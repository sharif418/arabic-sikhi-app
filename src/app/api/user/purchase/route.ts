import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

const purchaseSchema = z.object({
  itemId: z.enum(["heart-refill", "streak-freeze", "xp-boost", "heart-max"]),
});

const PRICES: Record<string, number> = {
  "heart-refill": 30,
  "streak-freeze": 50,
  "xp-boost": 40,
  "heart-max": 120,
};

export const POST = apiHandler(async (req) => {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  const body = await req.json().catch(() => null);
  const parsed = purchaseSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid item", 422, parsed.error.flatten());

  const { itemId } = parsed.data;
  const cost = PRICES[itemId];

  const user = await db.user.findUnique({ where: { id: session.id } });
  if (!user) return fail("User not found", 404);

  if (user.gems < cost) return fail("পর্যাপ্ত রত্ন নেই", 400);

  const updateData: Record<string, unknown> = { gems: { decrement: cost } };
  const result: Record<string, unknown> = { cost };

  switch (itemId) {
    case "heart-refill":
      if (user.hearts >= 5) return fail("হার্ট ইতিমধ্যে পূর্ণ", 400);
      updateData.hearts = 5;
      result.hearts = 5;
      break;
    case "streak-freeze":
      updateData.streakFreezes = { increment: 1 };
      result.streakFreezes = user.streakFreezes + 1;
      break;
    case "xp-boost":
      updateData.xp = { increment: 25 };
      updateData.totalXp = { increment: 25 };
      result.xpGained = 25;
      break;
    case "heart-max":
      // Max hearts cap at 7 (stored as a preference; hearts field default is 5)
      // Since schema doesn't have maxHearts field, we'll cap hearts at 7
      if (user.hearts >= 7) return fail("সর্বোচ্চ হার্ট সীমায় পৌঁছেছেন", 400);
      updateData.hearts = { increment: 1 };
      result.maxHearts = user.hearts + 1;
      break;
  }

  await db.user.update({ where: { id: user.id }, data: updateData });

  return ok({ success: true, itemId, ...result });
});
