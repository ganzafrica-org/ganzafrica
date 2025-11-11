/**
 * Script to set a specific user as admin
 * Usage: ts-node backend/scripts/set-admin-user.ts
 * Or: node -r ts-node/register backend/scripts/set-admin-user.ts
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and } from "drizzle-orm";
import * as dotenv from "dotenv";
import path from "path";
import * as schema from "../src/db/schema";
import { sql } from "drizzle-orm";

// Load environment variables
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

const DATABASE_URL = process.env.DATABASE_URL;
const TARGET_EMAIL = "jeannineuwasee@gmail.com";

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

async function setAdminUser() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  try {
    console.log(`Setting ${TARGET_EMAIL} as admin...`);

    // Find the admin role
    const adminRoles = await db
      .select()
      .from(schema.roles)
      .where(eq(schema.roles.name, "admin"))
      .limit(1);

    if (adminRoles.length === 0) {
      // Create admin role if it doesn't exist
      console.log("Admin role not found, creating it...");
      const maxIdResult = await db.execute(
        sql<{ max: number }>`SELECT COALESCE(MAX(id), 1000) + 1 as max FROM roles`
      );
      const adminRoleId = maxIdResult.rows[0].max;

      await db.insert(schema.roles).values({
        id: adminRoleId,
        name: "admin",
        description: "Administrator with full access",
        created_at: new Date(),
        updated_at: new Date(),
      });

      console.log(`Created admin role with ID: ${adminRoleId}`);
    }

    // Get admin role ID
    const adminRole = await db
      .select()
      .from(schema.roles)
      .where(eq(schema.roles.name, "admin"))
      .limit(1);

    const adminRoleId = adminRole[0].id;
    console.log(`Admin role ID: ${adminRoleId}`);

    // Find the user by email
    const targetUsers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, TARGET_EMAIL))
      .limit(1);

    if (targetUsers.length === 0) {
      console.error(`User with email ${TARGET_EMAIL} not found`);
      process.exit(1);
    }

    const targetUser = targetUsers[0];
    console.log(`Found user: ${targetUser.name} (ID: ${targetUser.id})`);

    // Check if user already has admin role in user_roles table
    const existingUserRoles = await db
      .select()
      .from(schema.user_roles)
      .where(
        and(
          eq(schema.user_roles.user_id, targetUser.id),
          eq(schema.user_roles.role_id, adminRoleId)
        )
      )
      .limit(1);

    if (existingUserRoles.length === 0) {
      // Get maximum user_roles ID
      const maxUserRoleIdResult = await db.execute(
        sql<{ max: number }>`SELECT COALESCE(MAX(id), 5000) + 1 as max FROM user_roles`
      );
      const maxUserRoleId = maxUserRoleIdResult.rows[0].max;

      // Add admin role to user_roles table
      await db.insert(schema.user_roles).values({
        id: maxUserRoleId,
        user_id: targetUser.id,
        role_id: adminRoleId,
        created_at: new Date(),
        updated_at: new Date(),
      });

      console.log("Added admin role to user_roles table");
    } else {
      console.log("User already has admin role in user_roles table");
    }

    // Update user's primary role_id to admin
    await db
      .update(schema.users)
      .set({
        role_id: adminRoleId,
        updated_at: new Date(),
      })
      .where(eq(schema.users.id, targetUser.id));

    console.log(`✅ Successfully set ${TARGET_EMAIL} as admin!`);
    console.log(`   User ID: ${targetUser.id}`);
    console.log(`   Admin Role ID: ${adminRoleId}`);
  } catch (error) {
    console.error("Error setting admin user:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  setAdminUser().catch(console.error);
}

export { setAdminUser };

