/**
 * React Query Client Configuration
 * Centralized query client setup for data fetching
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Default query options
 */
export const defaultQueryOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
  },
};

/**
 * Create a new QueryClient instance
 * Use this function to create a new instance for each request on the server
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
  });
}

/**
 * Browser query client (singleton)
 */
let browserQueryClient = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new query client
    return makeQueryClient();
  } else {
    // Browser: use singleton pattern to create query client once
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}
