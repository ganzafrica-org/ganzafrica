import { router } from '../trpc';
import { authRouter } from './auth';

/**
 * Root router for the API
 */
export const appRouter = router({
    auth: authRouter,
    // more routers here
});

// Export type for client use
export type AppRouter = typeof appRouter;