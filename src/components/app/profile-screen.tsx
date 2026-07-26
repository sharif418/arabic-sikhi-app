"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/stores/auth-store";
import { useNav } from "@/lib/stores/nav-store";
import { Skeleton } from "@/components/ui/skeleton";

import { motion } from "framer-motion";
import {
  LogOut, Settings, Flame, Star, BookOpen,
  Award, ChevronRight, Bot, Shield, Moon, Sun, Crown, Zap, Gem, ShoppingBag, Users
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

import { LEAGUES } from "@/lib/stores/game-store";
import { StreakHeatmap } from "./streak-heatmap";

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { navigate, resetTo } = useNav();
  const { data, isLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: api.userStats,
  });
  const { theme, setTheme } = useTheme();

  const stats = data?.stats;
  const achievements = data?.achievements ?? [];

  const handleLogout = async () => {
    await logout();
    resetTo({ name: "onboarding" });
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto premium-scroll">
      {/* Profile header */}
      <div className="relative px-5 pt-6 pb-5 gradient-emerald text-white">
        <div className="absolute inset-0 opacity-20 pattern-islamic" />
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur text-3xl font-extrabold border-2 border-white/30">
              {user?.name?.[0] ?? "?"}
            </div>
            <div className="absolute -bottom-1 -right-1 rounded-full gradient-gold px-2 py-0.5 text-[10px] font-bold text-white shadow-soft flex items-center gap-0.5">
              <Crown className="h-3 w-3" /> Lv {user?.level ?? 1}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bengali text-xl font-extrabold truncate">{user?.name}</h1>
            <p className="text-xs text-white/80 truncate">{user?.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">
                {LEAGUES.find((l) => l.id === user?.league)?.icon} {LEAGUES.find((l) => l.id === user?.league)?.name ?? user?.league}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">
                <Flame className="h-3 w-3" /> {user?.streak ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats grid */}
      <div className="px-4 -mt-3">
        <div className="grid grid-cols-2 gap-2">
          <StatTile icon={<Zap className="h-4 w-4" />} label="মোট XP" value={user?.totalXp ?? 0} color="emerald" />
          <StatTile icon={<Gem className="h-4 w-4" />} label="রত্ন" value={user?.gems ?? 0} color="gold" />
          <StatTile icon={<BookOpen className="h-4 w-4" />} label="লেসন" value={stats?.lessonsCompleted ?? 0} color="teal" />
          <StatTile icon={<Star className="h-4 w-4" />} label="তারকা" value={stats?.totalStars ?? 0} color="amber" />
        </div>
      </div>

      {/* Streak / weekly activity card */}
      <div className="px-4 mt-3">
        <div className="rounded-2xl glass border border-border/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-500" />
              <span className="font-bengali text-sm font-bold">এই সপ্তাহের স্ট্রিক</span>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Flame className="h-3 w-3" /> {user?.streak ?? 0} দিন
            </span>
          </div>
          <WeeklyStreak streak={user?.streak ?? 0} lastActive={user?.lastActiveDate} />
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-border/40">
            <span className="font-bengali text-[11px] text-muted-foreground">গড় নির্ভুলতা</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {stats?.averageScore ?? 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Activity heatmap */}
      <div className="px-4 mt-3">
        <StreakHeatmap />
      </div>

      {/* Achievements */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bengali text-sm font-bold flex items-center gap-1.5">
            <Award className="h-4 w-4 text-amber-500" /> অর্জন
          </h2>
          <button
            onClick={() => navigate({ name: "achievements" })}
            className="text-xs font-semibold text-primary flex items-center"
          >
            সব দেখুন <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {achievements.slice(0, 4).map((a) => {
              const hoursAgo = (Date.now() - new Date(a.unlockedAt).getTime()) / (1000 * 60 * 60);
              const isNew = hoursAgo <= 24;
              return (
                <motion.div
                  key={a.id}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex flex-col items-center rounded-2xl glass border border-border/50 p-2"
                >
                  {isNew && (
                    <span className="absolute -top-1 -right-1 z-10 rounded-full gradient-gold px-1 py-0.5 text-[7px] font-extrabold text-white shadow-soft animate-pulse-glow">
                      NEW
                    </span>
                  )}
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-xl mb-1"
                    style={{ backgroundColor: a.color + "30" }}
                  >
                    {a.icon}
                  </div>
                  <p className="font-bengali text-[9px] font-bold text-center leading-tight line-clamp-2">
                    {a.titleBn}
                  </p>
                </motion.div>
              );
            })}
            {achievements.length === 0 && (
              <p className="font-bengali col-span-4 text-center text-xs text-muted-foreground py-4">
                অর্জন আনলক করতে লেসন সম্পন্ন করুন
              </p>
            )}
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="px-4 mt-4 space-y-1.5">
        <MenuItem icon={<ShoppingBag className="h-4 w-4" />} label="দোকান" onClick={() => navigate({ name: "shop" })} highlight />
        <MenuItem icon={<Users className="h-4 w-4" />} label="বন্ধুরা" onClick={() => navigate({ name: "friends" })} highlight />
        <MenuItem icon={<Bot className="h-4 w-4" />} label="AI শিক্ষক" onClick={() => navigate({ name: "ai-tutor" })} />
        <MenuItem
          icon={theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          label={theme === "dark" ? "লাইট মোড" : "ডার্ক মোড"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
        <MenuItem icon={<Settings className="h-4 w-4" />} label="সেটিংস" onClick={() => navigate({ name: "settings" })} />
        {user?.role === "admin" && (
          <MenuItem icon={<Shield className="h-4 w-4 text-primary" />} label="অ্যাডমিন ড্যাশবোর্ড" onClick={() => navigate({ name: "admin" })} highlight />
        )}
        <MenuItem icon={<LogOut className="h-4 w-4 text-destructive" />} label="লগআউট" onClick={handleLogout} danger />
      </div>

      <div className="px-4 py-5 text-center">
        <p className="font-bengali text-[10px] text-muted-foreground">
          আরবি শিখি v1.0 · আস-সুন্নাহ ফাউন্ডেশন
        </p>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    gold: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    amber: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  };
  return (
    <div className="rounded-2xl glass border border-border/50 p-3">
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg mb-1.5", colors[color])}>
        {icon}
      </div>
      <p className="font-extrabold text-xl tabular-nums leading-none">{value}</p>
      <p className="font-bengali text-[11px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 border transition-all tap-scale text-left",
        danger ? "bg-destructive/5 border-destructive/20 hover:bg-destructive/10" :
        highlight ? "bg-primary/5 border-primary/30 hover:bg-primary/10" :
        "bg-card/70 border-border/40 hover:bg-accent/50"
      )}
    >
      <span className={cn(danger ? "text-destructive" : highlight ? "text-primary" : "text-muted-foreground")}>
        {icon}
      </span>
      <span className={cn("flex-1 font-bengali text-sm font-semibold", danger ? "text-destructive" : "text-foreground")}>
        {label}
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

/**
 * Weekly streak visualization.
 * Shows the last 7 days; days within the current streak are lit up.
 * Today is highlighted with a ring.
 */
function WeeklyStreak({ streak, lastActive }: { streak: number; lastActive?: string | null }) {
  const days = ["শনি", "রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র"];
  // JS getDay(): 0=Sun, 1=Mon, ... 6=Sat. Our array starts Sat, so map:
  // Sat=6, Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5
  const dayMap = [1, 2, 3, 4, 5, 6, 0]; // index into `days` for getDay() 0..6
  const today = new Date();
  const todayIdx = days.indexOf(days[dayMap[today.getDay()]]);

  // Compute which of the last 7 days were "active" based on streak + lastActiveDate
  const activeSet = new Set<number>();
  if (streak > 0) {
    const lastDate = lastActive ? new Date(lastActive) : today;
    // Walk back `streak` days from lastDate, marking the corresponding weekday
    for (let i = 0; i < Math.min(streak, 7); i++) {
      const d = new Date(lastDate);
      d.setDate(d.getDate() - i);
      const idx = days.indexOf(days[dayMap[d.getDay()]]);
      activeSet.add(idx);
    }
  }

  return (
    <div className="flex gap-1.5">
      {days.map((day, i) => {
        const active = activeSet.has(i);
        const isToday = i === todayIdx;
        return (
          <div key={day} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "h-9 w-full rounded-xl flex items-center justify-center transition-all relative",
                active
                  ? "gradient-gold text-white shadow-soft"
                  : "bg-muted/60 text-muted-foreground",
                isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background"
              )}
            >
              {active ? <Flame className="h-4 w-4" /> : <span className="text-[10px]">·</span>}
              {isToday && (
                <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary" />
              )}
            </motion.div>
            <span className={cn(
              "text-[9px] font-medium",
              isToday ? "text-primary font-bold" : "text-muted-foreground"
            )}>
              {day}
            </span>
          </div>
        );
      })}
    </div>
  );
}
