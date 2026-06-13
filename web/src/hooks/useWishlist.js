/**
 * Wishlist-related React Query hooks
 * Centralized wishlist operations using React Query
 */

import { wishlistAPI } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Query keys for wishlist
 */
export const wishlistKeys = {
  all: ['wishlist'],
  lists: () => [...wishlistKeys.all, 'list'],
  check: (productId) => [...wishlistKeys.all, 'check', productId],
};

/**
 * Hook to fetch user's wishlist
 * @param {Object} options - React Query options
 */
export function useWishlist(options = {}) {
  return useQuery({
    queryKey: wishlistKeys.lists(),
    queryFn: async () => {
      const response = await wishlistAPI.getAll();
      return response.data;
    },
    ...options,
  });
}

/**
 * Hook to check if product is in wishlist
 * @param {string} productId - Product ID
 * @param {Object} options - React Query options
 */
export function useCheckWishlist(productId, options = {}) {
  return useQuery({
    queryKey: wishlistKeys.check(productId),
    queryFn: async () => {
      const response = await wishlistAPI.check(productId);
      return response.data;
    },
    enabled: !!productId,
    ...options,
  });
}

/**
 * Hook to add product to wishlist
 */
export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId) => wishlistAPI.add(productId),
    onSuccess: (data, productId) => {
      // Invalidate wishlist queries to refetch
      queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.check(productId) });
    },
  });
}

/**
 * Hook to remove product from wishlist
 */
export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId) => wishlistAPI.remove(productId),
    onSuccess: (data, productId) => {
      // Invalidate wishlist queries to refetch
      queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.check(productId) });
    },
  });
}

/**
 * Hook to toggle product in wishlist (add or remove)
 */
export function useToggleWishlist() {
  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();

  const toggle = async (productId, isInWishlist) => {
    if (isInWishlist) {
      return removeMutation.mutateAsync(productId);
    } else {
      return addMutation.mutateAsync(productId);
    }
  };

  return {
    toggle,
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
}
