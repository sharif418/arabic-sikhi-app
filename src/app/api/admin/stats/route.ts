import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

export const GET = apiHandler(async () => {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") return fail("Forbidden", 403);

  const [
    totalUsers,
    totalLessons,
    totalVocab,
    completedLessons,
    lessonsToday,
    activeToday,
    leagueDistribution,
    recentUsers,
    courseProgress,
  ] = await Promise.all([
    db.user.count(),
    db.lesson.count(),
    db.vocabulary.count(),
    db.userProgress.count({ where: { status: "completed" } }),
    db.userProgress.count({
      where: { completedAt: { gte: new Date(Date.now() - 86400000) } },
    }),
    db.user.count({
      where: { lastActiveDate: new Date().toISOString().slice(0, 10) },
    }),
    db.user.groupBy({
      by: ["league"],
      _count: true,
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, name: true, email: true, createdAt: true, league: true, totalXp: true },
    }),
    db.course.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { units: true } } },
    }),
  ]);

  return ok({
    totals: {
      users: totalUsers,
      lessons: totalLessons,
      vocab: totalVocab,
      completedLessons,
      lessonsToday,
      activeToday,
    },
    leagueDistribution,
    recentUsers,
    courseProgress,
  });
});
