"use client";

/**
 * Perishable-goods "no returns" disclaimer shown below the cart items.
 */
export default function NoReturnNotice() {
  return (
    <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950">
      <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
        <span className="font-semibold">⚠️ No Return Policy:</span> Due to the
        perishable nature of fruits and vegetables, returns are not accepted.
        Please inspect the product before accepting delivery.
      </p>
    </div>
  );
}
