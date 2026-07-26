"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { GemIcon, HeartIcon, StreakIcon, XpIcon } from "@/components/icons/game-icons";
import { useThemeStore, THEMES, applyThemeCss, type ThemeId } from "@/lib/stores/theme-store";
import { useGame } from "@/lib/stores/game-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ThemePreviewModalProps {
  themeId: ThemeId | null;
  onClose: () => void;
}

export function ThemePreviewModal({ themeId, onClose }: ThemePreviewModalProps) {
  const { active, owned, setTheme, ownTheme } = useThemeStore();
  const { gems, spendGems } = useGame();
  const [purchasing, setPurchasing] = useState(false);

  // Apply the preview theme's CSS while the modal is open
  useEffect(() => {
    if (themeId) {
      applyThemeCss(themeId);
    }
    return () => {
      // Restore the active theme on close
      applyThemeCss(active);
    };
  }, [themeId, active]);

  if (!themeId) return null;

  const theme = THEMES[themeId];
  const isOwned = owned.includes(themeId);
  const isActive = active === themeId;
  const canAfford = gems >= theme.cost;

  const handleAction = async () => {
    setPurchasing(true);
    try {
      if (isOwned) {
        setTheme(themeId);
        toast.success(`${theme.icon} ${theme.nameBn} থিম প্রয়োগ হয়েছে!`);
        onClose();
      } else {
        const ok = spendGems(theme.cost);
        if (ok) {
          ownTheme(themeId);
          setTheme(themeId);
          toast.success(`${theme.icon} ${theme.nameBn} থিম আনলক ও প্রয়োগ হয়েছে!`);
          onClose();
        } else {
          toast.error("পর্যাপ্ত রত্ন নেই");
        }
      }
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <AnimatePresence>
      {themeId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-background border border-border/50 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto premium-scroll"
          >
            {/* Header */}
            <div className={cn("relative p-5 text-white overflow-hidden", theme.gradient)}>
              <div className="absolute inset-0 opacity-20 pattern-islamic" />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur tap-scale z-10"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 backdrop-blur text-4xl mb-2 border-2 border-white/30">
                  {theme.icon}
                </div>
                <h2 className="font-bengali text-xl font-extrabold">{theme.nameBn}</h2>
                <p className="text-xs text-white/80 mt-0.5">{theme.name}</p>
                {isActive && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-bold">
                    <Check className="h-3 w-3" /> বর্তমানে সক্রিয়
                  </span>
                )}
              </div>
            </div>

            {/* Live preview — sample UI elements */}
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  লাইভ প্রিভিউ
                </p>

                {/* Top bar mockup */}
                <div className="rounded-2xl glass border border-border/50 p-2.5 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-emerald text-white font-bold text-sm">
                    ع
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-1 rounded-full bg-card/70 px-2 py-0.5 border border-border/50">
                    <StreakIcon className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold tabular-nums">7</span>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-card/70 px-2 py-0.5 border border-border/50">
                    <GemIcon className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold tabular-nums">120</span>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-card/70 px-2 py-0.5 border border-border/50">
                    <HeartIcon className="h-3.5 w-3.5" filled />
                    <span className="text-[10px] font-bold tabular-nums">5</span>
                  </div>
                </div>

                {/* Lesson node mockup */}
                <div className="mt-3 flex justify-center">
                  <div className="flex flex-col items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-emerald border-2 border-white/30 shadow-glow-emerald">
                      <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="currentColor">
                        <path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5z" />
                      </svg>
                    </div>
                    <div className="mt-1.5 absolute -bottom-1 px-2 py-0.5 rounded-full bg-white text-primary text-[8px] font-extrabold shadow-soft">
                      START
                    </div>
                  </div>
                </div>

                {/* Progress bar mockup */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-muted-foreground">আজকের লক্ষ্য</span>
                    <span className="text-[10px] font-bold tabular-nums text-muted-foreground">15 / 30 XP</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full gradient-emerald" style={{ width: "50%" }} />
                  </div>
                </div>

                {/* Button mockup */}
                <div className="mt-3">
                  <div className="h-10 rounded-xl gradient-emerald text-primary-foreground font-bold text-sm flex items-center justify-center">
                    শুরু করুন · ৫টি ধাপ
                  </div>
                </div>

                {/* XP icon mockup */}
                <div className="mt-3 flex items-center justify-center gap-2">
                  <XpIcon className="h-5 w-5" />
                  <span className="text-xs font-bold text-gradient-emerald">+10 XP</span>
                  <GemIcon className="h-5 w-5" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">+2 💎</span>
                </div>
              </div>

              {/* Purchase info */}
              {!isOwned && theme.cost > 0 && (
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 flex items-center gap-3">
                  <GemIcon className="h-6 w-6 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bengali text-xs font-bold">মূল্য: {theme.cost} রত্ন</p>
                    <p className="font-bengali text-[10px] text-muted-foreground">
                      আপনার রত্ন: {gems} {canAfford ? "✓" : "(অপর্যাপ্ত)"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action footer */}
            <div className="px-5 py-4 border-t border-border/40 glass-strong safe-bottom">
              <Button
                onClick={handleAction}
                disabled={purchasing || isActive || (!isOwned && !canAfford)}
                className={cn(
                  "w-full h-12 font-bold rounded-2xl tap-scale",
                  isActive
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : isOwned
                    ? "bg-primary/10 text-primary"
                    : "gradient-gold text-white shadow-soft"
                )}
              >
                {purchasing ? (
                  "প্রক্রিয়াধীন..."
                ) : isActive ? (
                  <><Check className="h-4 w-4 mr-1" /> বর্তমানে সক্রিয়</>
                ) : isOwned ? (
                  <><Check className="h-4 w-4 mr-1" /> প্রয়োগ করুন</>
                ) : (
                  <><GemIcon className="h-4 w-4 mr-1" /> {theme.cost} রত্নে আনলক করুন</>
                )}
              </Button>
              <p className="font-bengali text-[10px] text-center text-muted-foreground mt-2">
                প্রিভিউ বন্ধ করলে আগের থিমে ফিরে যাবে
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
