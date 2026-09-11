/**
 * "Use a saved template instead of uploading a file" (contract creation + generic document
 * creation). Covers:
 *  - POST /hr/documents accepts either `file` or `sourceDocumentId`, never both, never neither.
 *  - Cloning reuses the source's stored file (no re-upload) and creates an independent row.
 *  - "Contract Templates" no longer requires contractId at creation — an unlinked row is the
 *    reusable template pool.
 *  - GET /hr/documents/templates only ever surfaces unlinked rows — never another employee's
 *    actual signed agreement (contract_id set) or an archived document.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeAzureStorageBlobModule } from "../helpers/mock-azure-storage";

// Same real-multipart-route mocking strategy as create-document-acl.test.ts (see that file's
// header for why @azure/storage-blob itself, not some deeper SDK, is what needs mocking here).
vi.mock("@azure/storage-blob", () => fakeAzureStorageBlobModule());

vi.mock("../../src/services/storage.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/services/storage.service")>();
  return { ...actual, getObjectBuffer: vi.fn().mockResolvedValue(Buffer.from("")) };
});

import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares/auth.middleware";
import {
  ensureRole,
  makeEmployee,
  makeEmployeeUser,
  makeDocument,
  makeContract,
} from "../factories";

const API = "/api/hr";

async function loginAsRole(role: string) {
  const { agent, user } = await loginAs(role);
  const employee = await makeEmployee({ userId: user.id, employmentType: "staff" });
  return { agent, user, employee };
}

describe("document templates — clone-instead-of-upload", () => {
  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    for (const role of ["employee", "hr"]) {
      await ensureRole(role);
      await grant(role, "documents", "read");
    }
    await grant("hr", "documents", "manage");
  });

  describe("POST /hr/documents mutual exclusivity", () => {
    it("400s when neither a file nor sourceDocumentId is given", async () => {
      const hr = await loginAsRole("hr");
      const res = await hr.agent
        .post(`${API}/documents`)
        .field("document_name", "Nothing")
        .field("category", "Policies & Procedures")
        .field("description", "desc")
        .field("department", "Ops");
      expect(res.status).toBe(400);
    });

    it("400s when both a file and sourceDocumentId are given", async () => {
      const hr = await loginAsRole("hr");
      const source = await makeDocument({ createdById: hr.employee.id });

      const res = await hr.agent
        .post(`${API}/documents`)
        .field("document_name", "Both")
        .field("category", "Policies & Procedures")
        .field("description", "desc")
        .field("department", "Ops")
        .field("sourceDocumentId", source.id)
        .attach("file", Buffer.from("%PDF-1.4 test"), {
          filename: "doc.pdf",
          contentType: "application/pdf",
        });
      expect(res.status).toBe(400);
    });
  });

  describe("cloning", () => {
    it("clones an existing document's stored file into a new, independent row", async () => {
      const hr = await loginAsRole("hr");
      const source = await makeDocument({
        createdById: hr.employee.id,
        category: "Policies & Procedures",
        name: "Base Policy",
      });

      const res = await hr.agent
        .post(`${API}/documents`)
        .field("document_name", "Policy Variant")
        .field("category", "Policies & Procedures")
        .field("description", "desc")
        .field("department", "Ops")
        .field("sourceDocumentId", source.id);

      expect(res.status).toBe(201);
      expect(res.body.data.id).not.toBe(source.id);
      expect(res.body.data.document_name).toBe("Policy Variant");
      expect(res.body.data.fileSize ?? res.body.data.file_size).toBeTruthy();

      // Editing/archiving the source afterward must not affect the clone (independent snapshot).
      const archiveRes = await hr.agent.delete(`${API}/documents/${source.id}`);
      expect(archiveRes.status).toBe(200);
      const cloneRead = await hr.agent.get(`${API}/documents/${res.body.data.id}`);
      expect(cloneRead.status).toBe(200);
      expect(cloneRead.body.data.status).not.toBe("ARCHIVED");
    });

    it("404s cloning a document that doesn't exist", async () => {
      const hr = await loginAsRole("hr");
      const res = await hr.agent
        .post(`${API}/documents`)
        .field("document_name", "Ghost Clone")
        .field("category", "Policies & Procedures")
        .field("description", "desc")
        .field("department", "Ops")
        .field("sourceDocumentId", "00000000-0000-0000-0000-000000000000");
      expect(res.status).toBe(404);
    });

    it("rejects cloning an archived document", async () => {
      const hr = await loginAsRole("hr");
      const source = await makeDocument({ createdById: hr.employee.id, status: "ARCHIVED" });

      const res = await hr.agent
        .post(`${API}/documents`)
        .field("document_name", "From Archived")
        .field("category", "Policies & Procedures")
        .field("description", "desc")
        .field("department", "Ops")
        .field("sourceDocumentId", source.id);
      expect(res.status).toBe(400);
    });
  });

  describe("Contract Templates: contractId is now optional", () => {
    it("creates an unlinked Contract Templates document without a contractId (a pool template)", async () => {
      const hr = await loginAsRole("hr");
      const res = await hr.agent
        .post(`${API}/documents`)
        .field("document_name", "Standard Employment Agreement")
        .field("category", "Contract Templates")
        .field("description", "Base template")
        .field("department", "HR")
        .attach("file", Buffer.from("%PDF-1.4 template"), {
          filename: "template.pdf",
          contentType: "application/pdf",
        });
      expect(res.status).toBe(201);
      expect(res.body.data.contract_id).toBeNull();
    });

    it("still links to a real contract when contractId is given, exactly as before", async () => {
      const hr = await loginAsRole("hr");
      const { employee } = await makeEmployeeUser({ employmentType: "staff" });
      const contract = await makeContract({ employeeId: employee.id });

      const res = await hr.agent
        .post(`${API}/documents`)
        .field("document_name", "Signed Agreement")
        .field("category", "Contract Templates")
        .field("description", "Signed copy")
        .field("department", "HR")
        .field("contractId", contract.id)
        .attach("file", Buffer.from("%PDF-1.4 signed"), {
          filename: "signed.pdf",
          contentType: "application/pdf",
        });
      expect(res.status).toBe(201);
      expect(res.body.data.contract_id).toBe(contract.id);
    });

    it("404s when contractId is given but doesn't exist", async () => {
      const hr = await loginAsRole("hr");
      const res = await hr.agent
        .post(`${API}/documents`)
        .field("document_name", "Bad Link")
        .field("category", "Contract Templates")
        .field("description", "desc")
        .field("department", "HR")
        .field("contractId", "00000000-0000-0000-0000-000000000000")
        .attach("file", Buffer.from("%PDF-1.4"), {
          filename: "f.pdf",
          contentType: "application/pdf",
        });
      expect(res.status).toBe(404);
    });
  });

  describe("GET /hr/documents/templates — privacy-safe pool listing", () => {
    it("lists only unlinked Contract Templates documents, never a linked employee agreement", async () => {
      const hr = await loginAsRole("hr");
      const { employee } = await makeEmployeeUser({ employmentType: "staff" });
      const contract = await makeContract({ employeeId: employee.id });

      const pooled = await makeDocument({
        createdById: hr.employee.id,
        category: "Contract Templates",
        name: "Reusable Template",
        contractId: null,
      });
      const linked = await makeDocument({
        createdById: hr.employee.id,
        category: "Contract Templates",
        name: "Someone's Signed Agreement",
        contractId: contract.id,
      });
      const archivedPooled = await makeDocument({
        createdById: hr.employee.id,
        category: "Contract Templates",
        name: "Old Retired Template",
        contractId: null,
        status: "ARCHIVED",
      });

      const res = await hr.agent
        .get(`${API}/documents/templates`)
        .query({ category: "Contract Templates" });

      expect(res.status).toBe(200);
      const ids = res.body.data.map((d: { id: string }) => d.id);
      expect(ids).toContain(pooled.id);
      expect(ids).not.toContain(linked.id);
      expect(ids).not.toContain(archivedPooled.id);
    });

    it("lists documents in a non-contract category unfiltered (no contract_id is ever set there)", async () => {
      const hr = await loginAsRole("hr");
      const doc = await makeDocument({
        createdById: hr.employee.id,
        category: "Policies & Procedures",
        name: "Handbook",
      });

      const res = await hr.agent
        .get(`${API}/documents/templates`)
        .query({ category: "Policies & Procedures" });

      expect(res.status).toBe(200);
      expect(res.body.data.map((d: { id: string }) => d.id)).toContain(doc.id);
    });

    it("403s an employee (documents:manage required)", async () => {
      const employee = await loginAsRole("employee");
      const res = await employee.agent
        .get(`${API}/documents/templates`)
        .query({ category: "Contract Templates" });
      expect(res.status).toBe(403);
    });

    it("400s an invalid category", async () => {
      const hr = await loginAsRole("hr");
      const res = await hr.agent.get(`${API}/documents/templates`).query({ category: "Bogus" });
      expect(res.status).toBe(400);
    });
  });
});
