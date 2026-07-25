import { z } from "zod";
import { db } from "@/lib/db";
import { apiHandler, fail, ok } from "@/lib/api/responses";
import { requireAdmin } from "@/lib/api/admin-guard";

const lessonQuerySchema = z.object({
  unitId: z.string().optional(),
  courseId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const createLessonSchema = z.object({
  unitId: z.string().min(1),
  title: z.string().min(1),
  titleBn: z.string().min(1),
  description: z.string().default(""),
  type: z.enum(["standard", "boss", "review", "treasure"]).default("standard"),
  xpReward: z.number().int().min(0).default(10),
  gemReward: z.number().int().min(0).default(2),
  icon: z.string().default("⭐"),
  exercises: z.array(
    z.object({
      type: z.enum(["multiple-choice", "match-pairs", "build-sentence", "fill-blank", "listen-choose", "translate"]),
      prompt: z.string(),
      promptBn: z.string().optional(),
    }).passthrough()
  ).default([]),
});

export const GET = apiHandler(async (req) => {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const parsed = lessonQuerySchema.safeParse({
    unitId: url.searchParams.get("unitId") ?? undefined,
    courseId: url.searchParams.get("courseId") ?? undefined,
    page: url.searchParams.get("page") ?? "1",
    limit: url.searchParams.get("limit") ?? "50",
  });
  if (!parsed.success) return fail("Invalid query", 422, parsed.error.flatten());

  const { unitId, courseId, page, limit } = parsed.data;
  const where = {
    ...(unitId ? { unitId } : {}),
    ...(courseId ? { unit: { courseId } } : {}),
  };

  const [lessons, total] = await Promise.all([
    db.lesson.findMany({
      where,
      orderBy: [{ unit: { order: "asc" } }, { order: "asc" }],
      include: { unit: { select: { id: true, titleBn: true, courseId: true, course: { select: { titleBn: true } } } } },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.lesson.count({ where }),
  ]);

  // Include units grouped by course for the create-lesson form
  const units = await db.unit.findMany({
    orderBy: [{ course: { order: "asc" } }, { order: "asc" }],
    include: { course: { select: { id: true, titleBn: true, slug: true, icon: true } } },
  });

  return ok({
    lessons: lessons.map((l) => ({
      ...l,
      exercises: JSON.parse(l.exercisesJson),
      exercisesJson: undefined,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    units,
  });
});

export const POST = apiHandler(async (req) => {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = createLessonSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid input", 422, parsed.error.flatten());

  const { exercises, ...rest } = parsed.data;
  // Determine next order in unit
  const maxOrder = await db.lesson.findFirst({
    where: { unitId: rest.unitId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const lesson = await db.lesson.create({
    data: {
      ...rest,
      order: (maxOrder?.order ?? 0) + 1,
      exercisesJson: JSON.stringify(exercises),
    },
  });
  return ok({ lesson }, { status: 201 });
});
