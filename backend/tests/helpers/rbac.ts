import { db } from "../../src/db/client";
import { permissions, role_permissions } from "../../src/db/schema";
import { eq, and } from "drizzle-orm";
import { ensureRole } from "../factories";

/** Grant a role a resource:action permission in the test DB (RBAC seed isn't run in tests). */
export async function grant(roleName: string, resource: string, action: string) {
  const role = await ensureRole(roleName);
  const existing = await db
    .select()
    .from(permissions)
    .where(and(eq(permissions.resource, resource), eq(permissions.action, action)))
    .limit(1);
  const permId =
    existing[0]?.id ??
    (
      await db
        .insert(permissions)
        .values({
          id: Math.floor(Math.random() * 1e9),
          name: `${resource}:${action}`,
          resource,
          action,
        })
        .returning()
    )[0].id;
  await db
    .insert(role_permissions)
    .values({ id: Math.floor(Math.random() * 1e9), role_id: role.id, permission_id: permId })
    .onConflictDoNothing();
}
