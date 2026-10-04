/**
 * Delivery partner React Query hooks.
 * Server state only — order/payment status always comes from the API, never
 * from local component state.
 */

import { deliveryPartnerAPI } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const dpKeys = {
  all: ["delivery-partner"],
  list: (scope) => [...dpKeys.all, "list", scope],
  detail: (id) => [...dpKeys.all, "detail", id],
};

/** Orders for a tab; refreshed periodically so new orders show up */
export function useDeliveryOrders(scope) {
  return useQuery({
    queryKey: dpKeys.list(scope),
    queryFn: async () => (await deliveryPartnerAPI.getOrders(scope)).data,
    staleTime: 0, // statuses change from elsewhere (admin, customer)
    refetchInterval: 30000,
  });
}

/** Single order (always fresh: status/payment can change from elsewhere) */
export function useDeliveryOrder(id) {
  return useQuery({
    queryKey: dpKeys.detail(id),
    queryFn: async () => (await deliveryPartnerAPI.getOrder(id)).data.data,
    enabled: !!id,
    staleTime: 0,
  });
}

function useOrderMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (response, variables) => {
      // Show the server's updated order immediately (status + payment)...
      const updated = response?.data?.data;
      const id = typeof variables === "string" ? variables : variables?.id;
      if (updated && id) {
        queryClient.setQueryData(dpKeys.detail(id), updated);
      }
      // ...and refetch every list/tab/count from the backend. Returning the
      // promise keeps the mutation "pending" until fresh data has arrived, so
      // the UI never flashes stale statuses.
      return queryClient.invalidateQueries({ queryKey: dpKeys.all });
    },
  });
}

export const useAcceptOrder = () =>
  useOrderMutation((id) => deliveryPartnerAPI.acceptOrder(id));

export const useUpdateDeliveryStatus = () =>
  useOrderMutation(({ id, status }) =>
    deliveryPartnerAPI.updateStatus(id, status),
  );

export const useCollectCash = () =>
  useOrderMutation((id) => deliveryPartnerAPI.collectCash(id));

// Doesn't change the order, so no invalidation needed
export function useCreateUpiQr() {
  return useMutation({
    mutationFn: (id) => deliveryPartnerAPI.createUpiQr(id),
  });
}

export const useConfirmUpiPayment = () =>
  useOrderMutation(({ id, reference }) =>
    deliveryPartnerAPI.confirmUpi(id, reference),
  );
