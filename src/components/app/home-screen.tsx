"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useNav } from "@/lib/stores/nav-store";
import { useGame } from "@/lib/stores/game-store";
import { motion } from "framer-motion";
import {
  LockIcon,
  StarIcon,
  CrownIcon,
} from "@/components/icons/game-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CourseSummary, CourseLesson } from "@/lib/types";
import { useState } from "react";
import { Sparkles, Bot, ChevronRight, Volume2, Calendar, Search, X } from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";
import { useNotifications } from "@/hooks/use-notifications";
import { DailyChallenge } from "./daily-challenge";
import { WeeklyGoalTracker } from "./weekly-goal-tracker";
import { VerseOfTheDay } from "./verse-of-the-day";

export function HomeScreen() {
  const { data, isLoading } = useQuery({ queryKey: ["courses"], queryFn: api.courses.list });
  const { navigate } = useNav();
  const courses = data?.courses ?? [];
  const [activeIdx, setActiveIdx] = useState(0);
  const activeCourse = courses[activeIdx];

  return (
    <div className="flex h-full flex-col">
      {/* Course selector + search */}
      <div className="px-3 pt-3 pb-2 flex items-center gap-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 flex-1">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-32 shrink-0 rounded-2xl" />
              ))
            : courses.map((c, i) => (
                <CourseChip
                  key={c.id}
                  course={c}
                  active={i === activeIdx}
                  onClick={() => setActiveIdx(i)}
                />
              ))}
        </div>
        <button
          onClick={() => navigate({ name: "search" })}
          className="shrink-0 flex h-11 w-11 items-center justify-center rounded-2xl glass border border-border/50 shadow-soft tap-scale hover:border-primary/40"
          aria-label="লেসন খুঁজুন"
        >
          <Search className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Notification permission nudge (dismissible) */}
      <NotificationNudge />

      {/* Daily Challenge */}
      <DailyChallenge />

      {/* Verse of the Day */}
      <VerseOfTheDay />

      {/* Word of the Day */}
      <DailyWord />

      {/* Daily goal banner */}
      <DailyGoalBanner />

      {/* Weekly goal tracker */}
      <div className="px-4 pb-3">
        <WeeklyGoalTracker />
      </div>

      {/* Learning path */}
      <div className="flex-1 overflow-y-auto premium-scroll px-4 pb-8">
        {isLoading || !activeCourse ? (
          <PathSkeleton />
        ) : (
          <LearningPath course={activeCourse} />
        )}
      </div>
    </div>
  );
}

function CourseChip({
  course,
  active,
  onClick,
}: {
  course: CourseSummary;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex shrink-0 flex-col items-start gap-0.5 rounded-2xl px-3.5 py-2.5 border transition-all tap-scale",
        active
          ? "gradient-emerald text-primary-foreground border-transparent shadow-glow-emerald"
          : "bg-card/70 border-border/50 text-foreground hover:bg-accent/50"
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-lg">{course.icon}</span>
        <span className="font-bengali text-xs font-bold leading-tight">
          {course.titleBn}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={cn("h-1 w-16 rounded-full overflow-hidden", active ? "bg-white/30" : "bg-muted")}>
          <div
            className={cn("h-full rounded-full", active ? "bg-white" : "gradient-emerald")}
            style={{ width: `${course.progressPct}%` }}
          />
        </div>
        <span className={cn("text-[9px] font-bold tabular-nums", active ? "text-white/80" : "text-muted-foreground")}>
          {course.progressPct}%
        </span>
      </div>
    </button>
  );
}

