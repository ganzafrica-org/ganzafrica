/**
 * MOD-02 org hierarchy: `employees.manager_id` is the single source of truth for reporting
 * lines. `setManager` is the only path that may write it — it is cycle-safe by construction
 * (walks the proposed manager's own ancestor chain and refuses if the employee being
 * reassigned would appear in it, which also catches direct self-assignment as a 1-node cycle).
 */
import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { employees, org_backfill_unresolved } from "@/db/schema";
import { AppError } from "@/middlewares";
import { sendNotification } from "@/modules/hr/notifications/notification.service";

// Re-exported rather than reimplemented: this transitive, cycle-safe walk already exists and is
// already consumed live by MOD-06 (leave-core.service.ts, approval routing) and LCM-01
// (process.service.ts, task-assignee resolution). MOD-02's spec assumed it would be created here;
// it predates this module. Duplicating the walk in a second place would only invite drift between
// two "cycle-safe" implementations, so this file re-exports the one real implementation instead.
//
// FROZEN ON MERGE: `isManagerOf(managerId, employeeId)` — true when `managerId` is `employeeId`'s
// direct manager or anywhere above them in the `employees.manager_id` chain (skip-level managers
// count). Consumed as-is by MOD-06 (leave approval) and will be by MOD-09 (performance reviews).
// Changing this signature or its transitivity semantics is a breaking-change conversation with
// those modules, not a quiet refactor.
export { isManagerOf } from "./employee-context";

const employeeName = sql<string>`${employees.first_name} || ' ' || ${employees.last_name}`;

// Defensive cap on the ancestor walk during a setManager cycle check — a legitimate chain this
// deep is itself a data smell (MOD-02 §8), not just a performance guard.
const MAX_CHAIN_DEPTH = 20;

export class CycleError extends AppError {
  readonly path: string[];
  constructor(path: string[]) {
    super("Assigning this manager would create a reporting cycle", 422, "cycle");
    this.path = path;
  }
}

/**
 * Walk `manager_id` ancestors starting at (and including) `startId`, following each row's own
 * manager upward until a root (`manager_id IS NULL`) or the depth cap. Returns `{id, name}` per
 * node, root-ward. Used only for the cycle check, where we need names for the error path — the
 * transitive membership check itself is `isManagerOf`.
 */
async function ancestorChain(startId: string): Promise<{ id: string; name: string }[]> {
  const chain: { id: string; name: string }[] = [];
  let currentId: string | null = startId;

  for (let depth = 0; currentId; depth++) {
    if (depth >= MAX_CHAIN_DEPTH) {
      throw new AppError(
        "Manager chain exceeds the maximum depth (20) — restructure the hierarchy",
        422,
        "CHAIN_TOO_DEEP",
      );
    }
    const [row] = await db
      .select({ id: employees.id, name: employeeName, managerId: employees.manager_id })
      .from(employees)
      .where(eq(employees.id, currentId))
      .limit(1);
    if (!row) break;
    chain.push({ id: row.id, name: row.name });
    currentId = row.managerId;
  }

  return chain;
}

export interface SetManagerActor {
  /** Platform user id of the caller, or null for system-triggered reassignment (e.g. LCM-02
   *  re-parenting an exiting manager's direct reports — no HTTP actor exists for that call). */
  userId: number | null;
}

