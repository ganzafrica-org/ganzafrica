import { Pool } from "pg";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables
const envPath = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: envPath });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

async function baselineDatabase() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    console.log("Starting database baseline...\n");

    // Create the drizzle migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      );
    `);
    console.log("✅ Ensured __drizzle_migrations table exists\n");

    // Read the journal to get migration hashes
    const journalPath = path.resolve(__dirname, "../../../drizzle/meta/_journal.json");
    const journal = JSON.parse(fs.readFileSync(journalPath, "utf-8"));

    console.log(`Found ${journal.entries.length} migrations in journal\n`);

    // Check which migrations are already recorded
    const existingMigrations = await pool.query("SELECT hash FROM __drizzle_migrations");
    const existingHashes = new Set(existingMigrations.rows.map((r) => r.hash));

    // Mark the first migration (0000) as applied since the schema exists
    // This assumes migration 0000 contains all the enums that are causing issues
    const firstMigration = journal.entries[0];

    if (!existingHashes.has(firstMigration.tag)) {
      await pool.query("INSERT INTO __drizzle_migrations (hash, created_at) VALUES ($1, $2)", [
        firstMigration.tag,
        firstMigration.when,
      ]);
      console.log(`✅ Marked migration '${firstMigration.tag}' as applied (baseline)`);
    } else {
      console.log(`ℹ️  Migration '${firstMigration.tag}' already marked as applied`);
    }

    console.log("\n✅ Database baseline complete!");
    console.log("\nNext steps:");
    console.log("1. Run 'pnpm run db:migrate' to apply remaining migrations");
    console.log("   This will apply migrations 0001 through 0006\n");
  } catch (error) {
    console.error("Baseline failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

baselineDatabase().catch(console.error);
