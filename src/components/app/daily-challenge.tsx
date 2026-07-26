"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useSpeech } from "@/hooks/use-speech";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Check, X, Trophy, Zap } from "lucide-react";
import { GemIcon, XpIcon } from "@/components/icons/game-icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function DailyChallenge() {
  const { data, isLoading } = useQuery({
    queryKey: ["daily-challenge"],
    queryFn: api.dailyChallenge.get,
    staleTime: 60 * 60 * 1000,
  });
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [rewards, setRewards] = useState<{ xp: number; gems: number } | null>(null);

  if (isLoading) {
    return <Skeleton className="h-20 rounded-2xl" />;
  }

  if (!data) return null;

  if (data.completed && !complete) {
    return (
      <div className="px-4 pb-3">
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
            <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="font-bengali text-sm font-bold text-emerald-600 dark:text-emerald-400">আজকের চ্যালেঞ্জ সম্পন্ন!</p>
            <p className="font-bengali text-[11px] text-muted-foreground">আগামীকাল নতুন চ্যালেঞ্জ আসবে</p>
          </div>
          <Trophy className="h-5 w-5 text-amber-500" />
        </div>
      </div>
    );
  }

  if (complete) {
    return (
      <div className="px-4 pb-3">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl gradient-gold p-4 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20 pattern-islamic" />
          <div className="relative flex items-center gap-3">
            <div className="text-4xl animate-float">🏆</div>
            <div className="flex-1">
              <p className="font-bengali text-sm font-bold">চ্যালেঞ্জ সম্পন্ন!</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-0.5 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold">
                  <XpIcon className="h-3 w-3" /> +{rewards?.xp ?? 20} XP
                </span>
                <span className="flex items-center gap-0.5 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold">
                  <GemIcon className="h-3 w-3" /> +{rewards?.gems ?? 5} 💎
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (playing) {
    return <ChallengePlayer data={data} onComplete={(r) => { setRewards(r); setComplete(true); setPlaying(false); }} onExit={() => setPlaying(false)} />;
  }

  return (
    <div className="px-4 pb-3">
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setPlaying(true)}
        className="w-full rounded-2xl gradient-sunset p-4 text-white relative overflow-hidden tap-scale shadow-soft"
      >
        <div className="absolute inset-0 opacity-20 pattern-islamic" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur text-2xl animate-pulse-glow">
            🎯
          </div>
          <div className="flex-1 text-left">
            <p className="font-bengali text-sm font-extrabold">আজকের ডেইলি চ্যালেঞ্জ</p>
            <p className="font-bengali text-[11px] text-white/80">৫টি দ্রুত প্রশ্ন · বোনাস পুরস্কার!</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="flex items-center gap-0.5 rounded-full bg-white/25 px-1.5 py-0.5 text-[9px] font-bold">
                <Zap className="h-2.5 w-2.5" /> +{data.rewards.xp} XP
              </span>
              <span className="flex items-center gap-0.5 rounded-full bg-white/25 px-1.5 py-0.5 text-[9px] font-bold">
                💎 +{data.rewards.gems}
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <div className="rounded-full bg-white/25 backdrop-blur px-3 py-1.5 text-xs font-bold">
              খেলুন →
            </div>
          </div>
        </div>
      </motion.button>
    </div>
  );
}

/* ---------- Challenge Player ---------- */
function ChallengePlayer({ data, onComplete, onExit }: {
  data: { questions: Array<{ arabic: string; transliteration: string; correctAnswer: string; options: string[]; wordId: string; category: string | null }> };
  onComplete: (rewards: { xp: number; gems: number }) => void;
  onExit: () => void;
}) {
  const { speak } = useSpeech();
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const total = data.questions.length;
  const current = data.questions[index];

  const completeMutation = useMutation({
    mutationFn: () => api.dailyChallenge.complete(correctCount, total),
    onSuccess: (res) => {
      toast.success(`চ্যালেঞ্জ সম্পন্ন! +${res.rewards.xp} XP, +${res.rewards.gems} 💎`);
      queryClient.invalidateQueries({ queryKey: ["daily-challenge"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      onComplete(res.rewards);
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const handlePick = (option: string) => {
    if (picked) return;
    setPicked(option);
    const isCorrect = option === current.correctAnswer;
    if (isCorrect) setCorrectCount((c) => c + 1);

    setTimeout(() => {
      if (index + 1 < total) {
        setIndex((i) => i + 1);
        setPicked(null);
      } else {
        setSubmitting(true);
        const finalCorrect = correctCount + (isCorrect ? 1 : 0);
        completeMutation.mutate();
        void finalCorrect;
      }
    }, 1000);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 gradient-sunset text-white safe-top">
        <button onClick={onExit} className="tap-scale text-white/80">
          <X className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bengali text-base font-bold">🎯 ডেইলি চ্যালেঞ্জ</h1>
          <p className="text-[11px] text-white/80">প্রশ্ন {index + 1} / {total}</p>
        </div>
        <div className="text-xs font-bold bg-white/20 rounded-full px-2 py-1">
          ✓ {correctCount}
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-2">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full gradient-sunset rounded-full transition-all duration-300"
            style={{ width: `${((index) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="w-full flex flex-col items-center"
          >
            {/* Arabic word */}
            <button
              onClick={() => speak(current.arabic)}
              className="font-arabic text-6xl font-bold mb-2 tap-scale"
            >
              {current.arabic}
            </button>
            <p className="text-sm text-muted-foreground italic mb-1">{current.transliteration}</p>
            <p className="font-bengali text-xs text-muted-foreground mb-8">এর অর্থ কী?</p>

            {/* Options */}
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {current.options.map((opt, i) => {
                const isCorrect = opt === current.correctAnswer;
                const isPicked = opt === picked;
                return (
                  <button
                    key={i}
                    disabled={!!picked}
                    onClick={() => handlePick(opt)}
                    className={cn(
                      "rounded-2xl border-2 px-4 py-3.5 font-bengali text-sm font-bold transition-all tap-scale",
                      !picked && "bg-card border-border/60 hover:border-primary/40",
                      picked && isCorrect && "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                      picked && isPicked && !isCorrect && "border-destructive bg-destructive/10 text-destructive",
                      picked && !isCorrect && !isPicked && "opacity-40"
                    )}
                  >
                    {opt}
                    {picked && isCorrect && <Check className="inline ml-2 h-4 w-4" />}
                    {picked && isPicked && !isCorrect && <X className="inline ml-2 h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {submitting && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
