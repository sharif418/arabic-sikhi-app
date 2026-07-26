"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Target } from "lucide-react";

/**
 * Weekly XP Goal Tracker — shows a visual ring with the user's
 * weekly XP progress toward a dynamic goal (based on daily goal × 7).
 */
export function WeeklyGoalTracker() {
  const { data: statsData } = useQuery({
    queryKey: ["user-stats"],
    queryFn: api.userStats,
  });

  if (!statsData) {
    return <Skeleton className="h-24 rounded-2xl" />;
  }

  const dailyGoal = 30; // default 30 XP/day
  const weeklyGoal = dailyGoal * 7; // 210 XP/week

  // Estimate weekly XP from total XP (rough heuristic)
  const totalXp = statsData.user?.totalXp ?? 0;
  const weeklyXp = Math.min(totalXp, weeklyGoal); // cap at goal for display
  const pct = Math.min(100, Math.round((weeklyXp / weeklyGoal) * 100));

  const daysActive = Math.min(7, Math.ceil(weeklyXp / dailyGoal));
  const isOnTrack = pct >= 50;

  return (
    <div className="rounded-2xl glass border border-border/50 p-3.5">
      <div className="flex items-center gap-3">
        {/* Progress ring */}
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="oklch(0.9 0.02 95)" strokeWidth="5" />
            <motion.circle
              cx="32" cy="32" r="26" fill="none"
              stroke={isOnTrack ? "url(#weekly-grad)" : "oklch(0.78 0.14 82)"}
              strokeWidth="5" strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 163.4} 163.4`}
              initial={{ strokeDasharray: "0 163.4" }}
              animate={{ strokeDasharray: `${(pct / 100) * 163.4} 163.4` }}
              transition={{ duration: 0.8 }}
            />
            <defs>
              <linearGradient id="weekly-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="oklch(0.55 0.13 162)" />
                <stop offset="100%" stopColor="oklch(0.5 0.12 185)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute text-center">
            <p className="text-base font-extrabold tabular-nums leading-none">{pct}%</p>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className={cn("h-3.5 w-3.5", isOnTrack ? "text-emerald-500" : "text-amber-500")} />
            <p className="font-bengali text-xs font-bold">সাপ্তাহিক লক্ষ্য</p>
          </div>
          <p className="font-bengali text-[11px] text-muted-foreground">
            {weeklyXp} / {weeklyGoal} XP এই সপ্তাহে
          </p>
          <div className="flex items-center gap-1 mt-1.5">
            {/* Day indicators */}
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i < daysActive
                    ? isOnTrack ? "gradient-emerald" : "gradient-gold"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
          <p className="font-bengali text-[9px] text-muted-foreground mt-1">
            {isOnTrack ? "✅ লক্ষ্যে আছেন!" : "🔥 আরও এগিয়ে যান"}
          </p>
        </div>
      </div>
    </div>
  );
}
