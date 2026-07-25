"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useGame } from "@/lib/stores/game-store";
import { useSpeech } from "@/hooks/use-speech";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Volume2, RotateCcw, Check, X, Brain, Flame, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const QUALITY_OPTIONS = [
  { value: 1, label: "আবার", labelEn: "Again", icon: RotateCcw, color: "destructive" },
  { value: 3, label: "কঠিন", labelEn: "Hard", icon: Flame, color: "amber" },
  { value: 4, label: "ভালো", labelEn: "Good", icon: Check, color: "emerald" },
  { value: 5, label: "সহজ", labelEn: "Easy", icon: Sparkles, color: "teal" },
] as const;

export function VocabularyScreen() {
  const [started, setStarted] = useState(false);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["vocab", "due"],
    queryFn: () => api.vocabulary.due("due"),
    enabled: started,
  });
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [done, setDone] = useState(false);
  const { addXp } = useGame();
  const queryClient = useQueryClient();
  const { speak } = useSpeech();

  const cards = data?.cards ?? [];
  const card = cards[index];

  // Mark done when we've started and there are no cards to review
  const noCards = started && !!data && cards.length === 0;

  const review = async (quality: number) => {
    if (!card) return;
    try {
      const res = await api.vocabulary.review(card.id, quality);
      if (res.xpAwarded > 0) addXp(res.xpAwarded);
      // Show achievement unlock toasts
      if (res.achievementsUnlocked && res.achievementsUnlocked.length > 0) {
        for (const ach of res.achievementsUnlocked) {
          toast.success(`🏆 অর্জন আনলক! ${ach.titleBn}`, { duration: 5000, icon: ach.icon });
        }
      }
      setReviewed((r) => r + 1);
      setFlipped(false);
      if (index + 1 < cards.length) {
        setTimeout(() => setIndex((i) => i + 1), 200);
      } else {
        setDone(true);
        queryClient.invalidateQueries({ queryKey: ["vocab"] });
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (!started) {
    return <VocabHome onStart={() => setStarted(true)} />;
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-72 w-full rounded-3xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    );
  }

  if (done || noCards) {
    return (
      <VocabComplete reviewed={reviewed} onRestart={() => { setStarted(false); setIndex(0); setReviewed(0); setDone(false); refetch(); }} />
    );
  }

  return (
    <div className="flex h-full flex-col p-4">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full gradient-emerald rounded-full transition-all duration-300"
            style={{ width: `${((index) / cards.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-muted-foreground tabular-nums">
          {index + 1}/{cards.length}
        </span>
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={card?.id}
            initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            transition={{ duration: 0.35 }}
            className="flex-1"
          >
            <FlipCard card={card} flipped={flipped} onFlip={() => setFlipped((f) => !f)} speak={speak} />
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        {!flipped ? (
          <Button
            onClick={() => setFlipped(true)}
            className="mt-4 h-12 w-full gradient-emerald text-primary-foreground font-bold rounded-xl tap-scale"
          >
            উত্তর দেখুন
          </Button>
        ) : (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {QUALITY_OPTIONS.map((q) => (
              <button
                key={q.value}
                onClick={() => review(q.value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border-2 py-3 tap-scale transition-all",
                  q.color === "destructive" && "border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-destructive",
                  q.color === "amber" && "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400",
                  q.color === "emerald" && "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  q.color === "teal" && "border-teal-500/30 bg-teal-500/5 hover:bg-teal-500/10 text-teal-600 dark:text-teal-400"
                )}
              >
                <q.icon className="h-5 w-5" />
                <span className="font-bengali text-[11px] font-bold">{q.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FlipCard({ card, flipped, onFlip, speak }: { card: any; flipped: boolean; onFlip: () => void; speak: (t: string, l?: string) => void }) {
  if (!card) return null;
  return (
    <button
      onClick={onFlip}
      className="relative flex h-full min-h-[320px] w-full flex-col items-center justify-center rounded-3xl glass-strong border-2 border-border/50 p-6 shadow-soft tap-scale overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10 pattern-islamic" />
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {card.isNew && (
          <span className="rounded-full gradient-gold px-2 py-0.5 text-[9px] font-bold text-white">নতুন</span>
        )}
        <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold text-muted-foreground">
          {card.category ?? "শব্দ"}
        </span>
      </div>

      {!flipped ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative flex flex-col items-center"
        >
          <button
            onClick={(e) => { e.stopPropagation(); speak(card.arabic); }}
            className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <Volume2 className="h-4 w-4" />
          </button>
          <p className="font-arabic text-5xl font-bold leading-tight">{card.arabic}</p>
          <p className="mt-3 text-sm text-muted-foreground italic">{card.transliteration}</p>
          <p className="mt-6 text-xs text-muted-foreground/70">ট্যাপ করে অর্থ দেখুন</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, rotateX: -90 }}
          animate={{ opacity: 1, rotateX: 0 }}
          className="relative flex flex-col items-center text-center"
        >
          <p className="font-arabic text-3xl font-bold text-primary">{card.arabic}</p>
          <div className="my-4 h-px w-16 bg-border/60" />
          <p className="font-bengali text-2xl font-bold">{card.bangla}</p>
          <p className="mt-1 text-sm text-muted-foreground">{card.english}</p>
          {card.partOfSpeech && (
            <span className="mt-2 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {card.partOfSpeech}
            </span>
          )}
          {card.exampleArabic && (
            <div className="mt-4 rounded-xl bg-card/60 p-3 w-full">
              <p className="font-arabic text-lg">{card.exampleArabic}</p>
              {card.exampleBangla && <p className="font-bengali text-xs text-muted-foreground mt-1">{card.exampleBangla}</p>}
            </div>
          )}
        </motion.div>
      )}
    </button>
  );
}

function VocabHome({ onStart }: { onStart: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["vocab", "due-count"],
    queryFn: () => api.vocabulary.due("due"),
  });
  const count = data?.count ?? 0;
  const mode = data?.mode ?? "due";

  return (
    <div className="flex h-full flex-col px-5 py-6 overflow-y-auto premium-scroll">
      <h1 className="font-bengali text-2xl font-extrabold">শব্দভান্ডার</h1>
      <p className="font-bengali text-sm text-muted-foreground mt-1">
        মুস্তাহাফ (Spaced Repetition) পদ্ধতিতে মুখস্থ করুন
      </p>

      {/* Review card */}
      <div className="mt-6 rounded-3xl gradient-aurora p-5 text-white shadow-glow-emerald relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pattern-islamic" />
        <div className="relative">
          <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-wider">
            <Brain className="h-4 w-4" />
            <span>পর্যালোচনা</span>
          </div>
          <p className="font-bengali text-3xl font-extrabold mt-2">
            {isLoading ? "..." : count > 0 ? count : "নতুন শব্দ"}টি
          </p>
          <p className="font-bengali text-sm text-white/80 mt-0.5">
            {count > 0 ? "পর্যালোচনার জন্য প্রস্তুত" : "নতুন শব্দ শেখা শুরু করুন"}
          </p>
          <Button
            onClick={onStart}
            className="mt-4 w-full bg-white/95 text-emerald-700 font-bold rounded-xl h-12 hover:bg-white tap-scale"
          >
            {count > 0 ? "পর্যালোচনা শুরু করুন" : "নতুন শব্দ শিখুন"}
          </Button>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 space-y-3">
        <h2 className="font-bengali text-sm font-bold text-muted-foreground uppercase tracking-wider">
          কীভাবে কাজ করে
        </h2>
        {[
          { icon: "🔄", title: "ব্যবধান পুনরাবৃত্তি", desc: "ভুলে যাওয়ার আগেই শব্দ পর্যালোচনা হয়" },
          { icon: "⚡", title: "দ্রুত মুখস্থ", desc: "প্রতিটি সঠিক উত্তরে XP পান" },
          { icon: "📈", title: "অগ্রগতি", desc: "প্রতিদিন নতুন শব্দ শিখুন" },
        ].map((t, i) => (
          <div key={i} className="flex items-start gap-3 rounded-2xl glass border border-border/50 p-3.5">
            <span className="text-2xl">{t.icon}</span>
            <div>
              <p className="font-bengali text-sm font-bold">{t.title}</p>
              <p className="font-bengali text-xs text-muted-foreground mt-0.5">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VocabComplete({ reviewed, onRestart }: { reviewed: number; onRestart: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center gradient-hero">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-7xl mb-4"
      >
        🧠
      </motion.div>
      <h2 className="font-bengali text-2xl font-extrabold">দারুণ হয়েছে!</h2>
      <p className="font-bengali text-sm text-muted-foreground mt-1">
        আজ {reviewed}টি শব্দ পর্যালোচনা করেছেন
      </p>
      <Button
        onClick={onRestart}
        variant="outline"
        className="mt-6 h-12 px-8 font-bold rounded-xl tap-scale"
      >
        আবার শুরু করুন
      </Button>
    </div>
  );
}
