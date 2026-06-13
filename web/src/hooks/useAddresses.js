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
  return useMutation({
    mutationFn: addressAPI.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.list() });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addressAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.list() });
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addressAPI.setDefault,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.list() });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => addressAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.list() });
    },
  });
}
