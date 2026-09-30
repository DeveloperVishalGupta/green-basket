"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

/**
 * Shared page header used across shop pages (products, categories, orders,
 * cart, checkout, etc.) so the back button, title and subtitle look and
 * behave the same everywhere.
 *
 * @param {string} title - Page title.
 * @param {string} [subtitle] - Optional line under the title (e.g. item count).
 * @param {function} [onBack] - Custom back handler; defaults to router.back().
 * @param {React.ReactNode} [rightContent] - Optional actions rendered on the right.
 * @param {string} [maxWidth] - Tailwind max-w-* class for the inner container.
 */
export default function PageHeader({
  title,
  subtitle,
  onBack,
  rightContent,
  maxWidth = "max-w-7xl",
}) {
  const router = useRouter();

  return (
    <header className="bg-white/95">
      <div
        className={`h-page-header mx-auto flex items-center justify-between gap-3 ${maxWidth} px-4`}>
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack || (() => router.back())}
            aria-label="Go back"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all hover:scale-105">
            <ArrowLeftOutlined className="text-base text-gray-700" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {rightContent && (
          <div className="flex shrink-0 items-center gap-2">{rightContent}</div>
        )}
      </div>
    </header>
  );
}
