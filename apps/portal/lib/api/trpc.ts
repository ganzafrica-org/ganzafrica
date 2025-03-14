import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { AppRouter } from '@workspace/api/src/trpc/routers';
import superjson from 'superjson';

// Configuration for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create and export tRPC client instance
export const api = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: `${API_URL}/api/trpc`,
            // Include cookies in requests
            fetch(url, options) {
                return fetch(url, {
                    ...options,
                    credentials: 'include',
                });
            },
        }),
    ],
    transformer: superjson,
});
