"use client";

/**
 * UI state store using Zustand
 * Tracks transient UI state shared across components, e.g. the
 * desktop side navigation drawer toggled from the Header.
 */

import { create } from "zustand";

export const useUIStore = create((set) => ({
  drawerOpen: false,
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
}));
