import { z } from "zod";
import { db } from "@/lib/db";
import { apiHandler, fail, ok } from "@/lib/api/responses";
import { requireAdmin } from "@/lib/api/admin-guard";

const updateVocabSchema = z.object({
  arabic: z.string().min(1).optional(),
  transliteration: z.string().min(1).optional(),
  bangla: z.string().min(1).optional(),
  english: z.string().min(1).optional(),
  partOfSpeech: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  exampleArabic: z.string().optional().nullable(),
  exampleBangla: z.string().optional().nullable(),
  difficulty: z.number().int().min(1).max(5).optional(),
});

export const GET = apiHandler(async (_req, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const word = await db.vocabulary.findUnique({ where: { id } });
  if (!word) return fail("Vocabulary not found", 404);
  return ok({ word });
});

export const PUT = apiHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateVocabSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid input", 422, parsed.error.flatten());

  const existing = await db.vocabulary.findUnique({ where: { id } });
  if (!existing) return fail("Vocabulary not found", 404);

  const word = await db.vocabulary.update({ where: { id }, data: parsed.data });
  return ok({ word });
});

export const DELETE = apiHandler(async (_req, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const existing = await db.vocabulary.findUnique({ where: { id } });
  if (!existing) return fail("Vocabulary not found", 404);

  await db.vocabulary.delete({ where: { id } });
  return ok({ success: true });
});
