import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

export const GET = apiHandler(async (req) => {
  const url = new URL(req.url);
  const courseSlug = url.searchParams.get("slug");

  const session = await getSessionUser();
  const userId = session?.id ?? "__guest__";

  if (courseSlug) {
    const course = await db.course.findUnique({
      where: { slug: courseSlug },
      include: {
        units: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: {
                progress: userId !== "__guest__"
                  ? { where: { userId }, select: { status: true, stars: true, score: true } }
                  : false,
              },
            },
          },
        },
      },
    });
    if (!course) return fail("Course not found", 404);
    return ok({ course });
  }

  // Return all courses with aggregate progress
  const courses = await db.course.findMany({
    orderBy: { order: "asc" },
    include: {
      units: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              progress: userId !== "__guest__"
                ? { where: { userId }, select: { status: true, stars: true } }
                : false,
            },
          },
        },
      },
    },
  });

  // Compute progress per course
  const withStats = courses.map((c) => {
    const lessons = c.units.flatMap((u) => u.lessons);
    const total = lessons.length;
    const completed = lessons.filter((l) =>
      l.progress?.some?.((p) => p.status === "completed")
    ).length;
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      titleBn: c.titleBn,
      subtitle: c.subtitle,
      description: c.description,
      color: c.color,
      icon: c.icon,
      order: c.order,
      totalLessons: total,
      completedLessons: completed,
      progressPct: total > 0 ? Math.round((completed / total) * 100) : 0,
      units: c.units,
    };
  });

  return ok({ courses: withStats });
});
