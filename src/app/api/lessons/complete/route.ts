import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";
import { checkAndUnlockAchievements } from "@/lib/achievements";

const completeSchema = z.object({
  lessonId: z.string(),
  score: z.number().min(0).max(100),
  stars: z.number().min(0).max(3),
  correctCount: z.number().int().min(0),
  totalCount: z.number().int().min(1),
});

export const POST = apiHandler(async (req) => {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  const body = await req.json().catch(() => null);
  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid payload", 422, parsed.error.flatten());

  const { lessonId, score, stars, correctCount, totalCount } = parsed.data;

  const lesson = await db.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return fail("Lesson not found", 404);

  // Determine rewards
  const accuracy = correctCount / totalCount;
  const xpGained = Math.round(lesson.xpReward * (0.5 + accuracy * 0.5));
  const gemGained = lesson.gemReward + (stars === 3 ? 2 : 0);

  // Upsert progress
  const existing = await db.userProgress.findUnique({
    where: { userId_lessonId: { userId: session.id, lessonId } },
  });

  const isImprovement = !existing || score > (existing.score ?? 0);
  const bestStars = Math.max(existing?.stars ?? 0, stars);

  const progress = await db.userProgress.upsert({
    where: { userId_lessonId: { userId: session.id, lessonId } },
    update: {
      status: "completed",
      score: Math.max(existing?.score ?? 0, score),
      stars: bestStars,
      attempts: { increment: 1 },
      completedAt: new Date(),
    },
    create: {
      userId: session.id,
      lessonId,
      status: "completed",
      score,
      stars,
      attempts: 1,
      completedAt: new Date(),
    },
  });

  // Only grant rewards on first completion or improvement
  if (!existing || isImprovement) {
    await db.user.update({
      where: { id: session.id },
      data: {
        gems: { increment: gemGained },
        xp: { increment: xpGained },
        totalXp: { increment: xpGained },
      },
    });

    // Update leaderboard
    await db.leaderboardEntry.upsert({
      where: { userId: session.id },
      update: {
        weeklyXp: { increment: xpGained },
        totalXp: { increment: xpGained },
      },
      create: {
        userId: session.id,
        weeklyXp: xpGained,
        totalXp: xpGained,
      },
    });

    // Recompute level
    const fresh = await db.user.findUnique({ where: { id: session.id } });
    if (fresh) {
      let level = 1;
      let remaining = fresh.totalXp;
      while (remaining >= Math.floor(50 * Math.pow(level, 1.4))) {
        remaining -= Math.floor(50 * Math.pow(level, 1.4));
        level++;
      }
      await db.user.update({ where: { id: session.id }, data: { level } });
    }

    // Update streak
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const u = await db.user.findUnique({ where: { id: session.id } });
    if (u && u.lastActiveDate !== today) {
      const newStreak = u.lastActiveDate === yesterday ? u.streak + 1 : 1;
      await db.user.update({
        where: { id: session.id },
        data: { streak: newStreak, lastActiveDate: today },
      });
    }
  }

  // Unlock the next lesson in the same unit (or first lesson of next unit)
  const lessonsInUnit = await db.lesson.findMany({
    where: { unitId: lesson.unitId },
    orderBy: { order: "asc" },
  });
  const idx = lessonsInUnit.findIndex((l) => l.id === lessonId);
  let nextLessonId: string | null = null;

  if (idx >= 0 && idx < lessonsInUnit.length - 1) {
    nextLessonId = lessonsInUnit[idx + 1].id;
  } else {
    // first lesson of next unit
    const unit = await db.unit.findUnique({
      where: { id: lesson.unitId },
      include: { course: { include: { units: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } } } },
    });
    if (unit) {
      const units = unit.course.units.sort((a, b) => a.order - b.order);
      const unitIdx = units.findIndex((u) => u.id === unit.id);
      if (unitIdx >= 0 && unitIdx < units.length - 1) {
        nextLessonId = units[unitIdx + 1].lessons[0]?.id ?? null;
      }
    }
  }

  if (nextLessonId) {
    await db.userProgress.upsert({
      where: { userId_lessonId: { userId: session.id, lessonId: nextLessonId } },
      update: { status: "available" },
      create: { userId: session.id, lessonId: nextLessonId, status: "available" },
    });
  }

  // Check & unlock achievements (returns newly unlocked for client toasts)
  const achievementResult = await checkAndUnlockAchievements(session.id);

  return ok({
    progress,
    rewards: { xp: xpGained, gems: gemGained, stars: bestStars },
    nextLessonId,
    achievementsUnlocked: achievementResult.unlocked,
  });
});
