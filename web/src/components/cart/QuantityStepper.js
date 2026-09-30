"use client";

/**
 * Minus / value / plus control for a cart line item.
 * The minus button is disabled at quantity 1 — removal is a separate action.
 *
 * onIncrement/onDecrement take no arguments and are expected to update the
 * store atomically (see useCartStore's incrementItem/decrementItem) rather
 * than receiving a quantity computed here — that avoids ever applying a
 * stale +1/-1 on top of an out-of-date `quantity` prop.
 */

import { MinusOutlined, PlusOutlined } from "@ant-design/icons";

export default function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  label = "item",
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 px-3 py-1.5 dark:border-emerald-600 dark:bg-emerald-950">
      <button
        type="button"
        onClick={onDecrement}
        disabled={quantity <= 1}
        aria-label={`Decrease ${label} quantity`}
        className="flex h-6 w-6 items-center justify-center font-bold text-emerald-600 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 dark:text-emerald-300">
        <MinusOutlined className="text-sm" />
      </button>
      <span
        className="w-7 text-center text-base font-bold text-gray-900 dark:text-text-primary"
        aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label={`Increase ${label} quantity`}
        className="flex h-6 w-6 items-center justify-center font-bold text-emerald-600 transition-transform hover:scale-110 dark:text-emerald-300">
        <PlusOutlined className="text-sm" />
      </button>
    </div>
  );
}
