"use client";

/**
 * Shopping Cart Store using Zustand
 * Manages cart state with localStorage persistence
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Cart store with persistent state
 * Automatically saves to localStorage
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      pendingProduct: null, // Product to add after login

      /**
       * Add item to cart or increment quantity if already exists
       * @param {Object} product - Product object to add
       * @param {number} quantity - Quantity to add (default: 1)
       */

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.id === product.id,
          );

          if (existingItem) {
            // Update quantity of existing item
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }

          // Add new item
          return {
            items: [...state.items, { ...product, quantity }],
          };
        });
      },

      /**
       * Remove item from cart completely
       * @param {string} productId - ID of product to remove
       */
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      /**
       * Update item quantity, size, and color
       * Removes item if quantity is 0 or negative
       * @param {string} productId - ID of product
       * @param {number} quantity - New quantity
       * @param {string} size - Optional size
       * @param {string} color - Optional color
       */
      updateQuantity: (
        productId,
        quantity,
        size = undefined,
        color = undefined,
      ) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.id !== productId),
            };
          }

          return {
            items: state.items.map((item) => {
              if (item.id === productId) {
                const updates = { ...item, quantity };
                if (size !== undefined) updates.size = size;
                if (color !== undefined) updates.color = color;
                return updates;
              }
              return item;
            }),
          };
        });
      },

      /**
       * Increment item quantity by 1. Reads the current quantity from state
       * itself, so rapid clicks (or any caller with a slightly stale copy
       * of the quantity) can never lose an increment the way computing
       * `quantity + 1` outside the store and calling updateQuantity() can.
       * @param {string} productId - ID of product
       */
      incrementItem: (productId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        }));
      },

      /**
       * Decrement item quantity by 1. Removes the item once it would drop
       * to 0. Reads the current quantity from state itself (not from a
       * value the caller computed earlier), so it stays correct even if the
       * caller's own copy of the quantity is stale.
       * @param {string} productId - ID of product
       */
      decrementItem: (productId) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item,
            )
            .filter((item) => item.quantity > 0),
        }));
      },

      /**
       * Clear all items from cart
       */
      clearCart: () => {
        set({ items: [] });
      },

      /**
       * Get total number of items in cart
       * @returns {number} Total item count
       */
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      /**
       * Get total price of all items in cart
       * @returns {number} Total price
       */
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          return total + item.price * item.quantity;
        }, 0);
      },

      /**
       * Check if product is in cart
       * @param {string} productId - ID of product
       * @returns {boolean}
       */
      isInCart: (productId) => {
        const { items } = get();
        return items.some((item) => item.id === productId);
      },

      /**
       * Get specific item from cart
       * @param {string} productId - ID of product
       * @returns {Object|undefined} Cart item or undefined
       */
      getItem: (productId) => {
        const { items } = get();
        return items.find((item) => item.id === productId);
      },

      /**
       * Set pending product to add after login
       * @param {Object} product - Product to add after login
       * @param {number} quantity - Quantity to add
       */
      setPendingProduct: (product, quantity = 1) => {
        set({ pendingProduct: { product, quantity } });
      },

      /**
       * Clear pending product
       */
      clearPendingProduct: () => {
        set({ pendingProduct: null });
      },

      /**
       * Add pending product to cart (called after login)
       * @returns {boolean} Whether product was added
       */
      addPendingProduct: () => {
        const { pendingProduct, addItem } = get();
        if (pendingProduct) {
          addItem(pendingProduct.product, pendingProduct.quantity);
          set({ pendingProduct: null });
          return true;
        }
        return false;
      },
    }),
    {
      name: "green-basket-cart", // localStorage key
      // Only persist items array
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
