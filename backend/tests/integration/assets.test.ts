/**
 * MOD-04 — Assets Finalization. Written tests-first per the task instructions: several
 * endpoints these tests exercise do not exist in the codebase yet as of this commit — they
 * are built next, against this file. Contracts assumed here (and to be implemented exactly
 * as tested):
 *
 *   POST   /hr/assets/:id/assign     { employeeId, notes? }             assets:manage
 *   POST   /hr/assets/:id/return     { condition, notes?, hasIssue? }   assets:manage
 *   POST   /hr/assets/:id/flag       { note? }                          assets:manage
 *   POST   /hr/assets/:id/unflag     {}                                 assets:manage
 *   GET    /hr/assets/:id/history                                      assets:read|manage
 *   GET    /hr/me/assets             authenticate only — own row via getEmployeeForUser,
 *          same pattern as the existing GET /hr/employees/me (no assets:* permission needed;
 *          NOT the same as the general assets:read grant, which stays HR/admin-scoped so an
 *          employee can't list every asset just because they can list their own).
 *   GET    /hr/employees/:id/assets?open=true                          assets:read|manage
 *   DELETE /hr/assets/:id
 *          — 409 if currently ASSIGNED (must be returned first; ASSIGNED→DISPOSED is not a
 *            legal edge in the status machine)
 *          — else, if the asset has any assignment history at all, transitions to DISPOSED
 *            instead of deleting the row
 *          — else (never assigned), hard-deletes as today
 *   POST   /hr/assets/maintenance    existing route; creating with status "APPROVED" opens
 *          the asset (→ UNDER_MAINTENANCE)
 *   PATCH  /hr/assets/maintenance/:id existing route, new field `completedAt` — setting it
 *          closes that entry; asset returns to AVAILABLE iff no other open (APPROVED,
 *          completed_at NULL) entries remain for that asset. PENDING/REJECTED entries never
 *          affect asset status.
 *   PATCH  /hr/assets/:id            no longer accepts `status` directly — all status changes
 *          go through the endpoints above, enforced by src/services/hr/asset-status.ts
 *
 * Status machine (spec §4), encoded as ASSET_STATUS_TRANSITIONS in asset-status.ts:
 *   AVAILABLE         -> ASSIGNED | UNDER_MAINTENANCE | DISPOSED
 *   ASSIGNED          -> AVAILABLE | UNDER_MAINTENANCE        (via /return)
 *   UNDER_MAINTENANCE -> AVAILABLE | DISPOSED
 *   DISPOSED          -> (terminal)
 * Self-transitions (A -> A) are deliberately not in the table. Call sites skip invoking the
 * assertion when no state change is needed rather than treating A -> A as a legal edge.
 */
import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import app from "../../src/app";
import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares/auth.middleware";
import { db } from "../../src/db/client";
import { user_roles, roles, hr_asset_assignments, hr_assets } from "../../src/db/schema";
import { eq } from "drizzle-orm";
import {
  ensureRole,
  makeUser,
  makeEmployee,
  makeAsset,
  makeAssetCategory,
  makeAssetAssignment,
} from "../factories";
import {
  ASSET_STATUS_TRANSITIONS,
  assertAssetStatusTransition,
  type AssetStatus,
} from "../../src/services/hr/asset-status";

const API = "/api/hr";
const ALL_STATUSES: AssetStatus[] = ["AVAILABLE", "ASSIGNED", "UNDER_MAINTENANCE", "DISPOSED"];

async function grantRole(userId: number, roleName: string) {
  const [role] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
  await db.insert(user_roles).values({ user_id: userId, role_id: role.id }).onConflictDoNothing();
}

/** HR-style agent with an employees row (assigned_by / requester FKs need one to exist). */
async function loginAsManager(role: "hr" | "admin" = "hr") {
  const { agent, user } = await loginAs(role);
  if (role !== "admin") await grantRole(user.id, role);
  const employee = await makeEmployee({ userId: user.id, employmentType: "staff" });
  return { agent, user, employee };
}

/** Plain employee agent with their own employees row and NO assets:* permission granted. */
async function loginAsEmployee() {
  const { agent, user } = await loginAs("employee");
  const employee = await makeEmployee({ userId: user.id, employmentType: "staff" });
  return { agent, user, employee };
}

/** A second, unrelated employee — used as an assign target so it isn't the actor's own row. */
async function makeTargetEmployee() {
  const user = await makeUser({ role: "employee" });
  return makeEmployee({ userId: user.id, employmentType: "staff" });
}

