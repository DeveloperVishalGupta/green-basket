"use client";

import { useThemeStore } from "@/store/themeStore";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

/**
 * Light/dark theme toggle button.
 * Renders a neutral placeholder until mounted to avoid hydration mismatch
 * (persisted theme is only known client-side).
 */
export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={toggleTheme}
      aria-label={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all hover:scale-105 shrink-0 dark:bg-emerald-950 dark:border-emerald-800 dark:hover:bg-emerald-900 ${className}`}>
      {mounted && theme === "dark" ? (
        <SunOutlined className="text-base md:text-lg text-emerald-300" />
      ) : (
        <MoonOutlined className="text-base md:text-lg text-emerald-700" />
      )}
    </button>
  );
}
