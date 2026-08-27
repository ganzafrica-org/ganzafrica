/**
 * Punch-list #5 — optional leave-request attachments, reusing hr_documents (category "Leave
 * Attachment", leave_id set) rather than a parallel upload system, so the existing
 * privateUpload/presigned-URL plumbing and the shared document viewer work unmodified. Goes
 * through the real multipart routes, same convention as create-document-acl.test.ts, so the
 * upload middleware and the ACL extension (leaveDocumentAccess in document.service.ts) are both
 * exercised for real rather than by calling service functions directly.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

const { uploadedObjects } = vi.hoisted(() => ({
  uploadedObjects: [] as Array<{ Key?: string }>,
}));

// Same fake multer-s3 storage engine as create-document-acl.test.ts — buffers in memory instead
// of hitting real S3/DO Spaces, while still exercising the real route/middleware/controller/service.
vi.mock("multer-s3", () => {
  const fakeStorage = () => ({
    _handleFile(
      _req: unknown,
      file: { stream: NodeJS.ReadableStream; originalname: string; mimetype: string },
      cb: (err: unknown, info?: Record<string, unknown>) => void,
    ) {
      const chunks: Buffer[] = [];
      file.stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      file.stream.on("error", cb);
      file.stream.on("end", () => {
        const buffer = Buffer.concat(chunks);
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
        const key = `uploads/test/${Date.now()}-${safeName}`;
        uploadedObjects.push({ Key: key });
        cb(null, {
          bucket: "test-bucket",
          key,
          acl: "private",
          contentType: file.mimetype,
          size: buffer.length,
          location: `https://test.spaces/${key}`,
          etag: '"test-etag"',
        });
      });
    },
    _removeFile(_req: unknown, _file: unknown, cb: (err: unknown) => void) {
      cb(null);
    },
  });
  fakeStorage.AUTO_CONTENT_TYPE = (
    _req: unknown,
    file: { mimetype?: string },
    cb: (err: null, type: string) => void,
  ) => cb(null, file.mimetype ?? "application/octet-stream");
  fakeStorage.DEFAULT_CONTENT_TYPE = (
    _req: unknown,
    _file: unknown,
    cb: (err: null, type: string) => void,
  ) => cb(null, "application/octet-stream");
  return { default: fakeStorage };
});

vi.mock("../../src/services/storage.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/services/storage.service")>();
  return {
    ...actual,
    getObjectBuffer: vi.fn().mockResolvedValue(Buffer.from("")),
    getPresignedDownload: vi.fn().mockResolvedValue("https://test.spaces/presigned-url"),
  };
});

vi.mock("../../src/services/email.service", () => ({
  sendEmail: vi.fn(async () => ({ id: "x" })),
}));

import supertest from "supertest";
import app from "../../src/app";
import { resetDb } from "../setup";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares/auth.middleware";
import { ensureRole, makeUser, makeEmployee, makeLeavePolicy } from "../factories";
import { requestLeave } from "../../src/services/hr/leave-core.service";

const API = "/api/hr";
const d = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

async function loginAsEmployee(role: string, managerId: string | null = null) {
  const user = await makeUser({ role });
  const employee = await makeEmployee({ userId: user.id, employmentType: "staff", managerId });
  const agent = supertest.agent(app);
  const res = await agent
    .post("/api/auth/login")
    .send({ email: user.email, password: user.password });
  if (res.status !== 200)
    throw new Error(`login failed: ${res.status} ${JSON.stringify(res.body)}`);
  const setCookies = (res.headers["set-cookie"] as unknown as string[]) ?? [];
  const csrf = setCookies.map((c) => /ganzafrica_csrf=([^;]+)/.exec(c)?.[1]).find(Boolean);
  if (csrf) agent.set("X-CSRF-Token", csrf);
  return { agent, user, employee };
}

describe("leave attachments (optional)", () => {
  beforeEach(async () => {
    await resetDb();
    uploadedObjects.length = 0;
    clearPermissionCache();
    for (const role of ["employee", "hr"]) {
      await ensureRole(role);
      await grant(role, "documents", "read");
      await grant(role, "leave_self", "request");
    }
    await grant("hr", "leave", "manage");
    await grant("hr", "documents", "manage");
    await makeLeavePolicy({ employmentType: "staff", type: "ANNUAL", annualDays: 20 });
  });

  it("a leave request submits fine with zero attachments — unaffected by this feature", async () => {
    const manager = await loginAsEmployee("employee");
    const report = await loginAsEmployee("employee", manager.employee.id);

    const res = await report.agent.post(`${API}/me/leave`).send({
      type: "ANNUAL",
      startDate: "2026-03-02",
      endDate: "2026-03-04",
      reason: "Trip",
    });

    expect(res.status).toBe(201);
    expect(res.body.leave.id).toBeTruthy();

    const list = await report.agent.get(`${API}/leave/${res.body.leave.id}/attachments`);
    expect(list.status).toBe(200);
    expect(list.body.attachments).toEqual([]);
  });

  it("the requester can upload a PDF attachment, and their manager (approver) can retrieve it via the shared document view-url endpoint", async () => {
    const manager = await loginAsEmployee("employee");
    const report = await loginAsEmployee("employee", manager.employee.id);

    const leave = await requestLeave(report.user.id, report.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-04"),
      reason: "Trip",
    });

    const upload = await report.agent
      .post(`${API}/leave/${leave.id}/attachments`)
      .attach("file", Buffer.from("%PDF-1.4 test sick note"), {
        filename: "note.pdf",
        contentType: "application/pdf",
      });
    expect(upload.status).toBe(201);
    expect(uploadedObjects.length).toBe(1);
    const documentId = upload.body.document.id;

    const list = await report.agent.get(`${API}/leave/${leave.id}/attachments`);
    expect(list.status).toBe(200);
    expect(list.body.attachments.map((a: { id: string }) => a.id)).toEqual([documentId]);

    // The approver retrieves it through the SAME generic endpoint the shared PDFx DocumentViewer
    // calls for every other document — no separate leave-specific viewer.
    const viewUrl = await manager.agent.get(`${API}/documents/${documentId}/view-url`);
    expect(viewUrl.status).toBe(200);
    expect(viewUrl.body.data.url).toBe("https://test.spaces/presigned-url");
  });

  it("an unrelated employee (not the requester, not the approver, not HR) cannot list or view the attachment — 403", async () => {
    const manager = await loginAsEmployee("employee");
    const report = await loginAsEmployee("employee", manager.employee.id);
    const outsider = await loginAsEmployee("employee");

    const leave = await requestLeave(report.user.id, report.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-04"),
      reason: "Trip",
    });
    const upload = await report.agent
      .post(`${API}/leave/${leave.id}/attachments`)
      .attach("file", Buffer.from("%PDF-1.4 test"), {
        filename: "note.pdf",
        contentType: "application/pdf",
      });
    const documentId = upload.body.document.id;

    const listDenied = await outsider.agent.get(`${API}/leave/${leave.id}/attachments`);
    expect(listDenied.status).toBe(403);

    const viewDenied = await outsider.agent.get(`${API}/documents/${documentId}/view-url`);
    expect(viewDenied.status).toBe(403);
  });

  it("an unrelated employee (not the requester, not HR) cannot upload an attachment to someone else's leave request — 403", async () => {
    const manager = await loginAsEmployee("employee");
    const report = await loginAsEmployee("employee", manager.employee.id);
    const outsider = await loginAsEmployee("employee");

    const leave = await requestLeave(report.user.id, report.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-04"),
      reason: "Trip",
    });

    const upload = await outsider.agent
      .post(`${API}/leave/${leave.id}/attachments`)
      .attach("file", Buffer.from("%PDF-1.4 test"), {
        filename: "note.pdf",
        contentType: "application/pdf",
      });
    expect(upload.status).toBe(403);
  });

  it("HR can always view a leave attachment regardless of the manager chain", async () => {
    const manager = await loginAsEmployee("employee");
    const report = await loginAsEmployee("employee", manager.employee.id);
    const hr = await loginAsEmployee("hr");

    const leave = await requestLeave(report.user.id, report.employee.id, {
      type: "ANNUAL",
      startDate: d("2026-03-02"),
      endDate: d("2026-03-04"),
      reason: "Trip",
    });
    const upload = await report.agent
      .post(`${API}/leave/${leave.id}/attachments`)
      .attach("file", Buffer.from("%PDF-1.4 test"), {
        filename: "note.pdf",
        contentType: "application/pdf",
      });
    const documentId = upload.body.document.id;

    const hrList = await hr.agent.get(`${API}/leave/${leave.id}/attachments`);
    expect(hrList.status).toBe(200);
    const hrView = await hr.agent.get(`${API}/documents/${documentId}/view-url`);
    expect(hrView.status).toBe(200);
  });
});
