import { initTRPC } from '@trpc/server';
import { type Context } from './context';
import { createLogger } from '../config';

const logger = createLogger('trpc');

const superjson = require('superjson').default;


// Initialize tRPC with context and custom transformer
const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter: ({ shape, error }) => {
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
            data: {
                ...shape.data,
                timestamp: new Date().toISOString(),
            },
        };
    },
});

// Export reusable router, procedure, and middleware
export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
