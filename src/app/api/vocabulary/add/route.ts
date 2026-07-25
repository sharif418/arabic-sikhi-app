import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

const addSchema = z.object({
  vocabularyId: z.string().min(1),
});

/**
 * Manually add a vocabulary word to the user's SRS review deck.
 * Creates a UserVocabulary record at box 1 if it doesn't already exist.
 */
export const POST = apiHandler(async (req) => {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  const body = await req.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid input", 422, parsed.error.flatten());

  const { vocabularyId } = parsed.data;

  // Verify the word exists
  const word = await db.vocabulary.findUnique({ where: { id: vocabularyId } });
  if (!word) return fail("Vocabulary not found", 404);

  // Check if already in the user's deck
  const existing = await db.userVocabulary.findUnique({
    where: { userId_vocabularyId: { userId: session.id, vocabularyId } },
  });
  if (existing) {
    return ok({ alreadyAdded: true, userVocab: existing });
  }

  // Add to deck at box 1, due now
  const userVocab = await db.userVocabulary.create({
    data: {
      userId: session.id,
      vocabularyId,
      box: 1,
      easeFactor: 2.5,
      interval: 1,
      dueDate: new Date(),
    },
  });

  return ok({ alreadyAdded: false, userVocab });
});
