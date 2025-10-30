import { db } from "../client";
import { sql } from "drizzle-orm";

/**
 * Migration: Update task_team_members to reference portal teams instead of users
 * This allows adding portal team members (Fellows/Team) directly to task teams
 */
export async function updateTaskTeamMembersSchema() {
  try {
    console.log("Starting migration: Update task_team_members schema...");

    // Step 1: Add new columns
    await db.execute(sql`
      ALTER TABLE task_team_members 
      ADD COLUMN IF NOT EXISTS portal_team_id INTEGER,
      ADD COLUMN IF NOT EXISTS name VARCHAR(200),
      ADD COLUMN IF NOT EXISTS position VARCHAR(500);
    `);
    console.log("✓ Added new columns: portal_team_id, name, position");

    // Step 2: Make user_id nullable (since portal team members may not have user accounts)
    await db.execute(sql`
      ALTER TABLE task_team_members 
      ALTER COLUMN user_id DROP NOT NULL;
    `);
    console.log("✓ Made user_id nullable");

    // Step 3: Add foreign key constraint to portal teams
    await db.execute(sql`
      ALTER TABLE task_team_members 
      ADD CONSTRAINT task_team_members_portal_team_id_fkey 
      FOREIGN KEY (portal_team_id) REFERENCES teams(id) ON DELETE CASCADE;
    `);
    console.log("✓ Added foreign key constraint to portal teams");

    // Step 4: Drop old unique constraint and create new one
    await db.execute(sql`
      DROP INDEX IF EXISTS unique_team_user;
    `);
    console.log("✓ Dropped old unique constraint");

    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_team_portal_member 
      ON task_team_members(team_id, portal_team_id);
    `);
    console.log("✓ Created new unique constraint");

    // Step 5: Add index on portal_team_id
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS task_team_members_portal_team_id_idx 
      ON task_team_members(portal_team_id);
    `);
    console.log("✓ Added index on portal_team_id");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  updateTaskTeamMembersSchema()
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

