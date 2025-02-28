'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { trpc, queryClient, getTrpcClient } from '@/lib/api/trpc';

export function TrpcProvider({
                                 children,
                                 baseUrl,
                             }: {
    children: React.ReactNode;
    baseUrl: string;
}) {
    const [trpcClient] = useState(() => getTrpcClient(baseUrl));

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    );
}