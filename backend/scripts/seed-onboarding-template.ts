/**
 * LCM-01 rollout (spec §10): seed a default onboarding template so a REC-05 hire never lands in a
 * template-less state, then backfill offers whose acceptance predated the engine.
 *
 *   pnpm db:seed:onboarding
 *
 * Idempotent — the template is created once by name, and the backfill skips employees who already
 * have an instance.
 */
import { and, eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { employees, offers, process_templates, users, roles, user_roles } from "../src/db/schema";
import {
  addTemplateTask,
  createTemplate,
  instantiateProcess,
} from "../src/services/hr/process.service";
import { Logger } from "../src/config";

const logger = new Logger("SeedOnboardingTemplate");

const TEMPLATE_NAME = "Default onboarding";

const DEFAULT_TASKS = [
  {
    title: "Sign employment contract",
    default_assignee: "employee" as const,
    kind: "contract_signing",
    is_blocking: true,
    due_offset_days: 3,
  },
  {
    title: "Upload national ID / passport",
    default_assignee: "employee" as const,
    kind: "document_upload",
    is_blocking: true,
    due_offset_days: 3,
  },
  {
    title: "Set up leave entitlements",
    default_assignee: "hr" as const,
    kind: "leave_setup",
    is_blocking: true,
    due_offset_days: 5,
  },
  {
    title: "Issue laptop and accessories",
    default_assignee: "it" as const,
    kind: "asset_assignment",
    is_blocking: true,
    due_offset_days: 1,
  },
  {
    title: "Create email and system accounts",
    default_assignee: "it" as const,
    is_blocking: true,
    due_offset_days: 1,
  },
  {
    title: "Add to payroll",
    default_assignee: "finance" as const,
    visibility: "staff_only" as const,
    is_blocking: true,
    due_offset_days: 7,
  },
  {
    title: "Background and reference checks",
    default_assignee: "hr" as const,
    visibility: "staff_only" as const,
    is_blocking: false,
    due_offset_days: 10,
  },
  {
    title: "Team introduction and office tour",
    default_assignee: "manager" as const,
    is_blocking: false,
    due_offset_days: 2,
  },
  {
    title: "First-week check-in",
    default_assignee: "manager" as const,
    is_blocking: false,
    due_offset_days: 7,
  },
];

async function firstHrUserId(): Promise<number> {
  const [hr] = await db
    .select({ userId: user_roles.user_id })
    .from(user_roles)
    .innerJoin(roles, eq(user_roles.role_id, roles.id))
    .where(eq(roles.name, "hr"))
    .limit(1);
  if (hr) return hr.userId;

  const [anyUser] = await db.select({ id: users.id }).from(users).limit(1);
  if (!anyUser) throw new Error("No users exist — run the RBAC seed first");
  return anyUser.id;
}

async function main() {
  const actorUserId = await firstHrUserId();

  const [existing] = await db
    .select()
    .from(process_templates)
    .where(and(eq(process_templates.type, "onboarding"), eq(process_templates.name, TEMPLATE_NAME)))
    .limit(1);

  if (existing) {
    logger.info(`Template "${TEMPLATE_NAME}" already exists (id ${existing.id})`);
  } else {
    const template = await createTemplate(
      { type: "onboarding", name: TEMPLATE_NAME, employment_types: null },
      actorUserId,
    );
    for (const task of DEFAULT_TASKS) {
      await addTemplateTask(template.id, task);
    }
    logger.info(`Created "${TEMPLATE_NAME}" with ${DEFAULT_TASKS.length} tasks`);
  }

  // Backfill: hires accepted before the engine existed. There is no offer→employee FK, so the
  // employees still sitting in 'onboarding' are the population; pending offers are cleared after.
  const stranded = await db
    .select({ id: employees.id })
    .from(employees)
    .where(eq(employees.status, "onboarding"));

  let created = 0;
  for (const employee of stranded) {
    try {
      await instantiateProcess("onboarding", employee.id, { actorUserId });
      created++;
    } catch (error) {
      // 409 means an instance already exists — expected on a re-run.
      logger.info(`Skipped employee ${employee.id}: ${(error as Error).message}`);
    }
  }

  if (created > 0) {
    await db
      .update(offers)
      .set({ onboarding_pending: false })
      .where(eq(offers.onboarding_pending, true));
  }

  logger.info(`Backfill: instantiated ${created} onboarding process(es)`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error("Onboarding template seed failed", error);
    process.exit(1);
  });
