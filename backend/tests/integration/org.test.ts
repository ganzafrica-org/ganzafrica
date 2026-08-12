/**
 * MOD-02 §6 — org hierarchy: cycle-safe reassignment, tree shape (incl. exited-manager
 * subtrees floating to root), transitive isManagerOf, the name-match backfill, and permissions.
 */
import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import app from "../../src/app";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import { employees, hr_contracts, org_backfill_unresolved } from "../../src/db/schema";
import { eq } from "drizzle-orm";
import {
  setManager,
  getOrgTree,
  getReports,
  isManagerOf,
  CycleError,
  invalidateOrgTreeCache,
} from "../../src/services/hr/org.service";
import { backfillManagers } from "../../src/services/hr/org-backfill.service";
import { makeOrgForest, makeContract, ensureRole } from "../factories";
import { loginAs } from "../helpers/auth";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares/auth.middleware";

describe("MOD-02 setManager — cycle prevention", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
  });

  it("rejects direct self-assignment as a 1-node cycle", async () => {
    const { A } = await makeOrgForest([{ name: "A" }]);
    await expect(setManager(A.employee.id, A.employee.id, { userId: null })).rejects.toThrow(
      CycleError,
    );
    await expect(setManager(A.employee.id, A.employee.id, { userId: null })).rejects.toMatchObject({
      statusCode: 422,
      code: "cycle",
      path: ["A Test"],
    });
  });

  it("rejects assigning a direct child as one's own manager", async () => {
    // A manages B (B.manager_id = A). Trying to make A report to B is a 2-node cycle.
    const { A, B } = await makeOrgForest([{ name: "A", children: [{ name: "B" }] }]);
    await expect(setManager(A.employee.id, B.employee.id, { userId: null })).rejects.toMatchObject({
      statusCode: 422,
      code: "cycle",
      path: ["B Test", "A Test"],
    });
  });

  it("rejects a cycle formed deeper in a subtree", async () => {
    // A -> B -> C. Trying to make A report to C (a grandchild) is a cycle.
    const { A, C } = await makeOrgForest([
      { name: "A", children: [{ name: "B", children: [{ name: "C" }] }] },
    ]);
    await expect(setManager(A.employee.id, C.employee.id, { userId: null })).rejects.toMatchObject({
      statusCode: 422,
      code: "cycle",
      path: ["C Test", "B Test", "A Test"],
    });
  });

  it("true negative control: a legal reassignment elsewhere in the org succeeds", async () => {
    // A -> B -> C, and D sits in a separate branch. Moving A under D is not a cycle.
    const { A, D } = await makeOrgForest([
      { name: "A", children: [{ name: "B", children: [{ name: "C" }] }] },
      { name: "D" },
    ]);
    const updated = await setManager(A.employee.id, D.employee.id, { userId: null });
    expect(updated.manager_id).toBe(D.employee.id);
  });

  it("clears an unresolved backfill row for the employee once a manager is assigned", async () => {
    const { A, D } = await makeOrgForest([{ name: "A" }, { name: "D" }]);
    await db.insert(org_backfill_unresolved).values({
      employee_id: A.employee.id,
      raw_text: "some ambiguous name",
    });

    await setManager(A.employee.id, D.employee.id, { userId: null });

    const remaining = await db
      .select()
      .from(org_backfill_unresolved)
      .where(eq(org_backfill_unresolved.employee_id, A.employee.id));
    expect(remaining).toHaveLength(0);
  });
});

