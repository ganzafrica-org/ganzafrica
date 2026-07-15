import { db } from "../client";
import { sql } from "drizzle-orm";

/**
 * Migration: Change task_team_members and task_project_members to reference users table
 * This allows proper authentication and role management
 */
export async function changeBackToUsersTable() {
  try {
    console.log("Starting migration: Change back to users table...");

    // Update task_team_members
    console.log("Updating task_team_members...");

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

    // Update task_project_members
    console.log("Updating task_project_members...");

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
  changeBackToUsersTable()
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
