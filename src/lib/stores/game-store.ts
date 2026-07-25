"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GamificationState {
  /** Lives available — lose one on a wrong answer in a lesson. */
  hearts: number;
  maxHearts: number;
  /** Timestamp (ms) when the next heart regenerates. */
  nextHeartAt: number | null;

  /** Soft currency earned from lessons, spent in shop. */
  gems: number;

  /** Experience points — accumulate to level up. */
  xp: number;
  /** Total xp earned across all time (for leaderboard). */
  totalXp: number;
  level: number;

  /** Daily streak — increments each day a lesson is completed. */
  streak: number;
  /** ISO date string of last activity day. */
  lastActiveDate: string | null;
  /** Whether today's goal has been met. */
  dailyGoalXp: number;
  dailyXp: number;
  dailyGoalMet: boolean;

  /** Achievements unlocked (ids). */
  achievements: string[];

  /** League position. */
  league: string;
}

interface GamificationActions {
  addXp: (amount: number) => void;
  addGems: (amount: number) => void;
  spendGems: (amount: number) => boolean;
  loseHeart: () => void;
  refillHearts: (cost: number) => boolean;
  regenHeartTick: () => void;
  recordLessonComplete: (xpGained: number, gemsGained: number) => void;
  unlockAchievement: (id: string) => boolean;
  setDailyGoal: (xp: number) => void;
  /** Reset everything (for dev / new user). */
  reset: () => void;
  /** Hydrate from a server snapshot. */
  hydrateFromServer: (data: Partial<GamificationState>) => void;
}

/** XP needed to reach the next level (level n -> n+1). */
export function xpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.4));
}

/** Total XP needed to reach a level from level 1. */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += xpForLevel(l);
  return total;
}

/** Compute level from total XP. */
export function levelFromXp(totalXp: number): number {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return level;
}

const HEART_REGEN_MS = 30 * 60 * 1000; // 30 minutes per heart

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const initialState: GamificationState = {
  hearts: 5,
  maxHearts: 5,
  nextHeartAt: null,
  gems: 20,
  xp: 0,
  totalXp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: null,
  dailyGoalXp: 30,
  dailyXp: 0,
  dailyGoalMet: false,
  achievements: [],
  league: "Bronze",
};

export const useGame = create<GamificationState & GamificationActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      addXp: (amount) =>
        set((s) => {
          const newTotalXp = s.totalXp + amount;
          const newDailyXp = s.dailyXp + amount;
          const newLevel = levelFromXp(newTotalXp);
          const met = newDailyXp >= s.dailyGoalXp;
          return {
            xp: s.xp + amount,
            totalXp: newTotalXp,
            level: newLevel,
            dailyXp: newDailyXp,
            dailyGoalMet: met,
          };
        }),

      addGems: (amount) => set((s) => ({ gems: s.gems + amount })),

      spendGems: (amount) => {
        const { gems } = get();
        if (gems < amount) return false;
        set({ gems: gems - amount });
        return true;
      },

      loseHeart: () =>
        set((s) => {
          const hearts = Math.max(0, s.hearts - 1);
          const nextHeartAt =
            hearts < s.maxHearts && !s.nextHeartAt
              ? Date.now() + HEART_REGEN_MS
              : s.nextHeartAt;
          return { hearts, nextHeartAt };
        }),

      refillHearts: (cost) => {
        const ok = get().spendGems(cost);
        if (!ok) return false;
        set((s) => ({ hearts: s.maxHearts, nextHeartAt: null }));
        return true;
      },

      regenHeartTick: () =>
        set((s) => {
          if (s.hearts >= s.maxHearts || !s.nextHeartAt) return s;
          if (Date.now() < s.nextHeartAt) return s;
          const hearts = Math.min(s.maxHearts, s.hearts + 1);
          const nextHeartAt =
            hearts < s.maxHearts ? Date.now() + HEART_REGEN_MS : null;
          return { hearts, nextHeartAt };
        }),

      recordLessonComplete: (xpGained, gemsGained) => {
        const today = todayStr();
        set((s) => {
          const yesterday = new Date(Date.now() - 86400000)
            .toISOString()
            .slice(0, 10);
          let streak = s.streak;
          if (s.lastActiveDate === today) {
            // already counted today
          } else if (s.lastActiveDate === yesterday) {
            streak = s.streak + 1;
          } else {
            streak = 1;
          }
          const newTotalXp = s.totalXp + xpGained;
          const newDailyXp = s.dailyXp + xpGained;
          return {
            streak,
            lastActiveDate: today,
            gems: s.gems + gemsGained,
            xp: s.xp + xpGained,
            totalXp: newTotalXp,
            level: levelFromXp(newTotalXp),
            dailyXp: newDailyXp,
            dailyGoalMet: newDailyXp >= s.dailyGoalXp,
          };
        });
      },

      unlockAchievement: (id) => {
        if (get().achievements.includes(id)) return false;
        set((s) => ({ achievements: [...s.achievements, id] }));
        return true;
      },

      setDailyGoal: (xp) => set({ dailyGoalXp: xp, dailyGoalMet: get().dailyXp >= xp }),

      reset: () => set({ ...initialState, dailyXp: 0 }),

      hydrateFromServer: (data) => set((s) => ({ ...s, ...data })),
    }),
    {
      name: "arabic-sikhi-game",
      partialize: (s) => ({
        hearts: s.hearts,
        maxHearts: s.maxHearts,
        nextHeartAt: s.nextHeartAt,
        gems: s.gems,
        xp: s.xp,
        totalXp: s.totalXp,
        level: s.level,
        streak: s.streak,
        lastActiveDate: s.lastActiveDate,
        dailyGoalXp: s.dailyGoalXp,
        dailyXp: s.dailyXp,
        dailyGoalMet: s.dailyGoalMet,
        achievements: s.achievements,
        league: s.league,
      }),
    }
  )
);

/** League tiers — weekly promotion/demotion. */
export const LEAGUES = [
  { id: "Bronze", name: "ব্রোঞ্জ", color: "oklch(0.6 0.08 55)", icon: "🥉" },
  { id: "Silver", name: "রূপা", color: "oklch(0.7 0.03 250)", icon: "🥈" },
  { id: "Gold", name: "স্বর্ণ", color: "oklch(0.8 0.13 85)", icon: "🥇" },
  { id: "Platinum", name: "প্ল্যাটিনাম", color: "oklch(0.75 0.05 200)", icon: "💠" },
  { id: "Diamond", name: "হীরা", color: "oklch(0.7 0.12 220)", icon: "💎" },
  { id: "Pearl", name: "মুক্তা", color: "oklch(0.85 0.04 200)", icon: "🫧" },
] as const;
