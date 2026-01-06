import { db } from "../client";
import { sql } from "drizzle-orm";

/**
 * Migration: Change user_id in task_team_members to reference teams table instead of users table
 * This allows storing portal team members (Fellows/Team) directly
 */
export async function changeUserIdToReferenceTeams() {
  try {
    console.log("Starting migration: Change user_id to reference teams table...");

    // Step 1: Drop the old foreign key constraint
    await db.execute(sql`
      ALTER TABLE task_team_members 
      DROP CONSTRAINT IF EXISTS task_team_members_user_id_fkey;
    `);
    console.log("✓ Dropped old user_id foreign key constraint (users table)");

    // Step 2: Add new foreign key constraint referencing teams table
    await db.execute(sql`
      ALTER TABLE task_team_members 
      ADD CONSTRAINT task_team_members_user_id_fkey 
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
  changeUserIdToReferenceTeams()
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

