"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

const LEVEL_COLORS = [
  "bg-muted/60",          // 0 — no activity
  "bg-emerald-500/30",    // 1 — 1 lesson
  "bg-emerald-500/55",    // 2 — 2 lessons
  "bg-emerald-500/80",    // 3 — 3-4 lessons
  "bg-emerald-600",       // 4 — 5+ lessons
];

const WEEKDAY_LABELS = ["শনি", "রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র"];
const MONTH_LABELS = ["জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্ট", "অক্টো", "নভে", "ডিসে"];

export function StreakHeatmap() {
  const { data, isLoading } = useQuery({
    queryKey: ["user-activity"],
    queryFn: () => api.activity(12),
  });
  const [hovered, setHovered] = useState<{ date: string; count: number } | null>(null);

  if (isLoading) {
    return <Skeleton className="h-28 w-full rounded-2xl" />;
  }

  if (!data || data.weeks.length === 0) return null;

  // Compute month labels for the top
  const monthLabels: Array<{ label: string; col: number } | null> = [];
  let lastMonth = -1;
  data.weeks.forEach((week, col) => {
    if (week.length === 0) return;
    const month = new Date(week[0].date).getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ label: MONTH_LABELS[month], col });
      lastMonth = month;
    } else {
      monthLabels.push(null);
    }
  });

  return (
    <div className="rounded-2xl glass border border-border/50 p-3.5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">📅</span>
          <h3 className="font-bengali text-xs font-bold">কার্যকলাপ হিটম্যাপ</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>কম</span>
          {LEVEL_COLORS.map((c, i) => (
            <div key={i} className={cn("h-2.5 w-2.5 rounded-sm", c)} />
          ))}
          <span>বেশি</span>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {/* Weekday labels column */}
        <div className="flex flex-col gap-1 shrink-0 pt-0">
          {WEEKDAY_LABELS.map((day, i) => (
            <div key={i} className="h-3 flex items-center text-[8px] text-muted-foreground/70 font-medium">
              {i % 2 === 0 ? day : ""}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Month labels row */}
          <div className="flex gap-1 mb-1 h-3">
            {data.weeks.map((_, col) => {
              const ml = monthLabels[col];
              return (
                <div key={col} className="flex-1 min-w-[10px] text-[8px] text-muted-foreground/70 font-medium">
                  {ml ? ml.label : ""}
                </div>
              );
            })}
          </div>

          {/* Day cells */}
          <div className="flex gap-1">
            {data.weeks.map((week, col) => (
              <div key={col} className="flex flex-col gap-1 flex-1 min-w-[10px]">
                {week.map((day) => {
                  const isToday = day.date === new Date().toISOString().slice(0, 10);
                  const isFuture = new Date(day.date) > new Date();
                  return (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: col * 0.01 }}
                      onMouseEnter={() => setHovered({ date: day.date, count: day.count })}
                      onMouseLeave={() => setHovered(null)}
                      className={cn(
                        "h-3 rounded-sm transition-all cursor-pointer",
                        isFuture ? "bg-transparent" : LEVEL_COLORS[day.level],
                        isToday && "ring-1 ring-amber-400 ring-offset-0",
                        hovered?.date === day.date && "scale-150 z-10"
                      )}
                      title={`${day.date}: ${day.count}টি লেসন`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats footer */}
      <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">
          মোট <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.totalCompletions}</span>টি লেসন · <span className="font-bold text-amber-600 dark:text-amber-400">{data.activeDays}</span> দিন সক্রিয়
        </span>
        {hovered ? (
          <span className="font-bold text-foreground">
            {new Date(hovered.date).toLocaleDateString("bn-BD", { day: "numeric", month: "short" })}: {hovered.count}টি
          </span>
        ) : (
          <span className="text-muted-foreground">
            আজ: <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.todayCount}</span>টি
          </span>
        )}
      </div>
    </div>
  );
}
