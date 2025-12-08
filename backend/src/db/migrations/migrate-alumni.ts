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

async function runAlumniMigrations() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    console.log("Starting alumni migrations...\n");

    // Create the drizzle migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      );
    `);
    console.log("✅ Ensured __drizzle_migrations table exists\n");

    // Alumni migrations are 0001 through 0006
    const alumniMigrations = [
      { file: "0001_steep_living_lightning.sql", tag: "0001_steep_living_lightning" },
      { file: "0002_needy_lester.sql", tag: "0002_needy_lester" },
      { file: "0003_right_franklin_storm.sql", tag: "0003_right_franklin_storm" },
      { file: "0004_windy_phalanx.sql", tag: "0004_windy_phalanx" },
      { file: "0005_flashy_wraith.sql", tag: "0005_flashy_wraith" },
      { file: "0006_aspiring_red_shift.sql", tag: "0006_aspiring_red_shift" },
    ];

    // Check which migrations are already applied
    const existingMigrations = await pool.query(
      "SELECT hash FROM __drizzle_migrations"
    );
    const existingHashes = new Set(existingMigrations.rows.map((r) => r.hash));

    let appliedCount = 0;
    let skippedCount = 0;

    for (const migration of alumniMigrations) {
      if (existingHashes.has(migration.tag)) {
        console.log(`⏭️  Skipping ${migration.tag} (already applied)`);
        skippedCount++;
        continue;
      }

      console.log(`📦 Applying ${migration.tag}...`);

      // Read and execute the migration SQL
      const migrationPath = path.resolve(
        __dirname,
        "../../../drizzle",
        migration.file
      );
      const sql = fs.readFileSync(migrationPath, "utf-8");

      // Split by statement breakpoint and execute each statement
      const statements = sql
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await pool.query("BEGIN");
      try {
        for (const statement of statements) {
          await pool.query(statement);
        }

        // Record the migration
        await pool.query(
          "INSERT INTO __drizzle_migrations (hash, created_at) VALUES ($1, $2)",
          [migration.tag, Date.now()]
        );

        await pool.query("COMMIT");
        console.log(`✅ Applied ${migration.tag}`);
        appliedCount++;
      } catch (error) {
        await pool.query("ROLLBACK");
        console.error(`❌ Failed to apply ${migration.tag}:`, error);
        throw error;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✅ Alumni migrations complete!`);
    console.log(`   Applied: ${appliedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log("=".repeat(50) + "\n");

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runAlumniMigrations().catch(console.error);
