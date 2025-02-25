import type { Config } from 'drizzle-kit'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

export default {
    schema: './src/db/schema/*.ts',
    out: './drizzle',
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ganzafrica',
    },
    // Custom naming convention for constraints, if desired
    // For example, to prefix all constraints with the table name
    tablesConstraintNameMapping: (tableName: any, constraintType: any, constraintName: any) => {
        return `${tableName}_${constraintType}_${constraintName}`;
    },
    verbose: true,
    strict: true,
} satisfies Config