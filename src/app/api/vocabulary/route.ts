import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

/** Get vocabulary due for review + available categories. */
export const GET = apiHandler(async (req) => {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const mode = url.searchParams.get("mode") ?? "due"; // due | all | learn

  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  const now = new Date();

  if (mode === "due") {
    const due = await db.userVocabulary.findMany({
      where: { userId: session.id, dueDate: { lte: now } },
      include: { vocabulary: true },
      orderBy: { dueDate: "asc" },
      take: 20,
    });

    // If no due cards, pull some unseen words to learn
    if (due.length === 0) {
      const seen = await db.userVocabulary.findMany({
        where: { userId: session.id },
        select: { vocabularyId: true },
      });
      const seenIds = seen.map((s) => s.vocabularyId);
      const fresh = await db.vocabulary.findMany({
        where: category ? { category, id: { notIn: seenIds } } : { id: { notIn: seenIds } },
        take: 10,
      });
      return ok({
        mode: "learn",
        cards: fresh.map((v) => ({ ...v, isNew: true })),
        count: fresh.length,
      });
    }

    return ok({
      mode: "due",
      cards: due.map((d) => ({ ...d.vocabulary, box: d.box, isNew: false })),
      count: due.length,
    });
  }

  if (mode === "all") {
    const where = category ? { category } : {};
    const vocab = await db.vocabulary.findMany({ where, take: 100 });
    return ok({ mode: "all", cards: vocab, count: vocab.length });
  }

  if (mode === "browse") {
    const q = url.searchParams.get("q");
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? "20")));

    const where = {
      ...(category ? { category } : {}),
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
    };

    const [words, total, categories] = await Promise.all([
      db.vocabulary.findMany({
        where,
        orderBy: { difficulty: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.vocabulary.count({ where }),
      db.vocabulary.findMany({
        where: { NOT: { category: null } },
        select: { category: true },
        distinct: ["category"],
      }),
    ]);

    // Get the user's learned set for marking
    const learned = await db.userVocabulary.findMany({
      where: { userId: session.id },
      select: { vocabularyId: true, box: true },
    });
    const learnedMap = new Map(learned.map((l) => [l.vocabularyId, l.box]));

    return ok({
      mode: "browse",
      cards: words.map((w) => ({
        ...w,
        learned: learnedMap.has(w.id),
        box: learnedMap.get(w.id) ?? 0,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      categories: categories.map((c) => c.category).filter(Boolean),
    });
  }

  return fail("Invalid mode", 400);
});
