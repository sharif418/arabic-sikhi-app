"use client";

import { useNav } from "@/lib/stores/nav-store";
import { useGame } from "@/lib/stores/game-store";
import { useAuth } from "@/lib/stores/auth-store";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Heart, Flame, Zap, Snowflake, Palette, Check, Lock, Sparkles, Crown
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { GemIcon, HeartIcon } from "@/components/icons/game-icons";

type ShopItem = {
  id: string;
  name: string;
  nameBn: string;
  desc: string;
  descBn: string;
  cost: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  category: "powerups" | "themes";
  action: () => boolean | Promise<boolean>;
  owned?: boolean;
  maxedOut?: boolean;
};

export function ShopScreen() {
  const { back } = useNav();
  const { gems, hearts, maxHearts, spendGems, refillHearts, streak } = useGame();
  const { setLocal, user } = useAuth();
  const [category, setCategory] = useState<"powerups" | "themes">("powerups");
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const buyHeartRefill = async () => {
    if (hearts >= maxHearts) {
      toast.info("হার্ট ইতিমধ্যে পূর্ণ!");
      return false;
    }
    const ok = refillHearts(30);
    if (ok) {
      toast.success("❤️ হার্ট পূরণ হয়েছে!");
      return true;
    }
    toast.error("পর্যাপ্ত রত্ন নেই");
    return false;
  };

  const buyStreakFreeze = async () => {
    const ok = spendGems(50);
    if (ok) {
      toast.success("🧊 স্ট্রিক ফ্রিজ সক্রিয়! আগামীকাল একদিন নিরাপদ।");
      return true;
    }
    toast.error("পর্যাপ্ত রত্ন নেই");
    return false;
  };

  const buyXpBoost = async () => {
    const ok = spendGems(40);
    if (ok) {
      // grant a flat XP boost
      setLocal({ totalXp: (user?.totalXp ?? 0) + 25, xp: (user?.xp ?? 0) + 25 });
      toast.success("⚡ ২৫ XP বোনাস যোগ হয়েছে!");
      return true;
    }
    toast.error("পর্যাপ্ত রত্ন নেই");
    return false;
  };

  const buyHeartMax = async () => {
    if (maxHearts >= 7) {
      toast.info("সর্বোচ্চ হার্ট সীমায় পৌঁছেছেন!");
      return false;
    }
    const ok = spendGems(120);
    if (ok) {
      toast.success("💖 সর্বোচ্চ হার্ট +১ বৃদ্ধি পেয়েছে!");
      return true;
    }
    toast.error("পর্যাপ্ত রত্ন নেই");
    return false;
  };

  const powerups: ShopItem[] = [
    {
      id: "heart-refill",
      name: "Heart Refill",
      nameBn: "হার্ট পূরণ",
      desc: "Restore all hearts instantly",
      descBn: "সব হার্ট তৎক্ষণাৎ ফিরিয়ে আনুন",
      cost: 30,
      icon: <HeartIcon className="h-7 w-7" filled />,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      category: "powerups",
      action: buyHeartRefill,
      maxedOut: hearts >= maxHearts,
    },
    {
      id: "streak-freeze",
      name: "Streak Freeze",
      nameBn: "স্ট্রিক ফ্রিজ",
      desc: "Protect your streak for one missed day",
      descBn: "একদিন মিস করলেও স্ট্রিক বাঁচান",
      cost: 50,
      icon: <Snowflake className="h-7 w-7 text-cyan-500" />,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      category: "powerups",
      action: buyStreakFreeze,
    },
    {
      id: "xp-boost",
      name: "XP Boost",
      nameBn: "এক্সপি বুস্ট",
      desc: "Get 25 bonus XP instantly",
      descBn: "তৎক্ষণাৎ ২৫ বোনাস XP পান",
      cost: 40,
      icon: <Zap className="h-7 w-7 text-amber-500" />,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      category: "powerups",
      action: buyXpBoost,
    },
    {
      id: "heart-max",
      name: "Max Heart +1",
      nameBn: "সর্বোচ্চ হার্ট +১",
      desc: "Permanently increase max hearts",
      descBn: "স্থায়ীভাবে সর্বোচ্চ হার্ট বাড়ান",
      cost: 120,
      icon: <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      category: "powerups",
      action: buyHeartMax,
      maxedOut: maxHearts >= 7,
    },
  ];

  const themes: ShopItem[] = [
    {
      id: "theme-emerald",
      name: "Emerald Night",
      nameBn: "এমেরাল্ড নাইট",
      desc: "Default premium theme",
      descBn: "ডিফল্ট প্রিমিয়াম থিম",
      cost: 0,
      icon: <Sparkles className="h-7 w-7 text-emerald-500" />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      category: "themes",
      action: async () => { toast.success("থিম প্রয়োগ হয়েছে"); return true; },
      owned: true,
    },
    {
      id: "theme-gold",
      name: "Royal Gold",
      nameBn: "রয়্যাল গোল্ড",
      desc: "Luxurious gold accents",
      descBn: "বিলাসী স্বর্ণ অলংকার",
      cost: 80,
      icon: <Crown className="h-7 w-7 text-amber-500" />,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      category: "themes",
      action: async () => { toast.success("👑 রয়্যাল গোল্ড থিম আনলক হয়েছে!"); return true; },
    },
    {
      id: "theme-rose",
      name: "Rose Dawn",
      nameBn: "রোজ ডন",
      desc: "Soft rose dawn gradient",
      descBn: "কোমল গোলাপী ভোর গ্রেডিয়েন্ট",
      cost: 80,
      icon: <Palette className="h-7 w-7 text-pink-500" />,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      category: "themes",
      action: async () => { toast.success("🌸 রোজ ডন থিম আনলক হয়েছে!"); return true; },
    },
    {
      id: "theme-midnight",
      name: "Midnight Mosque",
      nameBn: "মিডনাইট মসজিদ",
      desc: "Deep midnight blue with gold",
      descBn: "গভীর মিডনাইট ব্লু ও স্বর্ণ",
      cost: 100,
      icon: <Sparkles className="h-7 w-7 text-indigo-400" />,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      category: "themes",
      action: async () => { toast.success("🕌 মিডনাইট মসজিদ থিম আনলক হয়েছে!"); return true; },
    },
  ];

  const items = category === "powerups" ? powerups : themes;

  const handleBuy = async (item: ShopItem) => {
    setPurchasing(item.id);
    try {
      await item.action();
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="relative px-5 pt-4 pb-3 gradient-gold text-white safe-top">
        <div className="absolute inset-0 opacity-20 pattern-islamic" />
        <div className="relative flex items-center gap-3">
          <button onClick={back} className="tap-scale text-white/90 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bengali text-xl font-extrabold">দোকান</h1>
            <p className="text-[11px] text-white/80">রত্ন খরচ করে পাওয়ার-আপ কিনুন</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur px-3 py-1.5 shadow-soft">
            <GemIcon className="h-5 w-5" />
            <span className="font-extrabold tabular-nums text-sm">{gems}</span>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="px-4 pt-3">
        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-muted/60">
          <button
            onClick={() => setCategory("powerups")}
            className={cn(
              "py-2 rounded-xl text-xs font-bold transition-all tap-scale",
              category === "powerups" ? "gradient-gold text-white shadow-soft" : "text-muted-foreground"
            )}
          >
            ⚡ পাওয়ার-আপ
          </button>
          <button
            onClick={() => setCategory("themes")}
            className={cn(
              "py-2 rounded-xl text-xs font-bold transition-all tap-scale",
              category === "themes" ? "gradient-gold text-white shadow-soft" : "text-muted-foreground"
            )}
          >
            🎨 থিম
          </button>
        </div>
      </div>

      {/* Items grid */}
      <div className="flex-1 overflow-y-auto premium-scroll px-4 py-3">
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "relative flex flex-col rounded-2xl glass border border-border/50 p-3.5 overflow-hidden",
                item.maxedOut && "opacity-60"
              )}
            >
              {item.owned && (
                <div className="absolute top-2 right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full gradient-emerald text-white">
                  <Check className="h-3 w-3" />
                </div>
              )}
              <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl mb-2", item.bg)}>
                {item.icon}
              </div>
              <p className="font-bengali text-sm font-bold leading-tight">{item.nameBn}</p>
              <p className="font-bengali text-[10px] text-muted-foreground mt-0.5 leading-tight mb-3 line-clamp-2">
                {item.descBn}
              </p>
              <Button
                onClick={() => handleBuy(item)}
                disabled={!!item.owned || item.maxedOut || purchasing === item.id}
                className={cn(
                  "mt-auto w-full h-9 font-bold rounded-xl tap-scale text-xs",
                  item.owned
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : item.maxedOut
                    ? "bg-muted text-muted-foreground"
                    : "gradient-gold text-white shadow-soft"
                )}
              >
                {item.owned ? (
                  <><Check className="h-3.5 w-3.5 mr-1" /> আনলকড</>
                ) : item.maxedOut ? (
                  "সর্বোচ্চ"
                ) : purchasing === item.id ? (
                  "কেনা হচ্ছে..."
                ) : (
                  <><GemIcon className="h-3.5 w-3.5 mr-1" /> {item.cost}</>
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Earn more gems banner */}
        <div className="mt-4 rounded-2xl gradient-emerald p-4 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pattern-islamic" />
          <div className="relative flex items-center gap-3">
            <div className="text-4xl">💎</div>
            <div className="flex-1">
              <p className="font-bengali font-bold text-sm">রত্ন কমে গেছে?</p>
              <p className="font-bengali text-[11px] text-white/80 mt-0.5">
                লেসন সম্পন্ন করে আর প্রতিদিন অনুশীলন করে রত্ন উপার্জন করুন
              </p>
            </div>
            <Button
              onClick={() => back()}
              className="bg-white/95 text-emerald-700 font-bold rounded-xl h-9 tap-scale"
            >
              শেখা শুরু
            </Button>
          </div>
        </div>

        {/* Streak protection info */}
        {streak > 0 && (
          <div className="mt-3 rounded-2xl glass border border-cyan-500/20 p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-amber-500" />
              <p className="font-bengali text-xs font-bold">স্ট্রিক সুরক্ষা</p>
            </div>
            <p className="font-bengali text-[11px] text-muted-foreground leading-relaxed">
              আপনার বর্তমান স্ট্রিক <span className="font-bold text-amber-500">{streak} দিন</span>। স্ট্রিক ফ্রিজ কিনে একদিন মিস করলেও স্ট্রিক বজায় রাখুন।
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
