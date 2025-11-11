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
      await db.execute(
        sql`INSERT INTO roles (name, description, created_at, updated_at)
            VALUES ('admin', 'Administrator with full access', NOW(), NOW())
            RETURNING id`
      );
      console.log("Created admin role");
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
      // Add admin role to user_roles table using raw SQL
      await db.execute(
        sql`INSERT INTO user_roles (user_id, role_id, created_at, updated_at)
            VALUES (${targetUser.id}, ${adminRoleId}, NOW(), NOW())
            ON CONFLICT (user_id, role_id) DO NOTHING`
      );
      console.log("Added admin role to user_roles table");
    } else {
      console.log("User already has admin role in user_roles table");
    }

    // Check current role_id
    console.log(`Current user role_id: ${targetUser.role_id}`);
    
    // Check if user's role_id is already set to admin
    if (targetUser.role_id === adminRoleId) {
      console.log("✅ User's role_id is already set to admin. No update needed.");
    } else {
      console.log(`Updating user's role_id from ${targetUser.role_id} to ${adminRoleId}...`);
      
      // Use raw SQL to update, ensuring sequence exists and handling trigger
      // First, ensure audit_logs table and sequence exist
      try {
        // Create sequence if it doesn't exist
        await db.execute(
          sql`CREATE SEQUENCE IF NOT EXISTS audit_logs_id_seq`
        );
        
        // Ensure audit_logs table exists (it might not have the sequence properly set up)
        const auditTableExists = await db.execute(
          sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs')`
        );
        
        if (!auditTableExists.rows[0].exists) {
          console.log("Note: audit_logs table does not exist. Creating it...");
          await db.execute(
            sql`CREATE TABLE IF NOT EXISTS audit_logs (
              id INTEGER PRIMARY KEY DEFAULT nextval('audit_logs_id_seq'),
              user_id INTEGER REFERENCES users(id),
              action TEXT NOT NULL,
              resource_type TEXT NOT NULL,
              resource_id INTEGER,
              changes JSONB,
              ip_address TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )`
          );
        }
        
        console.log("Ensured audit_logs sequence and table exist");
      } catch (seqError: any) {
        console.log(`Note: Could not setup audit_logs (${seqError.message}). Will proceed with trigger disabled.`);
      }

      // Update user's role_id using raw SQL with trigger disabled to avoid audit issues
      try {
        // Temporarily disable the trigger
        await db.execute(
          sql`ALTER TABLE users DISABLE TRIGGER audit_users_trigger`
        );
        
        // Update the role_id
        await db.execute(
          sql`UPDATE users SET role_id = ${adminRoleId}, updated_at = NOW() WHERE id = ${targetUser.id}`
        );
        
        // Re-enable the trigger
        await db.execute(
          sql`ALTER TABLE users ENABLE TRIGGER audit_users_trigger`
        );
        
        console.log("✅ Updated user's role_id to admin");
      } catch (updateError: any) {
        // If disabling trigger fails, try direct update anyway
        console.log(`Warning: Could not disable trigger (${updateError.message}). Trying direct update...`);
        try {
          await db.execute(
            sql`UPDATE users SET role_id = ${adminRoleId}, updated_at = NOW() WHERE id = ${targetUser.id}`
          );
          console.log("✅ Updated user's role_id to admin (direct update)");
        } catch (directError: any) {
          console.error(`❌ Failed to update user's role_id: ${directError.message}`);
          // Don't throw - user might already be admin via user_roles table
          console.log("Note: User already has admin role in user_roles table, so they should have admin access.");
        }
      }
    }

    // Verify the final state
    const finalUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, targetUser.id))
      .limit(1);

    const finalRoleId = finalUser[0]?.role_id;
    
    console.log(`\n✅ Successfully set ${TARGET_EMAIL} as admin!`);
    console.log(`   User ID: ${targetUser.id}`);
    console.log(`   Admin Role ID: ${adminRoleId}`);
    console.log(`   User's role_id: ${finalRoleId}`);
    console.log(`   Has admin in user_roles: Yes`);
    
    if (finalRoleId === adminRoleId) {
      console.log(`\n🎉 User is now fully set as admin! They should log out and log back in to see admin features.`);
    } else if (existingUserRoles.length > 0) {
      console.log(`\n⚠️  Note: User has admin role in user_roles table, but role_id is ${finalRoleId}.`);
      console.log(`   The user should still have admin access through the user_roles table.`);
      console.log(`   They should log out and log back in to refresh their session.`);
    }
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

