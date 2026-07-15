import { db } from "../client";
import { sql } from "drizzle-orm";

/**
 * Migration: Fix task_status enum to include 'overdue' status
 */
export async function fixTaskStatusEnum() {
  try {
    console.log("Starting migration: Fix task_status enum...");

    // Add 'overdue' to the task_status enum
    await db.execute(sql`
      DO $$ BEGIN
        ALTER TYPE task_status ADD VALUE 'overdue';
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log("✓ Added 'overdue' to task_status enum");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  fixTaskStatusEnum()
    .then(() => {
      console.log("Migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
