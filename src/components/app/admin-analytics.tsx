"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart,
} from "recharts";
import { TrendingUp, TrendingDown, Activity, Award, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LEAGUES } from "@/lib/stores/game-store";

const LEAGUE_COLORS: Record<string, string> = {
  Bronze: "#b45309",
  Silver: "#94a3b8",
  Gold: "#f59e0b",
  Platinum: "#2dd4bf",
  Diamond: "#22d3ee",
  Pearl: "#a78bfa",
};

const RANGE_OPTIONS = [
  { days: 7, label: "৭ দিন" },
  { days: 14, label: "১৪ দিন" },
  { days: 30, label: "৩০ দিন" },
];

export function AdminAnalytics() {
  const [days, setDays] = useState(14);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics", days],
    queryFn: () => api.admin.analytics(days),
  });

  return (
    <div className="space-y-4">
      {/* Range selector */}
      <div className="flex gap-1 rounded-xl bg-muted/60 p-1">
        {RANGE_OPTIONS.map((r) => (
          <button
            key={r.days}
            onClick={() => setDays(r.days)}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all tap-scale",
              days === r.days ? "gradient-emerald text-primary-foreground shadow-soft" : "text-muted-foreground"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Summary stat row with deltas */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          <SummaryCard
            icon={<Zap className="h-4 w-4" />}
            label="সম্পন্ন লেসন"
            value={data?.summary.currCompletions ?? 0}
            delta={data?.summary.completionsDelta}
            color="emerald"
          />
          <SummaryCard
            icon={<Activity className="h-4 w-4" />}
            label="মোট ব্যবহারকারী"
            value={data?.summary.totalUsers ?? 0}
            color="teal"
          />
          <SummaryCard
            icon={<Target className="h-4 w-4" />}
            label="গড় স্কোর"
            value={`${data?.summary.avgScore ?? 0}%`}
            color="gold"
          />
          <SummaryCard
            icon={<Award className="h-4 w-4" />}
            label="নিখুঁত লেসন"
            value={data?.summary.perfectLessons ?? 0}
            color="amber"
          />
        </div>
      )}

      {/* XP / Completions trend chart */}
      <ChartCard title="লেসন সম্পন্ন — ট্রেন্ড" subtitle={`গত ${days} দিন`}>
        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data?.xpTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="completionsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.55 0.13 162)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="oklch(0.55 0.13 162)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 95)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "oklch(0.5 0.03 165)" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(0.5 0.03 165)" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.23 0.03 165)",
                  border: "1px solid oklch(0.3 0.03 165)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "white",
                }}
                labelStyle={{ color: "oklch(0.8 0.02 95)", fontWeight: 600 }}
                formatter={(v: number) => [`${v}টি`, "সম্পন্ন"]}
              />
              <Area
                type="monotone"
                dataKey="completions"
                stroke="oklch(0.55 0.13 162)"
                strokeWidth={2.5}
                fill="url(#completionsGrad)"
                dot={{ r: 3, fill: "oklch(0.55 0.13 162)", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "oklch(0.45 0.12 162)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Daily Active Users chart */}
      <ChartCard title="দৈনিক সক্রিয় ব্যবহারকারী" subtitle="DAU ট্রেন্ড">
        {isLoading ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={data?.dauTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 95)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "oklch(0.5 0.03 165)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: string) => v.slice(8)}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(0.5 0.03 165)" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.23 0.03 165)",
                  border: "1px solid oklch(0.3 0.03 165)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "white",
                }}
                formatter={(v: number) => [`${v} জন`, "সক্রিয়"]}
              />
              <Bar
                dataKey="activeUsers"
                fill="oklch(0.78 0.14 82)"
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Two-column: League donut + Avg score trend */}
      <div className="grid grid-cols-1 gap-4">
        <ChartCard title="লিগ বিতরণ" subtitle="ব্যবহারকারী অনুপাত">
          {isLoading ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : (
            <div className="flex items-center gap-3">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie
                    data={data?.leagueDistribution.map((l) => ({ name: l.league, value: l._count }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    paddingAngle={2}
                  >
                    {data?.leagueDistribution.map((l) => (
                      <Cell key={l.league} fill={LEAGUE_COLORS[l.league] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.23 0.03 165)",
                      border: "1px solid oklch(0.3 0.03 165)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "white",
                    }}
                    formatter={(v: number, n: string) => [`${v} জন`, LEAGUES.find((l) => l.id === n)?.name ?? n]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {data?.leagueDistribution.map((l) => {
                  const total = data.leagueDistribution.reduce((s, x) => s + x._count, 0) || 1;
                  const pct = Math.round((l._count / total) * 100);
                  const leagueInfo = LEAGUES.find((x) => x.id === l.league);
                  return (
                    <div key={l.league} className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: LEAGUE_COLORS[l.league] ?? "#94a3b8" }}
                      />
                      <span className="text-xs font-bold flex-1">{leagueInfo?.icon} {leagueInfo?.name ?? l.league}</span>
                      <span className="text-xs font-bold tabular-nums text-muted-foreground">{l._count}</span>
                      <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ChartCard>

        {/* Avg score trend */}
        <ChartCard title="গড় স্কোর ও তারকা" subtitle="দৈনিক গড়">
          {isLoading ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={data?.xpTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 95)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "oklch(0.5 0.03 165)" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "oklch(0.5 0.03 165)" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.23 0.03 165)",
                    border: "1px solid oklch(0.3 0.03 165)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "white",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  stroke="oklch(0.78 0.14 82)"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: "oklch(0.78 0.14 82)" }}
                  activeDot={{ r: 4 }}
                  name="গড় স্কোর"
                />
                <Line
                  type="monotone"
                  dataKey="avgStars"
                  stroke="oklch(0.6 0.12 190)"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  dot={false}
                  name="গড় তারকা"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Course completion bars */}
      <ChartCard title="কোর্স ভিত্তিক সম্পন্ন" subtitle="মোট সম্পন্ন লেসন">
        {isLoading ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : (
          <div className="space-y-3 pt-1">
            {data?.courseCompletion.map((c, i) => {
              const max = Math.max(...(data?.courseCompletion.map((x) => x.completions) ?? [1]), 1);
              const pct = (c.completions / max) * 100;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-lg w-6">{c.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bengali text-xs font-bold">{c.titleBn}</span>
                      <span className="text-[10px] font-bold tabular-nums text-muted-foreground">{c.completions}টি</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                        className="h-full rounded-full gradient-emerald"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </ChartCard>
    </div>
  );
}

function SummaryCard({
  icon, label, value, delta, color,
}: {
  icon: React.ReactNode; label: string; value: number | string;
  delta?: number; color: string;
}) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    gold: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    amber: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  };
  const hasDelta = typeof delta === "number" && isFinite(delta);
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="rounded-2xl glass border border-border/50 p-3.5">
      <div className="flex items-center justify-between mb-2">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", colors[color])}>
          {icon}
        </div>
        {hasDelta && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
              positive ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" : "text-destructive bg-destructive/10"
            )}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(delta!).toFixed(0)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold tabular-nums leading-none">{value}</p>
      <p className="font-bengali text-[11px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function ChartCard({
  title, subtitle, children,
}: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl glass border border-border/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bengali text-sm font-bold">{title}</h3>
          {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
