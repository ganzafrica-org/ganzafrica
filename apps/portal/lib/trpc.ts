import { QueryClient } from '@tanstack/react-query';
import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import superjson from 'superjson';
import type { AppRouter } from '@workspace/api';

// Create a QueryClient for react-query
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
        },
    },
});

// Create the tRPC client
export const trpc = createTRPCReact<AppRouter>();

// Create the tRPC client with links
export function getTrpcClient(baseUrl: string) {
    return trpc.createClient({
        links: [
            httpBatchLink({
                url: `${baseUrl}/api/trpc`,
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
}