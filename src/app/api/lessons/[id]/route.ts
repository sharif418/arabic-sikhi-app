import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

export const GET = apiHandler(async (_req, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await getSessionUser();
  const userId = session?.id;

  const lesson = await db.lesson.findUnique({
    where: { id },
    include: {
      unit: { include: { course: true } },
      progress: userId ? { where: { userId } } : false,
    },
  });

  if (!lesson) return fail("Lesson not found", 404);

  return ok({
    lesson: {
      id: lesson.id,
      title: lesson.title,
      titleBn: lesson.titleBn,
      description: lesson.description,
      type: lesson.type,
      xpReward: lesson.xpReward,
      gemReward: lesson.gemReward,
      icon: lesson.icon,
      exercises: JSON.parse(lesson.exercisesJson),
      unit: {
        id: lesson.unit.id,
        titleBn: lesson.unit.titleBn,
        course: {
          id: lesson.unit.course.id,
          titleBn: lesson.unit.course.titleBn,
          color: lesson.unit.course.color,
          slug: lesson.unit.course.slug,
        },
      },
      progress: userId
        ? lesson.progress?.[0] ?? { status: "locked", stars: 0, score: 0 }
        : null,
    },
  });
});
