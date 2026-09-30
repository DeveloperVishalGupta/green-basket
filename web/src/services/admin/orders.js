import { DEFAULT_CACHE_TIME } from "@/utils/constants";
import { useQuery } from "@tanstack/react-query";
import api from "../api";

/**
 * React Query hook for fetching all orders (admin)
 * @param {Object} options - Query options
 * @param {boolean} options.enabled - Enable/disable query
 * @param {Object} options.filters - Query filters (search, status)
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 */
export const useAdminOrders = ({ enabled = false, filters = {}, page = 1, limit = 20 }) => {
  return useQuery({
    queryKey: ["admin", "orders", page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
        ...filters,
      });
      
      const response = await api.get(`/api/orders/all?${params}`);
      return response.data;
    },
    staleTime: DEFAULT_CACHE_TIME,
    enabled: enabled
  });
};

/**
 * React Query hook for fetching single order details
 * @param {string} orderId - Order ID
 * @param {boolean} enabled - Enable/disable query
 */
export const useOrderById = (orderId, { enabled = false } = {}) => {
  return useQuery({
    queryKey: ["admin", "orders", "detail", orderId],
    queryFn: async () => {
      const response = await api.get(`/api/orders/${orderId}`);
      return response.data.data;
    },
    staleTime: DEFAULT_CACHE_TIME,
    enabled: enabled && !!orderId,
  });
};

/**
 * Orders service APIs
 */
const OrdersService = {
  getAll: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    const resp = await api.get(`/api/orders/all?${queryString}`);
    return resp.data;
  },

  getById: async (id) => {
    const resp = await api.get(`/api/orders/${id}`);
    return resp.data;
  },

  updateStatus: async (id, statusData) => {
    const resp = await api.put(`/api/orders/${id}/status`, statusData);
    return resp.data;
  },

  updateShipment: async (id, shipmentData) => {
    const resp = await api.put(`/api/orders/${id}/shipment`, shipmentData);
    return resp.data;
  },

  /**
   * Re-check a scheduled order's items against live stock/prices —
   * "check actual stock before preparing" — and notify the customer of
   * anything they need to act on.
   * @param {string} id - Order ID
   */
  verifyAvailability: async (id) => {
    const resp = await api.post(`/api/orders/${id}/verify-availability`);
    return resp.data;
  },

  createShipment: async (shipmentData) => {
    const resp = await api.post('/api/shipment/create', shipmentData);
    return resp.data;
  },

  cancelShipment: async (shipmentData) => {
    const resp = await api.post('/api/shipment/cancel', shipmentData);
    return resp.data;
  },

  /**
   * Cancel order (handles Shiprocket cancellation, refunds, stock restoration automatically)
   * @param {string} orderId - Order ID
   * @param {string} reason - Cancellation reason
   */
  cancelOrder: async (orderId, reason) => {
    const resp = await api.post(`/api/orders/${orderId}/cancel`, { reason });
    return resp.data;
  },
};

export default OrdersService;
