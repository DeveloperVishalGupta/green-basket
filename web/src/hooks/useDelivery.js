import { deliveryAPI, usersAPI } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const deliveryKeys = {
  all: ["delivery-availability"],
  list: (dateIds) => [...deliveryKeys.all, ...dateIds],
};

/**
 * Checks whether a pincode is currently serviceable.
 * @param {string} pincode - 6-digit pincode
 * @param {Object} options - react-query options (e.g. enabled)
 */
export function usePincodeServiceability(pincode, options = {}) {
  return useQuery({
    queryKey: ["pincode-serviceability", pincode],
    queryFn: async () => {
      const res = await deliveryAPI.checkPincode(pincode);
      return res.data.data;
    },
    enabled: Boolean(pincode) && /^\d{6}$/.test(pincode || ""),
    staleTime: 5 * 60 * 1000,
    retry: false,
    ...options,
  });
}

/**
 * @param {string[]} dateIds - "YYYY-MM-DD" ids to check
 * @param {Object} options - react-query options (e.g. enabled)
 */
export function useDeliveryAvailability(dateIds, options = {}) {
  return useQuery({
    queryKey: deliveryKeys.list(dateIds),
    queryFn: async () => {
      const res = await usersAPI.getDeliveryAvailability(dateIds);
      return res.data.data;
    },
    ...options,
  });
}

export function useSetDeliveryPreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (date) => {
      const res = await usersAPI.setDeliveryPreference(date);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all });
    },
  });
}