async function notifyManagerChange(
  employeeId: string,
  previousManagerId: string | null,
  newManagerId: string | null,
) {
  const ids = [employeeId, previousManagerId, newManagerId].filter(
    (id): id is string => id !== null,
  );
  if (!ids.length) return;

  const rows = await db
    .select({ id: employees.id, name: employeeName, userId: employees.user_id })
    .from(employees)
    .where(sql`${employees.id} IN ${ids}`);
  const byId = new Map(rows.map((r) => [r.id, r]));

  const subject = byId.get(employeeId);
  if (!subject) return;
  const newManagerName = newManagerId ? (byId.get(newManagerId)?.name ?? "someone") : null;
  const recipientUserIds = [
    subject.userId,
    newManagerId ? byId.get(newManagerId)?.userId : undefined,
    previousManagerId ? byId.get(previousManagerId)?.userId : undefined,
  ].filter((id): id is number => typeof id === "number");

  try {
    await sendNotification({
      type: "MANAGER_CHANGED",
      triggeredBy: 0,
      relatedEntity: { employeeId },
      title: "Reporting line updated",
      message: newManagerId
        ? `${subject.name}'s manager is now ${newManagerName}.`
        : `${subject.name} no longer has a manager assigned.`,
      priority: "NORMAL",
      recipientUserIds,
    });
  } catch {
    // Notification failure must not break the reassignment itself.
  }
}

/**
 * Reassign (or clear, with `managerId: null`) an employee's manager. Cycle-safe: walks the
 * proposed manager's own ancestor chain and rejects if `employeeId` appears in it (self-
 * assignment is the depth-0 case of this same check). Writes an audit notification to the
 * employee and old/new manager. Pure — no req/res coupling, so LCM-02 can call this directly
 * for offboarding re-parenting.
 */
export async function setManager(
  employeeId: string,
  managerId: string | null,
  _actor: SetManagerActor,
) {
  const [subjectRow] = await db
    .select({ id: employees.id, manager_id: employees.manager_id })
    .from(employees)
    .where(eq(employees.id, employeeId))
    .limit(1);
  if (!subjectRow) throw new AppError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");

  const previousManagerId = subjectRow.manager_id;

  if (managerId !== null) {
    const [managerRow] = await db
      .select({ id: employees.id, status: employees.status })
      .from(employees)
      .where(eq(employees.id, managerId))
      .limit(1);
    if (!managerRow) throw new AppError("Manager not found", 404, "MANAGER_NOT_FOUND");
    if (managerRow.status === "exited") {
      throw new AppError("Cannot assign an exited employee as manager", 422, "MANAGER_EXITED");
    }

    const chain = await ancestorChain(managerId);
    const cycleIndex = chain.findIndex((n) => n.id === employeeId);
    if (cycleIndex !== -1) {
      throw new CycleError(chain.slice(0, cycleIndex + 1).map((n) => n.name));
    }
  }

  const [row] = await db
    .update(employees)
    .set({ manager_id: managerId, updated_at: new Date() })
    .where(eq(employees.id, employeeId))
    .returning();

  // A resolved manager (any assignment, not just from the worklist) clears the backfill leftover
  // for this employee — the unresolved panel empties itself as HR assigns, per MOD-02 §5.
  await db
    .delete(org_backfill_unresolved)
    .where(eq(org_backfill_unresolved.employee_id, employeeId));

  invalidateOrgTreeCache();
  await notifyManagerChange(employeeId, previousManagerId, managerId);

  return row;
}

interface OrgTreeRow {
  id: string;
  name: string;
  job_title: string | null;
  department: string | null;
  picture: string | null;
  manager_id: string | null;
}

export interface OrgTreeNode {
  id: string;
  name: string;
  job_title: string | null;
  department: string | null;
  picture: string | null;
  children: OrgTreeNode[];
}

/**
 * Groups rows by manager_id into a nested tree. A row whose manager_id is null OR whose manager
 * isn't in this row set (the manager exited — LCM-02 re-parents on offboarding completion, but
 * the tree must not silently drop the subtree in the meantime) is treated as a root, so an
 * orphaned subtree floats up rather than disappearing.
 */
function buildTree(rows: OrgTreeRow[]): OrgTreeNode[] {
  const visibleIds = new Set(rows.map((r) => r.id));
  const byManager = new Map<string, OrgTreeRow[]>();
  const roots: OrgTreeRow[] = [];

  for (const row of rows) {
    if (row.manager_id && visibleIds.has(row.manager_id)) {
      if (!byManager.has(row.manager_id)) byManager.set(row.manager_id, []);
      byManager.get(row.manager_id)!.push(row);
    } else {
      roots.push(row);
    }
  }

  function toNode(row: OrgTreeRow): OrgTreeNode {
    return {
      id: row.id,
      name: row.name,
      job_title: row.job_title,
      department: row.department,
      picture: row.picture,
      children: (byManager.get(row.id) ?? []).map(toNode),
    };
  }

  return roots.map(toNode);
}

