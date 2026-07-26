import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { apiHandler, fail, ok } from "@/lib/api/responses";
import { requireAdmin } from "@/lib/api/admin-guard";
import { z } from "zod";

const seedSchema = z.object({
  secret: z.string().optional(),
});

/**
 * Seed the production database with courses, lessons, vocabulary, achievements,
 * and demo/admin users.
 *
 * Auth: Either an admin session OR a `secret` matching the SEED_SECRET env var
 * (for first-run seeding when no admin user exists yet).
 *
 * Idempotent — safe to run multiple times.
 */
export const POST = apiHandler(async (req) => {
  const body = await req.json().catch(() => ({}));
  const parsed = seedSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid input", 422);

  const { secret } = parsed.data;

  // Check auth: admin session OR seed secret
  const seedSecret = process.env.SEED_SECRET;
  const hasValidSecret = seedSecret && secret === seedSecret;

  if (!hasValidSecret) {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;
  }

  const results = {
    courses: 0,
    lessons: 0,
    vocabulary: 0,
    achievements: 0,
    users: 0,
  };

  // === 1. Admin user (if not exists) ===
  const adminEmail = "admin@arabicsikhi.com";
  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await db.user.create({
      data: {
        email: adminEmail,
        name: "Administrator",
        passwordHash: await hashPassword("admin123"),
        role: "admin",
        gems: 9999,
        xp: 5000,
        totalXp: 5000,
        level: 12,
        streak: 42,
        league: "Diamond",
      },
    });
    results.users++;
  }

  // === 2. Demo user (if not exists) ===
  const demoEmail = "learner@arabicsikhi.com";
  const existingDemo = await db.user.findUnique({ where: { email: demoEmail } });
  if (!existingDemo) {
    const demoUser = await db.user.create({
      data: {
        email: demoEmail,
        name: "রহমান লার্নার",
        passwordHash: await hashPassword("demo1234"),
        role: "user",
        gems: 120,
        xp: 320,
        totalXp: 320,
        level: 4,
        streak: 7,
        league: "Silver",
      },
    });
    await db.leaderboardEntry.create({
      data: { userId: demoUser.id, league: "Silver", weeklyXp: 320, totalXp: 320 },
    });
    results.users++;
  }

  // === 3. Bot users for leaderboard ===
  const botNames = [
    "আব্দুল্লাহ", "ফাতিমা", "ইউসুফ", "মরিয়ম", "ইব্রাহিম",
    "খাদিজা", "মুহাম্মদ", "আয়িশা", "ওমর", "জয়নব",
    "আলী", "সাফিয়া", "হামজা", "রুকাইয়া", "বিলাল",
  ];
  const leagues = ["Bronze", "Silver", "Gold"];
  for (let i = 0; i < botNames.length; i++) {
    const botEmail = `bot${i}@arabicsikhi.com`;
    const existingBot = await db.user.findUnique({ where: { email: botEmail } });
    if (!existingBot) {
      const botUser = await db.user.create({
        data: {
          email: botEmail,
          name: botNames[i],
          passwordHash: await hashPassword("demo1234"),
          role: "user",
          gems: 20 + i * 5,
          xp: 80 + i * 35,
          totalXp: 80 + i * 35,
          level: 2 + (i % 5),
          streak: i % 8,
          league: leagues[i % leagues.length],
        },
      });
      await db.leaderboardEntry.create({
        data: { userId: botUser.id, league: leagues[i % leagues.length], weeklyXp: 80 + i * 35, totalXp: 80 + i * 35 },
      });
      results.users++;
    }
  }

  // === 4. Achievements ===
  const achievements = [
    { slug: "first-lesson", title: "First Steps", titleBn: "প্রথম পদক্ষেপ", description: "Complete your first lesson", descriptionBn: "আপনার প্রথম লেসন সম্পন্ন করুন", icon: "🌱", color: "oklch(0.6 0.13 162)", requirement: JSON.stringify({ type: "lessons-completed", value: 1 }) },
    { slug: "streak-7", title: "Week Warrior", titleBn: "সপ্তাহ যোদ্ধা", description: "Maintain a 7-day streak", descriptionBn: "৭ দিনের স্ট্রিক ধরে রাখুন", icon: "🔥", color: "oklch(0.65 0.2 35)", requirement: JSON.stringify({ type: "streak", value: 7 }) },
    { slug: "streak-30", title: "Monthly Devotion", titleBn: "মাসিক নিষ্ঠা", description: "Maintain a 30-day streak", descriptionBn: "৩০ দিনের স্ট্রিক ধরে রাখুন", icon: "💎", color: "oklch(0.7 0.12 220)", requirement: JSON.stringify({ type: "streak", value: 30 }) },
    { slug: "gems-100", title: "Gem Collector", titleBn: "রত্ন সংগ্রাহক", description: "Collect 100 gems", descriptionBn: "১০০টি রত্ন সংগ্রহ করুন", icon: "💎", color: "oklch(0.8 0.13 85)", requirement: JSON.stringify({ type: "gems", value: 100 }) },
    { slug: "level-5", title: "Rising Scholar", titleBn: "উদীয়মান পণ্ডিত", description: "Reach level 5", descriptionBn: "লেভেল ৫-এ পৌঁছান", icon: "🎓", color: "oklch(0.55 0.13 162)", requirement: JSON.stringify({ type: "level", value: 5 }) },
    { slug: "level-10", title: "Quranic Seeker", titleBn: "কুরআনি সাধক", description: "Reach level 10", descriptionBn: "লেভেল ১০-এ পৌঁছান", icon: "📚", color: "oklch(0.5 0.12 190)", requirement: JSON.stringify({ type: "level", value: 10 }) },
    { slug: "vocab-50", title: "Word Smith", titleBn: "শব্দ কারিগর", description: "Learn 50 vocabulary words", descriptionBn: "৫০টি শব্দ শিখুন", icon: "✍️", color: "oklch(0.65 0.16 300)", requirement: JSON.stringify({ type: "vocab-learned", value: 50 }) },
    { slug: "perfect-lesson", title: "Flawless", titleBn: "নিখুঁত", description: "Complete a lesson with 3 stars", descriptionBn: "৩ তারকা নিয়ে একটি লেসন সম্পন্ন করুন", icon: "⭐", color: "oklch(0.82 0.14 85)", requirement: JSON.stringify({ type: "perfect-lesson", value: 1 }) },
  ];
  for (const a of achievements) {
    const existing = await db.achievement.findUnique({ where: { slug: a.slug } });
    if (!existing) {
      await db.achievement.create({ data: a });
      results.achievements++;
    }
  }

  // === 5. Courses + Units + Lessons ===
  const courses = [
    { slug: "book-1", title: "Book 1 — Foundations", titleBn: "বই ১ — ভিত্তি", subtitle: "Start your Arabic journey", description: "Learn the Arabic alphabet, basic greetings, and essential words.", color: "emerald", icon: "🌱" },
    { slug: "book-2", title: "Book 2 — Building Blocks", titleBn: "বই ২ — গঠন উপাদান", subtitle: "Words, phrases & simple sentences", description: "Build vocabulary and form basic sentences.", color: "gold", icon: "📖" },
    { slug: "book-3", title: "Book 3 — Grammar Essentials", titleBn: "বই ৩ — ব্যাকরণ সারাংশ", subtitle: "Master sentence structure", description: "Understand nouns, verbs, and sentence construction.", color: "teal", icon: "🏛️" },
    { slug: "book-4", title: "Book 4 — Quranic Mastery", titleBn: "বই ৪ — কুরআনি দক্ষতা", subtitle: "Read & understand the Quran", description: "Apply your knowledge to understand Quranic verses.", color: "sunset", icon: "🕌" },
  ];

  for (let ci = 0; ci < courses.length; ci++) {
    const c = courses[ci];
    let course = await db.course.findUnique({ where: { slug: c.slug } });
    if (!course) {
      course = await db.course.create({
        data: { slug: c.slug, title: c.title, titleBn: c.titleBn, subtitle: c.subtitle, description: c.description, color: c.color, icon: c.icon, order: ci + 1 },
      });
      results.courses++;
    }

    const unitDefs = [
      { titleBn: ci === 0 ? "ইউনিট ১ — শুভেচ্ছা" : ci === 1 ? "ইউনিট ১ — শব্দভান্ডার" : ci === 2 ? "ইউনিট ১ — বিশেষ্য" : "ইউনিট ১ — সূরা ফাতিহা", description: "এখান থেকে শুরু করুন", icon: ["👋", "📝", "📚", "📖"][ci] },
      { titleBn: ci === 0 ? "ইউনিট ২ — পরিচয়" : ci === 1 ? "ইউনিট ২ — পরিবার" : ci === 2 ? "ইউনিট ২ — ক্রিয়া" : "ইউনিট ২ — ছোট সূরা", description: "এগিয়ে যান", icon: ["🤝", "👨‍👩‍👧", "⚙️", "📿"][ci] },
      { titleBn: ci === 0 ? "ইউনিট ৩ — সংখ্যা" : ci === 1 ? "ইউনিট ৩ — প্রতিদিন" : ci === 2 ? "ইউনিট ৩ — বাক্য" : "ইউনিট ৩ — বোঝাপড়া", description: "ভিত্তি আয়ত্ত করুন", icon: ["🔢", "☀️", "🏗️", "🧠"][ci] },
    ];

    for (let ui = 0; ui < unitDefs.length; ui++) {
      const ud = unitDefs[ui];
      const existingUnit = await db.unit.findFirst({ where: { courseId: course.id, titleBn: ud.titleBn } });
      let unit;
      if (existingUnit) {
        unit = existingUnit;
      } else {
        unit = await db.unit.create({
          data: { courseId: course.id, title: `Unit ${ui + 1}`, titleBn: ud.titleBn, description: ud.description, icon: ud.icon, order: ui + 1 },
        });
      }

      const lessonCount = 4;
      for (let li = 0; li < lessonCount; li++) {
        const isBoss = li === lessonCount - 1;
        const lessonTitleBn = `লেসন ${li + 1}`;
        const existingLesson = await db.lesson.findFirst({ where: { unitId: unit.id, titleBn: lessonTitleBn } });
        if (!existingLesson) {
          await db.lesson.create({
            data: {
              unitId: unit.id,
              title: `Lesson ${li + 1}`,
              titleBn: lessonTitleBn,
              description: isBoss ? "Boss lesson — test your knowledge!" : "Practice and learn",
              order: li + 1,
              type: isBoss ? "boss" : "standard",
              xpReward: isBoss ? 25 : 10,
              gemReward: isBoss ? 5 : 2,
              icon: isBoss ? "👑" : ["⭐", "📘", "✨"][li % 3],
              exercisesJson: JSON.stringify(buildExercises(li)),
            },
          });
          results.lessons++;
        }
      }
    }
  }

  // === 6. Vocabulary (key subset) ===
  const vocabData = [
    { arabic: "السَّلَامُ", tr: "as-salāmu", bn: "শান্তি", en: "peace", pos: "noun", cat: "greeting", diff: 1 },
    { arabic: "عَلَيْكُمْ", tr: "ʿalaykum", bn: "তোমাদের উপর", en: "upon you", pos: "phrase", cat: "greeting", diff: 1 },
    { arabic: "كَيْفَ", tr: "kayfa", bn: "কেমন", en: "how", pos: "particle", cat: "greeting", diff: 1 },
    { arabic: "كِتَابٌ", tr: "kitāb", bn: "বই", en: "book", pos: "noun", cat: "objects", diff: 1 },
    { arabic: "قَلَمٌ", tr: "qalam", bn: "কলম", en: "pen", pos: "noun", cat: "objects", diff: 1 },
    { arabic: "مَاءٌ", tr: "māʾ", bn: "পানি", en: "water", pos: "noun", cat: "food", diff: 1 },
    { arabic: "أَبٌ", tr: "ab", bn: "পিতা", en: "father", pos: "noun", cat: "family", diff: 1 },
    { arabic: "أُمٌّ", tr: "umm", bn: "মাতা", en: "mother", pos: "noun", cat: "family", diff: 1 },
    { arabic: "أَخٌ", tr: "akh", bn: "ভাই", en: "brother", pos: "noun", cat: "family", diff: 1 },
    { arabic: "أُخْتٌ", tr: "ukht", bn: "বোন", en: "sister", pos: "noun", cat: "family", diff: 1 },
    { arabic: "اللَّهُ", tr: "Allāh", bn: "আল্লাহ", en: "Allah", pos: "noun", cat: "deen", diff: 1 },
    { arabic: "رَبٌّ", tr: "rabb", bn: "প্রভু", en: "Lord", pos: "noun", cat: "deen", diff: 2 },
    { arabic: "إِيمَانٌ", tr: "īmān", bn: "ঈমান/বিশ্বাস", en: "faith", pos: "noun", cat: "deen", diff: 3 },
    { arabic: "قُرْآنٌ", tr: "qurʾān", bn: "কুরআন", en: "Quran", pos: "noun", cat: "deen", diff: 2 },
    { arabic: "نَبِيٌّ", tr: "nabī", bn: "নবী", en: "prophet", pos: "noun", cat: "deen", diff: 3 },
    { arabic: "صَلَاةٌ", tr: "ṣalāt", bn: "সালাত/নামাজ", en: "prayer", pos: "noun", cat: "deen", diff: 3 },
    { arabic: "جَنَّةٌ", tr: "janna", bn: "জান্নাত", en: "paradise", pos: "noun", cat: "deen", diff: 3 },
    { arabic: "رَحْمَةٌ", tr: "raḥma", bn: "রহমত/করুণা", en: "mercy", pos: "noun", cat: "deen", diff: 3 },
    { arabic: "شُكْرًا", tr: "shukran", bn: "ধন্যবাদ", en: "thank you", pos: "phrase", cat: "greeting", diff: 1 },
    { arabic: "نَعَمْ", tr: "naʿam", bn: "হ্যাঁ", en: "yes", pos: "particle", cat: "phrases", diff: 1 },
    { arabic: "لَا", tr: "lā", bn: "না", en: "no", pos: "particle", cat: "phrases", diff: 1 },
    { arabic: "يَوْمٌ", tr: "yawm", bn: "দিন", en: "day", pos: "noun", cat: "time", diff: 1 },
    { arabic: "لَيْلٌ", tr: "layl", bn: "রাত", en: "night", pos: "noun", cat: "time", diff: 1 },
    { arabic: "شَمْسٌ", tr: "shams", bn: "সূর্য", en: "sun", pos: "noun", cat: "nature", diff: 2 },
    { arabic: "قَمَرٌ", tr: "qamar", bn: "চাঁদ", en: "moon", pos: "noun", cat: "nature", diff: 2 },
    { arabic: "بَيْتٌ", tr: "bayt", bn: "ঘর", en: "house", pos: "noun", cat: "objects", diff: 1 },
    { arabic: "مَسْجِدٌ", tr: "masjid", bn: "মসজিদ", en: "mosque", pos: "noun", cat: "places", diff: 2 },
    { arabic: "رَجُلٌ", tr: "rajul", bn: "পুরুষ", en: "man", pos: "noun", cat: "people", diff: 1 },
    { arabic: "امْرَأَةٌ", tr: "imraʾa", bn: "নারী", en: "woman", pos: "noun", cat: "people", diff: 2 },
    { arabic: "وَلَدٌ", tr: "walad", bn: "ছেলে", en: "boy", pos: "noun", cat: "people", diff: 1 },
    { arabic: "جَمِيلٌ", tr: "jamīl", bn: "সুন্দর", en: "beautiful", pos: "adjective", cat: "adjectives", diff: 2 },
    { arabic: "كَبِيرٌ", tr: "kabīr", bn: "বড়", en: "big", pos: "adjective", cat: "adjectives", diff: 2 },
    { arabic: "صَغِيرٌ", tr: "ṣaghīr", bn: "ছোট", en: "small", pos: "adjective", cat: "adjectives", diff: 2 },
    { arabic: "كَتَبَ", tr: "kataba", bn: "সে লিখেছে", en: "he wrote", pos: "verb", cat: "verbs", diff: 3 },
    { arabic: "قَرَأَ", tr: "qaraʾa", bn: "সে পড়েছে", en: "he read", pos: "verb", cat: "verbs", diff: 3 },
    { arabic: "وَاحِدٌ", tr: "wāḥid", bn: "এক", en: "one", pos: "number", cat: "numbers", diff: 1 },
    { arabic: "اثْنَانِ", tr: "ithnān", bn: "দুই", en: "two", pos: "number", cat: "numbers", diff: 1 },
    { arabic: "ثَلَاثَةٌ", tr: "thalātha", bn: "তিন", en: "three", pos: "number", cat: "numbers", diff: 1 },
    { arabic: "أَحْمَرُ", tr: "aḥmar", bn: "লাল", en: "red", pos: "adjective", cat: "colors", diff: 2 },
    { arabic: "أَخْضَرُ", tr: "akhḍar", bn: "সবুজ", en: "green", pos: "adjective", cat: "colors", diff: 2 },
    { arabic: "أَسَدٌ", tr: "asad", bn: "সিংহ", en: "lion", pos: "noun", cat: "animals", diff: 2 },
    { arabic: "قِطٌّ", tr: "qiṭṭ", bn: "বিড়াল", en: "cat", pos: "noun", cat: "animals", diff: 1 },
    { arabic: "رَأْسٌ", tr: "raʾs", bn: "মাথা", en: "head", pos: "noun", cat: "body", diff: 2 },
    { arabic: "عَيْنٌ", tr: "ʿayn", bn: "চোখ", en: "eye", pos: "noun", cat: "body", diff: 2 },
    { arabic: "يَدٌ", tr: "yad", bn: "হাত", en: "hand", pos: "noun", cat: "body", diff: 1 },
    { arabic: "قَلْبٌ", tr: "qalb", bn: "হৃদয়", en: "heart", pos: "noun", cat: "body", diff: 2 },
  ];

  for (const v of vocabData) {
    const existing = await db.vocabulary.findFirst({ where: { arabic: v.arabic } });
    if (!existing) {
      await db.vocabulary.create({
        data: { arabic: v.arabic, transliteration: v.tr, bangla: v.bn, english: v.en, partOfSpeech: v.pos, category: v.cat, difficulty: v.diff },
      });
      results.vocabulary++;
    }
  }

  return ok({ success: true, results, message: "Database seeded successfully!" });
});

