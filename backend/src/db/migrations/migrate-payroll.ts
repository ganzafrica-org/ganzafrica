import { sql } from "drizzle-orm";
import { db } from "../client";
import fs from "fs";
import path from "path";

async function runPayrollMigration() {
  console.log("Running payroll table migration...");

  try {
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, "../../../drizzle/0007_add_payroll_table.sql"),
      "utf-8"
    );

    // Execute the migration
    await db.execute(sql.raw(migrationSQL));

    console.log("✅ Payroll table migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

runPayrollMigration();