let treeCache: { data: OrgTreeNode[]; expiresAt: number } | null = null;
const TREE_CACHE_MS = 60_000;

export function invalidateOrgTreeCache() {
  treeCache = null;
}

/**
 * Full org tree, excluding exited employees. Roots are true roots (`manager_id IS NULL`) plus
 * "effective" roots — a non-exited employee whose manager is exited — so an exited manager's
 * subtree floats up instead of vanishing while LCM-02's re-parenting hook hasn't run yet
 * (MOD-02 §6 item 2). `buildTree` re-derives the same floating from the flat row set as a second,
 * cheaper safety net, so this holds even if the anchor's exited-manager subquery and a
 * since-changed row set disagree transiently. 60s cache.
 */
export async function getOrgTree(): Promise<OrgTreeNode[]> {
  if (treeCache && treeCache.expiresAt > Date.now()) return treeCache.data;

  const result = await db.execute(sql`
    WITH RECURSIVE org AS (
      SELECT id, (first_name || ' ' || last_name) AS name, job_title, department, picture,
             manager_id, 0 AS depth
      FROM employees
      WHERE status != 'exited'
        AND (manager_id IS NULL OR manager_id IN (SELECT id FROM employees WHERE status = 'exited'))
      UNION ALL
      SELECT e.id, (e.first_name || ' ' || e.last_name) AS name, e.job_title, e.department,
             e.picture, e.manager_id, org.depth + 1
      FROM employees e
      JOIN org ON e.manager_id = org.id
      WHERE e.status != 'exited'
    )
    SELECT id, name, job_title, department, picture, manager_id FROM org ORDER BY depth
  `);

  const data = buildTree(result.rows as unknown as OrgTreeRow[]);
  treeCache = { data, expiresAt: Date.now() + TREE_CACHE_MS };
  return data;
}

/**
 * A manager's reports. `direct: true` is one WHERE on `manager_id`; `direct: false` walks the
 * full subtree via a recursive CTE (transitive reports, e.g. for MOD-09 review scoping).
 */
export async function getReports(employeeId: string, opts: { direct: boolean }) {
  if (opts.direct) {
    return db
      .select({
        id: employees.id,
        first_name: employees.first_name,
        last_name: employees.last_name,
        job_title: employees.job_title,
        department: employees.department,
        status: employees.status,
      })
      .from(employees)
      .where(eq(employees.manager_id, employeeId));
  }

  const result = await db.execute(sql`
    WITH RECURSIVE reports AS (
      SELECT id, first_name, last_name, job_title, department, status, manager_id
      FROM employees WHERE manager_id = ${employeeId}
      UNION ALL
      SELECT e.id, e.first_name, e.last_name, e.job_title, e.department, e.status, e.manager_id
      FROM employees e
      JOIN reports ON e.manager_id = reports.id
    )
    SELECT id, first_name, last_name, job_title, department, status FROM reports
  `);

  return result.rows as {
    id: string;
    first_name: string;
    last_name: string;
    job_title: string | null;
    department: string | null;
    status: string;
  }[];
}

/** Unresolved backfill leftovers (raw text + the employee whose manager couldn't be matched). */
export async function listUnresolved() {
  return db
    .select({
      id: org_backfill_unresolved.id,
      employee_id: org_backfill_unresolved.employee_id,
      raw_text: org_backfill_unresolved.raw_text,
      employee_name: employeeName,
    })
    .from(org_backfill_unresolved)
    .innerJoin(employees, eq(employees.id, org_backfill_unresolved.employee_id))
    .where(eq(org_backfill_unresolved.resolved, false));
}
