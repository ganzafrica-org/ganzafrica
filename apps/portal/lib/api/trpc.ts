// apps/portal/lib/api/trpc.ts
import { QueryClient } from '@tanstack/react-query';
import * as trpcReact from '@trpc/react-query';
import type { AppRouter } from '@workspace/api';
import superjson from 'superjson';

// Create a QueryClient for react-query
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
            staleTime: 5 * 1000, // 5 seconds
        },
    },
});

// Create the tRPC client
export const trpc = trpcReact.createTRPCReact<AppRouter>();

// Create the tRPC client with links
export function getTrpcClient(baseUrl: string) {
    return trpc.createClient({
        links: [
            trpcReact.httpBatchLink({
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