import { DEFAULT_CACHE_TIME } from "@/utils/constants";
import { useQuery } from "@tanstack/react-query";
import api from "../api";

/**
 * React Query hook for fetching admin users data
 * @param {Object} options - Query options
 * @param {boolean} options.enabled - Enable/disable query
 * @param {Object} options.filters - Query filters (search, role, isActive)
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 */
export const useAdminUsers = ({ enabled = false, filters = {}, page = 1, limit = 20 }) => {
  return useQuery({
    queryKey: ["admin", "users", page, filters],
    queryFn: async () => {
      // Filter out empty values
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const params = new URLSearchParams({
        page,
        limit,
        ...cleanFilters,
      });
      
      const response = await api.get(`/api/admin/users?${params}`);
      return response.data;
    },
    staleTime: DEFAULT_CACHE_TIME,
    enabled: enabled
  });
};

/**
 * React Query hook for fetching single user data
 * @param {string} userId - User ID
 * @param {boolean} enabled - Enable/disable query
 */
export const useUserById = (userId, { enabled = false } = {}) => {
  return useQuery({
    queryKey: ["admin", "users", "detail", userId],
    queryFn: async () => {
      const response = await api.get(`/api/admin/users/${userId}`);
      return response.data.data;
    },
    staleTime: DEFAULT_CACHE_TIME,
    enabled: enabled && !!userId,
  });
};

/**
 * Users service APIs
 */
const UsersService = {
  getAll: async (params) => {
    // Filter out empty values
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    const queryString = new URLSearchParams(cleanParams).toString();
    const resp = await api.get(`/api/admin/users?${queryString}`);
    return resp.data;
  },

  getById: async (id) => {
    const resp = await api.get(`/api/admin/users/${id}`);
    return resp.data;
  },

  update: async (id, data) => {
    const resp = await api.put(`/api/admin/users/${id}`, data);
    return resp.data;
  },

  delete: async (id) => {
    const resp = await api.delete(`/api/admin/users/${id}`);
    return resp.data;
  },
};

export default UsersService;
