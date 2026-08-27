/**
 * MOD-05 §1E — "who can see this document" must work end-to-end, not just as a frontend widget.
 *
 * The other document ACL coverage (documents-policies.test.ts) inserts documents straight into
 * the DB via the `makeDocument` factory, bypassing the real `POST /api/hr/documents` route
 * entirely. This test instead goes through the real multipart route, the way the frontend
 * actually submits the Create Document form (documents.service.ts's `toFormData` JSON-stringifies
 * `access` into a form field).
 *
 * That real path had a genuine bug: `validate()` (src/middlewares/validation.middleware.ts)
 * Zod-parses the stringified `access` field for a clean 400 on malformed input, but discards the
 * parsed result instead of writing it back onto `req.body` — so `req.body.access` reached the
 * controller as the raw JSON *string*, not an object (confirmed below via `typeof`). The
 * controller then forwarded that string straight into `documentService.createDocument`, and
 * drizzle's jsonb column unconditionally `JSON.stringify()`s whatever it's given
 * (`mapToDriverValue`) — double-encoding an already-stringified value — so the `access` column
 * was stored as a jsonb *string* scalar instead of a jsonb *object* (`jsonb_typeof(access)` was
 * `'string'`, not `'object'`; asserted directly below).
 *
 * Practically, this table's read path survived it by accident: drizzle's jsonb
 * `mapFromDriverValue` re-`JSON.parse()`s any string it gets back from the driver, and a
 * double-encoded value happens to parse cleanly twice, landing back on the right object — so
 * `canReadDocument`'s in-process roles/employee_ids/departments checks weren't actually bypassed.
 * But the on-disk type was still wrong (breaking anything that queries `access` with raw SQL /
 * jsonb operators, and just wrong data hygiene), so document.controller.ts now parses `access`
 * explicitly (`parseAccessField`) before it ever reaches the service. Both the storage-level fix
 * (`jsonb_typeof` assertion) and the create-then-verify visibility behavior are asserted below.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// `vi.mock` factories are hoisted above every other statement in the file (including plain
// `const` declarations that appear earlier in source order), so anything a factory closes over
// must itself be declared via `vi.hoisted` — otherwise it's a TDZ ReferenceError the moment the
// mocked module is first imported.
const { uploadedObjects } = vi.hoisted(() => ({
  uploadedObjects: [] as Array<{ Bucket?: string; Key?: string; ACL?: string }>,
}));

// The document routes upload through `privateUpload` (src/middlewares/upload.ts), a multer
// instance backed by `multer-s3`. multer-s3 itself does the real write via `@aws-sdk/lib-storage`
// -> `@aws-sdk/client-s3`, both loaded as plain node_modules CJS requires *inside* multer-s3's
// own module — outside Vitest's module graph, so `vi.mock`ing those SDK packages from this test
// file never reaches them (proven experimentally: it still made a real DNS lookup for
// "digitaloceanspaces.com"). `upload.ts`'s own `import multerS3 from "multer-s3"` **is** inside
// Vitest's graph, so mocking the "multer-s3" package itself — a real multer StorageEngine that
// just buffers to memory instead of writing to S3 — is what actually keeps this test network-free
// while still exercising the real Express route, real multer parsing, and real controller/service
// code the ACL bug lived in.
// The upload middleware streams into Azure Blob via `@azure/storage-blob`. Mock the client so
// uploads buffer in memory (no network) while still exercising the real route/multer/controller.
vi.mock("@azure/storage-blob", () => {
  const makeBlockBlobClient = (containerName: string, key: string) => ({
    url: `https://teststorage.blob.core.windows.net/${containerName}/${key}`,
    async uploadData(data: Buffer) {
      uploadedObjects.push({ Bucket: containerName, Key: key, ACL: "private" });
      return { requestId: "test", size: data.length };
    },
    async deleteIfExists() {
      return { succeeded: true };
    },
    async downloadToBuffer() {
      return Buffer.from("");
    },
  });
  const makeContainerClient = (containerName: string) => ({
    getBlockBlobClient: (key: string) => makeBlockBlobClient(containerName, key),
  });
  return {
    BlobServiceClient: {
      fromConnectionString: () => ({
        getContainerClient: (name: string) => makeContainerClient(name),
      }),
    },
    BlobSASPermissions: { parse: () => ({}) },
    generateBlobSASQueryParameters: () => ({ toString: () => "sig=test" }),
    StorageSharedKeyCredential: class {},
  };
});

// Background text-indexing (fire-and-forget after create) would otherwise try a real DO Spaces
// GET with fake test credentials — stub it out, same as documents-policies.test.ts.
vi.mock("../../src/services/storage.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/services/storage.service")>();
  return { ...actual, getObjectBuffer: vi.fn().mockResolvedValue(Buffer.from("")) };
});

import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares/auth.middleware";
import { ensureRole, makeEmployee } from "../factories";
import { db } from "../../src/db/client";
import { sql } from "drizzle-orm";

/** Storage-level check the ACL-behavior assertions alone can't catch (see file header). */
async function accessJsonbType(documentId: string): Promise<string> {
  const rows = await db.execute(
    sql`SELECT jsonb_typeof(access) AS t FROM hr_documents WHERE id = ${documentId}`,
  );
  return (rows.rows[0] as { t: string }).t;
}

