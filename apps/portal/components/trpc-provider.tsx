'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { trpc, queryClient, getTrpcClient } from '@/lib/trpc';

export function TrpcProvider({
                                 children,
                                 baseUrl,
                             }: {
    children: React.ReactNode;
    baseUrl: string;
}) {
    const [client] = useState(() => getTrpcClient(baseUrl));

    return (
        <trpc.Provider client={client} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    );
}