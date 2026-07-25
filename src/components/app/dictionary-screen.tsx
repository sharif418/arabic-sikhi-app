"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useNav } from "@/lib/stores/nav-store";
import { useSpeech } from "@/hooks/use-speech";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Volume2, BookOpen, ChevronLeft, ChevronRight, Check, Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  greeting: "শুভেচ্ছা",
  family: "পরিবার",
  food: "খাবার",
  objects: "বস্তু",
  places: "স্থান",
  people: "মানুষ",
  time: "সময়",
  nature: "প্রকৃতি",
  deen: "দ্বীন",
  adjectives: "গুণবাচক",
  verbs: "ক্রিয়া",
  numbers: "সংখ্যা",
  colors: "রঙ",
  animals: "প্রাণী",
  body: "শরীর",
  phrases: "বাক্য",
};

export function DictionaryScreen() {
  const { back } = useNav();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [page, setPage] = useState(1);
  const { speak } = useSpeech();

  const { data, isLoading } = useQuery({
    queryKey: ["vocab-browse", search, category, page],
    queryFn: () => api.vocabulary.browse({ q: search || undefined, category: category || undefined, page, limit: 20 }),
  });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="relative px-4 pt-4 pb-3 gradient-aurora text-white safe-top">
        <div className="absolute inset-0 opacity-20 pattern-islamic" />
        <div className="relative flex items-center gap-3">
          <button onClick={back} className="tap-scale text-white/90 hover:text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="font-bengali text-lg font-extrabold">অভিধান</h1>
            <p className="text-[11px] text-white/80">{data?.total ?? 0}টি শব্দ · ১৬টি ক্যাটাগরি</p>
          </div>
          <BookOpen className="h-5 w-5 text-white/80" />
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="আরবি, বাংলা, ইংরেজি খুঁজুন..."
            className="w-full pl-9 pr-3 h-10 rounded-xl bg-white/15 backdrop-blur border border-white/20 text-white placeholder:text-white/60 font-bengali text-sm focus:outline-none focus:bg-white/25"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="px-4 py-2.5 border-b border-border/40 glass">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { setCategory(""); setPage(1); }}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all tap-scale",
              !category ? "gradient-emerald text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            সব
          </button>
          {data?.categories.sort().map((c) => (
            <button
              key={c}
              onClick={() => { setCategory(c); setPage(1); }}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all tap-scale",
                category === c ? "gradient-emerald text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {CATEGORY_LABELS[c] ?? c}
            </button>
          ))}
        </div>
      </div>

      {/* Word list */}
      <div className="flex-1 overflow-y-auto premium-scroll p-3 space-y-2">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)
        ) : data?.cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-5xl mb-2 opacity-50">🔍</div>
            <p className="font-bengali text-sm text-muted-foreground">কোনো শব্দ পাওয়া যায়নি</p>
            <p className="font-bengali text-xs text-muted-foreground/70 mt-1">অন্য কীওয়ার্ড চেষ্টা করুন</p>
          </div>
        ) : (
          data?.cards.map((word, i) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl glass border border-border/50 p-3 flex items-center gap-3"
            >
              {/* Difficulty stars */}
              <div className="flex flex-col items-center gap-0.5 shrink-0 w-8">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={cn("h-2 w-2", idx < word.difficulty ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
                  />
                ))}
              </div>

              {/* Arabic + audio */}
              <button
                onClick={() => speak(word.arabic)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors tap-scale relative"
              >
                <span className="font-arabic text-xl font-bold text-emerald-600 dark:text-emerald-400">{word.arabic[0]}</span>
                <Volume2 className="absolute -bottom-0.5 -right-0.5 h-3 w-3 text-emerald-600 dark:text-emerald-400 bg-background rounded-full p-0.5" />
              </button>

              {/* Meanings */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-arabic text-base font-bold truncate">{word.arabic}</span>
                  <span className="text-[10px] text-muted-foreground italic truncate">{word.transliteration}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-bengali text-xs font-semibold truncate">{word.bangla}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground truncate">{word.english}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {word.category && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                      {CATEGORY_LABELS[word.category] ?? word.category}
                    </span>
                  )}
                  {word.partOfSpeech && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                      {word.partOfSpeech}
                    </span>
                  )}
                </div>
              </div>

              {/* Learned badge */}
              {word.learned && (
                <div className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border/40 glass">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted disabled:opacity-40 tap-scale"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-bold text-muted-foreground tabular-nums">
            {page} / {data.totalPages} · {data.total}টি
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted disabled:opacity-40 tap-scale"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