describe("MOD-04 assets", () => {
  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    await ensureRole("employee");
    await ensureRole("hr");
    await ensureRole("admin");
    await grant("hr", "assets", "manage");
    await grant("hr", "assets", "read");
  });

  // ── §6.1 — status machine, table-driven over every (from, to) pair ────────────────────────
  describe("status machine", () => {
    const LEGAL = new Set(
      Object.entries(ASSET_STATUS_TRANSITIONS).flatMap(([from, tos]) =>
        (tos as AssetStatus[]).map((to) => `${from}->${to}`),
      ),
    );

    for (const from of ALL_STATUSES) {
      for (const to of ALL_STATUSES) {
        if (from === to) continue; // self-transitions: a call-site decision, not a table row
        const legal = LEGAL.has(`${from}->${to}`);
        it(`${legal ? "allows" : "rejects"} ${from} -> ${to}`, () => {
          if (legal) {
            expect(() => assertAssetStatusTransition(from, to)).not.toThrow();
          } else {
            expect(() => assertAssetStatusTransition(from, to)).toThrow(
              expect.objectContaining({ statusCode: 409 }),
            );
          }
        });
      }
    }
  });

  // ── §6.2 — assign: AVAILABLE only; assignment row + denormalized fields in one transaction ─
  describe("assign", () => {
    it("assigns an AVAILABLE asset: writes the assignment row and denormalized fields together", async () => {
      const { agent } = await loginAsManager();
      const target = await makeTargetEmployee();
      const asset = await makeAsset({ status: "AVAILABLE" });

      const res = await agent
        .post(`${API}/assets/${asset.id}/assign`)
        .send({ employeeId: target.id, notes: "New hire kit" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("ASSIGNED");
      expect(res.body.data.assignedToId).toBe(target.id);

      const [updated] = await db.select().from(hr_assets).where(eq(hr_assets.id, asset.id));
      expect(updated.status).toBe("ASSIGNED");
      expect(updated.assigned_to_employee_id).toBe(target.id);

      const history = await db
        .select()
        .from(hr_asset_assignments)
        .where(eq(hr_asset_assignments.asset_id, asset.id));
      expect(history).toHaveLength(1);
      expect(history[0].employee_id).toBe(target.id);
      expect(history[0].returned_at).toBeNull();
    });

    for (const badStatus of ["ASSIGNED", "UNDER_MAINTENANCE", "DISPOSED"] as AssetStatus[]) {
      it(`409s assigning a ${badStatus} asset`, async () => {
        const { agent } = await loginAsManager();
        const target = await makeTargetEmployee();
        const asset = await makeAsset({ status: badStatus });

        const res = await agent
          .post(`${API}/assets/${asset.id}/assign`)
          .send({ employeeId: target.id });

        expect(res.status).toBe(409);
      });
    }

    it("rolls back both writes when the transaction fails partway (no partial state)", async () => {
      const { agent } = await loginAsManager();
      const asset = await makeAsset({ status: "AVAILABLE" });
      const target = await makeTargetEmployee();

      // Engineer a state the app itself would never produce: an orphan OPEN assignment row
      // for an asset that's still AVAILABLE. The partial unique index
      // (hr_asset_assignments_one_open_per_asset) then rejects the assign's insert mid-
      // transaction — a real DB-level failure, not a mock — and both writes must roll back.
      await makeAssetAssignment({ assetId: asset.id, employeeId: target.id });

      const res = await agent
        .post(`${API}/assets/${asset.id}/assign`)
        .send({ employeeId: target.id, notes: "should not apply" });

      expect(res.status).toBeGreaterThanOrEqual(400);

      const [row] = await db.select().from(hr_assets).where(eq(hr_assets.id, asset.id));
      expect(row.status).toBe("AVAILABLE"); // unchanged — no partial write

      const history = await db
        .select()
        .from(hr_asset_assignments)
        .where(eq(hr_asset_assignments.asset_id, asset.id));
      expect(history).toHaveLength(1); // still just the orphan row we planted
    });
  });

  // ── §6.3 — return closes the open assignment exactly once; condition stored ────────────────
  describe("return", () => {
    it("closes the open assignment; a second return on the same asset 409s", async () => {
      const { agent } = await loginAsManager();
      const target = await makeTargetEmployee();
      const asset = await makeAsset({ status: "ASSIGNED", assignedToEmployeeId: target.id });
      const assignment = await makeAssetAssignment({ assetId: asset.id, employeeId: target.id });

      const res1 = await agent
        .post(`${API}/assets/${asset.id}/return`)
        .send({ condition: "Good, minor scuff", notes: "Returned at offboarding" });

      expect(res1.status).toBe(200);
      expect(res1.body.data.status).toBe("AVAILABLE");

      const [closed] = await db
        .select()
        .from(hr_asset_assignments)
        .where(eq(hr_asset_assignments.id, assignment.id));
      expect(closed.returned_at).not.toBeNull();
      expect(closed.return_condition).toBe("Good, minor scuff");

      const res2 = await agent
        .post(`${API}/assets/${asset.id}/return`)
        .send({ condition: "Second attempt" });
      expect(res2.status).toBe(409);
    });

    it("hasIssue: true routes the asset to UNDER_MAINTENANCE instead of AVAILABLE", async () => {
      const { agent } = await loginAsManager();
      const target = await makeTargetEmployee();
      const asset = await makeAsset({ status: "ASSIGNED", assignedToEmployeeId: target.id });
      await makeAssetAssignment({ assetId: asset.id, employeeId: target.id });

      const res = await agent
        .post(`${API}/assets/${asset.id}/return`)
        .send({ condition: "Screen cracked", hasIssue: true });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("UNDER_MAINTENANCE");
      expect(res.body.data.hasIssue).toBe("YES");
    });

    it("409s returning an asset with no open assignment", async () => {
      const { agent } = await loginAsManager();
      const asset = await makeAsset({ status: "AVAILABLE" });
      const res = await agent.post(`${API}/assets/${asset.id}/return`).send({ condition: "n/a" });
      expect(res.status).toBe(409);
    });
  });

  // ── §6.4 — maintenance open/close drives status, correctly across multiple entries ─────────
  describe("maintenance drives asset status", () => {
    it("opens on APPROVED, stays open with a second entry, closes only once the last one closes", async () => {
      const { agent } = await loginAsManager();
      const requester = await makeTargetEmployee();
      const asset = await makeAsset({ status: "AVAILABLE" });

      const m1 = await agent.post(`${API}/assets/maintenance`).send({
        assetId: asset.id,
        requesterId: requester.id,
        title: "Fan noise",
        status: "APPROVED",
      });
      expect(m1.status).toBe(201);

      let [row] = await db.select().from(hr_assets).where(eq(hr_assets.id, asset.id));
      expect(row.status).toBe("UNDER_MAINTENANCE");

      const m2 = await agent.post(`${API}/assets/maintenance`).send({
        assetId: asset.id,
        requesterId: requester.id,
        title: "Battery swap",
        status: "APPROVED",
      });
      expect(m2.status).toBe(201);

      // closing the first entry: the second is still open, asset must stay UNDER_MAINTENANCE
      await agent
        .patch(`${API}/assets/maintenance/${m1.body.data.id}`)
        .send({ completedAt: new Date().toISOString() });

      [row] = await db.select().from(hr_assets).where(eq(hr_assets.id, asset.id));
      expect(row.status).toBe("UNDER_MAINTENANCE");

      // closing the last open entry flips the asset back to AVAILABLE
      await agent
        .patch(`${API}/assets/maintenance/${m2.body.data.id}`)
        .send({ completedAt: new Date().toISOString() });

      [row] = await db.select().from(hr_assets).where(eq(hr_assets.id, asset.id));
      expect(row.status).toBe("AVAILABLE");
    });

    it("PENDING and REJECTED entries never touch asset status", async () => {
      const { agent } = await loginAsManager();
      const requester = await makeTargetEmployee();
      const asset = await makeAsset({ status: "AVAILABLE" });

      await agent.post(`${API}/assets/maintenance`).send({
        assetId: asset.id,
        requesterId: requester.id,
        title: "Routine check",
        status: "PENDING",
      });
      let [row] = await db.select().from(hr_assets).where(eq(hr_assets.id, asset.id));
      expect(row.status).toBe("AVAILABLE");

      const rejected = await agent.post(`${API}/assets/maintenance`).send({
        assetId: asset.id,
        requesterId: requester.id,
        title: "Denied repair",
        status: "REJECTED",
      });
      expect(rejected.status).toBe(201);

      [row] = await db.select().from(hr_assets).where(eq(hr_assets.id, asset.id));
      expect(row.status).toBe("AVAILABLE");
    });
  });

  // ── §6.5 — GET /hr/employees/:id/assets?open=true — the LCM-02 gate, exact rows ────────────
  describe("GET /hr/employees/:id/assets?open=true", () => {
    it("returns exactly the currently-open assignment for that employee, not their closed history", async () => {
      const { agent } = await loginAsManager();
      const target = await makeTargetEmployee();

      const openAsset = await makeAsset({ status: "ASSIGNED", assignedToEmployeeId: target.id });
      await makeAssetAssignment({ assetId: openAsset.id, employeeId: target.id });

      const closedAsset = await makeAsset({ status: "AVAILABLE" });
      await makeAssetAssignment({
        assetId: closedAsset.id,
        employeeId: target.id,
        returnedAt: new Date(),
        returnCondition: "Fine",
      });

      const res = await agent.get(`${API}/employees/${target.id}/assets`).query({ open: "true" });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].assetId).toBe(openAsset.id);
    });
  });

  // ── §6.6 — serial_number uniqueness 409; delete guard ───────────────────────────────────────
  describe("serial number uniqueness and delete guard", () => {
    it("409s creating an asset with a duplicate serial_number", async () => {
      const { agent } = await loginAsManager();
      const category = await makeAssetCategory();
      const serial = `DUPLICATE-${Date.now()}`;
      await makeAsset({ serialNumber: serial, categoryId: category.id });

      const res = await agent.post(`${API}/assets`).send({
        deviceName: "Second laptop",
        serialNumber: serial,
        categoryId: category.id,
      });

      expect(res.status).toBe(409);
    });

    it("hard-deletes an asset with no assignment history", async () => {
      const { agent } = await loginAsManager();
      const asset = await makeAsset({ status: "AVAILABLE" });

      const res = await agent.delete(`${API}/assets/${asset.id}`);
      expect(res.status).toBe(200);

      const rows = await db.select().from(hr_assets).where(eq(hr_assets.id, asset.id));
      expect(rows).toHaveLength(0);
    });

    it("soft-deletes (DISPOSED) an asset that has history but isn't currently assigned", async () => {
      const { agent } = await loginAsManager();
      const target = await makeTargetEmployee();
      const asset = await makeAsset({ status: "AVAILABLE" });
      await makeAssetAssignment({
        assetId: asset.id,
        employeeId: target.id,
        returnedAt: new Date(),
        returnCondition: "Fine",
      });

      const res = await agent.delete(`${API}/assets/${asset.id}`);
      expect(res.status).toBe(200);

      const [row] = await db.select().from(hr_assets).where(eq(hr_assets.id, asset.id));
      expect(row).toBeDefined();
      expect(row.status).toBe("DISPOSED");
    });

    it("409s deleting a currently-ASSIGNED asset (must be returned first)", async () => {
      const { agent } = await loginAsManager();
      const target = await makeTargetEmployee();
      const asset = await makeAsset({ status: "ASSIGNED", assignedToEmployeeId: target.id });
      await makeAssetAssignment({ assetId: asset.id, employeeId: target.id });

      const res = await agent.delete(`${API}/assets/${asset.id}`);
      expect(res.status).toBe(409);
    });
  });

  // ── §6.7 — permissions: employee reads own via /hr/me/assets; 403 on manage endpoints ──────
  describe("permissions", () => {
    it("an employee reads their own assets via GET /hr/me/assets with no assets:* permission granted", async () => {
      const { agent, employee } = await loginAsEmployee();
      const mine = await makeAsset({ status: "ASSIGNED", assignedToEmployeeId: employee.id });
      await makeAssetAssignment({ assetId: mine.id, employeeId: employee.id });

      const other = await makeAsset({ status: "AVAILABLE" });

      const res = await agent.get(`${API}/me/assets`);
      expect(res.status).toBe(200);
      const ids = res.body.data.map((a: { id: string }) => a.id);
      expect(ids).toContain(mine.id);
      expect(ids).not.toContain(other.id);
    });

    it("403s an employee on manage endpoints (create, assign)", async () => {
      const { agent } = await loginAsEmployee();
      const category = await makeAssetCategory();
      const asset = await makeAsset({ status: "AVAILABLE", categoryId: category.id });

      const createRes = await agent.post(`${API}/assets`).send({
        deviceName: "x",
        serialNumber: `SN-${Date.now()}`,
        categoryId: category.id,
      });
      expect(createRes.status).toBe(403);

      const assignRes = await agent
        .post(`${API}/assets/${asset.id}/assign`)
        .send({ employeeId: "00000000-0000-0000-0000-000000000000" });
      expect(assignRes.status).toBe(403);
    });

    it("403s an employee on the general asset list (assets:read stays HR/admin-scoped)", async () => {
      const { agent } = await loginAsEmployee();
      const res = await agent.get(`${API}/assets`);
      expect(res.status).toBe(403);
    });

    it("requires authentication on /hr/me/assets", async () => {
      const res = await supertest(app).get(`${API}/me/assets`);
      expect(res.status).toBe(401);
    });
  });
});
