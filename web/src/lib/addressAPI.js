import apiClient from './api';

/**
 * Address API endpoints
 */
export const addressAPI = {
  /**
   * Get all addresses
   */
  getAll: () => apiClient.get('/api/users/addresses'),

  /**
   * Add new address
   * @param {Object} addressData - Address data
   */
  add: (addressData) => apiClient.post('/api/users/addresses', addressData),

  /**
   * Update address
   * @param {string} id - Address ID
   * @param {Object} addressData - Updated address data
   */
  update: (id, addressData) => apiClient.put(`/api/users/addresses/${id}`, addressData),

  /**
   * Delete address
   * @param {string} id - Address ID
   */
  delete: (id) => apiClient.delete(`/api/users/addresses/${id}`),

  /**
   * Set default address
   * @param {string} id - Address ID
   */
  setDefault: (id) => apiClient.put(`/api/users/addresses/${id}/default`),
};
