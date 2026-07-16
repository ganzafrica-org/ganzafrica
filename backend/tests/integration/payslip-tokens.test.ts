import { describe, it, expect, beforeEach, vi } from "vitest";

// Presign is faked so redeem returns a deterministic Spaces-shaped URL with X-Amz-Expires.
vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: async (_client: unknown, cmd: any, opts: { expiresIn: number }) =>
    `https://test-bucket.nyc3.digitaloceanspaces.com/${cmd?.input?.Key ?? "obj"}?X-Amz-Expires=${opts.expiresIn}&X-Amz-Signature=test`,
}));

import supertest from "supertest";
import { eq } from "drizzle-orm";
import app from "../../src/app";
import { db } from "../../src/db/client";
import { payslip_access_tokens } from "../../src/db/schema/payslip-tokens";
import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { makeUser, makePayroll } from "../factories";
import * as payslipTokenService from "../../src/services/hr/payslip-token.service";
import * as pdfService from "../../src/services/hr/pdf.service";

async function seedPayroll() {
  const uploader = await makeUser({ role: "admin" });
  return makePayroll({ uploadedBy: uploader.id });
}

describe("payslip access tokens", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("stores only a 64-char sha256 hash, never the raw token", async () => {
    const payroll = await seedPayroll();
    const raw = await payslipTokenService.mintPayslipToken(payroll.id);
    const rows = await db
      .select()
      .from(payslip_access_tokens)
      .where(eq(payslip_access_tokens.payroll_id, payroll.id));
    expect(rows).toHaveLength(1);
    expect(rows[0].token_hash).toHaveLength(64);
    expect(rows[0].token_hash).not.toContain(raw);
  });

  it("valid token → 302 to a Spaces URL with X-Amz-Expires=300", async () => {
    const payroll = await seedPayroll();
    const token = await payslipTokenService.mintPayslipToken(payroll.id);
    const res = await supertest(app).get(`/api/payslips/view/${token}`);
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("digitaloceanspaces.com");
    expect(res.headers.location).toContain("X-Amz-Expires=300");
  });

  it("redeeming bumps access_count and sets last_accessed_at", async () => {
    const payroll = await seedPayroll();
    const token = await payslipTokenService.mintPayslipToken(payroll.id);
    await supertest(app).get(`/api/payslips/view/${token}`);
    const [row] = await db
      .select()
      .from(payslip_access_tokens)
      .where(eq(payslip_access_tokens.payroll_id, payroll.id));
    expect(row.access_count).toBe(1);
    expect(row.last_accessed_at).not.toBeNull();
  });

  it("expired token → 410 HTML, no Location", async () => {
    const payroll = await seedPayroll();
    const token = await payslipTokenService.mintPayslipToken(payroll.id);
    // force expiry into the past
    await db
      .update(payslip_access_tokens)
      .set({ expires_at: new Date(Date.now() - 1000) })
      .where(eq(payslip_access_tokens.payroll_id, payroll.id));
    const res = await supertest(app).get(`/api/payslips/view/${token}`);
    expect(res.status).toBe(410);
    expect(res.headers.location).toBeUndefined();
    expect(res.text).toContain("info@ganzafrica.org");
  });

  it("revoked and unknown tokens → identical 410 (no oracle)", async () => {
    const payroll = await seedPayroll();
    const token = await payslipTokenService.mintPayslipToken(payroll.id);
    await payslipTokenService.revokeTokensForPayroll(payroll.id);
    const revoked = await supertest(app).get(`/api/payslips/view/${token}`);
    const unknown = await supertest(app).get(`/api/payslips/view/definitely-not-a-real-token`);
    expect(revoked.status).toBe(410);
    expect(unknown.status).toBe(410);
    expect(revoked.text).toBe(unknown.text);
  });

  it("re-minting revokes prior tokens (old link → 410, new link → 302)", async () => {
    const payroll = await seedPayroll();
    const oldToken = await payslipTokenService.mintPayslipToken(payroll.id);
    const newToken = await payslipTokenService.mintPayslipToken(payroll.id);
    expect((await supertest(app).get(`/api/payslips/view/${oldToken}`)).status).toBe(410);
    expect((await supertest(app).get(`/api/payslips/view/${newToken}`)).status).toBe(302);
  });

  it("POST /payroll/:id/revoke-links requires auth and revokes", async () => {
    const payroll = await seedPayroll();
    const token = await payslipTokenService.mintPayslipToken(payroll.id);

    const anon = await supertest(app).post(`/api/payroll/${payroll.id}/revoke-links`);
    expect(anon.status).toBe(401);

    const { agent } = await loginAs("admin");
    const res = await agent.post(`/api/payroll/${payroll.id}/revoke-links`);
    expect(res.status).toBe(200);
    expect(res.body.revoked).toBe(1);

    expect((await supertest(app).get(`/api/payslips/view/${token}`)).status).toBe(410);
  });

  it("generateSignedPayslipUrl throws for expiresIn > 7 days", async () => {
    await expect(
      pdfService.generateSignedPayslipUrl("some/key.pdf", 8 * 24 * 60 * 60),
    ).rejects.toThrow(/cannot exceed 7 days/);
  });
});
