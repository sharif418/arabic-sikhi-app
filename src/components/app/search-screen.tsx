"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useNav } from "@/lib/stores/nav-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, BookOpen, Star, Lock, Check, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const COURSE_COLORS: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  gold: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  sunset: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

const SUGGESTED_SEARCHES = [
  "السَّلَامُ",
  "শান্তি",
  "লেসন 1",
  "কেমন",
  "Boss",
];

export function SearchScreen() {
  const { back, navigate } = useNav();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["lesson-search", debounced],
    queryFn: () => api.lessons.search(debounced),
    enabled: debounced.length >= 1,
  });

  const results = data?.results ?? [];

  return (
    <div className="flex h-full flex-col">
      {/* Header with search */}
      <div className="relative px-4 pt-4 pb-3 gradient-emerald text-white safe-top">
        <div className="absolute inset-0 opacity-20 pattern-islamic" />
        <div className="relative flex items-center gap-3">
          <button onClick={back} className="tap-scale text-white/90 hover:text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="font-bengali text-lg font-extrabold">লেসন খুঁজুন</h1>
            <p className="text-[11px] text-white/80">{results.length > 0 ? `${results.length}টি ফলাফল` : "সব কোর্সে অনুসন্ধান করুন"}</p>
          </div>
          <BookOpen className="h-5 w-5 text-white/80" />
        </div>

        {/* Search input */}
        <div className="relative mt-3">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors", isFetching ? "text-white/40 animate-pulse" : "text-white/60")} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="লেসনের নাম বা বিষয় লিখুন..."
            className="w-full pl-9 pr-9 h-11 rounded-xl bg-white/15 backdrop-blur border border-white/20 text-white placeholder:text-white/60 font-bengali text-sm focus:outline-none focus:bg-white/25 transition-colors"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white tap-scale"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results / suggestions */}
      <div className="flex-1 overflow-y-auto premium-scroll p-3">
        {/* No query — show suggestions */}
        {!debounced && (
          <div className="py-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl gradient-emerald text-white shadow-glow-emerald mb-3 animate-float">
                <Search className="h-7 w-7" />
              </div>
              <h2 className="font-bengali text-sm font-bold">কী শিখতে চান?</h2>
              <p className="font-bengali text-[11px] text-muted-foreground mt-1">নিচের বিষয়গুলো চেষ্টা করুন</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_SEARCHES.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="rounded-full glass border border-border/50 px-3.5 py-2 text-xs font-bold tap-scale hover:border-primary/40 hover:bg-accent/40 transition-all"
                >
                  <Sparkles className="h-3 w-3 inline mr-1 text-primary" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {debounced && isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Results */}
        {debounced && !isLoading && results.length > 0 && (
          <div className="space-y-2">
            <AnimatePresence>
              {results.map((lesson, i) => {
                const status = lesson.progress.status;
                const stars = lesson.progress.stars;
                const isBoss = lesson.type === "boss";
                return (
                  <motion.button
                    key={lesson.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => status !== "locked" && navigate({ name: "lesson", lessonId: lesson.id })}
                    disabled={status === "locked"}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-2xl glass border border-border/50 p-3 text-left transition-all tap-scale",
                      status === "locked" ? "opacity-60 cursor-not-allowed" : "hover:border-primary/40 hover:bg-accent/30"
                    )}
                  >
                    {/* Course icon */}
                    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", COURSE_COLORS[lesson.course.color] ?? "bg-primary/10")}>
                      <span className="text-lg">{isBoss ? "👑" : lesson.icon}</span>
                    </div>

                    {/* Lesson info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bengali text-sm font-bold truncate">{lesson.titleBn}</p>
                        {isBoss && (
                          <span className="shrink-0 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[8px] font-bold text-amber-600 dark:text-amber-400">BOSS</span>
                        )}
                      </div>
                      <p className="font-bengali text-[10px] text-muted-foreground truncate mt-0.5">
                        {lesson.course.icon} {lesson.course.titleBn} · {lesson.unit.titleBn}
                      </p>
                      {/* Status row */}
                      <div className="flex items-center gap-1.5 mt-1">
                        {status === "completed" ? (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                            <Check className="h-2.5 w-2.5" /> সম্পন্ন
                            <div className="flex gap-0.5 ml-0.5">
                              {Array.from({ length: 3 }).map((_, idx) => (
                                <Star key={idx} className={cn("h-2 w-2", idx < stars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                              ))}
                            </div>
                          </span>
                        ) : status === "available" ? (
                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">▶ শুরু করুন</span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold text-muted-foreground">
                            <Lock className="h-2.5 w-2.5" /> লক করা
                          </span>
                        )}
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400">+{lesson.xpReward} XP</span>
                        {/* Content match indicator */}
                        {lesson.contentMatches && lesson.contentMatches.length > 0 && (
                          <span className="flex items-center gap-0.5 text-[8px] font-bold text-primary bg-primary/10 rounded-full px-1 py-0.5">
                            📝 কন্টেন্ট ম্যাচ
                          </span>
                        )}
                      </div>
                      {/* Content match snippets */}
                      {lesson.contentMatches && lesson.contentMatches.length > 0 && (
                        <div className="mt-1.5 space-y-0.5">
                          {lesson.contentMatches.map((match, idx) => (
                            <div key={idx} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                              <span className="rounded bg-muted px-1 py-0.5 font-mono text-[8px]">{match.field}</span>
                              <span className="truncate font-bengali">{match.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chevron */}
                    {status !== "locked" && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* No results */}
        {debounced && !isLoading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-5xl mb-2 opacity-50">🔍</div>
            <p className="font-bengali text-sm text-muted-foreground">কোনো লেসন পাওয়া যায়নি</p>
            <p className="font-bengali text-xs text-muted-foreground/70 mt-1">"{debounced}" এর জন্য ফলাফল নেই</p>
            <button
              onClick={() => setQuery("")}
              className="mt-4 rounded-full gradient-emerald text-primary-foreground px-4 py-2 text-xs font-bold tap-scale"
            >
              আবার খুঁজুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
