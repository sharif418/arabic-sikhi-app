import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

export const GET = apiHandler(async () => {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  const [
    user,
    progress,
    vocabLearned,
    achievements,
  ] = await Promise.all([
    db.user.findUnique({ where: { id: session.id } }),
    db.userProgress.findMany({ where: { userId: session.id, status: "completed" } }),
    db.userVocabulary.findMany({ where: { userId: session.id }, include: { vocabulary: true } }),
    db.userAchievement.findMany({
      where: { userId: session.id },
      include: { achievement: true },
    }),
  ]);

  if (!user) return fail("User not found", 404);

  const totalStars = progress.reduce((sum, p) => sum + (p.stars ?? 0), 0);
  const perfectLessons = progress.filter((p) => (p.stars ?? 0) === 3).length;
  const dueVocab = vocabLearned.filter((v) => v.dueDate <= new Date()).length;

  return ok({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      gems: user.gems,
      xp: user.xp,
      totalXp: user.totalXp,
      level: user.level,
      streak: user.streak,
      league: user.league,
      hearts: user.hearts,
    },
    stats: {
      lessonsCompleted: progress.length,
      totalStars,
      perfectLessons,
      vocabLearned: vocabLearned.length,
      dueVocab,
      averageScore: progress.length
        ? Math.round(progress.reduce((s, p) => s + (p.score ?? 0), 0) / progress.length)
        : 0,
    },
    achievements: achievements.map((a) => ({
      id: a.achievement.id,
      slug: a.achievement.slug,
      title: a.achievement.title,
      titleBn: a.achievement.titleBn,
      description: a.achievement.descriptionBn,
      icon: a.achievement.icon,
      color: a.achievement.color,
      unlockedAt: a.unlockedAt,
    })),
  });
});
