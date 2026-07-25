import { z } from "zod";
import { db } from "@/lib/db";
import { apiHandler, fail, ok } from "@/lib/api/responses";
import { requireAdmin } from "@/lib/api/admin-guard";

const vocabQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const createVocabSchema = z.object({
  arabic: z.string().min(1),
  transliteration: z.string().min(1),
  bangla: z.string().min(1),
  english: z.string().min(1),
  partOfSpeech: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  exampleArabic: z.string().optional().nullable(),
  exampleBangla: z.string().optional().nullable(),
  difficulty: z.number().int().min(1).max(5).default(1),
});

export const GET = apiHandler(async (req) => {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const parsed = vocabQuerySchema.safeParse({
    q: url.searchParams.get("q") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    page: url.searchParams.get("page") ?? "1",
    limit: url.searchParams.get("limit") ?? "20",
  });
  if (!parsed.success) return fail("Invalid query", 422, parsed.error.flatten());

  const { q, category, page, limit } = parsed.data;
  const where = {
    ...(q
      ? {
          OR: [
            { arabic: { contains: q } },
            { transliteration: { contains: q } },
            { bangla: { contains: q } },
            { english: { contains: q } },
          ],
        }
      : {}),
    ...(category ? { category } : {}),
  };

  const [words, total] = await Promise.all([
    db.vocabulary.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.vocabulary.count({ where }),
  ]);

  const categories = await db.vocabulary.findMany({
    where: { NOT: { category: null } },
    select: { category: true },
    distinct: ["category"],
  });

  return ok({
    words,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    categories: categories.map((c) => c.category),
  });
});

export const POST = apiHandler(async (req) => {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = createVocabSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid input", 422, parsed.error.flatten());

  const word = await db.vocabulary.create({ data: parsed.data });
  return ok({ word }, { status: 201 });
});
