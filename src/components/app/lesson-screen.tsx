"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useNav } from "@/lib/stores/nav-store";
import { useGame } from "@/lib/stores/game-store";
import { useAuth } from "@/lib/stores/auth-store";
import { useSpeech } from "@/hooks/use-speech";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Check, X, Volume2, Sparkles, Heart, Gem, Zap } from "lucide-react";
import { HeartIcon, GemIcon, XpIcon, StarIcon } from "@/components/icons/game-icons";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/lib/types";
import { toast } from "sonner";

type Phase = "intro" | "playing" | "correct" | "wrong" | "complete";

export function LessonScreen({ lessonId }: { lessonId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => api.lessons.get(lessonId),
  });
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const { back } = useNav();

  const exercises = data?.lesson.exercises ?? [];
  const current = exercises[index];
  const total = exercises.length;
  const progressPct = total ? (index / total) * 100 : 0;

  const onComplete = (isCorrect: boolean) => {
    setSelected(isCorrect);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setPhase("correct");
    } else {
      setMistakes((m) => m + 1);
      setPhase("wrong");
      // lose a heart
      useGame.getState().loseHeart();
    }
  };

  const next = () => {
    setSelected(null);
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      setPhase("playing");
    } else {
      setPhase("complete");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col p-4">
        <Skeleton className="h-2 w-full rounded-full mb-4" />
        <Skeleton className="h-8 w-1/2 mb-6" />
        <Skeleton className="h-48 w-full rounded-3xl mb-4" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 text-center text-muted-foreground">Lesson not found.</div>;
  }

  if (phase === "intro") {
    return (
      <LessonIntro
        titleBn={data.lesson.titleBn}
        description={data.lesson.description}
        icon={data.lesson.icon}
        type={data.lesson.type}
        xpReward={data.lesson.xpReward}
        gemReward={data.lesson.gemReward}
        exerciseCount={data.lesson.exercises.length}
        courseTitleBn={data.lesson.unit.course.titleBn}
        courseColor={data.lesson.unit.course.color}
        onStart={() => setPhase("playing")}
        onExit={back}
      />
    );
  }

  if (phase === "complete") {
    return (
      <LessonComplete
        lessonId={lessonId}
        correctCount={correctCount}
        mistakes={mistakes}
        total={total}
        xpReward={data.lesson.xpReward}
        gemReward={data.lesson.gemReward}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Progress header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2 safe-top">
        <button
          onClick={() => {
            if (confirm("লেসন থেকে বের হতে চান? আপনার অগ্রগতি হারিয়ে যাবে।")) back();
          }}
          className="text-muted-foreground hover:text-foreground tap-scale"
          aria-label="Exit lesson"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full gradient-emerald rounded-full"
            animate={{ width: `${progressPct + (phase !== "playing" ? (100 / total) : 0)}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex items-center gap-1 text-destructive font-bold">
          <HeartIcon className="h-5 w-5" filled />
          <span className="text-sm tabular-nums">{useGame.getState().hearts}</span>
        </div>
      </div>

      {/* Exercise area */}
      <div className="flex-1 overflow-y-auto premium-scroll px-4 py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <ExerciseView exercise={current} phase={phase} onAnswer={onComplete} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Feedback footer */}
      <FeedbackFooter
        phase={phase}
        isCorrect={selected ?? false}
        onNext={next}
      />
    </div>
  );
}

function ExerciseView({
  exercise,
  phase,
  onAnswer,
}: {
  exercise: Exercise;
  phase: Phase;
  onAnswer: (correct: boolean) => void;
}) {
  switch (exercise.type) {
    case "multiple-choice":
      return <MultipleChoice ex={exercise} phase={phase} onAnswer={onAnswer} />;
    case "match-pairs":
      return <MatchPairs ex={exercise} onAnswer={onAnswer} />;
    case "build-sentence":
      return <BuildSentence ex={exercise} phase={phase} onAnswer={onAnswer} />;
    case "fill-blank":
      return <FillBlank ex={exercise} phase={phase} onAnswer={onAnswer} />;
    case "listen-choose":
      return <ListenChoose ex={exercise} phase={phase} onAnswer={onAnswer} />;
    case "translate":
      return <Translate ex={exercise} phase={phase} onAnswer={onAnswer} />;
    default:
      return <div>Unknown exercise</div>;
  }
}

/* ---------- Multiple Choice ---------- */
function MultipleChoice({
  ex,
  phase,
  onAnswer,
}: {
  ex: Extract<Exercise, { type: "multiple-choice" }>;
  phase: Phase;
  onAnswer: (c: boolean) => void;
}) {
  const { speak } = useSpeech();
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1">
        অর্থ বেছে নিন
      </p>
      {ex.arabic && (
        <button
          onClick={() => speak(ex.arabic!)}
          className="flex items-center gap-2 rounded-2xl glass px-4 py-3 mb-4 tap-scale"
        >
          <Volume2 className="h-5 w-5 text-primary" />
          <span className="font-arabic text-3xl font-bold">{ex.arabic}</span>
        </button>
      )}
      <p className="font-bengali text-base font-bold mb-4">{ex.promptBn ?? ex.prompt}</p>
      <div className="grid gap-2.5">
        {ex.options.map((opt, i) => {
          const isAnswer = i === ex.answer;
          const isPicked = i === picked;
          return (
            <button
              key={i}
              disabled={phase !== "playing"}
              onClick={() => {
                setPicked(i);
                onAnswer(isAnswer);
              }}
              className={cn(
                "flex items-center justify-between rounded-2xl border-2 px-4 py-3.5 text-left font-medium transition-all tap-scale",
                phase === "playing" && "bg-card border-border/60 hover:border-primary/50 hover:bg-accent/40",
                phase !== "playing" && isAnswer && "border-emerald-500 bg-emerald-500/10",
                phase !== "playing" && isPicked && !isAnswer && "border-destructive bg-destructive/10",
                phase !== "playing" && !isAnswer && !isPicked && "opacity-50"
              )}
            >
              <span className="font-bengali">{opt}</span>
              {phase !== "playing" && isAnswer && <Check className="h-5 w-5 text-emerald-500" />}
              {phase !== "playing" && isPicked && !isAnswer && <X className="h-5 w-5 text-destructive" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Match Pairs ---------- */
function MatchPairs({
  ex,
  onAnswer,
}: {
  ex: Extract<Exercise, { type: "match-pairs" }>;
  onAnswer: (c: boolean) => void;
}) {
  const lefts = useMemo(() => shuffle(ex.pairs.map((p) => p.left)), [ex]);
  const rights = useMemo(() => shuffle(ex.pairs.map((p) => p.right)), [ex]);
  const [leftPick, setLeftPick] = useState<string | null>(null);
  const [rightPick, setRightPick] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<{ l: string; r: string } | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);

  const tryMatch = (l: string | null, r: string | null) => {
    if (!l || !r) return;
    const pair = ex.pairs.find((p) => p.left === l);
    if (pair && pair.right === r) {
      const next = new Set(matched);
      next.add(l);
      next.add(r);
      setMatched(next);
      setLeftPick(null);
      setRightPick(null);
      if (next.size === ex.pairs.length * 2) {
        onAnswer(mistakeCount === 0);
      }
    } else {
      setWrong({ l, r });
      setMistakeCount((m) => m + 1);
      setTimeout(() => {
        setWrong(null);
        setLeftPick(null);
        setRightPick(null);
      }, 600);
    }
  };

  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1">
        জোড় মেলান
      </p>
      <p className="font-bengali text-base font-bold mb-4">{ex.promptBn ?? ex.prompt}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2.5">
          {lefts.map((l) => (
            <button
              key={l}
              disabled={matched.has(l)}
              onClick={() => {
                setLeftPick(l);
                tryMatch(l, rightPick);
              }}
              className={cn(
                "w-full rounded-2xl border-2 py-4 text-center font-arabic text-2xl font-bold transition-all tap-scale",
                matched.has(l) && "opacity-30 bg-emerald-500/10 border-emerald-500/30",
                leftPick === l && "border-primary bg-primary/10 scale-105",
                wrong?.l === l && "border-destructive bg-destructive/10 animate-pulse",
                !matched.has(l) && leftPick !== l && !wrong?.l && "bg-card border-border/60 hover:border-primary/40"
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="space-y-2.5">
          {rights.map((r) => (
            <button
              key={r}
              disabled={matched.has(r)}
              onClick={() => {
                setRightPick(r);
                tryMatch(leftPick, r);
              }}
              className={cn(
                "w-full rounded-2xl border-2 py-4 text-center font-bengali font-bold transition-all tap-scale",
                matched.has(r) && "opacity-30 bg-emerald-500/10 border-emerald-500/30",
                rightPick === r && "border-primary bg-primary/10 scale-105",
                wrong?.r === r && "border-destructive bg-destructive/10 animate-pulse",
                !matched.has(r) && rightPick !== r && !wrong?.r && "bg-card border-border/60 hover:border-primary/40"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Build Sentence ---------- */
function BuildSentence({
  ex,
  phase,
  onAnswer,
}: {
  ex: Extract<Exercise, { type: "build-sentence" }>;
  phase: Phase;
  onAnswer: (c: boolean) => void;
}) {
  const [built, setBuilt] = useState<string[]>([]);
  const shuffled = useMemo(() => shuffle(ex.tokens), [ex]);
  const [used, setUsed] = useState<Set<number>>(new Set());

  const addToken = (token: string, i: number) => {
    setBuilt((b) => [...b, token]);
    setUsed((u) => new Set(u).add(i));
  };
  const removeToken = (i: number) => {
    setBuilt((b) => b.filter((_, idx) => idx !== i));
  };

  const submit = () => {
    const answer = built.join(" ");
    onAnswer(answer.trim() === ex.answer.trim());
  };

  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1">
        বাক্য তৈরি করুন
      </p>
      <p className="font-bengali text-base font-bold mb-4">{ex.promptBn ?? ex.prompt}</p>

      {/* Build area */}
      <div className="min-h-[80px] rounded-2xl border-2 border-dashed border-border/60 p-3 mb-4 flex flex-wrap gap-2 content-start">
        {built.length === 0 && (
          <span className="text-sm text-muted-foreground/60 self-center mx-auto">
            নিচের শব্দগুলো ট্যাপ করুন
          </span>
        )}
        {built.map((t, i) => (
          <button
            key={i}
            onClick={() => removeToken(i)}
            className="rounded-xl gradient-emerald text-primary-foreground px-3 py-2 font-arabic text-xl font-bold tap-scale"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Token bank */}
      <div className="flex flex-wrap gap-2">
        {shuffled.map((t, i) => (
          <button
            key={i}
            disabled={used.has(i) || phase !== "playing"}
            onClick={() => addToken(t, i)}
            className={cn(
              "rounded-xl border-2 px-3 py-2 font-arabic text-xl font-bold transition-all tap-scale",
              used.has(i) ? "opacity-30 bg-muted border-border/40" : "bg-card border-border/60 hover:border-primary/40"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {phase === "playing" && built.length > 0 && (
        <Button
          onClick={submit}
          className="mt-4 w-full h-12 gradient-emerald text-primary-foreground font-bold rounded-xl tap-scale"
        >
          যাচাই করুন
        </Button>
      )}
    </div>
  );
}

/* ---------- Fill in the Blank ---------- */
function FillBlank({
  ex,
  phase,
  onAnswer,
}: {
  ex: Extract<Exercise, { type: "fill-blank" }>;
  phase: Phase;
  onAnswer: (c: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const { speak } = useSpeech();
  const parts = ex.arabic.split("___");

  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1">
        শূন্যস্থান পূরণ করুন
      </p>
      <p className="font-bengali text-base font-bold mb-4">{ex.promptBn ?? ex.prompt}</p>

      <button
        onClick={() => speak(ex.arabic.replace("___", ex.answer))}
        className="w-full rounded-2xl glass px-4 py-5 mb-4 flex items-center justify-center gap-2"
      >
        <Volume2 className="h-5 w-5 text-primary" />
        <span className="font-arabic text-2xl font-bold">
          {parts[0]}
          <span className={cn(
            "mx-1 inline-block min-w-[60px] border-b-2 px-2 text-center",
            picked !== null && phase !== "playing" && (picked === ex.options.indexOf(ex.answer) ? "text-emerald-500 border-emerald-500" : "text-destructive border-destructive"),
            picked === null && "border-primary/40 text-primary/40"
          )}>
            {picked !== null ? ex.options[picked] : "؟"}
          </span>
          {parts[1]}
        </span>
      </button>

      <div className="grid grid-cols-2 gap-2.5">
        {ex.options.map((opt, i) => {
          const isAnswer = opt === ex.answer;
          const isPicked = i === picked;
          return (
            <button
              key={i}
              disabled={phase !== "playing"}
              onClick={() => {
                setPicked(i);
                onAnswer(isAnswer);
              }}
              className={cn(
                "rounded-2xl border-2 py-3.5 font-arabic text-xl font-bold transition-all tap-scale",
                phase === "playing" && "bg-card border-border/60 hover:border-primary/50",
                phase !== "playing" && isAnswer && "border-emerald-500 bg-emerald-500/10",
                phase !== "playing" && isPicked && !isAnswer && "border-destructive bg-destructive/10",
                phase !== "playing" && !isAnswer && !isPicked && "opacity-50"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Listen & Choose ---------- */
function ListenChoose({
  ex,
  phase,
  onAnswer,
}: {
  ex: Extract<Exercise, { type: "listen-choose" }>;
  phase: Phase;
  onAnswer: (c: boolean) => void;
}) {
  const { speak, speaking } = useSpeech();
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1">
        শুনে বেছে নিন
      </p>
      <p className="font-bengali text-base font-bold mb-4">{ex.promptBn ?? ex.prompt}</p>

      <button
        onClick={() => speak(ex.audio)}
        className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full gradient-emerald text-primary-foreground shadow-glow-emerald tap-scale"
      >
        <Volume2 className={cn("h-10 w-10", speaking && "animate-pulse")} />
      </button>

      <button
        onClick={() => setRevealed((r) => !r)}
        className="mx-auto mb-4 block text-xs text-muted-foreground underline"
      >
        {revealed ? "আড়াল করুন" : "আরবি দেখুন"}
      </button>
      {revealed && (
        <p className="font-arabic text-center text-2xl font-bold mb-4">{ex.arabicText}</p>
      )}

      <div className="grid gap-2.5">
        {ex.options.map((opt, i) => {
          const isAnswer = i === ex.answer;
          const isPicked = i === picked;
          return (
            <button
              key={i}
              disabled={phase !== "playing"}
              onClick={() => {
                setPicked(i);
                onAnswer(isAnswer);
              }}
              className={cn(
                "rounded-2xl border-2 px-4 py-3.5 font-medium text-left transition-all tap-scale",
                phase === "playing" && "bg-card border-border/60 hover:border-primary/50",
                phase !== "playing" && isAnswer && "border-emerald-500 bg-emerald-500/10",
                phase !== "playing" && isPicked && !isAnswer && "border-destructive bg-destructive/10",
                phase !== "playing" && !isAnswer && !isPicked && "opacity-50"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Translate ---------- */
function Translate({
  ex,
  phase,
  onAnswer,
}: {
  ex: Extract<Exercise, { type: "translate" }>;
  phase: Phase;
  onAnswer: (c: boolean) => void;
}) {
  const { speak } = useSpeech();
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1">
        অনুবাদ করুন
      </p>
      <p className="font-bengali text-base font-bold mb-4">{ex.promptBn ?? ex.prompt}</p>

      <button
        onClick={() => speak(ex.arabic)}
        className="w-full rounded-2xl glass px-4 py-4 mb-4 flex items-center justify-center gap-2"
      >
        <Volume2 className="h-5 w-5 text-primary" />
        <span className="font-arabic text-2xl font-bold">{ex.arabic}</span>
      </button>

      <div className="grid gap-2.5">
        {ex.options.map((opt, i) => {
          const isAnswer = i === ex.answer;
          const isPicked = i === picked;
          return (
            <button
              key={i}
              disabled={phase !== "playing"}
              onClick={() => {
                setPicked(i);
                onAnswer(isAnswer);
              }}
              className={cn(
                "rounded-2xl border-2 px-4 py-3.5 font-arabic text-xl font-bold text-center transition-all tap-scale",
                phase === "playing" && "bg-card border-border/60 hover:border-primary/50",
                phase !== "playing" && isAnswer && "border-emerald-500 bg-emerald-500/10",
                phase !== "playing" && isPicked && !isAnswer && "border-destructive bg-destructive/10",
                phase !== "playing" && !isAnswer && !isPicked && "opacity-50"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Feedback Footer ---------- */
function FeedbackFooter({
  phase,
  isCorrect,
  onNext,
}: {
  phase: Phase;
  isCorrect: boolean;
  onNext: () => void;
}) {
  if (phase === "playing") return null;

  return (
    <div
      className={cn(
        "px-4 py-4 border-t-2 safe-bottom transition-colors",
        isCorrect ? "bg-emerald-500/10 border-emerald-500/30" : "bg-destructive/10 border-destructive/30"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              isCorrect ? "bg-emerald-500 text-white" : "bg-destructive text-white"
            )}
          >
            {isCorrect ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
          </div>
          <div>
            <p className={cn("font-bengali font-bold text-sm", isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-destructive")}>
              {isCorrect ? "সঠিক! দারুণ হয়েছে!" : "ভুল হয়েছে"}
            </p>
            <p className="font-bengali text-[11px] text-muted-foreground">
              {isCorrect ? "এভাবেই এগিয়ে যান" : "চিন্তা নেই, আবার চেষ্টা করুন"}
            </p>
          </div>
        </div>
        <Button
          onClick={onNext}
          className={cn(
            "h-12 px-6 font-bold rounded-xl tap-scale",
            isCorrect ? "gradient-emerald text-primary-foreground" : "bg-destructive text-destructive-foreground"
          )}
        >
          চালিয়ে যান
        </Button>
      </div>
    </div>
  );
}

/* ---------- Lesson Intro ---------- */
function LessonIntro({
  titleBn,
  description,
  icon,
  type,
  xpReward,
  gemReward,
  exerciseCount,
  courseTitleBn,
  courseColor,
  onStart,
  onExit,
}: {
  titleBn: string;
  description: string;
  icon: string;
  type: string;
  xpReward: number;
  gemReward: number;
  exerciseCount: number;
  courseTitleBn: string;
  courseColor: string;
  onStart: () => void;
  onExit: () => void;
}) {
  const isBoss = type === "boss";
  const headerGradient =
    courseColor === "emerald" ? "gradient-emerald" :
    courseColor === "gold" ? "gradient-gold" :
    courseColor === "teal" ? "gradient-aurora" :
    courseColor === "sunset" ? "gradient-sunset" : "gradient-emerald";

  return (
    <div className="flex h-full flex-col">
      {/* Header with course branding */}
      <div className={cn("relative px-5 pt-5 pb-6 text-white safe-top overflow-hidden", headerGradient)}>
        <div className="absolute inset-0 opacity-20 pattern-islamic" />
        <div className="relative flex items-center justify-between mb-4">
          <button onClick={onExit} className="tap-scale text-white/80 hover:text-white">
            <X className="h-5 w-5" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 bg-white/15 px-2 py-0.5 rounded-full">
            {courseTitleBn}
          </span>
        </div>
        <div className="relative flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur text-5xl mb-3 border-2 border-white/30 shadow-soft"
          >
            {isBoss ? "👑" : icon}
          </motion.div>
          <h1 className="font-bengali text-xl font-extrabold">{titleBn}</h1>
          <p className="font-bengali text-xs text-white/80 mt-1 max-w-[260px]">{description}</p>
          {isBoss && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold">
              👑 বস লেসন — সব শেখা যাচাই করুন
            </div>
          )}
        </div>
      </div>

      {/* Body: what you'll do + rewards */}
      <div className="flex-1 overflow-y-auto premium-scroll px-5 py-5 space-y-4">
        <div>
          <h2 className="font-bengali text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            যা শিখবেন
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: "📚", label: `${exerciseCount}টি অনুশীলন` },
              { icon: "🎯", label: "বহুনির্বাচনী" },
              { icon: "🔗", label: "জোড় মেলানো" },
              { icon: "🔊", label: "শ্রুতি অনুশীলন" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="flex items-center gap-2 rounded-2xl glass border border-border/50 p-3"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-bengali text-xs font-semibold">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Rewards preview */}
        <div>
          <h2 className="font-bengali text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            পুরস্কার
          </h2>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3">
              <XpIcon className="h-6 w-6" />
              <div>
                <p className="font-extrabold text-lg tabular-nums leading-none">{xpReward}</p>
                <p className="text-[10px] text-muted-foreground">XP</p>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3">
              <GemIcon className="h-6 w-6" />
              <div>
                <p className="font-extrabold text-lg tabular-nums leading-none">{gemReward}</p>
                <p className="text-[10px] text-muted-foreground">রত্ন</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start button */}
      <div className="px-5 py-4 border-t border-border/40 glass-strong safe-bottom">
        <Button
          onClick={onStart}
          className="w-full h-13 py-3.5 gradient-emerald text-primary-foreground font-bold rounded-2xl shadow-glow-emerald tap-scale"
        >
          শুরু করুন · {exerciseCount}টি ধাপ
        </Button>
      </div>
    </div>
  );
}

/* ---------- Lesson Complete ---------- */
function LessonComplete({
  lessonId,
  correctCount,
  mistakes,
  total,
  xpReward,
  gemReward,
}: {
  lessonId: string;
  correctCount: number;
  mistakes: number;
  total: number;
  xpReward: number;
  gemReward: number;
}) {
  const { back } = useNav();
  const { recordLessonComplete } = useGame();
  const { setLocal, user } = useAuth();
  const [submitting, setSubmitting] = useState(true);
  const [rewards, setRewards] = useState<{ xp: number; gems: number; stars: number; nextLessonId: string | null } | null>(null);

  useEffect(() => {
    const score = Math.round((correctCount / total) * 100);
    const stars = mistakes === 0 ? 3 : mistakes <= 1 ? 2 : 1;
    let active = true;
    (async () => {
      try {
        const res = await api.lessons.complete({
          lessonId,
          score,
          stars,
          correctCount,
          totalCount: total,
        });
        if (!active) return;
        setRewards(res.rewards);
        // sync local game store
        recordLessonComplete(res.rewards.xp, res.rewards.gems);
        setLocal({
          gems: (user?.gems ?? 0) + res.rewards.gems,
          xp: (user?.xp ?? 0) + res.rewards.xp,
          totalXp: (user?.totalXp ?? 0) + res.rewards.xp,
        });
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        if (active) setSubmitting(false);
      }
    })();
    return () => { active = false; };
  }, [correctCount, total, mistakes, lessonId, recordLessonComplete, setLocal, user]);

  const accuracy = Math.round((correctCount / total) * 100);
  const stars = mistakes === 0 ? 3 : mistakes <= 1 ? 2 : 1;

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden gradient-hero px-6 text-center">
      {/* Confetti */}
      <Confetti />

      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="mb-4 text-7xl"
      >
        🎉
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-bengali text-2xl font-extrabold"
      >
        লেসন সম্পন্ন!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="font-bengali text-sm text-muted-foreground mt-1"
      >
        আল্লাহ আপনার ইলম বরকতময় করুন
      </motion.p>

      {/* Stars */}
      <div className="mt-5 flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4 + i * 0.15, type: "spring", stiffness: 200 }}
          >
            <StarIcon className="h-12 w-12" filled={i < stars} />
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-6 grid w-full max-w-xs grid-cols-3 gap-2"
      >
        <StatCard icon={<XpIcon className="h-5 w-5" />} label="XP" value={rewards?.xp ?? xpReward} color="emerald" />
        <StatCard icon={<GemIcon className="h-5 w-5" />} label="রত্ন" value={rewards?.gems ?? gemReward} color="gold" />
        <StatCard icon={<span className="text-lg">🎯</span>} label="নির্ভুলতা" value={`${accuracy}%`} color="teal" />
      </motion.div>

      <Button
        onClick={() => back()}
        disabled={submitting}
        className="mt-8 h-12 w-full max-w-xs gradient-emerald text-primary-foreground font-bold rounded-2xl shadow-glow-emerald tap-scale"
      >
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "চমৎকার! চালিয়ে যান"}
      </Button>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: "emerald" | "gold" | "teal";
}) {
  return (
    <div className={cn(
      "rounded-2xl p-3 border",
      color === "emerald" && "bg-emerald-500/10 border-emerald-500/30",
      color === "gold" && "bg-amber-500/10 border-amber-500/30",
      color === "teal" && "bg-teal-500/10 border-teal-500/30"
    )}>
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="font-bold text-lg tabular-nums">{value}</p>
      <p className="font-bengali text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 24 });
  const colors = ["oklch(0.7 0.14 162)", "oklch(0.82 0.14 85)", "oklch(0.65 0.18 40)", "oklch(0.6 0.12 190)", "oklch(0.7 0.18 300)"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => (
        <div
          key={i}
          className="animate-confetti absolute h-2 w-2 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-10px",
            backgroundColor: colors[i % colors.length],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1 + Math.random()}s`,
          }}
        />
      ))}
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
