import { initTRPC } from '@trpc/server';
import { type Context } from './context';
import { createLogger } from '../config';


interface SuperJSONLike {
    serialize: (obj: unknown) => any;
    deserialize: (obj: any) => unknown;
}


let superJson: SuperJSONLike | null = null;


const jsonTransformer = {
    serialize: (obj: unknown) => {
        return { json: obj };
    },
    deserialize: (obj: any) => {
        return obj.json;
    },
};

// Try to load superjson
import('superjson')
    .then(module => {
        superJson = module.default;
    })
    .catch(err => {
        console.warn('Failed to load superjson:', err);
    });

const logger = createLogger('trpc');

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
    transformer: {
        serialize: (obj: unknown) => {
            if (superJson) {
                return superJson.serialize(obj);
            }
            return jsonTransformer.serialize(obj);
        },
        deserialize: (obj: any) => {
            if (superJson) {
                return superJson.deserialize(obj);
            }
            return jsonTransformer.deserialize(obj);
        },
    },
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

// Export public procedure for routers
export const publicProcedure = t.procedure;