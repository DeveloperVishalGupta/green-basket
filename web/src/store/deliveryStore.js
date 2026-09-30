"use client";

/**
 * Delivery date preference store using Zustand
 * Tracks the user's chosen delivery date ("Today"/"Tomorrow", as a
 * "YYYY-MM-DD" id) and whether they've been prompted for it this login.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useDeliveryStore = create(
  persist(
    (set) => ({
      // State
      date: null, // "YYYY-MM-DD" id, or null if not yet chosen
      promptedForUserId: null, // user id last confirmed for; cleared on every login

      /**
       * Set the chosen delivery date id
       * @param {string} dateId - "YYYY-MM-DD"
       */
      setDate: (dateId) => {
        set({ date: dateId });
      },

      /**
       * Mark the modal as answered for this user
       * @param {string} userId
       */
      setPromptedForUserId: (userId) => {
        set({ promptedForUserId: userId });
      },

      /**
       * Clear both the choice and the "prompted" flag, forcing the
       * mandatory modal to reappear (called on every successful login).
       */
      reset: () => {
        set({ date: null, promptedForUserId: null });
      },
    }),
    {
      name: "green-basket-delivery", // localStorage key
    },
  ),
);
