/**
 * Cart / checkout pricing rules.
 * Kept here so the cart page and summary footer share one source of truth.
 */

/** Order subtotal (in ₹) at or above which delivery is free. */
export const FREE_DELIVERY_THRESHOLD = 149;

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

/**
 * Amount (in ₹) still to be added to the subtotal to unlock free delivery.
 * @param {number} subtotal
 * @returns {number} 0 when the order already qualifies
 */
export function getFreeDeliveryRemaining(subtotal) {
  if (subtotal > FREE_DELIVERY_THRESHOLD) return 0;
  // Free delivery needs a subtotal strictly above the threshold.
  return Math.max(1, Math.ceil(FREE_DELIVERY_THRESHOLD - subtotal));
}
