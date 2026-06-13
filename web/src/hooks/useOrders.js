/**
 * Order-related React Query hooks
 * Centralized data fetching for orders using React Query
 */

import { ordersAPI } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Query keys for orders
 */
export const orderKeys = {
  all: ['orders'],
  lists: () => [...orderKeys.all, 'list'],
  list: (filters) => [...orderKeys.lists(), filters],
  details: () => [...orderKeys.all, 'detail'],
  detail: (id) => [...orderKeys.details(), id],
};

/**
 * Hook to fetch all user orders
 * @param {Object} options - React Query options
 */
export function useOrders(options = {}) {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: async () => {
      const response = await ordersAPI.getAll();
      return response.data;
    },
    ...options,
  });
}

/**
 * Hook to fetch a single order by ID
 * @param {string} orderId - Order ID
 * @param {Object} options - React Query options
 */
export function useOrder(orderId, options = {}) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: async () => {
      const response = await ordersAPI.getById(orderId);
      return response.data;
    },
    enabled: !!orderId,
    ...options,
  });
}

/**
 * Hook to fetch all orders (Admin only)
 * @param {Object} options - React Query options
 */
export function useAdminOrders(options = {}) {
  return useQuery({
    queryKey: [...orderKeys.all, 'admin'],
    queryFn: async () => {
      const response = await ordersAPI.getAllAdmin();
      return response.data;
    },
    ...options,
  });
}

/**
 * Hook to create a new order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) => ordersAPI.create(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

/**
 * Hook to cancel an order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }) => ordersAPI.cancel(orderId, reason),
    onSuccess: (data) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      if (data?.data?._id) {
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.data._id) });
      }
    },
  });
}

/**
 * Hook to update order status (Admin)
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status, note }) => ordersAPI.updateStatus(orderId, { status, note }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...orderKeys.all, 'admin'] });
      if (data?.data?._id) {
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.data._id) });
      }
    },
  });
}

/**
 * Hook to refresh refund status from Razorpay
 */
export function useRefreshRefundStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => ordersAPI.refreshRefundStatus(orderId),
    onSuccess: (data) => {
      // Invalidate order detail to show updated refund info
      if (data?.data?._id) {
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.data._id) });
      }
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

