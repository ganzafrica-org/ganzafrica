import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Drizzle configuration
 */
export default {
    schema: './src/db/schema/*.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ganzafrica',
    } as any,

    verbose: true,
    strict: true,
} satisfies Config;