"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

export function CourseProgressOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: api.courses.list,
  });

  if (isLoading) {
    return <Skeleton className="h-32 rounded-2xl" />;
  }

  const courses = data?.courses ?? [];
  if (courses.length === 0) return null;

  const totalLessons = courses.reduce((s, c) => s + c.totalLessons, 0);
  const totalCompleted = courses.reduce((s, c) => s + c.completedLessons, 0);
  const overallPct = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  const courseGradients: Record<string, string> = {
    emerald: "from-emerald-500 to-teal-600",
    gold: "from-amber-500 to-orange-600",
    teal: "from-teal-500 to-cyan-600",
    sunset: "from-orange-500 to-red-500",
  };

  return (
    <div className="rounded-2xl glass border border-border/50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="font-bengali text-sm font-bold">কোর্স অগ্রগতি</h3>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
            {totalCompleted}<span className="text-muted-foreground text-sm">/{totalLessons}</span>
          </p>
          <p className="text-[10px] text-muted-foreground">লেসন সম্পন্ন</p>
        </div>
      </div>

      {/* Overall progress ring */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="oklch(0.9 0.02 95)" strokeWidth="6" />
            <motion.circle
              cx="40" cy="40" r="34" fill="none"
              stroke="url(#progress-grad)" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${(overallPct / 100) * 213.6} 213.6`}
              initial={{ strokeDasharray: "0 213.6" }}
              animate={{ strokeDasharray: `${(overallPct / 100) * 213.6} 213.6` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="progress-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="oklch(0.55 0.13 162)" />
                <stop offset="100%" stopColor="oklch(0.5 0.12 185)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute text-center">
            <p className="text-xl font-extrabold tabular-nums">{overallPct}%</p>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {courses.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-2"
            >
              <span className="text-sm shrink-0">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bengali text-[10px] font-bold truncate">{c.titleBn}</span>
                  <span className="text-[9px] font-bold tabular-nums text-muted-foreground shrink-0 ml-1">
                    {c.completedLessons}/{c.totalLessons}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.progressPct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                    className={cn("h-full rounded-full bg-gradient-to-r", courseGradients[c.color] ?? "from-emerald-500 to-teal-600")}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
