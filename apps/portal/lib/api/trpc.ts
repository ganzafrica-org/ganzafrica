import { createTRPCReact, type CreateTRPCReact, httpBatchLink } from '@trpc/react-query';
import { QueryClient } from '@tanstack/react-query';
import superjson from 'superjson';
import type { AppRouter } from '@workspace/api/src/trpc/routers';

// Create a QueryClient for react-query
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

// Create the tRPC client with proper type annotation
export const trpc: CreateTRPCReact<AppRouter, any, any> = createTRPCReact<AppRouter>();

// Function to create the tRPC client with a URL
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