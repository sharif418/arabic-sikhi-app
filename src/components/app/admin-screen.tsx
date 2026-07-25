"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useNav } from "@/lib/stores/nav-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Brain, Award, Calendar, Activity, BarChart3, Library, UserCog, LineChart, RefreshCw, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AdminVocabulary } from "./admin-vocabulary";
import { AdminLessons } from "./admin-lessons";
import { AdminUsers } from "./admin-users";
import { AdminAnalytics } from "./admin-analytics";

type Tab = "overview" | "analytics" | "vocabulary" | "lessons" | "users";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "ওভারভিউ", icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { id: "analytics", label: "অ্যানালিটিক্স", icon: <LineChart className="h-3.5 w-3.5" /> },
  { id: "vocabulary", label: "শব্দভান্ডার", icon: <Library className="h-3.5 w-3.5" /> },
  { id: "lessons", label: "লেসন", icon: <BookOpen className="h-3.5 w-3.5" /> },
  { id: "users", label: "ব্যবহারকারী", icon: <UserCog className="h-3.5 w-3.5" /> },
];

export function AdminScreen() {
  const { back } = useNav();
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="relative px-4 pt-4 pb-3 gradient-emerald text-white safe-top">
        <div className="absolute inset-0 opacity-20 pattern-islamic" />
        <div className="relative flex items-center gap-3">
          <button onClick={back} className="tap-scale text-white/90 hover:text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="font-bengali text-base font-bold">অ্যাডমিন ড্যাশবোর্ড</h1>
            <p className="text-[11px] text-white/80">কন্টেন্ট ও ব্যবহারকারী ব্যবস্থাপনা</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur text-xs font-bold border border-white/30">
            AD
          </div>
        </div>

        {/* Tabs */}
        <div className="relative mt-3 flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all tap-scale",
                tab === t.id
                  ? "bg-white text-emerald-700 shadow-soft"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {tab === "overview" && <AdminOverview />}
            {tab === "analytics" && (
              <div className="h-full overflow-y-auto premium-scroll p-4">
                <AdminAnalytics />
              </div>
            )}
            {tab === "vocabulary" && <AdminVocabulary />}
            {tab === "lessons" && <AdminLessons />}
            {tab === "users" && <AdminUsers />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============ Overview Tab ============ */
function AdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: api.admin.stats,
  });

  return (
    <div className="h-full overflow-y-auto premium-scroll p-4 space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : (
          <>
            <Kpi icon={<Users className="h-4 w-4" />} label="মোট ব্যবহারকারী" value={data?.totals.users ?? 0} color="emerald" />
            <Kpi icon={<BookOpen className="h-4 w-4" />} label="মোট লেসন" value={data?.totals.lessons ?? 0} color="teal" />
            <Kpi icon={<Brain className="h-4 w-4" />} label="শব্দভান্ডার" value={data?.totals.vocab ?? 0} color="gold" />
            <Kpi icon={<Activity className="h-4 w-4" />} label="আজ সক্রিয়" value={data?.totals.activeToday ?? 0} color="amber" />
          </>
        )}
      </div>

      {/* Weekly league reset action */}
      <LeagueResetCard />

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
  );
}

/* ============ Weekly League Reset Card ============ */
function LeagueResetCard() {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<{ promotions: number; demotions: number } | null>(null);

  const resetMutation = useMutation({
    mutationFn: () => api.admin.leagueReset(),
    onSuccess: (data) => {
      setResult({ promotions: data.promotions, demotions: data.demotions });
      toast.success(`সাপ্তাহিক রিসেট সম্পন্ন! ${data.promotions} প্রমোশন, ${data.demotions} ডিমোশন`);
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <div className="rounded-2xl gradient-aurora p-4 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pattern-islamic" />
      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
          <RefreshCw className={cn("h-5 w-5", resetMutation.isPending && "animate-spin")} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bengali text-sm font-bold">সাপ্তাহিক লিগ রিসেট</p>
          <p className="font-bengali text-[11px] text-white/80 mt-0.5">
            শীর্ষ ৩ উন্নতি, নিচের ৩ অবনমন, সাপ্তাহিক XP রিসেট
          </p>
        </div>
        <Button
          onClick={() => {
            if (confirm("সাপ্তাহিক লিগ রিসেট করবেন? এটি সব ব্যবহারকারীর লিগ পরিবর্তন করবে।")) {
              resetMutation.mutate();
            }
          }}
          disabled={resetMutation.isPending}
          className="bg-white text-emerald-700 font-bold rounded-xl h-9 px-3 tap-scale shrink-0"
        >
          {resetMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "রিসেট"}
        </Button>
      </div>
      {result && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="relative mt-3 flex gap-3 pt-3 border-t border-white/20"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <TrendingUp className="h-3.5 w-3.5" /> {result.promotions} প্রমোশন
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <TrendingDown className="h-3.5 w-3.5" /> {result.demotions} ডিমোশন
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Kpi({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
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
      </div>
      <p className="text-2xl font-extrabold tabular-nums leading-none">{value}</p>
      <p className="font-bengali text-[11px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
