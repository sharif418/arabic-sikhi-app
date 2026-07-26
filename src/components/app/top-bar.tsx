"use client";

import { useEffect } from "react";
import { useGame } from "@/lib/stores/game-store";
import { useAuth } from "@/lib/stores/auth-store";
import { useNav } from "@/lib/stores/nav-store";
import {
  HeartIcon,
  GemIcon,
  StreakIcon,
  XpIcon,
} from "@/components/icons/game-icons";
import { cn } from "@/lib/utils";

function formatTime(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TopBar() {
  const { hearts, maxHearts, nextHeartAt, gems, streak, level, totalXp, regenHeartTick } =
    useGame();
  const { user } = useAuth();
  const { canGoBack, back } = useNav();
  const goBack = canGoBack();

  useEffect(() => {
    const interval = setInterval(() => regenHeartTick(), 5000);
    return () => clearInterval(interval);
  }, [regenHeartTick]);

  const now = Date.now();
  const regenIn = nextHeartAt && hearts < maxHearts ? nextHeartAt - now : 0;

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-border/40 safe-top">
      <div className="flex items-center gap-2 px-3 h-14">
        {goBack ? (
          <button
            onClick={back}
            className="tap-scale -ml-1 flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent/60 transition-colors"
            aria-label="Go back"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-emerald text-white font-bold text-sm shadow-soft">
              ع
            </div>
          </div>
        )}

        <div className="flex-1 flex items-center justify-end gap-1.5">
          {/* Streak */}
          <StatPill
            icon={<StreakIcon className="h-4 w-4" />}
            value={streak || user?.streak || 0}
            tone="streak"
          />
          {/* Streak freezes (only show if user has any) */}
          {(user?.streakFreezes ?? 0) > 0 && (
            <div
              className="flex items-center gap-1 rounded-full bg-cyan-500/15 px-2 py-1 border border-cyan-500/20"
              title={`${user?.streakFreezes} স্ট্রিক ফ্রিজ আছে`}
            >
              <span className="text-sm">🧊</span>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">{user?.streakFreezes}</span>
            </div>
          )}
          {/* Gems */}
          <StatPill
            icon={<GemIcon className="h-4 w-4" />}
            value={gems ?? user?.gems ?? 0}
            tone="gem"
          />
          {/* Hearts */}
          <button
            className="tap-scale flex items-center gap-1 rounded-full bg-card/70 px-2.5 py-1 shadow-soft border border-border/50 hover:bg-accent/50 transition-colors"
            title={regenIn > 0 ? `Next heart in ${formatTime(regenIn)}` : "Hearts full"}
          >
            <HeartIcon className="h-4 w-4" filled={hearts > 0} />
            <span className={cn("text-sm font-bold tabular-nums", hearts === 0 && "text-destructive")}>
              {hearts}
            </span>
          </button>
        </div>
      </div>

      {/* Level progress sub-bar */}
      <div className="px-3 pb-1.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <XpIcon className="h-3.5 w-3.5" />
            <span>Lv {level}</span>
          </div>
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <LevelProgress totalXp={totalXp} level={level} />
          </div>
        </div>
      </div>
    </header>
  );
}

function StatPill({
  icon,
  value,
  tone,
}: {
  icon: React.ReactNode;
  value: number;
  tone: "streak" | "gem";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full px-2.5 py-1 shadow-soft border border-border/50",
        tone === "streak" && "bg-card/70",
        tone === "gem" && "bg-card/70"
      )}
    >
      {icon}
      <span className="text-sm font-bold tabular-nums">{value}</span>
    </div>
  );
}

function LevelProgress({ totalXp, level }: { totalXp: number; level: number }) {
  const xpForLevel = (l: number) => Math.floor(50 * Math.pow(l, 1.4));
  let intoLevel = totalXp;
  for (let l = 1; l < level; l++) intoLevel -= xpForLevel(l);
  const needed = xpForLevel(level);
  const pct = Math.min(100, (intoLevel / needed) * 100);
  return (
    <div
      className="h-full rounded-full gradient-emerald transition-all duration-500"
      style={{ width: `${pct}%` }}
    />
  );
}
