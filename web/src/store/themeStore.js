"use client";

/**
 * Theme store using Zustand
 * Persists the user's light/dark preference to localStorage.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set({ theme: get().theme === "dark" ? "light" : "dark" }),
    }),
    {
      name: "green-basket-theme",
    }
  )
);
