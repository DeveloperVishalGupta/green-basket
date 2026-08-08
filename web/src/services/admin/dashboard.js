import { DEFAULT_CACHE_TIME } from "@/utils/constants";
import { useQuery } from "@tanstack/react-query";
import api from "../api";
// import api from "./api.js";

/**
 * React Query hook for fetching admin dashboard data
 */
export const useAdminDashboard = (period) => {
  return useQuery({
    queryKey: ["admin", "dashboard", period],
    queryFn: async () => {
      if (!period) {
        throw new Error("Period is required");
      }

      const response = await api.get(`api/admin/dashboard`, {
        params: { period },
      });
      return response.data.data;
    },
    enabled: !!period,
    staleTime: DEFAULT_CACHE_TIME,
  });
};

/**
 * React Query hook for fetching vendors assigned to a company
 */
export const useGetVendorsByCompanyId = (companyId) => {
  return useQuery({
    queryKey: ["company", companyId, "vendors"],
    queryFn: async () => {
      if (!companyId) {
        throw new Error("Company ID is required");
      }

      const response = await api.get(`/company/${companyId}/vendors`);

      return response.data;
    },
    enabled: Boolean(companyId),
    staleTime: DEFAULT_CACHE_TIME,
  });
};

/**
 * React Query hook for fetching all vendors
 */
export const useVendorsListAll = () => {
  return useQuery({
    queryKey: ["vendors", "all"],
    queryFn: async () => {
      const response = await api.get("/vendors");
      return response.data;
    },
    staleTime: DEFAULT_CACHE_TIME,
  });
};

/**
 * Vendor service APIs
 */
const vendorService = {
  getAll: async (params = {}, config = {}) => {
    const resp = await api.get("/vendors", {
      params,
      ...config,
    });
    return resp.data;
  },

  getById: async (id) => {
    const resp = await api.get(`/vendors/${id}`, {
      params: { id },
    });
    return resp.data;
  },

  create: async (data) => {
    const resp = await api.post("/vendors/create", data);
    return resp.data;
  },

  update: async (id, data) => {
    const resp = await api.put(`/vendors/${id}`, data);
    return resp.data;
  },

  delete: async (id) => {
    const resp = await api.delete(`/vendors/${id}`, {
      params: { id },
    });
    return resp.data;
  },

  deleteVendor: async (id) => {
    const resp = await api.delete(`/vendors/${id}`, {
      params: { id },
    });
    return resp.data;
  },
};

export default vendorService;
