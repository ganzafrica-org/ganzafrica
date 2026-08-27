/**
 * MOD-05 — Documents & Policies Finalization. Written per MOD-05 §6 / the ACL contract frozen
 * in §3: `{ roles?, employee_ids?, departments? }`, any-clause-match, null/empty = hr/admin only,
 * contract-linked docs always readable by that contract's employee.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// SAS download is faked so the download test asserts a deterministic URL carrying the requested
// expiry, without touching real Azure credentials. getObjectBuffer is stubbed so the search-index
// and /content viewer paths make no real network call. Individual tests override the resolved value.
vi.mock("../../src/services/storage.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/services/storage.service")>();
  return {
    ...actual,
    getObjectBuffer: vi.fn().mockResolvedValue(Buffer.from("")),
    getPresignedDownload: vi.fn(
      async (key: string, expiresIn = 300) =>
        `https://teststorage.blob.core.windows.net/uploads/${key}?sig=test&se=exp-${expiresIn}`,
    ),
  };
});

import app from "../../src/app";
import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares/auth.middleware";
import { db } from "../../src/db/client";
import { hr_documents, hr_policies, hr_policy_acknowledgements } from "../../src/db/schema";
import { eq } from "drizzle-orm";
import {
  ensureRole,
  makeUser,
  makeEmployee,
  makeDocument,
  makeContract,
  makePolicy,
} from "../factories";
import {
  canReadDocument,
  updateDocument,
  type DocumentAccessContext,
} from "../../src/services/hr/document.service";
import * as policyService from "../../src/services/hr/policy.service";
import * as storageService from "../../src/services/storage.service";
import {
  privateUpload,
  publicUpload,
  default as defaultUpload,
} from "../../src/middlewares/upload";

const API = "/api/hr";

async function loginAsRole(role: string, department?: string | null) {
  const { agent, user } = await loginAs(role);
  const employee = await makeEmployee({ userId: user.id, employmentType: "staff", department });
  return { agent, user, employee };
}

describe("MOD-05 documents & policies", () => {
  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    for (const role of ["employee", "hr", "admin", "fellow", "staff", "mentor"]) {
      await ensureRole(role);
      await grant(role, "documents", "read");
      await grant(role, "policies", "read");
    }
    await grant("hr", "documents", "manage");
    await grant("hr", "policies", "manage");
  });

  // ── §6.1 — ACL matrix, table-driven over canReadDocument (the heart of the ticket) ─────────
  describe("canReadDocument — ACL matrix", () => {
    const hr: DocumentAccessContext = { roles: ["hr"], employeeId: "emp-hr", department: null };
    const admin: DocumentAccessContext = { roles: ["admin"], employeeId: null, department: null };
    const fellow: DocumentAccessContext = {
      roles: ["fellow"],
      employeeId: "emp-fellow",
      department: "Agriculture",
    };
    const staff: DocumentAccessContext = {
      roles: ["staff"],
      employeeId: "emp-staff",
      department: "Operations",
    };

    const cases: {
      name: string;
      ctx: DocumentAccessContext;
      doc: { access: any; contractEmployeeId?: string | null };
      expected: boolean;
    }[] = [
      { name: "hr bypasses any ACL", ctx: hr, doc: { access: {} }, expected: true },
      { name: "admin bypasses any ACL", ctx: admin, doc: { access: {} }, expected: true },
      {
        name: "role clause: matching role admitted",
        ctx: fellow,
        doc: { access: { roles: ["fellow"] } },
        expected: true,
      },
      {
        name: "role clause: non-matching role denied",
        ctx: staff,
        doc: { access: { roles: ["fellow"] } },
        expected: false,
      },
      {
        name: "employee_ids clause: listed employee admitted",
        ctx: fellow,
        doc: { access: { employee_ids: ["emp-fellow"] } },
        expected: true,
      },
      {
        name: "employee_ids clause: unlisted employee denied",
        ctx: staff,
        doc: { access: { employee_ids: ["emp-fellow"] } },
        expected: false,
      },
      {
        name: "departments clause: matching department admitted",
        ctx: fellow,
        doc: { access: { departments: ["Agriculture"] } },
        expected: true,
      },
      {
        name: "departments clause: non-matching department denied",
        ctx: staff,
        doc: { access: { departments: ["Agriculture"] } },
        expected: false,
      },
      {
        name: "null/empty ACL: hr/admin only — employee denied",
        ctx: staff,
        doc: { access: {} },
        expected: false,
      },
      {
        name: "null ACL: hr/admin only — hr admitted",
        ctx: hr,
        doc: { access: null },
        expected: true,
      },
      {
        name: "contract-owner override: linked employee admitted despite empty ACL",
        ctx: staff,
        doc: { access: {}, contractEmployeeId: "emp-staff" },
        expected: true,
      },
      {
        name: "contract-owner override: non-owner still denied",
        ctx: fellow,
        doc: { access: {}, contractEmployeeId: "emp-staff" },
        expected: false,
      },
      {
        name: "any-clause-match: one non-matching clause doesn't block a matching one",
        ctx: fellow,
        doc: { access: { roles: ["mentor"], departments: ["Agriculture"] } },
        expected: true,
      },
    ];

    for (const c of cases) {
      it(`${c.expected ? "admits" : "denies"} — ${c.name}`, () => {
        expect(canReadDocument(c.ctx, c.doc)).toBe(c.expected);
      });
    }
  });

  // ── End-to-end ACL enforcement via the real list/download endpoints ────────────────────────
  describe("ACL enforcement — list filtering and download", () => {
    it("non-managers only see documents their ACL admits; hr sees everything", async () => {
      const hr = await loginAsRole("hr");
      const fellow = await loginAsRole("fellow", "Agriculture");
      const staff = await loginAsRole("staff", "Operations");

      const visibleToFellow = await makeDocument({
        createdById: hr.employee.id,
        name: "Fellow handbook",
        access: { roles: ["fellow"] },
      });
      const hrOnly = await makeDocument({
        createdById: hr.employee.id,
        name: "HR-only memo",
        access: {},
      });

      const fellowRes = await fellow.agent.get(`${API}/documents`);
      expect(fellowRes.status).toBe(200);
      const fellowIds = fellowRes.body.data.map((d: any) => d.id);
      expect(fellowIds).toContain(visibleToFellow.id);
      expect(fellowIds).not.toContain(hrOnly.id);

      const staffRes = await staff.agent.get(`${API}/documents`);
      const staffIds = staffRes.body.data.map((d: any) => d.id);
      expect(staffIds).not.toContain(visibleToFellow.id);
      expect(staffIds).not.toContain(hrOnly.id);

      const hrRes = await hr.agent.get(`${API}/documents`);
      const hrIds = hrRes.body.data.map((d: any) => d.id);
      expect(hrIds).toContain(visibleToFellow.id);
      expect(hrIds).toContain(hrOnly.id);
    });

    it("contract-linked document is always readable by that employee, even with an empty ACL", async () => {
      const hr = await loginAsRole("hr");
      const staff = await loginAsRole("staff");
      const contract = await makeContract({ employeeId: staff.employee.id });
      const doc = await makeDocument({
        createdById: hr.employee.id,
        category: "Contract Templates",
        access: {},
        contractId: contract.id,
      });

      const res = await staff.agent.get(`${API}/documents/${doc.id}`);
      expect(res.status).toBe(200);
    });

    it("GET /hr/me/documents returns only ACL-admitted + own-contract docs", async () => {
      const hr = await loginAsRole("hr");
      const fellow = await loginAsRole("fellow", "Agriculture");
      const contract = await makeContract({ employeeId: fellow.employee.id });

      const mine = await makeDocument({
        createdById: hr.employee.id,
        access: { employee_ids: [fellow.employee.id] },
      });
      const myContractDoc = await makeDocument({
        createdById: hr.employee.id,
        category: "Contract Templates",
        access: {},
        contractId: contract.id,
      });
      const notMine = await makeDocument({ createdById: hr.employee.id, access: {} });

      const res = await fellow.agent.get(`${API}/me/documents`);
      expect(res.status).toBe(200);
      const ids = res.body.data.map((d: any) => d.id);
      expect(ids).toContain(mine.id);
      expect(ids).toContain(myContractDoc.id);
      expect(ids).not.toContain(notMine.id);
    });

    it("403s a download for a document outside the caller's ACL, 200s (redirect) inside it", async () => {
      const hr = await loginAsRole("hr");
      const fellow = await loginAsRole("fellow", "Agriculture");
      const staff = await loginAsRole("staff", "Operations");

      const doc = await makeDocument({
        createdById: hr.employee.id,
        access: { roles: ["fellow"] },
      });

      const denied = await staff.agent.get(`${API}/documents/${doc.id}/download`);
      expect(denied.status).toBe(403);

      const allowed = await fellow.agent.get(`${API}/documents/${doc.id}/download`);
      expect(allowed.status).toBe(302);
      expect(allowed.headers.location).toContain(`/${doc.file_path}?`);
      expect(allowed.headers.location).toContain("se=exp-300");

      const [row] = await db.select().from(hr_documents).where(eq(hr_documents.id, doc.id));
      expect(row.downloads).toBe(1);
    });
  });

  // ── inline viewer support: /view-url (native + Office-viewer embeds) and /content (text/csv) ─
  describe("inline viewer endpoints", () => {
    it("/view-url enforces the same ACL as download, uses a 15-min expiry, and never increments downloads", async () => {
      const hr = await loginAsRole("hr");
      const fellow = await loginAsRole("fellow", "Agriculture");
      const staff = await loginAsRole("staff", "Operations");
      const doc = await makeDocument({
        createdById: hr.employee.id,
        access: { roles: ["fellow"] },
      });

      const denied = await staff.agent.get(`${API}/documents/${doc.id}/view-url`);
      expect(denied.status).toBe(403);

      const allowed = await fellow.agent.get(`${API}/documents/${doc.id}/view-url`);
      expect(allowed.status).toBe(200);
      expect(allowed.body.data.url).toContain(`/${doc.file_path}?`);
      expect(allowed.body.data.url).toContain("se=exp-900");
      // Real stored filename (S3 key basename), not the human document_name — the frontend needs
      // the actual extension to pick a renderer.
      expect(allowed.body.data.fileName).toBe(doc.file_path.split("/").pop());

      const [row] = await db.select().from(hr_documents).where(eq(hr_documents.id, doc.id));
      expect(row.downloads).toBe(0);
    });

    it("/content enforces ACL and returns the object's text for csv/txt-style formats", async () => {
      const hr = await loginAsRole("hr");
      const fellow = await loginAsRole("fellow", "Agriculture");
      const staff = await loginAsRole("staff", "Operations");
      const doc = await makeDocument({
        createdById: hr.employee.id,
        access: { roles: ["fellow"] },
      });

      vi.mocked(storageService.getObjectBuffer).mockResolvedValueOnce(
        Buffer.from("name,age\nAda,30\nGrace,34"),
      );

      const denied = await staff.agent.get(`${API}/documents/${doc.id}/content`);
      expect(denied.status).toBe(403);

      const allowed = await fellow.agent.get(`${API}/documents/${doc.id}/content`);
      expect(allowed.status).toBe(200);
      expect(allowed.body.data.text).toBe("name,age\nAda,30\nGrace,34");
      expect(allowed.body.data.truncated).toBe(false);
    });
  });

  // ── §6.2 — private storage config ──────────────────────────────────────────────────────────
  // On Azure Blob, privacy is enforced by which container an uploader writes to (there are no
  // per-object ACLs). The default export and privateUpload share the private container; publicUpload
  // is a distinct engine targeting the public container.
  describe("upload middleware container wiring", () => {
    it("the default export is the private uploader", () => {
      expect(privateUpload).toBe(defaultUpload);
    });

    it("publicUpload is a separate engine from the private uploader", () => {
      expect(publicUpload).not.toBe(privateUpload);
    });
  });

  // ── §6.3 — versioning ────────────────────────────────────────────────────────────────────
  describe("versioning", () => {
    it("a new file on PATCH bumps version and appends the old key to versions history", async () => {
      const hr = await loginAsRole("hr");
      const doc = await makeDocument({ createdById: hr.employee.id, version: "1" });
      expect(doc.version).toBe("1");
      expect(doc.versions).toEqual([]);

      const v2 = await updateDocument(doc.id, {
        file: { key: "uploads/document/v2.pdf", size: 100, originalName: "v2.pdf" },
      });
      expect(v2.version).toBe("2");
      expect(v2.file_path).toBe("uploads/document/v2.pdf");
      expect(v2.versions).toHaveLength(1);
      expect((v2.versions as any[])[0]).toMatchObject({ key: doc.file_path, version: "1" });

      const v3 = await updateDocument(doc.id, {
        file: { key: "uploads/document/v3.pdf", size: 200, originalName: "v3.pdf" },
      });
      expect(v3.version).toBe("3");
      expect(v3.versions).toHaveLength(2);
      expect((v3.versions as any[])[1]).toMatchObject({
        key: "uploads/document/v2.pdf",
        version: "2",
      });
    });

    it("metadata-only PATCH (no file) does not touch version or versions history", async () => {
      const hr = await loginAsRole("hr");
      const doc = await makeDocument({ createdById: hr.employee.id, version: "1" });
      const updated = await updateDocument(doc.id, { description: "Updated description" });
      expect(updated.version).toBe("1");
      expect(updated.versions).toEqual([]);
    });
  });

  // ── §6.6 — soft delete ──────────────────────────────────────────────────────────────────
  describe("soft delete", () => {
    it("DELETE archives the document (status=ARCHIVED) instead of removing the row; hidden from lists", async () => {
      const hr = await loginAsRole("hr");
      const doc = await makeDocument({ createdById: hr.employee.id });

      const del = await hr.agent.delete(`${API}/documents/${doc.id}`);
      expect(del.status).toBe(200);

      const [row] = await db.select().from(hr_documents).where(eq(hr_documents.id, doc.id));
      expect(row).toBeDefined();
      expect(row.status).toBe("ARCHIVED");
      expect(row.file_path).toBe(doc.file_path); // key preserved for audit

      const list = await hr.agent.get(`${API}/documents`);
      expect(list.body.data.map((d: any) => d.id)).not.toContain(doc.id);
    });
  });

  // ── §6.4/§6.5 — policy publish, version-scoped acknowledgement, idempotency, report ────────
  describe("policy publish + acknowledgements", () => {
    it("publish bumps version and deactivates the predecessor; ack is version-scoped", async () => {
      const hr = await loginAsRole("hr");
      const fellow = await loginAsRole("fellow");

      const v1 = await makePolicy({
        createdById: hr.employee.id,
        title: "Code of Conduct",
        version: "1",
        status: "PUBLISHED",
        isActive: true,
      });

      const ack1 = await fellow.agent.post(`${API}/policies/${v1.id}/acknowledge`);
      expect(ack1.status).toBe(200);
      expect(await policyService.pendingAckCount(fellow.employee.id)).toBe(0);

      // Draft a new version of the same policy, then publish it.
      const v2Draft = await makePolicy({
        createdById: hr.employee.id,
        title: "Code of Conduct",
        version: "2",
        status: "DRAFT",
        isActive: false,
      });
      const publishRes = await hr.agent.post(`${API}/policies/${v2Draft.id}/publish`);
      expect(publishRes.status).toBe(200);
      expect(publishRes.body.data.version).toBe("2");
      expect(publishRes.body.data.status).toBe("PUBLISHED");

      const [predecessor] = await db.select().from(hr_policies).where(eq(hr_policies.id, v1.id));
      expect(predecessor.is_active).toBe(false);

      // v1 ack does not carry over to v2 — fellow is pending again.
      expect(await policyService.pendingAckCount(fellow.employee.id)).toBe(1);

      const ack2 = await fellow.agent.post(`${API}/policies/${v2Draft.id}/acknowledge`);
      expect(ack2.status).toBe(200);
      expect(await policyService.pendingAckCount(fellow.employee.id)).toBe(0);
    });

    it("GET /hr/policies?active=true annotates rows with the caller's myAcknowledged status", async () => {
      const hr = await loginAsRole("hr");
      const fellow = await loginAsRole("fellow");
      const policy = await makePolicy({ createdById: hr.employee.id, title: "Handbook" });
      await fellow.agent.post(`${API}/policies/${policy.id}/acknowledge`);

      const res = await fellow.agent.get(`${API}/policies`).query({ active: "true" });
      expect(res.status).toBe(200);
      const row = res.body.data.find((p: any) => p.id === policy.id);
      expect(row.myAcknowledged).toBe(true);
    });

    it("acknowledge is idempotent — repeat calls don't error or duplicate", async () => {
      const hr = await loginAsRole("hr");
      const fellow = await loginAsRole("fellow");
      const policy = await makePolicy({ createdById: hr.employee.id });

      const first = await fellow.agent.post(`${API}/policies/${policy.id}/acknowledge`);
      const second = await fellow.agent.post(`${API}/policies/${policy.id}/acknowledge`);
      expect(first.status).toBe(200);
      expect(second.status).toBe(200);

      const rows = await db
        .select()
        .from(hr_policy_acknowledgements)
        .where(eq(hr_policy_acknowledgements.policy_id, policy.id));
      expect(rows).toHaveLength(1);
    });

    it("acknowledgements report lists who's missing, excluding exited employees", async () => {
      const hr = await loginAsRole("hr");
      const fellow = await loginAsRole("fellow");
      const staff = await loginAsRole("staff");
      const exitedUser = await makeUser({ role: "employee" });
      const exited = await makeEmployee({ userId: exitedUser.id, status: "exited" });

      const policy = await makePolicy({ createdById: hr.employee.id });
      await fellow.agent.post(`${API}/policies/${policy.id}/acknowledge`);

      const report = await hr.agent.get(`${API}/policies/${policy.id}/acknowledgements`);
      expect(report.status).toBe(200);
      expect(report.body.data.acknowledged_count).toBe(1);
      const ids = report.body.data.details.map((d: any) => d.employee_id);
      expect(ids).toContain(fellow.employee.id);
      expect(ids).toContain(staff.employee.id);
      expect(ids).not.toContain(exited.id); // exited employees are excluded entirely
      const missing = report.body.data.details.filter((d: any) => !d.acknowledged);
      expect(missing.map((d: any) => d.employee_id)).toContain(staff.employee.id);
      expect(missing.map((d: any) => d.employee_id)).not.toContain(fellow.employee.id);
    });
  });
});
