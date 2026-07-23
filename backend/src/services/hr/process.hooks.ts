/**
 * Wires REC-05's hire seam to the LCM-01 engine. Called once at startup.
 *
 * Everything here runs on the hire's own transaction handle: the employees row it references is not
 * committed yet, so going through the pool would both deadlock and risk surviving a rolled-back hire.
 */
import { eq } from "drizzle-orm";
import { Logger } from "@/config";
import { employees, roles, user_roles } from "@/db/schema";
import type { DbTransaction } from "@/db/client";
import { setOnboardingHooks } from "../recruitment/onboarding.hooks";
import { instantiateProcess } from "./process.service";

const logger = new Logger("ProcessHooks");

/**
 * An automated hire has no acting HR user. Prefer any HR account so `hr`-class tasks land on a
 * real person; fall back to the new employee's own account so the instance still has a creator.
 */
async function resolveActor(tx: DbTransaction, employeeId: string): Promise<number> {
  const [hrUser] = await tx
    .select({ userId: user_roles.user_id })
    .from(user_roles)
    .innerJoin(roles, eq(user_roles.role_id, roles.id))
    .where(eq(roles.name, "hr"))
    .limit(1);
  if (hrUser) return hrUser.userId;

  const [employee] = await tx
    .select({ userId: employees.user_id })
    .from(employees)
    .where(eq(employees.id, employeeId))
    .limit(1);
  return employee?.userId ?? 0;
}

export function registerOnboardingHooks(): void {
  setOnboardingHooks({
    async onHired(ctx) {
      const actorUserId = await resolveActor(ctx.tx, ctx.employeeId);
      await instantiateProcess("onboarding", ctx.employeeId, {
        actorUserId,
        tx: ctx.tx,
        startedAt: ctx.startDate ? new Date(ctx.startDate) : new Date(),
      });
      logger.info(`Onboarding instantiated for employee ${ctx.employeeId}`);
      return true;
    },
  });
}
