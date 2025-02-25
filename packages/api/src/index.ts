// packages/api/src/index.ts
import { createContext } from './trpc/context';
import { appRouter } from './trpc/routers';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createLogger } from './config/logger';
import { db } from './db/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const logger = createLogger('api');

// Export router for client usage
export { appRouter };
export type { AppRouter } from './trpc/routers';

/**
 * Standalone server when running directly
 */
if (require.main === module) {
    const PORT = process.env.PORT || 3001;

    // Simple HTTP server for development
    const server = Bun.serve({
        port: PORT,
        async fetch(request) {
            const url = new URL(request.url);

            // Handle tRPC requests
            if (url.pathname.startsWith('/api/trpc')) {
                try {
                    return await fetchRequestHandler({
                        endpoint: '/api/trpc',
                        req: request,
                        router: appRouter,
                        createContext,
                    });
                } catch (error) {
                    logger.error('API handler error', { error });
                    return new Response('Internal Server Error', { status: 500 });
                }
            }

            // Simple health check
            if (url.pathname === '/health') {
                try {
                    // Test database connection
                    await db.execute(sql`SELECT 1`);
                    return new Response(JSON.stringify({ status: 'healthy' }), {
                        headers: { 'Content-Type': 'application/json' },
                    });
                } catch (error) {
                    logger.error('Health check failed', { error });
                    return new Response(JSON.stringify({ status: 'unhealthy', error: error.message }), {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
            }

            // Default response for other routes
            return new Response('GanzAfrica API', {
                headers: { 'Content-Type': 'text/plain' },
            });
        },
    });

    logger.info(`Server started on port ${PORT}`);
}

/**
 * Handler for Cloudflare Workers or similar environments
 */
export default async function handler(request: Request): Promise<Response> {
    try {
        const url = new URL(request.url);

        // Handle tRPC requests
        if (url.pathname.startsWith('/api/trpc')) {
            return await fetchRequestHandler({
                endpoint: '/api/trpc',
                req: request,
                router: appRouter,
                createContext,
            });
        }

        // Simple health check
        if (url.pathname === '/health') {
            try {
                // Test database connection
                await db.execute(sql`SELECT 1`);
                return new Response(JSON.stringify({ status: 'healthy' }), {
                    headers: { 'Content-Type': 'application/json' },
                });
            } catch (error) {
                logger.error('Health check failed', { error });
                return new Response(JSON.stringify({ status: 'unhealthy', error: error.message }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        // Default response for other routes
        return new Response('GanzAfrica API', {
            headers: { 'Content-Type': 'text/plain' },
        });
    } catch (error) {
        logger.error('API handler error', { error });
        return new Response('Internal Server Error', { status: 500 });
    }
}