import { db } from "../client";
import { sql } from "drizzle-orm";

/**
 * Migration: Add position column to task_team_members table
 * This allows storing the actual position/title of team members from portal teams
 */
export async function addPositionToTaskTeamMembers() {
  try {
    console.log("Starting migration: Add position to task_team_members...");

    // Add position column to task_team_members table
    await db.execute(sql`
      ALTER TABLE task_team_members 
      ADD COLUMN IF NOT EXISTS position VARCHAR(500);
    `);

    console.log("✓ Added position column to task_team_members");
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  addPositionToTaskTeamMembers()
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

