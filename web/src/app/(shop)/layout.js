'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';

/**
 * Shop Layout
 * Protects all customer-facing pages from admin/vendor access
 */
export default function ShopLayout({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect admins and vendors to their dashboards
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'vendor') {
        router.push('/vendor/dashboard');
      }
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Return null if redirecting admin/vendor
  if (user && (user.role === 'admin' || user.role === 'vendor')) {
    return null;
  }

  // Allow access for customers and unauthenticated users (for browsing)
  return <>
  {/* <Header/> */}
  {children}</>;
}
