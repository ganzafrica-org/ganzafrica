import { db } from "../client";
import { sql } from "drizzle-orm";

/**
 * Migration: Clean up invalid data and change to users table
 */
export async function cleanupAndChangeToUsers() {
  try {
    console.log("Starting migration: Cleanup and change to users table...");

    // Step 1: Delete invalid task_team_members (where user_id doesn't exist in users)
    console.log("Cleaning up task_team_members...");
    const deleteResult1 = await db.execute(sql`
      DELETE FROM task_team_members 
      WHERE user_id NOT IN (SELECT id FROM users);
    `);
    console.log("✓ Cleaned up task_team_members");

    // Step 2: Delete invalid task_project_members
    console.log("Cleaning up task_project_members...");
    const deleteResult2 = await db.execute(sql`
      DELETE FROM task_project_members 
      WHERE user_id NOT IN (SELECT id FROM users);
    `);
    console.log("✓ Cleaned up task_project_members");

    // Step 3: Update task_team_members foreign key
    await db.execute(sql`
      ALTER TABLE task_team_members 
      DROP CONSTRAINT IF EXISTS task_team_members_user_id_fkey;
    `);
    console.log("✓ Dropped task_team_members foreign key constraint");

    await db.execute(sql`
      ALTER TABLE task_team_members 
      ADD CONSTRAINT task_team_members_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `);
    console.log("✓ Added task_team_members foreign key to users table");

    // Step 4: Update task_project_members foreign key
    await db.execute(sql`
      ALTER TABLE task_project_members 
      DROP CONSTRAINT IF EXISTS task_project_members_user_id_fkey;
    `);
    console.log("✓ Dropped task_project_members foreign key constraint");

    await db.execute(sql`
      ALTER TABLE task_project_members 
      ADD CONSTRAINT task_project_members_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `);
    console.log("✓ Added task_project_members foreign key to users table");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  cleanupAndChangeToUsers()
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

