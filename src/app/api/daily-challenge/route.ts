import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

/**
 * Get the Daily Challenge — a rapid-fire vocabulary quiz that rotates daily.
 * Returns 5 random vocabulary words for the user to match.
 * Bonus rewards: 2x XP and extra gems on completion.
 *
 * No schema changes needed — completion is tracked via UserProgress
 * with a special lessonId format: "daily-YYYY-MM-DD".
 */
export const GET = apiHandler(async () => {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  const today = new Date().toISOString().slice(0, 10);
  const challengeId = `daily-${today}`;

  // Pick 5 random vocabulary words (seeded by date for consistency)
  const allVocab = await db.vocabulary.findMany({
    where: { difficulty: { lte: 3 } },
    select: { id: true, arabic: true, transliteration: true, bangla: true, english: true, category: true },
    take: 100,
  });

  if (allVocab.length < 5) return fail("Not enough vocabulary", 500);

  // Deterministic shuffle based on date
  const seed = today.split("-").reduce((sum, val) => sum + parseInt(val), 0);
  const shuffled = [...allVocab].sort((a, b) => {
    const hashA = (a.id.charCodeAt(0) + seed) % 100;
    const hashB = (b.id.charCodeAt(0) + seed) % 100;
    return hashA - hashB;
  });
  const challengeWords = shuffled.slice(0, 5);

  // Check if already completed today
  const existing = await db.userProgress.findFirst({
    where: {
      userId: session.id,
      lessonId: challengeId,
      status: "completed",
    },
  });

  // Build the challenge: 5 match-the-meaning questions
  const questions = challengeWords.map((word, i) => {
    // Create 3 wrong options from other words
    const wrongOptions = shuffled
      .filter((w) => w.id !== word.id)
      .slice(i * 3, i * 3 + 3)
      .map((w) => w.bangla);
    const options = [...wrongOptions, word.bangla].sort(() => Math.random() - 0.5);
    return {
      wordId: word.id,
      arabic: word.arabic,
      transliteration: word.transliteration,
      correctAnswer: word.bangla,
      options,
      category: word.category,
    };
  });

  return ok({
    challengeId,
    date: today,
    questions,
    completed: !!existing,
    rewards: {
      xp: 20,
      gems: 5,
      bonus: "2x XP for first completion!",
    },
  });
});

/**
 * Complete the daily challenge and award bonus rewards.
 */
export const POST = apiHandler(async (req) => {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  const body = await req.json().catch(() => ({}));
  const { correctCount, totalCount } = body as { correctCount: number; totalCount: number };

  if (typeof correctCount !== "number" || typeof totalCount !== "number") {
    return fail("Invalid payload", 422);
  }

  const today = new Date().toISOString().slice(0, 10);
  const challengeId = `daily-${today}`;

  // Check if already completed
  const existing = await db.userProgress.findFirst({
    where: { userId: session.id, lessonId: challengeId, status: "completed" },
  });
  if (existing) return fail("Already completed today", 400);

  // Calculate rewards based on accuracy
  const accuracy = correctCount / totalCount;
  const xpGained = Math.round(20 * (0.5 + accuracy * 0.5));
  const gemGained = 5 + (accuracy === 1 ? 3 : 0); // Perfect bonus

  // Record completion
  await db.userProgress.create({
    data: {
      userId: session.id,
      lessonId: challengeId,
      status: "completed",
      score: Math.round(accuracy * 100),
      stars: accuracy === 1 ? 3 : accuracy >= 0.6 ? 2 : 1,
      attempts: 1,
      completedAt: new Date(),
    },
  });

  // Award rewards
  await db.user.update({
    where: { id: session.id },
    data: {
      gems: { increment: gemGained },
      xp: { increment: xpGained },
      totalXp: { increment: xpGained },
    },
  });

  await db.leaderboardEntry.upsert({
    where: { userId: session.id },
    update: { weeklyXp: { increment: xpGained }, totalXp: { increment: xpGained } },
    create: { userId: session.id, weeklyXp: xpGained, totalXp: xpGained },
  });

  return ok({
    success: true,
    rewards: { xp: xpGained, gems: gemGained },
    accuracy: Math.round(accuracy * 100),
  });
});
