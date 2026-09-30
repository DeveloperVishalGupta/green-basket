/**
 * API client configuration and endpoints
 * Centralized API communication for the application
 */

import axios from "axios";

/**
 * Base API URL from environment variables
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Axios instance with default configuration
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor to add auth token
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      const networkError = new Error(
        "Network error. Please check your connection.",
      );
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }

    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    // Format error with proper message
    const formattedError = {
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",
      status: error.response?.status,
      data: error.response?.data,
      response: error.response,
    };

    return Promise.reject(formattedError);
  },
);

// ==================== API Endpoints ====================

/**
 * Authentication API endpoints
 */
export const authAPI = {
  /**
   * Login with email and password
   * @param {Object} credentials - { email, password }
   */
  login: (credentials) => apiClient.post("/api/auth/login", credentials),

  /**
   * Register new user
   * @param {Object} userData - User registration data
   */
  register: (userData) => apiClient.post("/api/auth/register", userData),

  /**
   * Verify OTP for email verification
   * @param {Object} data - { email, otp }
   */
  verifyOTP: (data) => apiClient.post("/api/auth/verify-otp", data),

  /**
   * Resend OTP for email verification
   * @param {Object} data - { email }
   */
  resendOTP: (data) => apiClient.post("/api/auth/resend-otp", data),

  /**
   * Logout current user
   */
  logout: () => apiClient.post("/api/auth/logout"),

  /**
   * Get current user profile
   */
  getMe: () => apiClient.get("/api/auth/me"),

  /**
   * Refresh authentication token
   */
  refreshToken: () => apiClient.post("/api/auth/refresh"),

  /**
   * Send forgot password email
   * @param {Object} data - { email }
   */
  forgotPassword: (data) => apiClient.post("/api/auth/forgot-password", data),

  /**
   * Reset password using reset token
   * @param {string} token - Password reset token
   * @param {Object} data - { password }
   */
  resetPassword: (token, data) =>
    apiClient.post(`/api/auth/reset-password/${token}`, data),
};

/**
 * Products API endpoints
 */