function buildExercises(_lessonIndex: number) {
  return [
    {
      type: "multiple-choice",
      prompt: "What does this mean?",
      promptBn: "এর অর্থ কী?",
      arabic: "السَّلَامُ",
      options: ["শান্তি", "অবস্থা", "তোমাদের উপর", "কেমন"],
      answer: 0,
    },
    {
      type: "match-pairs",
      prompt: "Match the Arabic words with their meanings",
      promptBn: "আরবি শব্দের সাথে অর্থ মিলিয়ে দিন",
      pairs: [
        { left: "السَّلَامُ", right: "শান্তি" },
        { left: "كِتَابٌ", right: "বই" },
      ],
    },
    {
      type: "listen-choose",
      prompt: "Listen and choose",
      promptBn: "শুনে বেছে নিন",
      audio: "السَّلَامُ",
      arabicText: "السَّلَامُ",
      options: ["peace", "book", "water"],
      answer: 0,
    },
    {
      type: "fill-blank",
      prompt: "Complete the sentence",
      promptBn: "বাক্যটি পূরণ করুন",
      arabic: "هَذَا ___",
      answer: "قَلَمٌ",
      options: ["قَلَمٌ", "كِتَابٌ", "مَاءٌ"],
    },
    {
      type: "translate",
      prompt: "Which Arabic word means 'book'?",
      promptBn: "'বই' অর্থের আরবি শব্দ কোনটি?",
      arabic: "كِتَابٌ",
      options: ["كِتَابٌ", "قَلَمٌ", "يَوْمٌ"],
      answer: 0,
    },
  ];
}