/* ---------- Notification Permission Nudge ---------- */
function NotificationNudge() {
  const { supported, permission, enabled, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if not supported, already enabled, already granted, or dismissed
  if (!supported || enabled || permission === "granted" || permission === "denied" || dismissed) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="px-4 pb-2"
    >
      <div className="flex items-center gap-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-2.5">
        <span className="text-lg shrink-0">🔔</span>
        <div className="flex-1 min-w-0">
          <p className="font-bengali text-[11px] font-bold text-amber-600 dark:text-amber-400">রিমাইন্ডার চালু করুন</p>
          <p className="font-bengali text-[10px] text-muted-foreground truncate">প্রতিদিন মনে করিয়ে দেবে লেসন করতে</p>
        </div>
        <button
          onClick={async () => {
            const ok = await requestPermission();
            if (ok) setDismissed(true);
          }}
          className="shrink-0 rounded-full gradient-emerald text-primary-foreground px-2.5 py-1 text-[10px] font-bold tap-scale"
        >
          চালু করুন
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-muted-foreground hover:text-foreground tap-scale p-0.5"
          aria-label="dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

/* ---------- Word of the Day ---------- */
function DailyWord() {
  const { data, isLoading } = useQuery({
    queryKey: ["word-of-day"],
    queryFn: api.vocabulary.wordOfDay,
    staleTime: 60 * 60 * 1000, // 1 hour — word changes daily
  });
  const { speak } = useSpeech();
  const { navigate } = useNav();

  if (isLoading) {
    return (
      <div className="px-4 pb-3">
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;
  const { word, learned } = data;

  return (
    <div className="px-4 pb-3">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl glass border border-border/50 p-3.5 overflow-hidden"
      >
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full gradient-gold opacity-10 blur-2xl" />
        <div className="relative flex items-center gap-3">
          {/* Calendar badge */}
          <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl gradient-gold text-white shadow-soft">
            <Calendar className="h-3 w-3" />
            <span className="text-[8px] font-bold leading-none mt-0.5">আজ</span>
          </div>

          {/* Word content */}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">আজকের শব্দ</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-arabic text-2xl font-bold leading-tight">{word.arabic}</span>
              <button
                onClick={() => speak(word.arabic)}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary tap-scale"
              >
                <Volume2 className="h-3 w-3" />
              </button>
            </div>
            <p className="font-bengali text-xs text-muted-foreground mt-0.5 truncate">
              {word.bangla} · <span className="italic">{word.transliteration}</span>
            </p>
          </div>

          {/* Status / action */}
          {learned ? (
            <div className="shrink-0 flex flex-col items-center gap-0.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400">শিখেছেন</span>
            </div>
          ) : (
            <button
              onClick={() => navigate({ name: "dictionary" })}
              className="shrink-0 flex h-8 items-center gap-1 rounded-full gradient-emerald text-primary-foreground px-2.5 text-[10px] font-bold tap-scale"
            >
              শিখুন
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function DailyGoalBanner() {
  const { dailyXp, dailyGoalXp, streak, gems } = useGame();
  const { navigate } = useNav();
  const pct = Math.min(100, (dailyXp / dailyGoalXp) * 100);

  return (
    <div className="px-4 pb-3 space-y-2.5">
      <div className="flex items-center gap-3 rounded-2xl glass border border-border/50 p-3 shadow-soft">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
          <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="oklch(0.9 0.02 95)" strokeWidth="4" />
            <circle
              cx="24" cy="24" r="20" fill="none"
              stroke="url(#goal-grad)" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 125.6} 125.6`}
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="goal-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="oklch(0.7 0.14 162)" />
                <stop offset="100%" stopColor="oklch(0.55 0.12 185)" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute text-lg">🎯</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-bengali text-sm font-bold">আজকের লক্ষ্য</span>
            <span className="text-xs font-bold text-muted-foreground tabular-nums">
              {dailyXp} / {dailyGoalXp} XP
            </span>
          </div>
          <p className="font-bengali text-[11px] text-muted-foreground mt-0.5">
            {pct >= 100 ? "🎉 লক্ষ্য অর্জন! আগামীকালের জন্য প্রস্তুত!" : `আর ${Math.max(0, dailyGoalXp - dailyXp)} XP প্রয়োজন`}
          </p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{streak}</span>
          </div>
        )}
      </div>

      {/* Quick actions: Shop + Practice — consistent card style */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => navigate({ name: "shop" })}
          className="relative flex items-center gap-2.5 rounded-2xl gradient-gold text-white p-3 shadow-glow-gold tap-scale overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20 pattern-islamic" />
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/25 backdrop-blur">
            <span className="text-lg">🛍️</span>
          </div>
          <div className="relative text-left flex-1 min-w-0">
            <p className="font-bengali text-xs font-bold leading-tight">দোকান</p>
            <p className="text-[9px] text-white/90 truncate font-semibold">💎 {gems} রত্ন</p>
          </div>
        </button>
        <button
          onClick={() => navigate({ name: "vocabulary" })}
          className="relative flex items-center gap-2.5 rounded-2xl glass border border-border/50 p-3 shadow-soft tap-scale overflow-hidden"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-emerald text-white">
            <span className="text-lg">📖</span>
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="font-bengali text-xs font-bold leading-tight">অনুশীলন</p>
            <p className="text-[9px] text-muted-foreground truncate">শব্দ পর্যালোচনা</p>
          </div>
        </button>
      </div>
    </div>
  );
}

function LearningPath({ course }: { course: CourseSummary }) {
  return (
    <div className="relative">
      {/* AI tutor floating button */}
      <AiTutorFab />

      {course.units.map((unit, ui) => (
        <div key={unit.id} className="mb-2">
          {/* Unit header */}
          <div className={cn("relative mb-3 overflow-hidden rounded-2xl p-3.5 shadow-soft border border-border/50", unitGradient(course.color))}>
            <div className="absolute inset-0 opacity-20 pattern-islamic" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur text-2xl">
                {unit.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-bold text-white/70">
                  Unit {ui + 1}
                </p>
                <h3 className="font-bengali text-sm font-bold text-white leading-tight">
                  {unit.titleBn}
                </h3>
                <p className="font-bengali text-[11px] text-white/80 truncate">{unit.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-white/60" />
            </div>
          </div>

          {/* Lesson nodes — winding path */}
          <div className="relative flex flex-col items-center">
            {unit.lessons.map((lesson, li) => (
              <LessonNode
                key={lesson.id}
                lesson={lesson}
                index={li}
                _unitIndex={ui}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Course completion */}
      {course.completedLessons === course.totalLessons && course.totalLessons > 0 && (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="text-5xl mb-2 animate-float">🏆</div>
          <p className="font-bengali font-bold text-lg">কোর্স সম্পূর্ণ!</p>
          <p className="font-bengali text-sm text-muted-foreground">পরবর্তী বইয়ে এগিয়ে যান</p>
        </div>
      )}
    </div>
  );
}

function LessonNode({
  lesson,
  index,
  _unitIndex,
}: {
  lesson: CourseLesson;
  index: number;
  _unitIndex: number;
}) {
  const { navigate } = useNav();
  const progress = lesson.progress?.[0];
  const status = progress?.status ?? "locked";
  const stars = progress?.stars ?? 0;
  const isBoss = lesson.type === "boss";

  // Winding path offset — gentle S-curve (smaller extremes to prevent overflow)
  const offsets = [0, 42, 60, 42, 0, -42, -60, -42];
  const offset = offsets[index % offsets.length];

  // Previous offset for connector curve
  const prevOffset = index > 0 ? offsets[(index - 1) % offsets.length] : 0;

  return (
    <div className="relative flex flex-col items-center" style={{ transform: `translateX(${offset}px)` }}>
      {/* Curved connector — an SVG path from previous node center to current */}
      {index > 0 && (
        <svg
          className="absolute -top-5 left-1/2 -translate-x-1/2 overflow-visible pointer-events-none"
          width="2"
          height="20"
          style={{ transform: `translateX(${(prevOffset - offset) / 2}px)` }}
        >
          <path
            d={`M ${(prevOffset - offset) / 2} 0 Q 0 10 ${-(prevOffset - offset) / 2} 20`}
            stroke="oklch(0.7 0.05 95 / 0.4)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={status === "locked" ? "4 4" : undefined}
          />
        </svg>
      )}

      <motion.button
        initial={{ opacity: 0, scale: 0.6, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: index * 0.06, type: "spring", stiffness: 200, damping: 18 }}
        disabled={status === "locked"}
        onClick={() => status !== "locked" && navigate({ name: "lesson", lessonId: lesson.id })}
        className={cn(
          "group relative flex flex-col items-center tap-scale",
          status === "locked" && "cursor-not-allowed"
        )}
      >
        {/* Node bubble */}
        <div
          className={cn(
            "relative flex h-[68px] w-[68px] items-center justify-center rounded-full shadow-soft border-2 transition-all",
            status === "completed" && "gradient-emerald border-white/30 shadow-glow-emerald",
            status === "available" && "gradient-gold border-white/40 shadow-glow-gold animate-pulse-glow",
            status === "locked" && "bg-muted border-border/50 opacity-70"
          )}
        >
          {/* Inner ring for depth */}
          <div className="absolute inset-1.5 rounded-full border border-white/20" />

          {status === "locked" ? (
            <LockIcon className="h-6 w-6 text-muted-foreground" />
          ) : isBoss ? (
            <CrownIcon className="h-8 w-8" />
          ) : status === "completed" ? (
            <CheckIcon className="h-8 w-8 text-white" />
          ) : (
            <PlayIcon className="h-7 w-7 text-white drop-shadow" />
          )}

          {/* Stars for completed */}
          {status === "completed" && stars > 0 && (
            <div className="absolute -top-2 flex gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <StarIcon key={i} className="h-3.5 w-3.5" filled={i < stars} />
              ))}
            </div>
          )}

          {/* Boss badge */}
          {isBoss && status !== "locked" && (
            <div className="absolute -bottom-1.5 px-2 py-0.5 rounded-full gradient-gold text-[8px] font-extrabold text-white shadow-soft tracking-wider">
              BOSS
            </div>
          )}

          {/* "START" ribbon for available */}
          {status === "available" && !isBoss && (
            <div className="absolute -bottom-1.5 px-2 py-0.5 rounded-full bg-white text-emerald-700 text-[8px] font-extrabold shadow-soft tracking-wider">
              START
            </div>
          )}
        </div>

        {/* Lesson label */}
        <div className="mt-2.5 max-w-[88px] text-center">
          <p className="font-bengali text-[11px] font-bold leading-tight text-foreground truncate">
            {lesson.titleBn}
          </p>
          {status === "available" && (
            <p className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
              +{lesson.xpReward} XP · +{lesson.gemReward} 💎
            </p>
          )}
          {status === "completed" && (
            <p className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stars}★ · অনুশীলন করুন
            </p>
          )}
          {status === "locked" && (
            <p className="text-[9px] font-medium text-muted-foreground/60 mt-0.5">লক করা</p>
          )}
        </div>
      </motion.button>
    </div>
  );
}

/** Crisp SVG play icon (replaces ▶️ emoji). */
function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5z" />
    </svg>
  );
}

/** Crisp SVG check icon for completed lessons. */
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function AiTutorFab() {
  const { navigate } = useNav();
  return (
    <button
      onClick={() => navigate({ name: "ai-tutor" })}
      className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full gradient-aurora text-white shadow-glow-emerald tap-scale"
      aria-label="AI Tutor"
    >
      <Bot className="h-6 w-6" />
      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full gradient-gold text-[9px] font-bold">
        AI
      </span>
    </button>
  );
}

function unitGradient(color: string): string {
  switch (color) {
    case "emerald":
      return "gradient-emerald";
    case "gold":
      return "gradient-gold";
    case "teal":
      return "gradient-aurora";
    case "sunset":
      return "gradient-sunset";
    default:
      return "gradient-emerald";
  }
}

function PathSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 pt-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ transform: `translateX(${[0, 55, 80, 55, 0, -55][i % 6]}px)` }}>
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="mt-2 h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
