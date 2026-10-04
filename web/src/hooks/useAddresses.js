import { useAuth } from '@/hooks/useAuth';
import { addressAPI } from '@/lib/addressAPI';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const addressKeys = {
  all: ['addresses'],
  list: () => [...addressKeys.all, 'list'],
  detail: (id) => [...addressKeys.all, 'detail', id],
};

export function useAddresses(options = {}) {
  return useQuery({
    queryKey: addressKeys.list(),
    queryFn: addressAPI.getAll,
    ...options,
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: addressAPI.add,
    // Pages like checkout read addresses from the auth user, so refresh it
    // too (awaited, so it's up to date before any navigation).
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.list() });
      await refreshUser();
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: addressAPI.delete,
    // Pages like checkout read addresses from the auth user, so refresh it
    // too (awaited, so it's up to date before any navigation).
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.list() });
      await refreshUser();
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: addressAPI.setDefault,
    // Pages like checkout read addresses from the auth user, so refresh it
    // too (awaited, so it's up to date before any navigation).
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.list() });
      await refreshUser();
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }) => addressAPI.update(id, data),
    // Pages like checkout read addresses from the auth user, so refresh it
    // too (awaited, so it's up to date before any navigation).
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.list() });
      await refreshUser();
    },
  });
}
