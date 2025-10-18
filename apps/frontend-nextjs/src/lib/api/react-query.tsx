/**
 * React Query Configuration & Provider
 * Setup for data fetching and caching
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: Data is considered fresh for 1 minute
        staleTime: 60 * 1000,
        // Cache time: Keep unused data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry failed requests 1 time
        retry: 1,
        // Refetch on window focus in production
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
        // Refetch on reconnect
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
      },
    },
  });
}

interface ReactQueryProviderProps {
  children: ReactNode;
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* ReactQueryDevtools removed for production */}
    </QueryClientProvider>
  );
}

