"use client";

/**
 * AuthProvider
 * Single source of truth for authentication state.
 * Wraps the entire app so every component shares the same user/loading state
 * and /api/auth/me is called exactly once on mount — not once per component.
 */

import { authAPI } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const isFetchingRef = useRef(false);

  /**
   * Fetch current user from API.
   * Guarded by isFetchingRef to prevent concurrent calls.
   */
  const fetchUser = useCallback(async () => {
    if (isFetchingRef.current) return;

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      const response = await authAPI.getMe();
      const userData = response.data.user || response.data.data;
      setUser(userData);
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
      }
      setError(null);
    } catch (err) {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
      if (err.response?.status !== 401 && err.status !== 401) {
        setError(err.response?.data?.message || "Failed to fetch user");
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  /** Initialise from localStorage on mount, then validate with server. */
  useEffect(() => {
    if (typeof window === "undefined") {
      fetchUser();
      return;
    }

    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setLoading(false);
        // Validate token in background — don't await
        fetchUser();
      } catch {
        fetchUser();
      }
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [fetchUser]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login({ email, password });
      if (response.data.success) {
        setUser(response.data.user);
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return response.data;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.register(userData);
      if (response.data.success) {
        setUser(response.data.user);
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        router.push("/");
        return response.data;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem("token");

      // Switch back to guest cart
      useCartStore.persist.setOptions({
        name: `green-basket-cart-guest`,
      });

      await useCartStore.persist.rehydrate();
    } catch {
      // ignore logout errors
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      router.push("/login");
    }
  };

  const refreshUser = async () => {
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      await fetchUser();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        refreshUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — reads from AuthContext.
 * All components share the same state; no duplicate API calls.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
