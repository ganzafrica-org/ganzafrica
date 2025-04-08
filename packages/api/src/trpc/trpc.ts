import { initTRPC, TRPCError } from '@trpc/server';
import { type Context } from './context';
import { createLogger } from '../config';
import superjson from 'superjson';

const logger = createLogger('trpc');

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

// Create middleware to check if user is authenticated
const isAuthed = t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to access this resource',
        });
    }
    return next({
        ctx: {
            // Add user to the next context
            user: ctx.user,
        },
    });
});

// Export reusable router, procedure, and middleware
export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);