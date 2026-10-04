"use client";

import { useAuth } from "@/hooks/useAuth";
import { getRoleHome } from "@/lib/roles";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Client-side route guard for a role's portal (use in the route group layout).
 * - Logged out → /login
 * - Logged in with another role → that role's own home (so changing the URL
 *   by hand can't open another role's dashboard)
 *
 * This is for UX only; the API enforces roles server-side (isAuthorize).
 *
 * @param {string} role - the one role allowed in this area
 * @returns {{ user: object|null, loading: boolean, allowed: boolean }}
 */
export function useRoleGuard(role) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const allowed = !!user && user.role === role;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role !== role) {
      router.replace(getRoleHome(user.role));
    }
  }, [user, loading, role, router]);

  return { user, loading, allowed };
}
