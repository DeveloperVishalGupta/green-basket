'use client';

import { useAuth } from '@/hooks/useAuth';

/**
 * Customer Page Wrapper
 * Adds proper padding for side navigation on desktop
 * Only applies padding for customer users
 */
export default function CustomerPageWrapper({ children, className = '' }) {
  const { user, loading } = useAuth();

  // Add left padding for desktop side nav only for customers
  const shouldAddPadding = !loading && user && user.role === 'customer';

  return (
    <div className={`${shouldAddPadding ? 'lg:pl-20 xl:pl-24' : ''} ${className}`}>
      {children}
    </div>
  );
}
