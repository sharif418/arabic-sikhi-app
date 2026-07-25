"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const MILESTONES = [3, 7, 14, 30, 60, 100, 365];

const MILESTONE_INFO: Record<number, { emoji: string; title: string; message: string }> = {
  3: { emoji: "🌱", title: "৩ দিনের স্ট্রিক!", message: "চমৎকার শুরু! এভাবেই এগিয়ে যান।" },
  7: { emoji: "🔥", title: "৭ দিনের স্ট্রিক!", message: "এক পূর্ণ সপ্তাহ! আপনি অসাধারণ।" },
  14: { emoji: "⚡", title: "১৪ দিনের স্ট্রিক!", message: "দুই সপ্তাহ ধরে ধারাবাহিক! দারুণ!" },
  30: { emoji: "💎", title: "৩০ দিনের স্ট্রিক!", message: "এক মাস! আপনি একজন প্রকৃত যোদ্ধা।" },
  60: { emoji: "🏆", title: "৬০ দিনের স্ট্রিক!", message: "অবিশ্বাস্য! আপনার নিষ্ঠা অনুপ্রেরণাদায়ক।" },
  100: { emoji: "👑", title: "১০০ দিনের স্ট্রিক!", message: "শতবর্ষ! আপনি একজন কিংবদন্তি!" },
  365: { emoji: "🌟", title: "৩৬৫ দিনের স্ট্রিক!", message: "এক পূর্ণ বছর! অভাবনীয় অর্জন!" },
};

/**
 * Watches the user's streak and shows a celebratory toast when a milestone is hit.
 * Uses a ref to track the last-seen streak so it only fires once per milestone.
 */
export function StreakMilestoneWatcher({ streak }: { streak: number }) {
  const lastStreakRef = useRef<number>(streak);
  const shownMilestonesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Only trigger if the streak increased
    if (streak > lastStreakRef.current) {
      // Check if we crossed a milestone
      for (const m of MILESTONES) {
        if (streak >= m && !shownMilestonesRef.current.has(m)) {
          shownMilestonesRef.current.add(m);
          const info = MILESTONE_INFO[m];
          if (info) {
            // Show a rich, long-duration toast with custom styling
            toast.custom(
              () => (
                <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500/40 p-4 shadow-glow-gold">
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="text-4xl"
                  >
                    {info.emoji}
                  </motion.div>
                  <div>
                    <p className="font-bengali font-extrabold text-sm text-amber-600 dark:text-amber-400">
                      {info.title}
                    </p>
                    <p className="font-bengali text-xs text-muted-foreground mt-0.5">
                      {info.message}
                    </p>
                  </div>
                </div>
              ),
              { duration: 6000 }
            );
          }
        }
      }
    }
    lastStreakRef.current = streak;
  }, [streak]);

  return null; // This component only renders toasts, no visible UI
}
