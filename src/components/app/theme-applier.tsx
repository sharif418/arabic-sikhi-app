"use client";

import { useEffect } from "react";
import { useThemeStore, applyThemeCss } from "@/lib/stores/theme-store";

/**
 * Renders nothing visible — just applies the active theme's CSS variables
 * to the document root on mount and whenever the active theme changes.
 */
export function ThemeApplier() {
  const active = useThemeStore((s) => s.active);

  useEffect(() => {
    applyThemeCss(active);
  }, [active]);

  return null;
}
