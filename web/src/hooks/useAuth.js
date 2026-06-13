/**
 * Custom hook for authentication
 * Manages user session and authentication state
 */

'use client';

import { authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Authentication hook
 * Provides user state and auth methods
 * 
 * @returns {Object} Auth state and methods
 * @returns {Object|null} user - Current user object
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message
 * @returns {boolean} isAuthenticated - Whether user is logged in
 * @returns {Function} login - Login function
 * @returns {Function} logout - Logout function
 * @returns {Function} register - Register function
 * @returns {Function} refreshUser - Refresh user data
 */

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const isFetchingRef = useRef(false); // Prevent multiple simultaneous calls
  
  /**
   * Fetch current user from API
   * Only calls API if token exists in localStorage
   */
  const fetchUser = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      return;
    }
    
    // Check if token exists before calling API
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        // No token, user is not logged in - don't call API
        setUser(null);
        setLoading(false);
        return;
      }
    }
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      const response = await authAPI.getMe();
      
      // Handle both response.data.user and response.data.data formats
      const userData = response.data.user || response.data.data;
      setUser(userData);
      
      // Update localStorage with fresh user data
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      setError(null);
    } catch (err) {
      setUser(null);
      // Clear localStorage on auth error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      // Don't set error for 401 (user not logged in)
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Failed to fetch user');
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);
  
  /**
   * Initialize - fetch user on mount
   */
  useEffect(() => {
    // Try to get user from localStorage first for instant load
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
          setLoading(false); // Set loading false immediately if we have cached user
          // Still fetch fresh data in background
          fetchUser();
        } catch (e) {
          console.error('Failed to parse stored user:', e);
          // If parsing fails, fetch from server
          fetchUser();
        }
      } else {
        // No cached user or token, set not authenticated immediately
        setUser(null);
        setLoading(false);
      }
    } else {
      // Server-side, just fetch
      fetchUser();
    }
  }, [fetchUser]);
  
  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response
   * @throws {Error} If login fails
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        setUser(response.data.user);
        
        // Store token if returned
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Don't redirect here - let calling component handle it
        // This prevents conflicts with role-based redirects
        
        return response.data;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.firstName - First name
   * @param {string} userData.lastName - Last name
   * @returns {Promise<Object>} Registration response
   * @throws {Error} If registration fails
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(userData);
      
      if (response.data.success) {
        setUser(response.data.user);
        
        // Store token if returned
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        // Redirect to home
        router.push('/');
        
        return response.data;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Logout current user
   */
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      // Clear all auth data from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      router.push('/login');
    }
  };
  
  /**
   * Refresh user data
   * Only refreshes if user is currently authenticated
   */
  const refreshUser = async () => {
    // Only refresh if token exists
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        await fetchUser();
      }
    }
  };
  
  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    refreshUser,
  };
}
