"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const WELCOME_KEY = "as-welcome-back";
const STREAK_THRESHOLD = 3; // Only show if user had 3+ day streak

export function StreakRecoveryDialog({ streak, lastActiveDate }: { streak: number; lastActiveDate?: string | null }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!lastActiveDate || streak < STREAK_THRESHOLD) return;

    // Check if this is a return visit (last active was before today)
    const today = new Date().toISOString().slice(0, 10);

    // Only show if user was active before today
    if (lastActiveDate >= today) return;

    // Check if we already showed the welcome for this session
    const shown = sessionStorage.getItem(WELCOME_KEY);
    if (shown) return;

    // Show after a short delay
    const timer = setTimeout(() => {
      setShow(true);
      sessionStorage.setItem(WELCOME_KEY, "1");
    }, 1500);

    return () => clearTimeout(timer);
  }, [streak, lastActiveDate]);

  const handleClose = () => setShow(false);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Gradient header */}
            <div className="gradient-sunset p-6 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 pattern-islamic" />
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur tap-scale"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  className="text-5xl mb-2"
                >
                  🔥
                </motion.div>
                <h2 className="font-bengali text-xl font-extrabold">স্বাগতম!</h2>
                <p className="font-bengali text-xs text-white/80 mt-1">
                  আবার ফিরে এসেছেন — চমৎকার!
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="bg-background p-5 space-y-4">
              <div className="text-center">
                <p className="font-bengali text-sm text-muted-foreground leading-relaxed">
                  আপনার বর্তমান স্ট্রিক:
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Flame className="h-6 w-6 text-amber-500" />
                  <span className="text-3xl font-extrabold tabular-nums text-amber-600 dark:text-amber-400">
                    {streak}
                  </span>
                  <span className="font-bengali text-sm font-bold text-muted-foreground">দিন</span>
                </div>
              </div>

              {/* Streak freeze check */}
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                <p className="font-bengali text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  ✅ আপনার স্ট্রিক সুরক্ষিত আছে!
                </p>
                <p className="font-bengali text-[10px] text-muted-foreground mt-0.5">
                  আজ লেসন সম্পন্ন করে স্ট্রিক বাড়ান
                </p>
              </div>

              <Button
                onClick={handleClose}
                className="w-full h-11 gradient-emerald text-primary-foreground font-bold rounded-xl tap-scale"
              >
                চালিয়ে যান →
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
