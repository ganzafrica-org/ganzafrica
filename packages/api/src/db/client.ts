import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from '../config/env'
import * as schema from './schema'
import { generateId } from './id'

// Create a Postgres connection pool
const connectionPool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
})

// Add error handling
connectionPool.on('error', (err) => {
    console.error('Unexpected database error:', err);
    // In a production system, this would trigger monitoring alerts
});

// Initialize Drizzle with our schema
export const db = drizzle(connectionPool, { schema });

// Extend the pool with middleware functionality
export async function withDbTransaction<T>(callback: (db: typeof schema) => Promise<T>): Promise<T> {
    const client = await connectionPool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(drizzle(client, { schema }));
        await client.query('COMMIT');
        return result;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

// Setup context for audit logging
export async function setDbContext(userId: string | null, ipAddress: string | null) {
    const client = await connectionPool.connect();
    try {
        if (userId) {
            await client.query("SET LOCAL app.current_user_id = $1", [userId]);
        }
        if (ipAddress) {
            await client.query("SET LOCAL app.current_ip_address = $1", [ipAddress]);
        }
    } finally {
        client.release();
    }
}

// Helper to generate IDs in a consistent way across the app
export function newId(): bigint {
    return generateId();
}