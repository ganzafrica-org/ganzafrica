import { createContext } from './trpc/context';
import { appRouter } from './trpc/routers';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createLogger } from './config';
import { db } from './db/client';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as http from 'http';
import { Readable } from 'stream';

// Load environment variables
dotenv.config();

const logger = createLogger('api');

// Export router for client usage
export { appRouter };
export type { AppRouter } from './trpc/routers';

/**
 * Helper to convert Node.js IncomingMessage to a ReadableStream for Fetch API
 */
function nodeStreamToReadableStream(nodeStream: http.IncomingMessage): ReadableStream<Uint8Array> {
    return new ReadableStream({
        start(controller) {
            nodeStream.on('data', (chunk) => {
                controller.enqueue(new Uint8Array(chunk instanceof Buffer ? chunk : Buffer.from(chunk)));
            });
            nodeStream.on('end', () => {
                controller.close();
            });
            nodeStream.on('error', (err) => {
                controller.error(err);
            });
        },
        cancel() {
            nodeStream.destroy();
        },
    });
}

/**
 * Standalone server when running directly
 */
if (require.main === module) {
    const PORT = Number(process.env.PORT || 3001);

    // Simple HTTP server for development
    const server = http.createServer(async (req, res) => {
        const url = new URL(`http://${req.headers.host}${req.url}`);

        // Convert headers to Headers object
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
            if (value) {
                if (Array.isArray(value)) {
                    value.forEach(v => headers.append(key, v));
                } else {
                    headers.set(key, value);
                }
            }
        }

        // Convert Node.js request to a Fetch API Request
        const fetchRequest = new Request(url.toString(), {
            method: req.method,
            headers,
            // Convert IncomingMessage to ReadableStream for the body
            body: ['GET', 'HEAD'].includes(req.method || '') ? undefined : nodeStreamToReadableStream(req),
        });

        try {
            // Handle tRPC requests
            if (url.pathname.startsWith('/api/trpc')) {
                const response = await fetchRequestHandler({
                    endpoint: '/api/trpc',
                    req: fetchRequest,
                    router: appRouter,
                    createContext,
                });

                // Convert Fetch API Response to Node.js response
                res.statusCode = response.status;
                response.headers.forEach((value, key) => {
                    res.setHeader(key, value);
                });

                const body = await response.text();
                res.end(body);
                return;
            }

            // Simple health check
            if (url.pathname === '/health') {
                try {
                    // Test database connection
                    await db.execute(sql`SELECT 1`);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ status: 'healthy' }));
                } catch (error: any) {
                    logger.error('Health check failed', { error });
                    res.statusCode = 503;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ status: 'unhealthy', error: error.message }));
                }
                return;
            }

            // Default response for other routes
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('GanzAfrica API');
        } catch (error) {
            logger.error('API handler error', { error });
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    });

    server.listen(PORT, () => {
        logger.info(`Server started on port ${PORT}`);
    });
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
            } catch (error: any) {
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
    } catch (error: any) {
        logger.error('API handler error', { error });
        return new Response('Internal Server Error', { status: 500 });
    }
}