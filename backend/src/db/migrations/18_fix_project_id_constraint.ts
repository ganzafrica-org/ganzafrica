import { db } from "../client";
import { sql } from "drizzle-orm";

/**
 * Migration: Fix project_id constraint to allow NULL values
 */
export async function fixProjectIdConstraint() {
  try {
    console.log("Starting migration: Fix project_id constraint...");

    // Make project_id nullable
    await db.execute(sql`
      ALTER TABLE tasks ALTER COLUMN project_id DROP NOT NULL;
    `);
    console.log("✓ Made project_id nullable in tasks table");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  fixProjectIdConstraint()
    .then(() => {
      console.log("Migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}




import { db } from "../client";
import { sql } from "drizzle-orm";

/**
 * Migration: Fix project_id constraint to allow NULL values
 */
export async function fixProjectIdConstraint() {
  try {
    console.log("Starting migration: Fix project_id constraint...");

    // Make project_id nullable
    await db.execute(sql`
      ALTER TABLE tasks ALTER COLUMN project_id DROP NOT NULL;
    `);
    console.log("✓ Made project_id nullable in tasks table");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  fixProjectIdConstraint()
    .then(() => {
      console.log("Migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}


