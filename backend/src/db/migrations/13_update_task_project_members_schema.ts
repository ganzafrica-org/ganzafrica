import { db } from "../client";
import { sql } from "drizzle-orm";

/**
 * Migration: Update task_project_members to reference portal teams
 * Same pattern as task_team_members
 */
export async function updateTaskProjectMembersSchema() {
  try {
    console.log("Starting migration: Update task_project_members schema...");

    // Step 1: Add new columns
    await db.execute(sql`
      ALTER TABLE task_project_members 
      ADD COLUMN IF NOT EXISTS name VARCHAR(200),
      ADD COLUMN IF NOT EXISTS position VARCHAR(500);
    `);
    console.log("✓ Added new columns: name, position");

    // Step 2: Drop the old foreign key constraint
    await db.execute(sql`
      ALTER TABLE task_project_members 
      DROP CONSTRAINT IF EXISTS task_project_members_user_id_fkey;
    `);
    console.log("✓ Dropped old user_id foreign key constraint (users table)");

    // Step 3: Add new foreign key constraint referencing teams table
    await db.execute(sql`
      ALTER TABLE task_project_members 
      ADD CONSTRAINT task_project_members_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES teams(id) ON DELETE CASCADE;
    `);
    console.log("✓ Added new user_id foreign key constraint (teams table)");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  updateTaskProjectMembersSchema()
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

