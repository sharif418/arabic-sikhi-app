"use client";

import { create } from "zustand";

export type Screen =
  | { name: "onboarding" }
  | { name: "auth" }
  | { name: "home" }
  | { name: "lesson"; lessonId: string }
  | { name: "vocabulary" }
  | { name: "vocab-deck"; deckId?: string }
  | { name: "dictionary" }
  | { name: "friends" }
  | { name: "alphabet" }
  | { name: "search" }
  | { name: "leaderboard" }
  | { name: "profile" }
  | { name: "achievements" }
  | { name: "ai-tutor" }
  | { name: "shop" }
  | { name: "admin" }
  | { name: "settings" };

export type TabName = "home" | "vocabulary" | "leaderboard" | "profile";

interface NavState {
  /** Stack of screens for back navigation. Last item is current. */
  stack: Screen[];
  /** Currently active bottom tab. */
  activeTab: TabName;
  /** Navigate to a new screen (push onto stack). */
  navigate: (screen: Screen) => void;
  /** Replace the current screen (no back). */
  replace: (screen: Screen) => void;
  /** Go back one screen. Returns to tab root if at root. */
  back: () => void;
  /** Reset to a single screen. */
  resetTo: (screen: Screen) => void;
  /** Switch the active bottom tab (clears stack to tab root). */
  setTab: (tab: TabName) => void;
  /** Whether we can go back. */
  canGoBack: () => boolean;
}

const TAB_ROOTS: Record<TabName, Screen> = {
  home: { name: "home" },
  vocabulary: { name: "vocabulary" },
  leaderboard: { name: "leaderboard" },
  profile: { name: "profile" },
};

export const useNav = create<NavState>((set, get) => ({
  stack: [{ name: "onboarding" }],
  activeTab: "home",
  navigate: (screen) => set((s) => ({ stack: [...s.stack, screen] })),
  replace: (screen) =>
    set((s) => ({ stack: [...s.stack.slice(0, -1), screen] })),
  back: () => {
    const { stack } = get();
    if (stack.length <= 1) return;
    set({ stack: stack.slice(0, -1) });
  },
  resetTo: (screen) => set({ stack: [screen] }),
  setTab: (tab) => set({ activeTab: tab, stack: [TAB_ROOTS[tab]] }),
  canGoBack: () => get().stack.length > 1,
}));

/** Selector hook for current screen. */
export function useCurrentScreen(): Screen {
  return useNav((s) => s.stack[s.stack.length - 1]);
}
