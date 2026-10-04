"use client";

import { getFreeDeliveryRemaining } from "@/components/cart/constants";

/**
 * Message showing how much more to add for free delivery.
 * Renders nothing when the subtotal already qualifies.
 */
export default function FreeDeliveryNudge({ subtotal, className = "" }) {
  const remaining = getFreeDeliveryRemaining(subtotal);
  if (remaining <= 0) return null;

  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-center ${className}`}>
      <p className="text-xs font-semibold text-amber-800">
        🚚 Add items worth ₹{remaining} more to get FREE delivery
      </p>
    </div>
  );
}