describe("MOD-02 getOrgTree — CTE shape", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    invalidateOrgTreeCache();
  });

  it("builds a 2-root, 3-level forest correctly", async () => {
    const forest = await makeOrgForest([
      {
        name: "Root1",
        children: [
          { name: "Mid1", children: [{ name: "Leaf1" }, { name: "Leaf2" }] },
          { name: "Mid2" },
        ],
      },
      { name: "Root2", children: [{ name: "Mid3" }] },
    ]);

    const tree = await getOrgTree();
    expect(tree.map((n) => n.name).sort()).toEqual(["Root1 Test", "Root2 Test"]);

    const root1 = tree.find((n) => n.id === forest.Root1.employee.id)!;
    expect(root1.children.map((n) => n.name).sort()).toEqual(["Mid1 Test", "Mid2 Test"]);

    const mid1 = root1.children.find((n) => n.id === forest.Mid1.employee.id)!;
    expect(mid1.children.map((n) => n.name).sort()).toEqual(["Leaf1 Test", "Leaf2 Test"]);
    expect(mid1.children.every((n) => n.children.length === 0)).toBe(true);
  });

  it("excludes exited employees from the tree entirely", async () => {
    const forest = await makeOrgForest([
      { name: "Root1", children: [{ name: "Gone", status: "exited" }] },
    ]);
    const tree = await getOrgTree();
    const root1 = tree.find((n) => n.id === forest.Root1.employee.id)!;
    expect(root1.children).toHaveLength(0);

    const ids = new Set<string>();
    function collect(nodes: typeof tree) {
      for (const n of nodes) {
        ids.add(n.id);
        collect(n.children);
      }
    }
    collect(tree);
    expect(ids.has(forest.Gone.employee.id)).toBe(false);
  });

  it("floats an orphaned subtree to root when its manager has exited", async () => {
    // Root1 -> Manager (exited) -> Kid. Manager disappears from the tree; Kid must not vanish
    // with them — LCM-02 re-parents on offboarding completion, but until that hook runs the
    // chart must not silently drop live employees.
    const forest = await makeOrgForest([
      {
        name: "Root1",
        children: [{ name: "Manager", status: "exited", children: [{ name: "Kid" }] }],
      },
    ]);

    const tree = await getOrgTree();
    const rootNames = tree.map((n) => n.name).sort();
    expect(rootNames).toEqual(["Kid Test", "Root1 Test"]);

    const kidRoot = tree.find((n) => n.id === forest.Kid.employee.id)!;
    expect(kidRoot.children).toHaveLength(0);
  });

  it("caches for 60s and invalidateOrgTreeCache forces a refetch", async () => {
    await makeOrgForest([{ name: "Root1" }]);
    const first = await getOrgTree();
    expect(first).toHaveLength(1);

    // Insert a second root directly, bypassing setManager (which would itself invalidate).
    await makeOrgForest([{ name: "Root2" }]);
    const stillCached = await getOrgTree();
    expect(stillCached).toHaveLength(1);

    invalidateOrgTreeCache();
    const refreshed = await getOrgTree();
    expect(refreshed).toHaveLength(2);
  });
});

describe("MOD-02 getReports", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
  });

  it("direct returns only immediate reports", async () => {
    const { A, B, C } = await makeOrgForest([
      { name: "A", children: [{ name: "B", children: [{ name: "C" }] }] },
    ]);
    const direct = await getReports(A.employee.id, { direct: true });
    expect(direct.map((r) => r.id)).toEqual([B.employee.id]);
    void C;
  });

  it("non-direct (all) returns the full transitive subtree", async () => {
    const { A, B, C } = await makeOrgForest([
      { name: "A", children: [{ name: "B", children: [{ name: "C" }] }] },
    ]);
    const all = await getReports(A.employee.id, { direct: false });
    expect(all.map((r) => r.id).sort()).toEqual([B.employee.id, C.employee.id].sort());
  });
});

describe("MOD-02 isManagerOf — transitive", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
  });

  it("true for a direct manager and a skip-level manager; false otherwise", async () => {
    const { A, B, C, D } = await makeOrgForest([
      { name: "A", children: [{ name: "B", children: [{ name: "C" }] }] },
      { name: "D" },
    ]);
    expect(await isManagerOf(B.employee.id, C.employee.id)).toBe(true); // direct
    expect(await isManagerOf(A.employee.id, C.employee.id)).toBe(true); // skip-level (transitive)
    expect(await isManagerOf(C.employee.id, A.employee.id)).toBe(false); // wrong direction
    expect(await isManagerOf(D.employee.id, C.employee.id)).toBe(false); // unrelated branch
    expect(await isManagerOf(A.employee.id, A.employee.id)).toBe(false); // self
  });
});

