"use client";

import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StreakIcon, XpIcon } from "@/components/icons/game-icons";
import { LEAGUES } from "@/lib/stores/game-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { SessionUser } from "@/lib/types";

interface ShareCardProps {
  user: SessionUser;
  stats: {
    lessonsCompleted: number;
    totalStars: number;
    perfectLessons: number;
    vocabLearned: number;
  };
  onClose: () => void;
}

export function ShareCard({ user, stats, onClose }: ShareCardProps) {
  const leagueInfo = LEAGUES.find((l) => l.id === user.league);

  const handleShare = async () => {
    const text = `আরবি শিখি 📚\n\n${user.name} — লেভেল ${user.level}\n🔥 ${user.streak} দিনের স্ট্রিক\n⚡ ${user.totalXp} XP\n🏆 ${leagueInfo?.name ?? user.league} লিগ\n📚 ${stats.lessonsCompleted}টি লেসন সম্পন্ন\n⭐ ${stats.totalStars}টি তারকা\n\nআরবি শিখুন: https://arabic.ailearnersbd.com`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "আরবি শিখি — আমার অগ্রগতি",
          text,
          url: "https://arabic.ailearnersbd.com",
        });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("অগ্রগতি কপি হয়েছে! বন্ধুদের সাথে শেয়ার করুন 📋");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm"
      >
        {/* Shareable Card */}
        <div className="rounded-3xl overflow-hidden shadow-2xl relative">
          {/* Gradient header */}
          <div className="gradient-emerald p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 pattern-islamic" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur text-2xl font-bold font-arabic">
                  ع
                </div>
                {leagueInfo && (
                  <div
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
                    style={{ backgroundColor: leagueInfo.color }}
                  >
                    {leagueInfo.icon} {leagueInfo.name}
                  </div>
                )}
              </div>
              <h2 className="font-bengali text-xl font-extrabold">{user.name}</h2>
              <p className="text-xs text-white/80">লেভেল {user.level} · {user.totalXp} XP</p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="bg-background p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <ShareStat icon={<StreakIcon className="h-5 w-5" />} label="স্ট্রিক" value={`${user.streak} দিন`} color="amber" />
              <ShareStat icon={<XpIcon className="h-5 w-5" />} label="মোট XP" value={user.totalXp} color="emerald" />
              <ShareStat icon={<span className="text-lg">📚</span>} label="লেসন" value={stats.lessonsCompleted} color="teal" />
              <ShareStat icon={<span className="text-lg">⭐</span>} label="তারকা" value={stats.totalStars} color="gold" />
            </div>

            {/* Perfect lessons badge */}
            {stats.perfectLessons > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5">
                <span className="text-lg">🏆</span>
                <p className="font-bengali text-xs font-bold text-amber-600 dark:text-amber-400">
                  {stats.perfectLessons}টি নিখুঁত লেসন!
                </p>
              </div>
            )}

            {/* Vocab learned */}
            {stats.vocabLearned > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-teal-500/10 border border-teal-500/20 p-2.5">
                <span className="text-lg">📖</span>
                <p className="font-bengali text-xs font-bold text-teal-600 dark:text-teal-400">
                  {stats.vocabLearned}টি নতুন শব্দ শিখেছেন
                </p>
              </div>
            )}

            {/* Branding footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <p className="font-bengali text-[10px] text-muted-foreground">আরবি শিখি · আস-সুন্নাহ ফাউন্ডেশন</p>
              <p className="text-[10px] text-muted-foreground">arabic.ailearnersbd.com</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl font-semibold tap-scale"
          >
            বন্ধ করুন
          </Button>
          <Button
            onClick={handleShare}
            className="flex-1 h-11 gradient-emerald text-primary-foreground font-bold rounded-xl tap-scale"
          >
            <Share2 className="h-4 w-4 mr-1.5" />
            শেয়ার করুন
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ShareStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    gold: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    amber: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  };
  return (
    <div className={cn("rounded-2xl p-3 border border-border/30", colors[color])}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</span>
      </div>
      <p className="font-extrabold text-lg tabular-nums">{value}</p>
    </div>
  );
}
