"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useNav } from "@/lib/stores/nav-store";
import { useSpeech } from "@/hooks/use-speech";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search, Volume2, BookOpen, ChevronLeft, ChevronRight, Check, Star, Plus, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

type WordCard = {
  id: string;
  arabic: string;
  transliteration: string;
  bangla: string;
  english: string;
  partOfSpeech: string | null;
  category: string | null;
  exampleArabic: string | null;
  exampleBangla: string | null;
  difficulty: number;
  learned: boolean;
  box: number;
};

export function DictionaryScreen() {
  const { back } = useNav();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selectedWord, setSelectedWord] = useState<WordCard | null>(null);
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

      {/* Category progress overview (only when no search/filter active) */}
      {!search && !category && <CategoryProgress />}

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
              onClick={() => setSelectedWord(word)}
              className="rounded-2xl glass border border-border/50 p-3 flex items-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-accent/30 transition-all tap-scale"
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

      {/* Word detail modal */}
      <AnimatePresence>
        {selectedWord && (
          <WordDetailModal
            word={selectedWord}
            onClose={() => setSelectedWord(null)}
            onAdded={() => {
              setSelectedWord(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Word Detail Modal ---------- */
function WordDetailModal({
  word,
  onClose,
  onAdded,
}: {
  word: WordCard;
  onClose: () => void;
  onAdded: () => void;
}) {
  const { speak } = useSpeech();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);

  const addMutation = useMutation({
    mutationFn: () => api.vocabulary.add(word.id),
    onSuccess: (data) => {
      if (data.alreadyAdded) {
        toast.info("এই শব্দটি ইতিমধ্যে আপনার তালিকায় আছে");
      } else {
        toast.success("📚 শব্দটি আপনার পর্যালোচনা তালিকায় যোগ হয়েছে!");
      }
      queryClient.invalidateQueries({ queryKey: ["vocab-browse"] });
      queryClient.invalidateQueries({ queryKey: ["vocab"] });
      onAdded();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const handleAdd = () => {
    setAdding(true);
    addMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-background border border-border/50 shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto premium-scroll"
      >
        {/* Header with gradient */}
        <div className="relative gradient-emerald p-6 text-white text-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 pattern-islamic" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur tap-scale"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-2">
              {word.category ? CATEGORY_LABELS[word.category] ?? word.category : "শব্দ"}
            </p>
            <button
              onClick={() => speak(word.arabic)}
              className="font-arabic text-5xl font-bold leading-tight tap-scale inline-flex items-center gap-2"
            >
              {word.arabic}
            </button>
            <p className="mt-2 text-sm italic text-white/80">{word.transliteration}</p>
            <button
              onClick={() => speak(word.arabic)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur px-3 py-1.5 text-xs font-bold tap-scale"
            >
              <Volume2 className="h-3.5 w-3.5" /> উচ্চারণ শুনুন
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Meanings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">বাংলা</p>
              <p className="font-bengali text-lg font-bold">{word.bangla}</p>
            </div>
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">English</p>
              <p className="text-lg font-bold">{word.english}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            {word.partOfSpeech && (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                {word.partOfSpeech}
              </span>
            )}
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> কঠিনতা {word.difficulty}/5
            </span>
            {word.learned && (
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="h-3 w-3" /> শিখেছেন
              </span>
            )}
          </div>

          {/* Examples */}
          {word.exampleArabic && (
            <div className="rounded-2xl glass border border-border/50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">উদাহরণ</p>
              <p className="font-arabic text-xl text-right mb-1">{word.exampleArabic}</p>
              {word.exampleBangla && (
                <p className="font-bengali text-xs text-muted-foreground">{word.exampleBangla}</p>
              )}
            </div>
          )}

          {/* Add to SRS button */}
          <Button
            onClick={handleAdd}
            disabled={adding || word.learned}
            className="w-full h-12 gradient-emerald text-primary-foreground font-bold rounded-2xl tap-scale"
          >
            {adding ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : word.learned ? (
              <><Check className="h-4 w-4 mr-1" /> ইতিমধ্যে তালিকায় আছে</>
            ) : (
              <><Plus className="h-4 w-4 mr-1" /> পর্যালোচনা তালিকায় যোগ করুন</>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- Category Progress Section ---------- */
function CategoryProgress() {
  const { data, isLoading } = useQuery({
    queryKey: ["vocab-categories"],
    queryFn: api.vocabulary.categories,
  });

  if (isLoading) {
    return (
      <div className="px-4 py-3 border-b border-border/40">
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  if (!data || data.categories.length === 0) return null;

  return (
    <div className="px-4 py-3 border-b border-border/40 glass">
      {/* Overall progress */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">📊</span>
          <h3 className="font-bengali text-xs font-bold">আপনার অগ্রগতি</h3>
        </div>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
          {data.totalLearned}/{data.totalWords} · {data.overallPct}%
        </span>
      </div>

      {/* Overall progress bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${data.overallPct}%` }}
          transition={{ duration: 0.6 }}
          className="h-full gradient-emerald rounded-full"
        />
      </div>

      {/* Category grid (top 6 by total) */}
      <div className="grid grid-cols-3 gap-1.5">
        {data.categories.slice(0, 9).map((c, i) => (
          <motion.button
            key={c.category}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl bg-card/50 border border-border/30 p-2 text-center tap-scale hover:border-primary/40"
          >
            <p className="text-[9px] font-bold text-muted-foreground truncate">
              {CATEGORY_LABELS[c.category] ?? c.category}
            </p>
            <p className="text-sm font-extrabold tabular-nums mt-0.5">
              {c.learned}<span className="text-muted-foreground text-[10px]">/{c.total}</span>
            </p>
            <div className="h-1 rounded-full bg-muted overflow-hidden mt-1">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  c.pct === 100 ? "gradient-gold" : c.pct > 0 ? "gradient-emerald" : "bg-muted-foreground/20"
                )}
                style={{ width: `${c.pct}%` }}
              />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
