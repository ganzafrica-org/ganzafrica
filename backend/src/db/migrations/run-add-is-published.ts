import { db } from "../client";
import { sql } from "drizzle-orm";

/**
 * Migration: Add is_published column to projects table
 */
async function runMigration() {
  try {
    console.log("Starting migration: Add is_published to projects...");

    // Add is_published column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false
    `);

    console.log("✓ Added is_published column to projects table");
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

export { runMigration };
