/**
 * Notification-related React Query hooks
 * Centralized notification operations using React Query
 */

import { notificationAPI } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Query keys for notifications
 */
export const notificationKeys = {
  all: ['notifications'],
  lists: () => [...notificationKeys.all, 'list'],
  list: (params) => [...notificationKeys.lists(), params],
  unreadCount: () => [...notificationKeys.all, 'unread-count'],
};

/**
 * Hook to fetch user notifications
 * @param {Object} params - Query parameters (page, limit, unreadOnly)
 * @param {Object} options - React Query options
 */
export function useNotifications(params = {}, options = {}) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: async () => {
      const response = await notificationAPI.getAll(params);
      return response.data;
    },
    ...options,
  });
}

/**
 * Hook to get unread notification count
 * @param {Object} options - React Query options
 */
export function useUnreadCount(options = {}) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const response = await notificationAPI.getUnreadCount();
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    ...options,
  });
}

/**
 * Hook to mark notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => notificationAPI.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate notifications and unread count
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationAPI.markAllAsRead(),
    onSuccess: () => {
      // Invalidate notifications and unread count
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Hook to delete notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => notificationAPI.delete(notificationId),
    onSuccess: () => {
      // Invalidate notifications
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Hook to delete all notifications
 */
export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationAPI.deleteAll(),
    onSuccess: () => {
      // Invalidate notifications
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
