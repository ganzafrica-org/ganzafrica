import { db } from "../client";
import fs from "fs";
import path from "path";

async function runMigration() {
  const sqlPath = path.join(__dirname, "../../../drizzle/0009_payroll_schema_cleanup.sql");
  const raw = fs.readFileSync(sqlPath, "utf-8");

  // Strip comment lines before splitting on semicolons
  const stripped = raw
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  const statements = stripped
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`Running ${statements.length} migration statements...`);

  for (const statement of statements) {
    console.log(`Executing: ${statement.substring(0, 80)}...`);
    await db.execute(statement as any);
    console.log("  OK");
  }

  console.log("Migration 0009 complete.");
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
