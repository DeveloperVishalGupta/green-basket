"use client";

/**
 * Applies the persisted light/dark theme to <html> and switches Ant
 * Design's token algorithm to match, since AntD components don't
 * respond to Tailwind's `dark:` class variant on their own.
 */

import { useThemeStore } from "@/store/themeStore";
import { App, ConfigProvider, theme as antdTheme } from "antd";
import { useEffect } from "react";

export function ThemeProvider({ children }) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#16A34A",
          colorSuccess: "#22C55E",
          colorWarning: "#FACC15",
          colorInfo: "#16A34A",
          borderRadius: 8,
          fontFamily: "var(--font-geist-sans)",
        },
      }}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
