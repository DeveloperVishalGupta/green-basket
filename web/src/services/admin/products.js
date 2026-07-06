import { DEFAULT_CACHE_TIME } from "@/utils/constants";
import { useQuery } from "@tanstack/react-query";
import api from "../api";

/**
 * React Query hook for fetching admin products data
 * @param {Object} options - Query options
 * @param {boolean} options.enabled - Enable/disable query
 * @param {Object} options.filters - Query filters (search, category, featured, isActive)
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 */
export const useAdminProducts = ({
  enabled = false,
  filters = {},
  page = 1,
  limit = 20,
}) => {
  return useQuery({
    queryKey: ["admin", "products", page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
        ...filters,
      });

      const response = await api.get(`/api/products?${params}`);
      return response.data;
    },
    staleTime: DEFAULT_CACHE_TIME,
    enabled: enabled,
  });
};

/**
 * React Query hook for fetching admin products options data
 */
export const useProductsOptions = ({ enabled = false }) => {
  return useQuery({
    queryKey: ["products", "options"],
    queryFn: async () => {
      const response = await api.get("/api/products/options/all");
      return response.data.data;
    },
    staleTime: DEFAULT_CACHE_TIME,
    enabled: enabled,
  });
};

/**
 * React Query hook for fetching product by ID
 * @param {string} productId - Product ID to fetch
 * @param {boolean} enabled - Whether to enable the query
 */
export const useProductById = (productId, { enabled = false } = {}) => {
  return useQuery({
    queryKey: ["products", "detail", productId],
    queryFn: async () => {
      const response = await api.get(`/api/products/id/${productId}`);
      return response.data.data;
    },
    staleTime: DEFAULT_CACHE_TIME,
    enabled: enabled && !!productId,
  });
};

/**
 * Products service APIs
 */
const ProductsService = {
  getAll: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    const resp = await api.get(`/api/products?${queryString}`);
    return resp.data;
  },

  getById: async (id) => {
    const resp = await api.get(`/api/products/id/${id}`);
    return resp.data;
  },

  create: async (data) => {
    const resp = await api.post("/api/products", data);
    return resp.data;
  },

  update: async (id, data) => {
    const resp = await api.put(`/api/products/${id}`, data);
    return resp.data;
  },

  delete: async (id) => {
    const resp = await api.delete(`/api/products/${id}`);
    return resp.data;
  },

  toggleFeatured: async (id) => {
    const resp = await api.put(`/api/products/${id}/featured`);
    return resp.data;
  },
};

export default ProductsService;
