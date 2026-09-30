"use client";

/**
 * Single selectable variant / weight pill (e.g. "250gm", "1kg").
 */
export default function WeightPill({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-all ${
        selected
          ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
          : "border-gray-300 bg-white text-gray-600 hover:border-emerald-500 hover:text-emerald-700 dark:border-border-default dark:bg-surface dark:text-text-secondary"
      }`}>
      {label}
    </button>
  );
}
