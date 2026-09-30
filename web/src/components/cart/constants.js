/**
 * Cart / checkout pricing rules.
 * Kept here so the cart page and summary footer share one source of truth.
 */

/** Order subtotal (in ₹) at or above which delivery is free. */
export const FREE_DELIVERY_THRESHOLD = 199;

/** Flat delivery fee (in ₹) charged when the subtotal is below the threshold. */
export const DELIVERY_FEE = 25;

/**
 * Delivery fee for a given subtotal.
 * @param {number} subtotal
 * @returns {number} 0 when the order qualifies for free delivery
 */
export function getDeliveryFee(subtotal) {
  return subtotal > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}
