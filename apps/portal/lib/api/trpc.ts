import { createTRPCReact } from '@trpc/react-query';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { QueryClient } from '@tanstack/react-query';
import superjson from 'superjson';
import type { AppRouter } from '@workspace/api/src';

// QueryClient for react-query
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

// This is a React tRPC client to be used inside React components with hooks
export const trpc = createTRPCReact<AppRouter>();

// Function to create the React tRPC client with a URL
export function getTrpcClient(baseUrl: string) {
    return trpc.createClient({
        links: [
            httpBatchLink({
                url: `${baseUrl}/api/trpc`,
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

// This is a standalone (non-React) tRPC client to be used outside of React components for direct API calls
export const trpcClient = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: typeof window !== 'undefined'
                ? `${window.location.origin}/api/trpc`
                : 'http://localhost:3002/api/trpc',
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