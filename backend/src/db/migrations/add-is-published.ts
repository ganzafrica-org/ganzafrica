import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import path from "path";
import * as dotenv from "dotenv";
import * as fs from "fs";

// Load environment variables
const envPath = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: envPath });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

async function addIsPublishedColumn() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    console.log("Adding is_published column to projects table...");
    const db = drizzle(pool);

    // Read and execute the SQL migration
    const sqlPath = path.resolve(
      __dirname,
      "../../../drizzle/0007_add_is_published_to_projects.sql",
    );
    const sql = fs.readFileSync(sqlPath, "utf-8");

    // Execute the SQL
    await pool.query(sql);

    console.log("✅ Successfully added is_published column to projects table!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  addIsPublishedColumn().catch(console.error);
}

export { addIsPublishedColumn };
