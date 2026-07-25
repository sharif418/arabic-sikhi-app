"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useNav } from "@/lib/stores/nav-store";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

export function AchievementsScreen() {
  const { back } = useNav();
  const { data: statsData } = useQuery({ queryKey: ["user-stats"], queryFn: api.userStats });
  const { data: allData, isLoading } = useQuery({ queryKey: ["achievements"], queryFn: api.achievements });

  const unlocked = new Map(statsData?.achievements.map((a) => [a.slug, a.unlockedAt]));
  const all = allData?.achievements ?? [];
  const unlockedCount = all.filter((a) => unlocked.has(a.slug)).length;
  const pct = all.length ? Math.round((unlockedCount / all.length) * 100) : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 py-3 glass-strong border-b border-border/40 safe-top">
        <button onClick={back} className="tap-scale text-muted-foreground hover:text-foreground">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="font-bengali text-base font-bold">অর্জনসমূহ</h1>
          <p className="text-[11px] text-muted-foreground">{unlockedCount} / {all.length} আনলক করা · {pct}%</p>
        </div>
        <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full gradient-gold transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto premium-scroll p-4">
        {/* Progress hero banner */}
        {!isLoading && unlockedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-2xl gradient-gold p-4 text-white relative overflow-hidden shadow-glow-gold"
          >
            <div className="absolute inset-0 opacity-20 pattern-islamic" />
            <div className="relative flex items-center gap-3">
              <div className="text-4xl animate-float">🏆</div>
              <div className="flex-1">
                <p className="font-bengali text-sm font-bold">দারুণ অগ্রগতি!</p>
                <p className="font-bengali text-[11px] text-white/80 mt-0.5">
                  {unlockedCount}টি অর্জন আনলক করেছেন · আর {all.length - unlockedCount}টি বাকি
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold tabular-nums">{pct}%</p>
                <p className="text-[9px] text-white/80">সম্পন্ন</p>
              </div>
            </div>
          </motion.div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
              ))
            : all.map((a, i) => {
                const isUnlocked = unlocked.has(a.slug);
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "relative flex flex-col items-center rounded-2xl p-4 border text-center overflow-hidden",
                      isUnlocked
                        ? "glass-strong border-border/50 shadow-soft"
                        : "bg-muted/40 border-border/30"
                    )}
                  >
                    {isUnlocked && (
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{ background: `radial-gradient(circle at center, ${a.color}, transparent 70%)` }}
                      />
                    )}
                    {/* NEW badge for recently unlocked (within 24h) */}
                    {isUnlocked && unlocked.has(a.slug) && (() => {
                      const unlockedAt = unlocked.get(a.slug);
                      if (!unlockedAt) return null;
                      const hoursAgo = (Date.now() - new Date(unlockedAt).getTime()) / (1000 * 60 * 60);
                      if (hoursAgo > 24) return null;
                      return (
                        <motion.div
                          initial={{ scale: 0, rotate: -15 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute -top-1.5 -right-1.5 z-20 flex items-center rounded-full gradient-gold px-1.5 py-0.5 text-[8px] font-extrabold text-white shadow-glow-gold animate-pulse-glow"
                        >
                          NEW
                        </motion.div>
                      );
                    })()}
                    <div
                      className={cn(
                        "relative flex h-16 w-16 items-center justify-center rounded-2xl text-3xl mb-2",
                        !isUnlocked && "grayscale opacity-40"
                      )}
                      style={{ backgroundColor: isUnlocked ? a.color + "30" : "transparent" }}
                    >
                      {isUnlocked ? a.icon : <Lock className="h-7 w-7 text-muted-foreground" />}
                    </div>
                    <p className={cn("font-bengali text-xs font-bold leading-tight", !isUnlocked && "text-muted-foreground")}>
                      {a.titleBn}
                    </p>
                    <p className={cn("font-bengali text-[10px] mt-1 leading-tight", isUnlocked ? "text-muted-foreground" : "text-muted-foreground/60")}>
                      {a.descriptionBn}
                    </p>
                    {isUnlocked && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                        ✓ আনলকড
                      </div>
                    )}
                  </motion.div>
                );
              })}
        </div>
      </div>
    </div>
  );
}
