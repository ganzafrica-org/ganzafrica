import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import app from "../../src/app";
import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares";

// One representative GET per HR resource: the route + the permission that should open it.
const READ_ROUTES: { path: string; resource: string; action: string }[] = [
  { path: "/api/hr/employees", resource: "employees", action: "manage" },
  { path: "/api/hr/assets", resource: "assets", action: "read" },
  { path: "/api/hr/leaves", resource: "leave", action: "manage" },
  { path: "/api/hr/policies", resource: "policies", action: "read" },
  { path: "/api/hr/helpdesk", resource: "helpdesk", action: "create" },
];

describe("HR route auth matrix (FND-07)", () => {
  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
  });

  it("anonymous requests are 401 on every HR resource", async () => {
    for (const r of READ_ROUTES) {
      const res = await supertest(app).get(r.path);
      expect(res.status, r.path).toBe(401);
    }
  });

  it("an authenticated user WITHOUT the permission is 403", async () => {
    const { agent } = await loginAs("staff");
    for (const r of READ_ROUTES) {
      const res = await agent.get(r.path);
      expect(res.status, r.path).toBe(403);
    }
  });

  it("granting the matching permission to the hr role stops the 403", async () => {
    // Grant to the `hr` role so both the middleware AND the transitional HR services (which still
    // check the mapped enum) allow the request.
    for (const r of READ_ROUTES) {
      await resetDb();
      clearPermissionCache();
      await grant("hr", r.resource, r.action);
      const { agent } = await loginAs("hr");
      const res = await agent.get(r.path);
      expect(res.status, r.path).not.toBe(403);
      expect(res.status, r.path).not.toBe(401);
    }
  });

  it("admin reaches every HR resource (short-circuit)", async () => {
    const { agent } = await loginAs("admin");
    for (const r of READ_ROUTES) {
      const res = await agent.get(r.path);
      expect(res.status, r.path).not.toBe(403);
      expect(res.status, r.path).not.toBe(401);
    }
  });

  it("308-redirects the old singular /hr/leave and /hr/document paths", async () => {
    const leave = await supertest(app).get("/api/hr/leave").redirects(0);
    expect(leave.status).toBe(308);
    expect(leave.headers.location).toContain("/api/hr/leaves");

    const document = await supertest(app).get("/api/hr/document").redirects(0);
    expect(document.status).toBe(308);
    expect(document.headers.location).toContain("/api/hr/documents");
  });
});
