import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import supertest from "supertest";
import app from "../../src/app";
import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { makeUser, makePayroll, ensureRole } from "../factories";
import { db } from "../../src/db/client";
import { roles, permissions, role_permissions } from "../../src/db/schema";
import { eq } from "drizzle-orm";
import { clearPermissionCache } from "../../src/middlewares";

async function grant(roleName: string, resource: string, action: string) {
  const role = await ensureRole(roleName);
  const [perm] = await db
    .insert(permissions)
    .values({
      id: Math.floor(Math.random() * 1e9),
      name: `${resource}:${action}`,
      resource,
      action,
    })
    .onConflictDoNothing()
    .returning();
  const permId =
    perm?.id ??
    (await db.select().from(permissions).where(eq(permissions.resource, resource)).limit(1))[0].id;
  await db
    .insert(role_permissions)
    .values({ id: Math.floor(Math.random() * 1e9), role_id: role.id, permission_id: permId })
    .onConflictDoNothing();
}

describe("requirePermission on /api/payroll", () => {
  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
  });

  it("allows a finance user with payroll:manage", async () => {
    await grant("finance", "payroll", "manage");
    const { agent, user } = await loginAs("finance");
    const uploader = await makeUser({ role: "admin" });
    const payroll = await makePayroll({ uploadedBy: uploader.id });
    const res = await agent.post(`/api/payroll/${payroll.id}/revoke-links`);
    expect(res.status).not.toBe(403);
  });

  it("denies a staff user without payroll:manage (403)", async () => {
    const { agent } = await loginAs("staff");
    const uploader = await makeUser({ role: "admin" });
    const payroll = await makePayroll({ uploadedBy: uploader.id });
    const res = await agent.post(`/api/payroll/${payroll.id}/revoke-links`);
    expect(res.status).toBe(403);
  });

  it("allows admin (short-circuit)", async () => {
    const { agent } = await loginAs("admin");
    const uploader = await makeUser({ role: "admin" });
    const payroll = await makePayroll({ uploadedBy: uploader.id });
    const res = await agent.post(`/api/payroll/${payroll.id}/revoke-links`);
    expect(res.status).not.toBe(403);
  });

  it("rejects anonymous (401)", async () => {
    const res = await supertest(app).post(`/api/payroll/1/revoke-links`);
    expect(res.status).toBe(401);
  });

  it("reflects a granted permission after clearPermissionCache", async () => {
    const { agent, user } = await loginAs("staff");
    const uploader = await makeUser({ role: "admin" });
    const payroll = await makePayroll({ uploadedBy: uploader.id });

    expect((await agent.post(`/api/payroll/${payroll.id}/revoke-links`)).status).toBe(403);

    await grant("staff", "payroll", "manage");
    clearPermissionCache(user.id);

    expect((await agent.post(`/api/payroll/${payroll.id}/revoke-links`)).status).not.toBe(403);
  });
});
