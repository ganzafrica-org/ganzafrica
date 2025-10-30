import { db } from "../client";
import { sql } from "drizzle-orm";

/**
 * Migration: Fix task_team_members constraints
 * Ensures portal_team_id is NOT NULL and user_id can be null
 */
export async function fixTaskTeamMembersConstraints() {
  try {
    console.log("Starting migration: Fix task_team_members constraints...");

    // Step 1: Drop the foreign key constraint on user_id (we'll recreate it without NOT NULL)
    await db.execute(sql`
      ALTER TABLE task_team_members 
      DROP CONSTRAINT IF EXISTS task_team_members_user_id_fkey;
    `);
    console.log("✓ Dropped old user_id foreign key constraint");

    // Step 2: Make sure user_id is nullable
    await db.execute(sql`
      ALTER TABLE task_team_members 
      ALTER COLUMN user_id DROP NOT NULL;
    `);
    console.log("✓ Made user_id nullable");

    // Step 3: Re-add the foreign key constraint (without NOT NULL requirement)
    await db.execute(sql`
      ALTER TABLE task_team_members 
      ADD CONSTRAINT task_team_members_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `);
    console.log("✓ Re-added user_id foreign key constraint (nullable)");

    // Step 4: Make portal_team_id NOT NULL (if it exists)
    await db.execute(sql`
      ALTER TABLE task_team_members 
      ALTER COLUMN portal_team_id SET NOT NULL;
    `);
    console.log("✓ Made portal_team_id NOT NULL");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  fixTaskTeamMembersConstraints()
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

