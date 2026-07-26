import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";
import { checkAndUnlockAchievements } from "@/lib/achievements";

const reviewSchema = z.object({
  vocabularyId: z.string(),
  quality: z.number().min(0).max(5), // 0=again, 5=perfect
});

/** SM-2-ish spaced repetition update. */
export const POST = apiHandler(async (req) => {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  const body = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid payload", 422, parsed.error.flatten());

  const { vocabularyId, quality } = parsed.data;

  const existing = await db.userVocabulary.findUnique({
    where: { userId_vocabularyId: { userId: session.id, vocabularyId } },
  });

  // SM-2 algorithm (simplified)
  let box = existing?.box ?? 1;
  let ease = existing?.easeFactor ?? 2.5;
  let interval = existing?.interval ?? 1;
  const reviewCount = (existing?.reviewCount ?? 0) + 1;

  if (quality < 3) {
    // Failed — reset
    box = 1;
    interval = 1;
  } else {
    ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    if (reviewCount === 1) interval = 1;
    else if (reviewCount === 2) interval = 3;
    else interval = Math.round(interval * ease);
    box = Math.min(5, box + 1);
  }

  const dueDate = new Date(Date.now() + interval * 86400000);

  const updated = await db.userVocabulary.upsert({
    where: { userId_vocabularyId: { userId: session.id, vocabularyId } },
    update: { box, easeFactor: ease, interval, dueDate, reviewCount, lastReviewed: new Date() },
    create: {
      userId: session.id,
      vocabularyId,
      box,
      easeFactor: ease,
      interval,
      dueDate,
      reviewCount,
      lastReviewed: new Date(),
    },
  });

  // Award a small XP for reviewing (only on good answers)
  let xpAwarded = 0;
  if (quality >= 3) {
    xpAwarded = 2;
    await db.user.update({
      where: { id: session.id },
      data: { xp: { increment: xpAwarded }, totalXp: { increment: xpAwarded } },
    });
    await db.leaderboardEntry.upsert({
      where: { userId: session.id },
      update: { weeklyXp: { increment: xpAwarded }, totalXp: { increment: xpAwarded } },
      create: { userId: session.id, weeklyXp: xpAwarded, totalXp: xpAwarded },
    });
  }

  // Check achievements (vocab-learned, gems, level, etc.)
  const achievementResult = await checkAndUnlockAchievements(session.id);

  return ok({ updated, xpAwarded, achievementsUnlocked: achievementResult.unlocked });
});
