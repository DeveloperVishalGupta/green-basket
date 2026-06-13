import { DEFAULT_CACHE_TIME } from "@/utils/constants";
import { useQuery } from "@tanstack/react-query";
import api from "./api";

/**
 * React Query hook for fetching admin categories data
 */
export const useCategories = ({ enabled = false }) => {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const response = await api.get("/api/categories");
      return response.data.data;
    },
    staleTime: DEFAULT_CACHE_TIME,
    enabled: enabled
  });
};

/**
 * React Query hook for fetching category by ID
 * @param {string} categoryId - Category ID to fetch
 * @param {boolean} enabled - Whether to enable the query
 */
export const useCategoryById = (categoryId, { enabled = false } = {}) => {
  return useQuery({
    queryKey: ["categories", "detail", categoryId],
    queryFn: async () => {
      const response = await api.get(`/api/categories/id/${categoryId}`);
      return response.data.data;
    },
    staleTime: DEFAULT_CACHE_TIME,
    enabled: enabled && !!categoryId,
  });
};

/**
 * Categories service APIs
 */
const CategoriesService = {
  create: async (data) => {
    const resp = await api.post("/api/categories", data);
    return resp.data;
  },

  update: async (id, data) => {
    const resp = await api.put(`/api/categories/${id}`, data);
    return resp.data;
  },

  delete: async (id) => {
    const resp = await api.delete(`/api/categories/${id}`);
    return resp.data;
  },
};

export default CategoriesService;
