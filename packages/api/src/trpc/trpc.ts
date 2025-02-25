import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { type Context } from './context';
import { createLogger } from '../config/logger';

const logger = createLogger('trpc');

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter: ({ shape, error }) => {
        // Log all errors
        logger.error('tRPC error', {
            path: shape.data?.path,
            code: shape.data?.code,
            error: {
                message: error.message,
                stack: error.stack,
            },
        });

        return {
            ...shape,
            // additional data to the response
            data: {
                ...shape.data,
                timestamp: new Date().toISOString(),
            },
        };
    },
});

/**
 * Export reusable router, procedure, and middleware
 */
export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;