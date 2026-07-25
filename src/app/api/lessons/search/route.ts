import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, ok } from "@/lib/api/responses";

/**
 * Search lessons by name (Bengali or English) across all courses.
 * Returns matching lessons with their unit/course info and the user's progress.
 */
export const GET = apiHandler(async (req) => {
  const session = await getSessionUser();
  const userId = session?.id;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return ok({ results: [], count: 0 });
  }

  const lessons = await db.lesson.findMany({
    where: {
      OR: [
        { title: { contains: q } },
        { titleBn: { contains: q } },
        { description: { contains: q } },
      ],
    },
    include: {
      unit: {
        include: {
          course: {
            select: { id: true, titleBn: true, icon: true, color: true, slug: true },
          },
        },
      },
      progress: userId
        ? { where: { userId }, select: { status: true, stars: true, score: true } }
        : false,
    },
    orderBy: [{ unit: { course: { order: "asc" } } }, { unit: { order: "asc" } }, { order: "asc" }],
    take: 30,
  });

  const results = lessons.map((l) => {
    const prog = l.progress?.[0];
    return {
      id: l.id,
      title: l.title,
      titleBn: l.titleBn,
      description: l.description,
      type: l.type,
      xpReward: l.xpReward,
      gemReward: l.gemReward,
      icon: l.icon,
      order: l.order,
      course: l.unit.course,
      unit: { id: l.unit.id, titleBn: l.unit.titleBn },
      progress: prog
        ? { status: prog.status, stars: prog.stars, score: prog.score }
        : { status: "locked", stars: 0, score: 0 },
    };
  });

  return ok({ results, count: results.length });
});
