import { sql } from "drizzle-orm";
import { db } from "../client";
import fs from "fs";
import path from "path";

async function runMigration() {
  console.log("Running payroll formats migration (0008)...");

  try {
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, "../../../drizzle/0008_payroll_optional_user_and_formats.sql"),
      "utf-8",
    );

    // Strip comment lines first, then split on semicolons
    const withoutComments = migrationSQL
      .split("\n")
      .filter((line) => !line.trimStart().startsWith("--"))
      .join("\n");

    const statements = withoutComments
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await db.execute(sql.raw(statement));
      console.log(
        `  ✓ ${statement
          .split("\n")
          .find((l) => l.trim())
          ?.substring(0, 80)}`,
      );
    }

    console.log("\n✅ Payroll formats migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runMigration();
