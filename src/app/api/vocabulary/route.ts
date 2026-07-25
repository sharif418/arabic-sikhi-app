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

  return fail("Invalid mode", 400);
});
