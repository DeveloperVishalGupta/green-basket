import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentAPI } from '@/lib/api';
import { message } from 'antd';

/**
 * Custom hook for shipment operations
 * Handles serviceability check and shipment creation
 */

/**
 * Create shipment with serviceability check
 * First checks serviceability, then creates shipment if available
 */
export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shipmentData) => {
      try {
        // Step 1: Check serviceability
        const serviceabilityResponse = await shipmentAPI.cerateServiceability();
        
        if (!serviceabilityResponse?.data?.success) {
          const error = {
            message: serviceabilityResponse?.data?.message || 'Service not available in your area',
            type: 'serviceability'
          };
          throw error;
        }

        // Step 2: Create shipment if serviceability check passed
        const shipmentResponse = await shipmentAPI.createShipment(shipmentData);
        
        if (!shipmentResponse?.data?.success) {
          const error = {
            message: shipmentResponse?.data?.message || 'Failed to create shipment',
            type: 'shipment'
          };
          throw error;
        }

        return {
          serviceability: serviceabilityResponse.data,
          shipment: shipmentResponse.data,
        };
      } catch (error) {
        // Re-throw with proper message
        throw {
          message: error?.message || error?.response?.data?.message || 'Shipment creation failed',
          originalError: error
        };
      }
    },
    onSuccess: (data) => {
      message.success('Shipment created successfully!');
      // Invalidate orders cache if needed
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Shipment creation error:', error);
      const errorMessage = error?.message || 'Failed to create shipment';
      message.error(errorMessage);
    },
  });
}

/**
 * Check serviceability only
 */
export function useCheckServiceability() {
  return useMutation({
    mutationFn: async () => {
      try {
        const response = await shipmentAPI.cerateServiceability();
        
        if (!response?.data?.success) {
          throw {
            message: response?.data?.message || 'Service not available in your area'
          };
        }
        
        return response.data;
      } catch (error) {
        throw {
          message: error?.message || error?.response?.data?.message || 'Service check failed',
          originalError: error
        };
      }
    },
    onSuccess: (data) => {
      message.success('Service available in your area!');
    },
    onError: (error) => {
      console.error('Serviceability check error:', error);
      const errorMessage = error?.message || 'Service not available';
      message.error(errorMessage);
    },
  });
}
