import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { env } from '../config';
import { setupTriggers } from './setup-triggers';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runMigrations() {
    const pool = new Pool({
        connectionString: env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ganzafrica',
    });

    try {
        console.log('Starting database migrations...');
        const db = drizzle(pool);

        // Run the SQL migrations
        await migrate(db, { migrationsFolder: './drizzle' });
        console.log('SQL migrations completed');

        // Setup triggers
        await setupTriggers();
        console.log('Triggers setup completed');

        console.log('All database migrations completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run migrations if this file is executed directly
if (require.main === module) {
    runMigrations().catch(console.error);
}

export { runMigrations };