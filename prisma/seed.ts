import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";

/* ============================================================
   Arabic Sikhi — Seed Data
   Real Quranic Arabic learning content (Bengali medium)
   ============================================================ */

type Exercise =
  | {
      type: "multiple-choice";
      prompt: string;
      promptBn?: string;
      arabic?: string;
      audio?: string;
      options: string[];
      answer: number;
      hint?: string;
    }
  | {
      type: "match-pairs";
      prompt: string;
      promptBn?: string;
      pairs: { left: string; right: string }[];
    }
  | {
      type: "build-sentence";
      prompt: string;
      promptBn?: string;
      tokens: string[];
      answer: string; // correct order joined
    }
  | {
      type: "fill-blank";
      prompt: string;
      promptBn?: string;
      arabic: string; // with ___
      answer: string;
      options: string[];
    }
  | {
      type: "listen-choose";
      prompt: string;
      promptBn?: string;
      audio: string; // arabic word to "play"
      arabicText: string;
      options: string[];
      answer: number;
    }
  | {
      type: "translate";
      prompt: string;
      promptBn?: string;
      arabic: string;
      options: string[];
      answer: number;
    };

async function main() {
  console.log("🌱 Seeding Arabic Sikhi database...");

  // ---- Admin & demo users ----
  const adminPass = await hashPassword("admin123");
  const demoPass = await hashPassword("demo1234");

  const admin = await db.user.upsert({
    where: { email: "admin@arabicsikhi.com" },
    update: {},
    create: {
      email: "admin@arabicsikhi.com",
      name: "Administrator",
      passwordHash: adminPass,
      role: "admin",
      gems: 9999,
      xp: 5000,
      totalXp: 5000,
      level: 12,
      streak: 42,
      league: "Diamond",
    },
  });

  const demo = await db.user.upsert({
    where: { email: "learner@arabicsikhi.com" },
    update: {},
    create: {
      email: "learner@arabicsikhi.com",
      name: "রহমান লার্নার",
      passwordHash: demoPass,
      role: "user",
      gems: 120,
      xp: 320,
      totalXp: 320,
      level: 4,
      streak: 7,
      league: "Silver",
    },
  });

  // Generate a handful of bot competitors for the leaderboard
  const botNames = [
    "আব্দুল্লাহ", "ফাতিমা", "ইউসুফ", "মরিয়ম", "ইব্রাহিম",
    "খাদিজা", "মুহাম্মদ", "আয়িশা", "ওমর", "জয়নব",
    "আলী", "সাফিয়া", "হামজা", "রুকাইয়া", "বিলাল",
  ];
  const leagues = ["Bronze", "Silver", "Gold"];
  for (let i = 0; i < botNames.length; i++) {
    await db.user.upsert({
      where: { email: `bot${i}@arabicsikhi.com` },
      update: {},
      create: {
        email: `bot${i}@arabicsikhi.com`,
        name: botNames[i],
        passwordHash: demoPass,
        role: "user",
        gems: 20 + i * 5,
        xp: 80 + i * 35,
        totalXp: 80 + i * 35,
        level: 2 + (i % 5),
        streak: i % 8,
        league: leagues[i % leagues.length],
      },
    });
  }

  // ---- Achievements ----
  const achievements = [
    {
      slug: "first-lesson",
      title: "First Steps",
      titleBn: "প্রথম পদক্ষেপ",
      description: "Complete your first lesson",
      descriptionBn: "আপনার প্রথম লেসন সম্পন্ন করুন",
      icon: "🌱",
      color: "oklch(0.6 0.13 162)",
      requirement: JSON.stringify({ type: "lessons-completed", value: 1 }),
    },
    {
      slug: "streak-7",
      title: "Week Warrior",
      titleBn: "সপ্তাহ যোদ্ধা",
      description: "Maintain a 7-day streak",
      descriptionBn: "৭ দিনের স্ট্রিক ধরে রাখুন",
      icon: "🔥",
      color: "oklch(0.65 0.2 35)",
      requirement: JSON.stringify({ type: "streak", value: 7 }),
    },
    {
      slug: "streak-30",
      title: "Monthly Devotion",
      titleBn: "মাসিক নিষ্ঠা",
      description: "Maintain a 30-day streak",
      descriptionBn: "৩০ দিনের স্ট্রিক ধরে রাখুন",
      icon: "💎",
      color: "oklch(0.7 0.12 220)",
      requirement: JSON.stringify({ type: "streak", value: 30 }),
    },
    {
      slug: "gems-100",
      title: "Gem Collector",
      titleBn: "রত্ন সংগ্রাহক",
      description: "Collect 100 gems",
      descriptionBn: "১০০টি রত্ন সংগ্রহ করুন",
      icon: "💎",
      color: "oklch(0.8 0.13 85)",
      requirement: JSON.stringify({ type: "gems", value: 100 }),
    },
    {
      slug: "level-5",
      title: "Rising Scholar",
      titleBn: "উদীয়মান পণ্ডিত",
      description: "Reach level 5",
      descriptionBn: "লেভেল ৫-এ পৌঁছান",
      icon: "🎓",
      color: "oklch(0.55 0.13 162)",
      requirement: JSON.stringify({ type: "level", value: 5 }),
    },
    {
      slug: "level-10",
      title: "Quranic Seeker",
      titleBn: "কুরআনি সাধক",
      description: "Reach level 10",
      descriptionBn: "লেভেল ১০-এ পৌঁছান",
      icon: "📚",
      color: "oklch(0.5 0.12 190)",
      requirement: JSON.stringify({ type: "level", value: 10 }),
    },
    {
      slug: "vocab-50",
      title: "Word Smith",
      titleBn: "শব্দ কারিগর",
      description: "Learn 50 vocabulary words",
      descriptionBn: "৫০টি শব্দ শিখুন",
      icon: "✍️",
      color: "oklch(0.65 0.16 300)",
      requirement: JSON.stringify({ type: "vocab-learned", value: 50 }),
    },
    {
      slug: "perfect-lesson",
      title: "Flawless",
      titleBn: "নিখুঁত",
      description: "Complete a lesson with 3 stars",
      descriptionBn: "৩ তারকা নিয়ে একটি লেসন সম্পন্ন করুন",
      icon: "⭐",
      color: "oklch(0.82 0.14 85)",
      requirement: JSON.stringify({ type: "perfect-lesson", value: 1 }),
    },
  ];

  for (const a of achievements) {
    await db.achievement.upsert({
      where: { slug: a.slug },
      update: {},
      create: a,
    });
  }

  // ---- Vocabulary ----
  const vocabData = [
    { arabic: "السَّلَامُ", tr: "as-salāmu", bn: "শান্তি", en: "peace", pos: "noun", cat: "greeting", diff: 1, exA: "السَّلَامُ عَلَيْكُمْ", exB: "শান্তি তোমার উপর হোক" },
    { arabic: "عَلَيْكُمْ", tr: "ʿalaykum", bn: "তোমাদের উপর", en: "upon you", pos: "phrase", cat: "greeting", diff: 1 },
    { arabic: "كَيْفَ", tr: "kayfa", bn: "কেমন", en: "how", pos: "particle", cat: "greeting", diff: 1, exA: "كَيْفَ حَالُكَ؟", exB: "তোমার অবস্থা কেমন?" },
    { arabic: "حَالٌ", tr: "ḥāl", bn: "অবস্থা", en: "condition", pos: "noun", cat: "greeting", diff: 2 },
    { arabic: "كِتَابٌ", tr: "kitāb", bn: "বই", en: "book", pos: "noun", cat: "objects", diff: 1, exA: "هَذَا كِتَابٌ", exB: "এটি একটি বই" },
    { arabic: "قَلَمٌ", tr: "qalam", bn: "কলম", en: "pen", pos: "noun", cat: "objects", diff: 1 },
    { arabic: "مَاءٌ", tr: "māʾ", bn: "পানি", en: "water", pos: "noun", cat: "food", diff: 1 },
    { arabic: "خُبْزٌ", tr: "khubz", bn: "রুটি", en: "bread", pos: "noun", cat: "food", diff: 1 },
    { arabic: "أَبٌ", tr: "ab", bn: "পিতা", en: "father", pos: "noun", cat: "family", diff: 1 },
    { arabic: "أُمٌّ", tr: "umm", bn: "মাতা", en: "mother", pos: "noun", cat: "family", diff: 1 },
    { arabic: "ابْنٌ", tr: "ibn", bn: "পুত্র", en: "son", pos: "noun", cat: "family", diff: 2 },
    { arabic: "بِنْتٌ", tr: "bint", bn: "কন্যা", en: "daughter", pos: "noun", cat: "family", diff: 2 },
    { arabic: "كَبِيرٌ", tr: "kabīr", bn: "বড়", en: "big", pos: "adjective", cat: "adjectives", diff: 2 },
    { arabic: "صَغِيرٌ", tr: "ṣaghīr", bn: "ছোট", en: "small", pos: "adjective", cat: "adjectives", diff: 2 },
    { arabic: "جَمِيلٌ", tr: "jamīl", bn: "সুন্দর", en: "beautiful", pos: "adjective", cat: "adjectives", diff: 2 },
    { arabic: "كَتَبَ", tr: "kataba", bn: "লিখেছে", en: "he wrote", pos: "verb", cat: "verbs", diff: 3 },
    { arabic: "قَرَأَ", tr: "qaraʾa", bn: "পড়েছে", en: "he read", pos: "verb", cat: "verbs", diff: 3 },
    { arabic: "ذَهَبَ", tr: "dhahaba", bn: "গিয়েছে", en: "he went", pos: "verb", cat: "verbs", diff: 3 },
    { arabic: "الْبَيْتُ", tr: "al-bayt", bn: "ঘর", en: "the house", pos: "noun", cat: "objects", diff: 1 },
    { arabic: "الْمَسْجِدُ", tr: "al-masjid", bn: "মসজিদ", en: "the mosque", pos: "noun", cat: "places", diff: 1 },
    { arabic: "رَجُلٌ", tr: "rajul", bn: "পুরুষ", en: "man", pos: "noun", cat: "people", diff: 1 },
    { arabic: "امْرَأَةٌ", tr: "imraʾa", bn: "নারী", en: "woman", pos: "noun", cat: "people", diff: 2 },
    { arabic: "وَلَدٌ", tr: "walad", bn: "ছেলে", en: "boy", pos: "noun", cat: "people", diff: 1 },
    { arabic: "يَوْمٌ", tr: "yawm", bn: "দিন", en: "day", pos: "noun", cat: "time", diff: 1 },
    { arabic: "لَيْلٌ", tr: "layl", bn: "রাত", en: "night", pos: "noun", cat: "time", diff: 1 },
    { arabic: "شَمْسٌ", tr: "shams", bn: "সূর্য", en: "sun", pos: "noun", cat: "nature", diff: 2 },
    { arabic: "قَمَرٌ", tr: "qamar", bn: "চাঁদ", en: "moon", pos: "noun", cat: "nature", diff: 2 },
    { arabic: "نُورٌ", tr: "nūr", bn: "আলো", en: "light", pos: "noun", cat: "nature", diff: 2 },
    { arabic: "اللَّهُ", tr: "Allāh", bn: "আল্লাহ", en: "Allah", pos: "noun", cat: "deen", diff: 1 },
    { arabic: "رَبٌّ", tr: "rabb", bn: "প্রভু", en: "Lord", pos: "noun", cat: "deen", diff: 2 },
  ];

  const vocabIds: string[] = [];
  for (const v of vocabData) {
    const created = await db.vocabulary.create({
      data: {
        arabic: v.arabic,
        transliteration: v.tr,
        bangla: v.bn,
        english: v.en,
        partOfSpeech: v.pos,
        category: v.cat,
        difficulty: v.diff,
        exampleArabic: v.exA,
        exampleBangla: v.exB,
      },
    });
    vocabIds.push(created.id);
  }

  // ---- Courses (4 Books) ----
  const courses = [
    {
      slug: "book-1",
      title: "Book 1 — Foundations",
      titleBn: "বই ১ — ভিত্তি",
      subtitle: "Start your Arabic journey",
      description: "Learn the Arabic alphabet, basic greetings, and essential words.",
      color: "emerald",
      icon: "🌱",
    },
    {
      slug: "book-2",
      title: "Book 2 — Building Blocks",
      titleBn: "বই ২ — গঠন উপাদান",
      subtitle: "Words, phrases & simple sentences",
      description: "Build vocabulary and form basic sentences.",
      color: "gold",
      icon: "📖",
    },
    {
      slug: "book-3",
      title: "Book 3 — Grammar Essentials",
      titleBn: "বই ৩ — ব্যাকরণ সারাংশ",
      subtitle: "Master sentence structure",
      description: "Understand nouns, verbs, and sentence construction.",
      color: "teal",
      icon: "🏛️",
    },
    {
      slug: "book-4",
      title: "Book 4 — Quranic Mastery",
      titleBn: "বই ৪ — কুরআনি দক্ষতা",
      subtitle: "Read & understand the Quran",
      description: "Apply your knowledge to understand Quranic verses.",
      color: "sunset",
      icon: "🕌",
    },
  ];

  for (let ci = 0; ci < courses.length; ci++) {
    const c = courses[ci];
    const course = await db.course.create({
      data: {
        slug: c.slug,
        title: c.title,
        titleBn: c.titleBn,
        subtitle: c.subtitle,
        description: c.description,
        color: c.color,
        icon: c.icon,
        order: ci + 1,
      },
    });

    // Each course gets 3 units
    const unitDefs = [
      {
        title: `Unit 1`,
        titleBn: ci === 0 ? "ইউনিট ১ — শুভেচ্ছা" : ci === 1 ? "ইউনিট ১ — শব্দভান্ডার" : ci === 2 ? "ইউনিট ১ — বিশেষ্য" : "ইউনিট ১ — সূরা ফাতিহা",
        description: "এখান থেকে শুরু করুন",
        icon: ["👋", "📝", "📚", "📖"][ci],
      },
      {
        title: `Unit 2`,
        titleBn: ci === 0 ? "ইউনিট ২ — পরিচয়" : ci === 1 ? "ইউনিট ২ — পরিবার" : ci === 2 ? "ইউনিট ২ — ক্রিয়া" : "ইউনিট ২ — ছোট সূরা",
        description: "এগিয়ে যান",
        icon: ["🤝", "👨‍👩‍👧", "⚙️", "📿"][ci],
      },
      {
        title: `Unit 3`,
        titleBn: ci === 0 ? "ইউনিট ৩ — সংখ্যা" : ci === 1 ? "ইউনিট ৩ — প্রতিদিন" : ci === 2 ? "ইউনিট ৩ — বাক্য" : "ইউনিট ৩ — বোঝাপড়া",
        description: "ভিত্তি আয়ত্ত করুন",
        icon: ["🔢", "☀️", "🏗️", "🧠"][ci],
      },
    ];

    for (let ui = 0; ui < unitDefs.length; ui++) {
      const ud = unitDefs[ui];
      const unit = await db.unit.create({
        data: {
          courseId: course.id,
          title: ud.title,
          titleBn: ud.titleBn,
          description: ud.description,
          icon: ud.icon,
          order: ui + 1,
        },
      });

      // Each unit gets 4 lessons (3 standard + 1 boss/review)
      const lessonCount = 4;
      for (let li = 0; li < lessonCount; li++) {
        const isBoss = li === lessonCount - 1;
        const lessonTitle = `Lesson ${li + 1}`;
        const lessonTitleBn = `লেসন ${li + 1}`;
        const exercises = buildExercises(ci, ui, li, vocabData);

        await db.lesson.create({
          data: {
            unitId: unit.id,
            title: lessonTitle,
            titleBn: lessonTitleBn,
            description: isBoss ? "Boss lesson — test your knowledge!" : "Practice and learn",
            order: li + 1,
            type: isBoss ? "boss" : "standard",
            xpReward: isBoss ? 25 : 10,
            gemReward: isBoss ? 5 : 2,
            icon: isBoss ? "👑" : ["⭐", "📘", "✨"][li % 3],
            exercisesJson: JSON.stringify(exercises),
          },
        });
      }
    }
  }

  // ---- Leaderboard entries ----
  const allUsers = await db.user.findMany({ include: { leaderboard: true } });
  for (const u of allUsers) {
    if (!u.leaderboard) {
      await db.leaderboardEntry.create({
        data: {
          userId: u.id,
          league: u.league,
          weeklyXp: u.totalXp,
          totalXp: u.totalXp,
        },
      });
    }
  }

  // ---- Demo user progress (unlock first lesson of book 1) ----
  const firstLesson = await db.lesson.findFirst({
    orderBy: { order: "asc" },
    include: { unit: true },
  });
  if (firstLesson) {
    await db.userProgress.create({
      data: {
        userId: demo.id,
        lessonId: firstLesson.id,
        status: "available",
      },
    });
  }

  console.log(`✅ Seed complete. Admin: ${admin.email} / admin123 | Demo: ${demo.email} / demo1234`);
}

