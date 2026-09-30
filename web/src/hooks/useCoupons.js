/**
 * Coupon-related React Query hooks.
 * Coupons are currently only ever issued automatically as loyalty rewards
 * for reaching an order-count milestone (see the profile page).
 */

import { couponsAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const couponKeys = {
  all: ["coupons"],
  mine: () => [...couponKeys.all, "mine"],
};

/**
 * Hook to fetch the current user's coupons
 * @param {Object} options - React Query options
 */
export function useMyCoupons(options = {}) {
  return useQuery({
    queryKey: couponKeys.mine(),
    queryFn: async () => {
      const response = await couponsAPI.getMy();
      return response.data;
    },
    ...options,
  });
}