describe("MOD-02 backfill-managers — name match", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
  });

  it("resolves exact and case/whitespace-variant matches, leaves ambiguous/missing unresolved, and is idempotent", async () => {
    const forest = await makeOrgForest([
      { name: "Alice", children: [] },
      { name: "Bob", children: [] },
      { name: "John", children: [] }, // one "John" — deliberately ambiguous target below
    ]);
    // A second "John" makes the name ambiguous.
    const { John2 } = await makeOrgForest([{ name: "John" }]);
    void John2;

    const subject = (await makeOrgForest([{ name: "Target" }])).Target;

    await makeContract({ employeeId: subject.employee.id, jobTitle: "Analyst" });
    await db
      .update(hr_contracts)
      .set({ report_to: "  alice test  " }) // exact match, case/whitespace-insensitive
      .where(eq(hr_contracts.employee_ref_id, subject.employee.id));

    const ambiguousSubject = (await makeOrgForest([{ name: "Ambiguous" }])).Ambiguous;
    await makeContract({ employeeId: ambiguousSubject.employee.id, jobTitle: "Analyst" });
    await db
      .update(hr_contracts)
      .set({ report_to: "John Test" }) // matches both "John Test" rows -> ambiguous
      .where(eq(hr_contracts.employee_ref_id, ambiguousSubject.employee.id));

    const missingSubject = (await makeOrgForest([{ name: "Missing" }])).Missing;
    await makeContract({ employeeId: missingSubject.employee.id, jobTitle: "Analyst" });
    await db
      .update(hr_contracts)
      .set({ report_to: "Nobody Here" }) // zero matches
      .where(eq(hr_contracts.employee_ref_id, missingSubject.employee.id));

    const firstRun = await backfillManagers();
    expect(firstRun.resolved).toBe(1);
    expect(firstRun.unresolved).toBe(2);

    const [resolvedRow] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, subject.employee.id));
    expect(resolvedRow.manager_id).toBe(forest.Alice.employee.id);

    const unresolvedRows = await db.select().from(org_backfill_unresolved);
    expect(unresolvedRows.map((r) => r.employee_id).sort()).toEqual(
      [ambiguousSubject.employee.id, missingSubject.employee.id].sort(),
    );

    // Idempotent: rerunning must not double-insert unresolved rows or touch the resolved one.
    const secondRun = await backfillManagers();
    expect(secondRun.resolved).toBe(0); // subject already has a manager_id, skipped
    const unresolvedAfterRerun = await db.select().from(org_backfill_unresolved);
    expect(unresolvedAfterRerun).toHaveLength(2);
  });

  it("sends a would-be-cycle backfill match to unresolved instead of applying it", async () => {
    // Manager reports to Report per contract text (backwards) -- applying it verbatim would
    // make Report manage itself transitively once we also set Report's manager the normal way.
    const { Report, Boss } = await makeOrgForest([
      { name: "Boss", children: [{ name: "Report" }] },
    ]);
    const cycleSubject = Boss.employee.id;
    await makeContract({ employeeId: cycleSubject, jobTitle: "Exec" });
    await db
      .update(hr_contracts)
      .set({ report_to: "Report Test" }) // Boss -> Report, but Report already reports to Boss
      .where(eq(hr_contracts.employee_ref_id, cycleSubject));

    const result = await backfillManagers();
    expect(result.unresolved).toBeGreaterThanOrEqual(1);

    const [bossRow] = await db.select().from(employees).where(eq(employees.id, Boss.employee.id));
    expect(bossRow.manager_id).toBeNull();
    const unresolvedForBoss = await db
      .select()
      .from(org_backfill_unresolved)
      .where(eq(org_backfill_unresolved.employee_id, Boss.employee.id));
    expect(unresolvedForBoss).toHaveLength(1);
    void Report;
  });
});

describe("MOD-02 permissions over HTTP", () => {
  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    await ensureRole("employee");
    await ensureRole("hr");
    await grant("employee", "org_chart", "read");
    await grant("hr", "employees", "manage");
  });

  it("an employee reads the chart (200) but cannot edit a manager (403)", async () => {
    const employee = await loginAs("employee");
    const { A } = await makeOrgForest([{ name: "A" }]);

    const chart = await employee.agent.get("/api/hr/org-chart");
    expect(chart.status).toBe(200);

    const edit = await employee.agent
      .patch(`/api/hr/employees/${A.employee.id}/manager`)
      .send({ manager_id: null });
    expect(edit.status).toBe(403);
  });

  it("HR can edit a manager over HTTP and a cycle attempt 422s with the path", async () => {
    const hr = await loginAs("hr");
    const { A, B } = await makeOrgForest([{ name: "A", children: [{ name: "B" }] }]);

    const ok = await hr.agent
      .patch(`/api/hr/employees/${A.employee.id}/manager`)
      .send({ manager_id: null });
    expect(ok.status).toBe(200);

    const cycle = await hr.agent
      .patch(`/api/hr/employees/${A.employee.id}/manager`)
      .send({ manager_id: B.employee.id });
    expect(cycle.status).toBe(422);
    expect(cycle.body).toMatchObject({ error: "cycle", path: ["B Test", "A Test"] });
  });
});