export const productsAPI = {
  /**
   * Get all products with filters
   * @param {Object} params - Query parameters (page, limit, category, etc.)
   */
  getAll: (params = { limit: null }) =>
    apiClient.get(`/api/products?limit=${params.limit || null}`, { params }),

  /**
   * Get single product by slug
   * @param {string} slug - Product slug
   */
  getBySlug: (slug) => apiClient.get(`/api/products/${slug}`),

  /**
   * Create new product (Admin/Vendor only)
   * @param {Object} productData - Product data
   */
  create: async (formdata) =>
    apiClient.post("/api/products", formdata, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  /**
   * Update product
   * @param {string} id - Product ID
   * @param {Object} productData - Updated product data
   */
  update: (id, formData) => apiClient.put(`/api/products/${id}`, formData),

  /**
   * Delete product (Admin only)
   * @param {string} id - Product ID
   */
  delete: (id) => apiClient.delete(`/api/products/${id}`),

  /**
   * Get featured products
   */
  getFeatured: () => apiClient.get("/api/products/featured"),
};

/**
 * Categories API endpoints
 */
export const categoriesAPI = {
  /**
   * Get all categories
   */
  getAll: () => apiClient.get("/api/categories"),

  /**
   * Get category by slug with products
   * @param {string} slug - Category slug
   */
  getBySlug: (slug) => apiClient.get(`/api/categories/${slug}`),

  /**
   * Create new category (Admin only)
   * @param {Object} categoryData - Category data
   */
  create: (categoryData) => apiClient.post("/api/categories", categoryData),
};

/**
 * Cart API endpoints
 */
export const cartAPI = {
  /**
   * Get user's cart
   */
  get: () => apiClient.get("/api/cart"),

  /**
   * Add item to cart
   * @param {Object} item - { productId, quantity }
   */
  addItem: (item) => apiClient.post("/api/cart/items", item),

  /**
   * Update cart item quantity
   * @param {string} itemId - Cart item ID
   * @param {number} quantity - New quantity
   */
  updateItem: (itemId, quantity) =>
    apiClient.put(`/api/cart/items/${itemId}`, { quantity }),

  /**
   * Remove item from cart
   * @param {string} itemId - Cart item ID
   */
  removeItem: (itemId) => apiClient.delete(`/api/cart/items/${itemId}`),

  /**
   * Clear entire cart
   */
  clear: () => apiClient.delete("/api/cart"),
};

/**
 * Orders API endpoints
 */
export const ordersAPI = {
  /**
   * Get user's orders
   */
  getAll: () => apiClient.get("/api/orders"),

  /**
   * Get single order by ID
   * @param {string} orderId - Order ID
   */
  getById: (orderId) => apiClient.get(`/api/orders/${orderId}`),

  /**
   * Create new order
   * @param {Object} orderData - Order data
   */
  create: (orderData) => apiClient.post("/api/orders", orderData),

  /**
   * Check stock availability for cart items against a delivery date
   * @param {Array} items - [{ product, quantity, name }]
   * @param {string} deliveryDate - "YYYY-MM-DD"
   */
  checkStock: (items, deliveryDate) =>
    apiClient.post("/api/orders/check-stock", { items, deliveryDate }),

  /**
   * Update order status (Admin only)
   * @param {string} orderId - Order ID
   * @param {Object} data - { status, note }
   */
  updateStatus: (orderId, data) =>
    apiClient.put(`/api/orders/${orderId}/status`, data),

  /**
   * Cancel order (Customer)
   * @param {string} orderId - Order ID
   * @param {string} reason - Cancellation reason
   */
  cancel: (orderId, reason) =>
    apiClient.post(`/api/orders/${orderId}/cancel`, { reason }),

  /**
   * Refresh refund status from Razorpay
   * @param {string} orderId - Order ID
   */
  refreshRefundStatus: (orderId) =>
    apiClient.post(`/api/orders/${orderId}/refund/refresh`),

  /**
   * Resolve a flagged order item (stock/price issue found on
   * delivery-day/admin verification) — replace, remove, accept the new
   * price, or accept a reduced/partial quantity.
   * @param {string} orderId - Order ID
   * @param {string} itemId - Order item (subdocument) ID
   * @param {Object} data - { action, replacementProductId?, replacementVariant? }
   */
  resolveItem: (orderId, itemId, data) =>
    apiClient.put(`/api/orders/${orderId}/items/${itemId}/resolve`, data),

  /**
   * Get all orders (Admin only)
   * @param {Object} params - Query parameters
   */
  getAllAdmin: (params = {}) =>
    apiClient.get("/api/orders/admin/all", { params }),

  /**
   * Customer edits their own order — item quantities/removal, delivery
   * address, delivery date/slot, and notes — while it's still
   * pending/confirmed/processing.
   * @param {string} orderId - Order ID
   * @param {Object} data - { items?, addressId?, deliveryDate?, deliveryTimeSlot?, notes? }
   */
  update: (orderId, data) => apiClient.put(`/api/orders/${orderId}`, data),
};

/**
 * Delivery API endpoints
 */
export const deliveryAPI = {
  /**
   * Check whether a pincode is currently serviceable
   * @param {string} pincode - 6-digit pincode
   */
  checkPincode: (pincode) =>
    apiClient.get(`/api/delivery/check-pincode/${pincode}`),
};

/**
 * Users API endpoints
 */
export const usersAPI = {
  /**
   * Get user profile
   */
  getProfile: () => apiClient.get("/api/users/profile"),

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   */
  updateProfile: (userData) => apiClient.put("/api/users/profile", userData),

  /**
   * Change password
   * @param {Object} passwordData - { currentPassword, newPassword }
   */
  changePassword: (passwordData) =>
    apiClient.put("/api/users/password", passwordData),

  /**
   * Get delivery date availability
   * @param {string[]} dateIds - "YYYY-MM-DD" ids to check (defaults to today+tomorrow)
   */
  getDeliveryAvailability: (dateIds) =>
    apiClient.get("/api/users/delivery-availability", {
      params: dateIds ? { dates: dateIds.join(",") } : undefined,
    }),

  /**
   * Set the user's delivery date preference
   * @param {string} date - "YYYY-MM-DD"
   */
  setDeliveryPreference: (date) =>
    apiClient.put("/api/users/delivery-preference", { date }),
};

/**
 * shipment API endpoints
 */
export const shipmentAPI = {
  /**
   * Create serviceability request
   */
  cerateServiceability: () => apiClient.post("/api/shipment/serviceability"),

  /**
   * create shipment
   * @param {Object} shipmentData - Shipment data
   */
  createShipment: (shipmentData) =>
    apiClient.put("/api/shipment/create", shipmentData),
};

/**
 * Wishlist API endpoints
 */
export const wishlistAPI = {
  /**
   * Get user's wishlist
   */
  getAll: () => apiClient.get("/api/wishlist"),

  /**
   * Add product to wishlist
   * @param {string} productId - Product ID
   */
  add: (productId) => apiClient.post(`/api/wishlist/${productId}`),

  /**
   * Remove product from wishlist
   * @param {string} productId - Product ID
   */
  remove: (productId) => apiClient.delete(`/api/wishlist/${productId}`),

  /**
   * Check if product is in wishlist
   * @param {string} productId - Product ID
   */
  check: (productId) => apiClient.get(`/api/wishlist/check/${productId}`),
};

/**
 * Coupon API endpoints — currently coupons are only ever issued
 * automatically as loyalty rewards for reaching an order-count milestone.
 */
export const couponsAPI = {
  /**
   * Get the current user's coupons (unused first)
   */
  getMy: () => apiClient.get("/api/coupons/my"),
};

/**
 * Notification API endpoints
 */
export const notificationAPI = {
  /**
   * Get user notifications
   * @param {Object} params - Query parameters (page, limit, unreadOnly)
   */
  getAll: (params) => apiClient.get("/api/notifications", { params }),

  /**
   * Get unread notification count
   */
  getUnreadCount: () => apiClient.get("/api/notifications/unread-count"),

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   */
  markAsRead: (notificationId) =>
    apiClient.put(`/api/notifications/${notificationId}/read`),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: () => apiClient.put("/api/notifications/read-all"),

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   */
  delete: (notificationId) =>
    apiClient.delete(`/api/notifications/${notificationId}`),

  /**
   * Delete all notifications
   */
  deleteAll: () => apiClient.delete("/api/notifications/all"),
};

/**
 * Payment API endpoints (Razorpay)
 */
export const paymentAPI = {
  /**
   * Create Razorpay order for payment
   * @param {string} orderId - Order ID from our database
   */
  createRazorpayOrder: (orderId, pricing) =>
    apiClient.post("/api/payment/create-order", { orderId, pricing }),

  /**
   * Verify payment after Razorpay success
   * @param {Object} paymentData - { razorpay_order_id, razorpay_payment_id, razorpay_signature }
   */
  verifyPayment: (paymentData) =>
    apiClient.post("/api/payment/verify", paymentData),

  /**
   * Handle payment failure
   * @param {string} orderId - Order ID
   * @param {Object} errorData - Error details
   */
  handlePaymentFailure: (orderId, errorData) =>
    apiClient.post("/api/payment/failure", { orderId, ...errorData }),
};

export default apiClient;
