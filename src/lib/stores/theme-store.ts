"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeId = "emerald" | "gold" | "rose" | "midnight";

export interface CustomTheme {
  id: ThemeId;
  name: string;
  nameBn: string;
  /** Primary CSS color (oklch) */
  primary: string;
  /** Primary foreground */
  primaryForeground: string;
  /** Gradient class name for the theme */
  gradient: string;
  /** Glow shadow class */
  glow: string;
  /** Accent gold color for this theme */
  gold: string;
  /** Icon */
  icon: string;
}

export const THEMES: Record<ThemeId, CustomTheme> = {
  emerald: {
    id: "emerald",
    name: "Emerald Night",
    nameBn: "এমেরাল্ড",
    primary: "oklch(0.45 0.12 165)",
    primaryForeground: "oklch(0.98 0.015 95)",
    gradient: "gradient-emerald",
    glow: "shadow-glow-emerald",
    gold: "oklch(0.78 0.14 82)",
    icon: "🌿",
  },
  gold: {
    id: "gold",
    name: "Royal Gold",
    nameBn: "রয়্যাল গোল্ড",
    primary: "oklch(0.55 0.13 65)",
    primaryForeground: "oklch(0.98 0.015 95)",
    gradient: "gradient-gold",
    glow: "shadow-glow-gold",
    gold: "oklch(0.78 0.14 82)",
    icon: "👑",
  },
  rose: {
    id: "rose",
    name: "Rose Dawn",
    nameBn: "রোজ ডন",
    primary: "oklch(0.55 0.14 10)",
    primaryForeground: "oklch(0.98 0.015 95)",
    gradient: "gradient-sunset",
    glow: "shadow-glow-gold",
    gold: "oklch(0.78 0.14 82)",
    icon: "🌸",
  },
  midnight: {
    id: "midnight",
    name: "Midnight Mosque",
    nameBn: "মিডনাইট",
    primary: "oklch(0.45 0.12 265)",
    primaryForeground: "oklch(0.98 0.015 95)",
    gradient: "gradient-aurora",
    glow: "shadow-glow-emerald",
    gold: "oklch(0.82 0.14 85)",
    icon: "🕌",
  },
};

interface ThemeState {
  /** Currently active theme */
  active: ThemeId;
  /** Owned themes (purchased) */
  owned: ThemeId[];
  /** Set the active theme */
  setTheme: (id: ThemeId) => void;
  /** Mark a theme as owned (after purchase) */
  ownTheme: (id: ThemeId) => void;
  /** Check if a theme is owned */
  isOwned: (id: ThemeId) => boolean;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      active: "emerald",
      owned: ["emerald"],
      setTheme: (id) => set({ active: id }),
      ownTheme: (id) =>
        set((s) => ({
          owned: s.owned.includes(id) ? s.owned : [...s.owned, id],
        })),
      isOwned: (id) => get().owned.includes(id),
    }),
    {
      name: "arabic-sikhi-themes",
    }
  )
);

/**
 * Apply the active theme's primary color to the document root as CSS variables.
 * Call this in a useEffect on the client side.
 */
export function applyThemeCss(themeId: ThemeId) {
  if (typeof document === "undefined") return;
  const theme = THEMES[themeId];
  if (!theme) return;
  const root = document.documentElement;
  // Override the primary CSS variables
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--primary-foreground", theme.primaryForeground);
  // Set a data attribute for theme-specific CSS targeting
  root.setAttribute("data-theme", themeId);
}

/**
 * Reset theme CSS variables back to default (emerald).
 */
export function resetThemeCss() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.removeProperty("--primary");
  root.style.removeProperty("--primary-foreground");
  root.removeAttribute("data-theme");
}
