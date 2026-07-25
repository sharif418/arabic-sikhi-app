"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNav } from "@/lib/stores/nav-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    titleBn: "কুরআনি আরবি শিখুন",
    title: "Learn Quranic Arabic",
    descBn:
      "আস-সুন্নাহ ফাউন্ডেশনের উদ্যোগে একটি বিশ্বমানের ফ্রি অ্যাপ। খেলার মতো করে সহজে আরবি শিখুন।",
    art: "mosque",
    gradient: "from-emerald-500/20 via-teal-500/15 to-transparent",
  },
  {
    titleBn: "প্রতিদিন অভ্যাস গড়ুন",
    title: "Build a daily habit",
    descBn:
      "স্ট্রিক, এক্সপি আর লিগ দিয়ে উৎসাহ ধরে রাখুন। প্রতিদিন একটু একটু করে এগিয়ে যান।",
    art: "streak",
    gradient: "from-amber-500/20 via-orange-500/15 to-transparent",
  },
  {
    titleBn: "AI শিক্ষকের সাথে কথা বলুন",
    title: "Talk to your AI tutor",
    descBn:
      "যেকোনো প্রশ্ন করুন, সাথে সাথে উত্তর পান। ভয়েস সহ আরবি উচ্চারণ শুনে শুনে শিখুন।",
    art: "ai",
    gradient: "from-teal-500/20 via-emerald-500/15 to-transparent",
  },
];

export function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const { resetTo } = useNav();
  const isLast = step === SLIDES.length - 1;

  const next = () => {
    if (isLast) {
      resetTo({ name: "auth" });
    } else {
      setStep((s) => s + 1);
    }
  };

  const skip = () => resetTo({ name: "auth" });

  const slide = SLIDES[step];

  return (
    <div className="relative flex h-full flex-col overflow-hidden gradient-hero">
      {/* Skip button */}
      <button
        onClick={skip}
        className="absolute right-4 top-4 z-20 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors safe-top"
      >
        এড়িয়ে যান
      </button>

      {/* Illustration area */}
      <div className="flex flex-1 items-center justify-center p-6 relative">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-b opacity-70",
            slide.gradient
          )}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10"
          >
            <OnboardingArt variant={slide.art} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Text + CTA */}
      <div className="px-6 pb-8 pt-4 glass-strong rounded-t-[2rem] shadow-2xl relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
          >
            <h1 className="font-bengali text-2xl font-extrabold leading-tight text-foreground">
              {slide.titleBn}
            </h1>
            <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              {slide.title}
            </p>
            <p className="font-bengali mt-3 text-sm leading-relaxed text-muted-foreground">
              {slide.descBn}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === step
                  ? "w-7 gradient-emerald"
                  : "w-2 bg-muted-foreground/30"
              )}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <Button
          onClick={next}
          size="lg"
          className="mt-5 w-full gradient-emerald text-primary-foreground font-bold rounded-2xl h-13 py-3.5 shadow-glow-emerald tap-scale"
        >
          {isLast ? "শুরু করি" : "পরবর্তী"}
        </Button>
        {!isLast && (
          <button
            onClick={skip}
            className="mt-3 w-full text-center text-xs text-muted-foreground font-medium"
          >
            আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন
          </button>
        )}
      </div>
    </div>
  );
}

function OnboardingArt({ variant }: { variant: string }) {
  if (variant === "mosque") {
    return (
      <div className="relative h-64 w-64">
        <div className="absolute inset-0 rounded-full gradient-emerald opacity-30 blur-3xl animate-pulse-glow" />
        <div className="relative h-full w-full flex items-center justify-center">
          <img
            src="/art-mosque.png"
            alt="Mosque at sunset"
            className="h-full w-full object-contain animate-float drop-shadow-2xl"
          />
        </div>
      </div>
    );
  }
  if (variant === "streak") {
    return (
      <div className="relative h-64 w-64">
        <div className="absolute inset-0 rounded-full bg-amber-500/30 blur-3xl animate-pulse-glow" />
        <div className="relative h-full w-full flex items-center justify-center">
          <img
            src="/art-streak.png"
            alt="Streak flame"
            className="h-4/5 w-4/5 object-contain animate-float drop-shadow-2xl"
          />
        </div>
        <div className="absolute top-10 -right-2 text-4xl animate-float" style={{ animationDelay: "0.3s" }}>💎</div>
        <div className="absolute bottom-8 -left-2 text-4xl animate-float" style={{ animationDelay: "0.7s" }}>⭐</div>
      </div>
    );
  }
  return (
    <div className="relative h-64 w-64">
      <div className="absolute inset-0 rounded-full bg-teal-500/30 blur-3xl animate-pulse-glow" />
      <div className="relative h-full w-full flex items-center justify-center">
        <img
          src="/art-ai-tutor.png"
          alt="AI tutor"
          className="h-4/5 w-4/5 object-contain animate-float drop-shadow-2xl"
        />
      </div>
      <div className="absolute top-6 right-2 text-3xl animate-float" style={{ animationDelay: "0.4s" }}>💬</div>
      <div className="absolute bottom-4 -left-2 text-3xl animate-float" style={{ animationDelay: "0.9s" }}>🔊</div>
    </div>
  );
}