const API = "/api/hr";

async function loginAsRole(role: string, department?: string | null) {
  const { agent, user } = await loginAs(role);
  const employee = await makeEmployee({ userId: user.id, employmentType: "staff", department });
  return { agent, user, employee };
}

describe("create-document ACL — real multipart route, create then verify", () => {
  beforeEach(async () => {
    await resetDb();
    uploadedObjects.length = 0;
    clearPermissionCache();
    for (const role of ["employee", "hr", "admin", "fellow", "staff"]) {
      await ensureRole(role);
      await grant(role, "documents", "read");
    }
    await grant("hr", "documents", "manage");
  });

  it(
    "POST /hr/documents with a department-only ACL: outside-department employee can't see it " +
      "in the list, matching-department employee can",
    async () => {
      const hr = await loginAsRole("hr");
      const programsEmployee = await loginAsRole("staff", "Programs");
      const financeEmployee = await loginAsRole("staff", "Finance");

      const createRes = await hr.agent
        .post(`${API}/documents`)
        .field("document_name", "Programs-only handbook")
        .field("category", "Policies & Procedures")
        .field("description", "Visible only to the Programs department")
        .field("department", "Programs")
        .field("status", "PUBLISHED")
        .field("access", JSON.stringify({ departments: ["Programs"] }))
        .attach("file", Buffer.from("%PDF-1.4 test document body"), {
          filename: "handbook.pdf",
          contentType: "application/pdf",
        });

      expect(createRes.status).toBe(201);
      const documentId = createRes.body.data.id;
      expect(documentId).toBeTruthy();
      expect(createRes.body.data.access).toEqual({ departments: ["Programs"] });
      expect(uploadedObjects.length).toBe(1); // multer-s3 really went through the upload path
      // The storage-level bug this test guards: previously `access` was persisted as a jsonb
      // *string* scalar (double-encoded), not a jsonb object — see file header.
      expect(await accessJsonbType(documentId)).toBe("object");

      // Outside the ACL'd department: must not see it in the list at all.
      const outsideRes = await financeEmployee.agent.get(`${API}/documents`);
      expect(outsideRes.status).toBe(200);
      const outsideIds = outsideRes.body.data.map((d: { id: string }) => d.id);
      expect(outsideIds).not.toContain(documentId);

      // Direct read is also denied for the outsider.
      const outsideRead = await financeEmployee.agent.get(`${API}/documents/${documentId}`);
      expect(outsideRead.status).toBe(403);

      // Inside the ACL'd department: sees it in the list and can read it directly.
      const insideRes = await programsEmployee.agent.get(`${API}/documents`);
      expect(insideRes.status).toBe(200);
      const insideIds = insideRes.body.data.map((d: { id: string }) => d.id);
      expect(insideIds).toContain(documentId);

      const insideRead = await programsEmployee.agent.get(`${API}/documents/${documentId}`);
      expect(insideRead.status).toBe(200);
      expect(insideRead.body.data.id).toBe(documentId);

      // HR always sees everything regardless of ACL.
      const hrRes = await hr.agent.get(`${API}/documents`);
      expect(hrRes.body.data.map((d: { id: string }) => d.id)).toContain(documentId);
    },
  );

  it("PATCH /hr/documents/:id can change the ACL and it takes effect immediately", async () => {
    const hr = await loginAsRole("hr");
    const financeEmployee = await loginAsRole("staff", "Finance");

    const createRes = await hr.agent
      .post(`${API}/documents`)
      .field("document_name", "Initially HR-only")
      .field("category", "Policies & Procedures")
      .field("description", "Starts locked down")
      .field("department", "Programs")
      .field("access", JSON.stringify({}))
      .attach("file", Buffer.from("%PDF-1.4 test"), {
        filename: "doc.pdf",
        contentType: "application/pdf",
      });
    expect(createRes.status).toBe(201);
    const documentId = createRes.body.data.id;

    const deniedBefore = await financeEmployee.agent.get(`${API}/documents/${documentId}`);
    expect(deniedBefore.status).toBe(403);

    const patchRes = await hr.agent
      .patch(`${API}/documents/${documentId}`)
      .field("access", JSON.stringify({ departments: ["Finance"] }));
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.access).toEqual({ departments: ["Finance"] });
    expect(await accessJsonbType(documentId)).toBe("object");

    const allowedAfter = await financeEmployee.agent.get(`${API}/documents/${documentId}`);
    expect(allowedAfter.status).toBe(200);
  });
});
