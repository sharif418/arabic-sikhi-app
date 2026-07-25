import { db } from "@/lib/db";
import { apiHandler, ok } from "@/lib/api/responses";
import { requireAdmin } from "@/lib/api/admin-guard";

/** Get day key (YYYY-MM-DD) for a date. */
function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Get the Bengali weekday short name for a date. */
function bengaliDay(d: Date): string {
  const days = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];
  return days[d.getDay()];
}

export const GET = apiHandler(async (req) => {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const days = Math.min(30, Math.max(7, Number(url.searchParams.get("days") ?? 14)));

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  // === 1. Lesson completions per day (last N days) ===
  const completions = await db.userProgress.findMany({
    where: {
      status: "completed",
      completedAt: { gte: startDate },
    },
    select: { completedAt: true, score: true, stars: true },
  });

  const dayMap = new Map<string, { completions: number; totalScore: number; totalStars: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    dayMap.set(dayKey(d), { completions: 0, totalScore: 0, totalStars: 0 });
  }
  for (const c of completions) {
    if (!c.completedAt) continue;
    const key = dayKey(c.completedAt);
    const entry = dayMap.get(key);
    if (entry) {
      entry.completions++;
      entry.totalScore += c.score ?? 0;
      entry.totalStars += c.stars ?? 0;
    }
  }

  const xpTrend = Array.from(dayMap.entries()).map(([key, val], i) => {
    const d = new Date(key);
    return {
      date: key,
      day: bengaliDay(d),
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      completions: val.completions,
      avgScore: val.completions > 0 ? Math.round(val.totalScore / val.completions) : 0,
      avgStars: val.completions > 0 ? +(val.totalStars / val.completions).toFixed(1) : 0,
      index: i,
    };
  });

  // === 2. Daily active users (last N days) — based on lastActiveDate ===
  const activeUsers = await db.user.findMany({
    where: { lastActiveDate: { not: null } },
    select: { lastActiveDate: true },
  });
  const dauMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    dauMap.set(dayKey(d), 0);
  }
  for (const u of activeUsers) {
    if (!u.lastActiveDate) continue;
    const key = u.lastActiveDate.slice(0, 10);
    const entry = dauMap.get(key);
    if (entry !== undefined) dauMap.set(key, entry + 1);
  }
  const dauTrend = Array.from(dauMap.entries()).map(([key, count]) => ({
    date: key,
    activeUsers: count,
  }));

  // === 3. League distribution (donut) ===
  const leagueDist = await db.user.groupBy({
    by: ["league"],
    _count: true,
  });

  // === 4. Course completion distribution ===
  const courseStats = await db.course.findMany({
    orderBy: { order: "asc" },
    include: {
      units: {
        include: {
          lessons: {
            select: { id: true },
          },
        },
      },
    },
  });

  const allLessonIds = courseStats.flatMap((c) => c.units.flatMap((u) => u.lessons.map((l) => l.id)));
  const totalCompletions = await db.userProgress.count({
    where: { lessonId: { in: allLessonIds }, status: "completed" },
  });

  const courseCompletion = await Promise.all(
    courseStats.map(async (c) => {
      const lessonIds = c.units.flatMap((u) => u.lessons.map((l) => l.id));
      const completed = await db.userProgress.count({
        where: { lessonId: { in: lessonIds }, status: "completed" },
      });
      return {
        id: c.id,
        titleBn: c.titleBn,
        icon: c.icon,
        color: c.color,
        totalLessons: lessonIds.length,
        completions: completed,
      };
    })
  );

  // === 5. Summary metrics ===
  const totalUsers = await db.user.count();
  const totalCompletionsAll = await db.userProgress.count({ where: { status: "completed" } });
  const avgScoreAgg = await db.userProgress.aggregate({
    where: { status: "completed" },
    _avg: { score: true },
  });
  const perfectLessons = await db.userProgress.count({ where: { status: "completed", stars: 3 } });

  // Previous period for delta comparison
  const prevStart = new Date(startDate);
  prevStart.setDate(prevStart.getDate() - days);
  const prevCompletions = await db.userProgress.count({
    where: {
      status: "completed",
      completedAt: { gte: prevStart, lt: startDate },
    },
  });
  const currCompletions = xpTrend.reduce((s, d) => s + d.completions, 0);
  const completionsDelta = prevCompletions > 0 ? ((currCompletions - prevCompletions) / prevCompletions) * 100 : 0;

  return ok({
    xpTrend,
    dauTrend,
    leagueDistribution: leagueDist,
    courseCompletion,
    summary: {
      totalUsers,
      totalCompletions: totalCompletionsAll,
      avgScore: Math.round(avgScoreAgg._avg.score ?? 0),
      perfectLessons,
      currCompletions,
      prevCompletions,
      completionsDelta: +completionsDelta.toFixed(1),
    },
  });
});
