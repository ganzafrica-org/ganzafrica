import { Request } from "express";
import { AppError } from "@/middlewares";
import type { HrRequester } from "@/types/employee.types";
import { getHrRequester as resolveHrRequester } from "@/services/hr/employee-context";

/**
 * Resolve the legacy HrRequester ({id, role, email}) from the authenticated platform user.
 * Async because it maps the user to their employee profile + RBAC roles. HR services still expect
 * the old enum shape during the transition (they get retired onto the employees table in MOD-01).
 */
export async function getHrRequester(req: Request): Promise<HrRequester> {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }
  const resolved = await resolveHrRequester(Number(req.user.id), req.user.email);
  return { id: resolved.id, role: resolved.role, email: resolved.email };
}
