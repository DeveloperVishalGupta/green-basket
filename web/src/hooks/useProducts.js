/**
 * Product-related React Query hooks
 * Centralized data fetching for products using React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI } from '@/lib/api';

/**
 * Query keys for products
 */
export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (filters) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all, 'detail'],
  detail: (slug) => [...productKeys.details(), slug],
  featured: () => [...productKeys.all, 'featured'],
  trending: () => [...productKeys.all, 'trending'],
  newArrivals: () => [...productKeys.all, 'newArrivals'],
  bestSellers: () => [...productKeys.all, 'bestSellers'],
};

/**
 * Hook to fetch all products with filters
 * @param {Object} filters - Query filters (page, limit, category, etc.)
 * @param {Object} options - React Query options
 */
export function useProducts(filters = {}, options = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: async () => {
      const response = await productsAPI.getAll(filters);
      return response.data;
    },
    ...options,
  });
}

/**
 * Hook to fetch a single product by slug
 * @param {string} slug - Product slug
 * @param {Object} options - React Query options
 */
export function useProduct(slug, options = {}) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: async () => {
      const response = await productsAPI.getBySlug(slug);
      return response.data;
    },
    enabled: !!slug,
    ...options,
  });
}

/**
 * Hook to fetch featured products
 * @param {Object} options - React Query options
 */
export function useFeaturedProducts(options = {}) {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: async () => {
      const response = await productsAPI.getAll({ isFeatured: true, limit: 10 });
      return response.data;
    },
    ...options,
  });
}

/**
 * Hook to fetch trending products
 * @param {Object} options - React Query options
 */
export function useTrendingProducts(options = {}) {
  return useQuery({
    queryKey: productKeys.trending(),
    queryFn: async () => {
      const response = await productsAPI.getAll({ tag: 'trending', limit: 8 });
      return response.data;
    },
    ...options,
  });
}

/**
 * Hook to fetch new arrival products
 * @param {Object} options - React Query options
 */
export function useNewArrivals(options = {}) {
  return useQuery({
    queryKey: productKeys.newArrivals(),
    queryFn: async () => {
      const response = await productsAPI.getAll({ 
        sort: '-createdAt', 
        limit: 10 
      });
      return response.data;
    },
    ...options,
  });
}

/**
 * Hook to fetch best seller products
 * @param {Object} options - React Query options
 */
export function useBestSellers(options = {}) {
  return useQuery({
    queryKey: productKeys.bestSellers(),
    queryFn: async () => {
      const response = await productsAPI.getAll({ 
        sort: '-salesCount', 
        limit: 10 
      });
      return response.data;
    },
    ...options,
  });
}

/**
 * Hook to create a new product (Admin/Vendor)
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData) => productsAPI.create(productData),
    onSuccess: () => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

/**
 * Hook to update a product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => productsAPI.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate specific product and lists
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

/**
 * Hook to delete a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => productsAPI.delete(id),
    onSuccess: () => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
