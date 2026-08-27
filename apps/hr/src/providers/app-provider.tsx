"use client";

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { toast } from "@/lib/toast";

function extractErrorMessage(error: unknown): string | undefined {
  const backendMessage = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;
  if (backendMessage) return backendMessage;
  if (error instanceof Error) return error.message;
  return undefined;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (mutation.options.meta?.silentError) return;
            toast.danger("Something went wrong", extractErrorMessage(error));
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
