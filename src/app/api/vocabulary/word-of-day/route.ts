import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

/**
 * Get the "Word of the Day" — a deterministic word based on the current date
 * that rotates daily. Returns whether the user has already learned it.
 */
export const GET = apiHandler(async () => {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  // Use day-of-year to deterministically pick a word
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);

  const totalWords = await db.vocabulary.count();
  if (totalWords === 0) return fail("No vocabulary available", 404);

  // Pick a word that's not too hard (difficulty <= 3) for the daily word
  const easyWords = await db.vocabulary.findMany({
    where: { difficulty: { lte: 3 } },
    select: { id: true },
  });

  const pool = easyWords.length > 0 ? easyWords : await db.vocabulary.findMany({ select: { id: true } });
  const wordId = pool[dayOfYear % pool.length].id;

  const word = await db.vocabulary.findUnique({ where: { id: wordId } });
  if (!word) return fail("Word not found", 404);

  // Check if user has learned this word
  const userVocab = await db.userVocabulary.findUnique({
    where: { userId_vocabularyId: { userId: session.id, vocabularyId: wordId } },
  });

  return ok({
    word,
    learned: !!userVocab,
    box: userVocab?.box ?? 0,
    dayOfYear,
  });
});
