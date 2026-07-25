import { z } from "zod";
import { db } from "@/lib/db";
import { apiHandler, fail, ok } from "@/lib/api/responses";
import { requireAdmin } from "@/lib/api/admin-guard";

const updateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  titleBn: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["standard", "boss", "review", "treasure"]).optional(),
  xpReward: z.number().int().min(0).optional(),
  gemReward: z.number().int().min(0).optional(),
  icon: z.string().optional(),
  exercises: z.array(
    z.object({
      type: z.enum(["multiple-choice", "match-pairs", "build-sentence", "fill-blank", "listen-choose", "translate"]),
      prompt: z.string(),
      promptBn: z.string().optional(),
    }).passthrough()
  ).optional(),
  order: z.number().int().min(0).optional(),
});

export const GET = apiHandler(async (_req, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const lesson = await db.lesson.findUnique({
    where: { id },
    include: { unit: { include: { course: true } } },
  });
  if (!lesson) return fail("Lesson not found", 404);
  return ok({
    lesson: {
      ...lesson,
      exercises: JSON.parse(lesson.exercisesJson),
      exercisesJson: undefined,
    },
  });
});

export const PUT = apiHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateLessonSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid input", 422, parsed.error.flatten());

  const existing = await db.lesson.findUnique({ where: { id } });
  if (!existing) return fail("Lesson not found", 404);

  const { exercises, ...rest } = parsed.data;
  const lesson = await db.lesson.update({
    where: { id },
    data: {
      ...rest,
      ...(exercises ? { exercisesJson: JSON.stringify(exercises) } : {}),
    },
  });
  return ok({ lesson });
});

export const DELETE = apiHandler(async (_req, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const existing = await db.lesson.findUnique({ where: { id } });
  if (!existing) return fail("Lesson not found", 404);

  await db.lesson.delete({ where: { id } });
  return ok({ success: true });
});