function buildExercises(
  ci: number,
  ui: number,
  li: number,
  vocab: { arabic: string; tr: string; bn: string; en: string }[]
): Exercise[] {
  // Generic but varied exercise sets
  const ex: Exercise[] = [];

  // 1. Multiple choice — translate Arabic to Bengali
  const w1 = vocab[(ci * 3 + ui + li) % vocab.length];
  const wrong1 = vocab.filter((v) => v.bn !== w1.bn).slice(0, 3);
  const opts1 = shuffle([w1.bn, ...wrong1.map((w) => w.bn)]);
  ex.push({
    type: "multiple-choice",
    prompt: `What does "${w1.arabic}" mean?`,
    promptBn: `"${w1.arabic}" এর অর্থ কী?`,
    arabic: w1.arabic,
    options: opts1,
    answer: opts1.indexOf(w1.bn),
    hint: `Transliteration: ${w1.tr}`,
  });

  // 2. Match pairs
  const matchWords = vocab.slice((ci + ui + li) % 8, (ci + ui + li) % 8 + 4);
  ex.push({
    type: "match-pairs",
    prompt: "Match the Arabic words with their meanings",
    promptBn: "আরবি শব্দের সাথে অর্থ মিলিয়ে দিন",
    pairs: matchWords.map((w) => ({ left: w.arabic, right: w.bn })),
  });

  // 3. Listen & choose
  const w2 = vocab[(ci * 5 + ui + li + 3) % vocab.length];
  const wrong2 = vocab.filter((v) => v.en !== w2.en).slice(0, 3);
  const opts2 = shuffle([w2.en, ...wrong2.map((w) => w.en)]);
  ex.push({
    type: "listen-choose",
    prompt: "Listen and choose the correct meaning",
    promptBn: "শুনে সঠিক অর্থ বেছে নিন",
    audio: w2.arabic,
    arabicText: w2.arabic,
    options: opts2,
    answer: opts2.indexOf(w2.en),
  });

  // 4. Fill in the blank
  const w3 = vocab[(ci * 2 + ui + li + 5) % vocab.length];
  const fbWrong = vocab.filter((v) => v.arabic !== w3.arabic).slice(0, 3).map((v) => v.arabic);
  const fbOpts = shuffle([w3.arabic, ...fbWrong]);
  ex.push({
    type: "fill-blank",
    prompt: "Complete the sentence",
    promptBn: "বাক্যটি পূরণ করুন",
    arabic: `هَذَا ${"___"}`,
    answer: w3.arabic,
    options: fbOpts,
  });

  // 5. Translate (Bengali -> Arabic option)
  const w4 = vocab[(ci * 4 + ui + li + 7) % vocab.length];
  const wrong4 = vocab.filter((v) => v.arabic !== w4.arabic).slice(0, 3);
  const opts4 = shuffle([w4.arabic, ...wrong4.map((w) => w.arabic)]);
  ex.push({
    type: "translate",
    prompt: `Which Arabic word means "${w4.bn}"?`,
    promptBn: `"${w4.bn}" অর্থের আরবি শব্দ কোনটি?`,
    arabic: w4.arabic,
    options: opts4,
    answer: opts4.indexOf(w4.arabic),
  });

  // Boss lessons get an extra build-sentence exercise
  if (li === 3) {
    ex.push({
      type: "build-sentence",
      prompt: "Build: 'The book is beautiful'",
      promptBn: "বাক্য তৈরি করুন: 'বইটি সুন্দর'",
      tokens: ["الْكِتَابُ", "جَمِيلٌ"],
      answer: "الْكِتَابُ جَمِيلٌ",
    });
  }

  return ex;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
