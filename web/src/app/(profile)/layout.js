"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Profile Layout
 * Protects customer profile pages from admin/vendor access
 * Requires authentication
 */
export default function ProfileLayout({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Check authentication
  useEffect(() => {
    if (!loading) {
      // Redirect if not logged in
      if (!user) {
        router.push("/");
        return;
      }
      // All authenticated users (customer, admin, vendor) can access their profile
      // No role-based redirect needed here
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

  // Return null if not authenticated (will redirect in useEffect)
  if (!user) {
    return null;
  }

  // Allow access for all authenticated users (customer, admin, vendor)
  return <>{children}</>;
}
