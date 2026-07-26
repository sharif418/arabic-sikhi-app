"use client";

import { useNav } from "@/lib/stores/nav-store";
import { useSpeech } from "@/hooks/use-speech";
import { motion } from "framer-motion";
import { Volume2, BookOpen } from "lucide-react";

interface Letter {
  arabic: string;
  name: string;
  nameBn: string;
  sound: string;
  example: string;
  exampleBn: string;
}

const LETTERS: Letter[] = [
  { arabic: "ا", name: "Alif", nameBn: "আলিফ", sound: "a/ā", example: "أَبٌ", exampleBn: "পিতা" },
  { arabic: "ب", name: "Bā", nameBn: "বা", sound: "b", example: "بَيْتٌ", exampleBn: "ঘর" },
  { arabic: "ت", name: "Tā", nameBn: "তা", sound: "t", example: "تَمْرٌ", exampleBn: "খেজুর" },
  { arabic: "ث", name: "Thā", nameBn: "সা", sound: "th", example: "ثَلَاثَةٌ", exampleBn: "তিন" },
  { arabic: "ج", name: "Jīm", nameBn: "জিম", sound: "j", example: "جَمَلٌ", exampleBn: "উট" },
  { arabic: "ح", name: "Ḥā", nameBn: "হা", sound: "ḥ", example: "حَالٌ", exampleBn: "অবস্থা" },
  { arabic: "خ", name: "Khā", nameBn: "খা", sound: "kh", example: "خُبْزٌ", exampleBn: "রুটি" },
  { arabic: "د", name: "Dāl", nameBn: "দাল", sound: "d", example: "دَرْسٌ", exampleBn: "পাঠ" },
  { arabic: "ذ", name: "Dhāl", nameBn: "যাল", sound: "dh", example: "ذَهَبَ", exampleBn: "গেল" },
  { arabic: "ر", name: "Rā", nameBn: "রা", sound: "r", example: "رَجُلٌ", exampleBn: "পুরুষ" },
  { arabic: "ز", name: "Zāy", nameBn: "যাই", sound: "z", example: "زَيْتٌ", exampleBn: "তেল" },
  { arabic: "س", name: "Sīn", nameBn: "সিন", sound: "s", example: "سَمَكٌ", exampleBn: "মাছ" },
  { arabic: "ش", name: "Shīn", nameBn: "শিন", sound: "sh", example: "شَمْسٌ", exampleBn: "সূর্য" },
  { arabic: "ص", name: "Ṣād", nameBn: "সোদ", sound: "ṣ", example: "صَلَاةٌ", exampleBn: "নামাজ" },
  { arabic: "ض", name: "Ḍād", nameBn: "দোদ", sound: "ḍ", example: "ضَوْءٌ", exampleBn: "আলো" },
  { arabic: "ط", name: "Ṭā", nameBn: "তোয়া", sound: "ṭ", example: "طَرِيقٌ", exampleBn: "রাস্তা" },
  { arabic: "ظ", name: "Ẓā", nameBn: "যোয়া", sound: "ẓ", example: "ظِلٌّ", exampleBn: "ছায়া" },
  { arabic: "ع", name: "ʿAyn", nameBn: "আইন", sound: "ʿ", example: "عَيْنٌ", exampleBn: "চোখ" },
  { arabic: "غ", name: "Ghayn", nameBn: "গাইন", sound: "gh", example: "غَيْمٌ", exampleBn: "মেঘ" },
  { arabic: "ف", name: "Fā", nameBn: "ফা", sound: "f", example: "فِيلٌ", exampleBn: "হাতি" },
  { arabic: "ق", name: "Qāf", nameBn: "কোফ", sound: "q", example: "قَلَمٌ", exampleBn: "কলম" },
  { arabic: "ك", name: "Kāf", nameBn: "কাফ", sound: "k", example: "كِتَابٌ", exampleBn: "বই" },
  { arabic: "ل", name: "Lām", nameBn: "লাম", sound: "l", example: "لَيْلٌ", exampleBn: "রাত" },
  { arabic: "م", name: "Mīm", nameBn: "মিম", sound: "m", example: "مَاءٌ", exampleBn: "পানি" },
  { arabic: "ن", name: "Nūn", nameBn: "নুন", sound: "n", example: "نَارٌ", exampleBn: "আগুন" },
  { arabic: "ه", name: "Hā", nameBn: "হা", sound: "h", example: "هَوَاءٌ", exampleBn: "বাতাস" },
  { arabic: "و", name: "Wāw", nameBn: "ওয়াও", sound: "w/ū", example: "وَلَدٌ", exampleBn: "ছেলে" },
  { arabic: "ي", name: "Yā", nameBn: "ইয়া", sound: "y/ī", example: "يَدٌ", exampleBn: "হাত" },
];

export function AlphabetScreen() {
  const { back } = useNav();
  const { speak } = useSpeech();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="relative px-4 pt-4 pb-3 gradient-aurora text-white safe-top">
        <div className="absolute inset-0 opacity-20 pattern-islamic" />
        <div className="relative flex items-center gap-3">
          <button onClick={back} className="tap-scale text-white/90 hover:text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="font-bengali text-lg font-extrabold">আরবি বর্ণমালা</h1>
            <p className="text-[11px] text-white/80">২৮টি অক্ষর · উচ্চারণ শুনুন</p>
          </div>
          <BookOpen className="h-5 w-5 text-white/80" />
        </div>
      </div>

      {/* Letters grid */}
      <div className="flex-1 overflow-y-auto premium-scroll p-3">
        <div className="grid grid-cols-2 gap-2.5">
          {LETTERS.map((letter, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl glass border border-border/50 p-3 flex items-center gap-3"
            >
              {/* Arabic letter with audio */}
              <button
                onClick={() => speak(letter.arabic)}
                className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl gradient-emerald text-white shadow-soft tap-scale"
              >
                <span className="font-arabic text-3xl font-bold">{letter.arabic}</span>
                <Volume2 className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-background rounded-full p-0.5 text-primary" />
              </button>

              {/* Letter info */}
              <div className="flex-1 min-w-0">
                <p className="font-bengali text-sm font-bold">{letter.nameBn}</p>
                <p className="text-[10px] text-muted-foreground">{letter.name} · /{letter.sound}/</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="font-arabic text-sm font-bold text-primary">{letter.example}</span>
                  <span className="text-[9px] text-muted-foreground">= {letter.exampleBn}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="mt-4 rounded-2xl bg-primary/5 border border-primary/20 p-3 text-center">
          <p className="font-bengali text-[11px] text-muted-foreground">
            💡 প্রতিটি অক্ষরে ট্যাপ করে উচ্চারণ শুনুন
          </p>
        </div>
      </div>
    </div>
  );
}
