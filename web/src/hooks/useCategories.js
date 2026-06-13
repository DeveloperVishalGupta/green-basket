/**
 * Category-related React Query hooks
 * Centralized data fetching for categories using React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesAPI } from '@/lib/api';

/**
 * Query keys for categories
 */
export const categoryKeys = {
  all: ['categories'],
  lists: () => [...categoryKeys.all, 'list'],
  list: (filters) => [...categoryKeys.lists(), filters],
  details: () => [...categoryKeys.all, 'detail'],
  detail: (slug) => [...categoryKeys.details(), slug],
};

/**
 * Hook to fetch all categories
 * @param {Object} options - React Query options
 */
export function useCategories(options = {}) {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const response = await categoriesAPI.getAll();
      return response.data;
    },
    ...options,
  });
}

/**
 * Hook to fetch a single category by slug
 * @param {string} slug - Category slug
 * @param {Object} options - React Query options
 */
export function useCategory(slug, options = {}) {
  return useQuery({
    queryKey: categoryKeys.detail(slug),
    queryFn: async () => {
      const response = await categoriesAPI.getBySlug(slug);
      return response.data;
    },
    enabled: !!slug,
    ...options,
  });
}

/**
 * Hook to create a new category (Admin only)
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData) => categoriesAPI.create(categoryData),
    onSuccess: () => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}
