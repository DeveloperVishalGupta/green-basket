/**
 * Query Provider Component
 * Wraps the application with React Query QueryClientProvider
 */
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/queryClient';
import { useState } from 'react';

export function QueryProvider({ children }) {
  // Create a client once per request
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
