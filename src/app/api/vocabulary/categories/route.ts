import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

/**
 * Get per-category progress for the current user:
 * total words per category, learned words per category, and percentage.
 */
export const GET = apiHandler(async () => {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  // Get all categories with total counts
  const categoryTotals = await db.vocabulary.groupBy({
    by: ["category"],
    _count: true,
    orderBy: { category: "asc" },
  });

  // Get learned words per category for this user
  const learned = await db.userVocabulary.findMany({
    where: { userId: session.id },
    include: { vocabulary: { select: { category: true } } },
  });

  const learnedByCategory = new Map<string, number>();
  for (const l of learned) {
    const cat = l.vocabulary.category;
    if (!cat) continue;
    learnedByCategory.set(cat, (learnedByCategory.get(cat) ?? 0) + 1);
  }

  const categories = categoryTotals
    .filter((c) => c.category !== null && c.category !== "") // exclude null/empty
    .map((c) => {
      const cat = c.category as string;
      return {
        category: cat,
        total: c._count,
        learned: learnedByCategory.get(cat) ?? 0,
        pct: c._count > 0 ? Math.round(((learnedByCategory.get(cat) ?? 0) / c._count) * 100) : 0,
      };
    });

  const totalWords = categories.reduce((s, c) => s + c.total, 0);
  const totalLearned = categories.reduce((s, c) => s + c.learned, 0);

  return ok({
    categories,
    totalWords,
    totalLearned,
    overallPct: totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0,
  });
});
