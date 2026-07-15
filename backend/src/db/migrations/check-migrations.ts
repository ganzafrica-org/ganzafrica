import { Pool } from "pg";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables
const envPath = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: envPath });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

async function checkMigrations() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    console.log("Checking migration status...\n");

    // Check if drizzle migrations table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = '__drizzle_migrations'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log("❌ __drizzle_migrations table does not exist");
      console.log("This means no migrations have been tracked yet.\n");

      // Check if enum exists
      const enumCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM pg_type
          WHERE typname = 'application_status'
        );
      `);

      if (enumCheck.rows[0].exists) {
        console.log("⚠️  BUT the 'application_status' enum already exists!");
        console.log("This suggests the database has schema but migrations weren't tracked.\n");
        console.log("SOLUTION: You need to baseline your database.\n");
      }
    } else {
      console.log("✅ __drizzle_migrations table exists\n");

      // Get all applied migrations
      const migrations = await pool.query(`
        SELECT * FROM __drizzle_migrations
        ORDER BY created_at;
      `);

      console.log(`Applied migrations (${migrations.rows.length}):`);
      migrations.rows.forEach((row, idx) => {
        console.log(`${idx + 1}. ${row.hash} - Created: ${row.created_at}`);
      });

      console.log("\n");
    }

    // Check for existing enums
    const enums = await pool.query(`
      SELECT typname
      FROM pg_type
      WHERE typtype = 'e'
      AND typname LIKE '%status%'
      ORDER BY typname;
    `);

    console.log("Existing enums with 'status' in name:");
    enums.rows.forEach((row) => {
      console.log(`  - ${row.typname}`);
    });
  } catch (error) {
    console.error("Error checking migrations:", error);
  } finally {
    await pool.end();
  }
}

checkMigrations().catch(console.error);
