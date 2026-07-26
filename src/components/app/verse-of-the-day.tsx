"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useSpeech } from "@/hooks/use-speech";
import { Volume2, BookOpen } from "lucide-react";

interface Verse {
  arabic: string;
  bangla: string;
  surah: string;
  ayah: number;
}

// Curated short, inspiring Quranic verses for daily rotation
const VERSES: Verse[] = [
  { arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", bangla: "নিশ্চয়ই কষ্টের সাথেই রয়েছে স্বস্তি।", surah: "আশ-শারহ", ayah: 6 },
  { arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا", bangla: "এবং বলুন: হে আমার রব! আমার জ্ঞান বৃদ্ধি করুন।", surah: "ত্বাহা", ayah: 114 },
  { arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ", bangla: "অতএব তোমরা আমাকে স্মরণ করো, আমিও তোমাদের স্মরণ করব।", surah: "আল-বাকারা", ayah: 152 },
  { arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", bangla: "নিশ্চয়ই আল্লাহ ধৈর্যশীলদের সাথে আছেন।", surah: "আল-বাকারা", ayah: 153 },
  { arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ", bangla: "তিনি তোমাদের সাথে আছেন যেখানেই তোমরা থাকো।", surah: "আল-হাদীদ", ayah: 4 },
  { arabic: "رَبِّ اشْرَحْ لِي صَدْرِي", bangla: "হে আমার রব! আমার বক্ষ প্রশস্ত করুন।", surah: "ত্বাহা", ayah: 25 },
  { arabic: "وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ", bangla: "আর এতে প্রতিযোগীদের প্রতিযোগিতা করা উচিত।", surah: "আল-মুতাফফিফীন", ayah: 26 },
];

export function VerseOfTheDay() {
  const { speak } = useSpeech();

  // Deterministic verse selection based on day of year
  const { data, isLoading } = useQuery({
    queryKey: ["verse-of-day"],
    queryFn: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
      return VERSES[dayOfYear % VERSES.length];
    },
    staleTime: 60 * 60 * 1000,
  });

  if (isLoading || !data) {
    return <Skeleton className="h-28 rounded-2xl" />;
  }

  return (
    <div className="px-4 pb-3">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl glass border border-border/50 p-4 relative overflow-hidden"
      >
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full gradient-emerald opacity-8 blur-2xl" />

        {/* Header */}
        <div className="flex items-center gap-2 mb-3 relative">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-emerald text-white">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">আজকের আয়াত</p>
            <p className="font-bengali text-[10px] text-muted-foreground">{data.surah} : {data.ayah}</p>
          </div>
          <button
            onClick={() => speak(data.arabic)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary tap-scale"
          >
            <Volume2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Arabic verse */}
        <button
          onClick={() => speak(data.arabic)}
          className="font-arabic text-xl text-center w-full leading-relaxed font-bold text-foreground mb-2 tap-scale"
          dir="rtl"
        >
          {data.arabic}
        </button>

        {/* Bengali translation */}
        <p className="font-bengali text-xs text-center text-muted-foreground leading-relaxed">
          {data.bangla}
        </p>
      </motion.div>
    </div>
  );
}
