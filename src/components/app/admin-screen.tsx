"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useNav } from "@/lib/stores/nav-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, BookOpen, Brain, Award, TrendingUp, Calendar, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AdminScreen() {
  const { back } = useNav();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: api.admin.stats,
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 py-3 glass-strong border-b border-border/40 safe-top">
        <button onClick={back} className="tap-scale text-muted-foreground hover:text-foreground">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="font-bengali text-base font-bold">অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="text-[11px] text-muted-foreground">রিয়েল-টাইম অ্যানালিটিক্স</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-emerald text-white text-xs font-bold">
          AD
        </div>
      </div>

      <div className="flex-1 overflow-y-auto premium-scroll p-4 space-y-4">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-2.5">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : (
            <>
              <Kpi icon={<Users className="h-4 w-4" />} label="মোট ব্যবহারকারী" value={data?.totals.users ?? 0} delta="+12%" color="emerald" />
              <Kpi icon={<BookOpen className="h-4 w-4" />} label="মোট লেসন" value={data?.totals.lessons ?? 0} color="teal" />
              <Kpi icon={<Brain className="h-4 w-4" />} label="শব্দভান্ডার" value={data?.totals.vocab ?? 0} color="gold" />
              <Kpi icon={<Activity className="h-4 w-4" />} label="আজ সক্রিয়" value={data?.totals.activeToday ?? 0} delta="+5%" color="amber" />
            </>
          )}
        </div>

        {/* Today's activity */}
        <div className="rounded-2xl glass border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="font-bengali text-sm font-bold">আজকের কার্যকলাপ</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-3">
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {data?.totals.lessonsToday ?? 0}
              </p>
              <p className="font-bengali text-xs text-muted-foreground">লেসন সম্পন্ন</p>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-3">
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                {data?.totals.completedLessons ?? 0}
              </p>
              <p className="font-bengali text-xs text-muted-foreground">মোট সম্পন্ন</p>
            </div>
          </div>
        </div>

        {/* League distribution */}
        <div className="rounded-2xl glass border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-4 w-4 text-amber-500" />
            <h2 className="font-bengali text-sm font-bold">লিগ বিতরণ</h2>
          </div>
          <div className="space-y-2">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 rounded-lg" />)
            ) : (
              data?.leagueDistribution.map((l) => {
                const total = data.totals.users || 1;
                const pct = (l._count / total) * 100;
                const leagueInfo = [
                  { id: "Bronze", icon: "🥉", color: "bg-amber-700/60" },
                  { id: "Silver", icon: "🥈", color: "bg-slate-400/60" },
                  { id: "Gold", icon: "🥇", color: "bg-amber-500/60" },
                  { id: "Platinum", icon: "💠", color: "bg-teal-400/60" },
                  { id: "Diamond", icon: "💎", color: "bg-cyan-400/60" },
                ].find((x) => x.id === l.league);
                return (
                  <div key={l.league} className="flex items-center gap-2">
                    <span className="text-lg w-6">{leagueInfo?.icon ?? "🏆"}</span>
                    <span className="font-bengali text-xs font-bold w-20">{l.league}</span>
                    <div className="flex-1 h-5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                        className={cn("h-full rounded-full flex items-center justify-end pr-2", leagueInfo?.color ?? "bg-primary/60")}
                      >
                        <span className="text-[10px] font-bold text-white">{l._count}</span>
                      </motion.div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent users */}
        <div className="rounded-2xl glass border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="font-bengali text-sm font-bold">নতুন ব্যবহারকারী</h2>
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto premium-scroll">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)
            ) : (
              data?.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 rounded-xl bg-card/50 p-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-emerald text-white font-bold text-sm">
                    {u.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bengali text-sm font-bold truncate">{u.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-primary tabular-nums">{u.totalXp} XP</p>
                    <p className="text-[10px] text-muted-foreground">{u.league}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Courses overview */}
        <div className="rounded-2xl glass border border-border/50 p-4">
          <h2 className="font-bengali text-sm font-bold mb-3">কোর্স ওভারভিউ</h2>
          <div className="grid grid-cols-2 gap-2">
            {data?.courseProgress.map((c) => (
              <div key={c.id} className="rounded-xl bg-card/50 p-3">
                <p className="text-2xl mb-1">{["🌱", "📖", "🏛️", "🕌"][c.slug === "book-1" ? 0 : c.slug === "book-2" ? 1 : c.slug === "book-3" ? 2 : 3]}</p>
                <p className="font-bengali text-xs font-bold leading-tight">{c.titleBn}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{c._count.units} ইউনিট</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, delta, color }: { icon: React.ReactNode; label: string; value: number; delta?: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    gold: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    amber: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  };
  return (
    <div className="rounded-2xl glass border border-border/50 p-3.5">
      <div className="flex items-center justify-between mb-2">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", colors[color])}>
          {icon}
        </div>
        {delta && (
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
            {delta}
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold tabular-nums leading-none">{value}</p>
      <p className="font-bengali text-[11px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
