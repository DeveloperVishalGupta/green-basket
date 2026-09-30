"use client";

/**
 * Small reassurance tile shown in the cart (Free Delivery / No Returns / Secure).
 * `tone` picks the colour treatment; "warning" is used to draw attention.
 */
const TONES = {
  default: "bg-white text-gray-700 dark:bg-surface dark:text-text-secondary",
  warning:
    "bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300",
};

export default function InfoBadge({ icon, title, subtitle, tone = "default" }) {
  return (
    <div
      className={`rounded-xl p-3 text-center shadow-sm ${TONES[tone] ?? TONES.default}`}>
      <div className="mb-1 text-xl" aria-hidden="true">
        {icon}
      </div>
      <p className="text-xs font-semibold">{title}</p>
      {subtitle ? (
        <p className="text-xs opacity-80">{subtitle}</p>
      ) : null}
    </div>
  );
}
