import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

/**
 * Check the user's streak status on app load.
 * If the user missed a day (yesterday was active, today is not, but the gap > 1 day):
 *   - If they have a streak freeze, consume it and preserve the streak.
 *   - Otherwise, reset the streak to 0.
 *
 * Returns the updated streak and whether a freeze was consumed.
 */
export const POST = apiHandler(async () => {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  const user = await db.user.findUnique({ where: { id: session.id } });
  if (!user) return fail("User not found", 404);

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Already active today — no action needed
  if (user.lastActiveDate === today) {
    return ok({ streak: user.streak, freezeConsumed: false, streakReset: false, noAction: true });
  }

  // If last active was yesterday, streak is still "alive" (will increment on today's lesson)
  if (user.lastActiveDate === yesterday) {
    return ok({ streak: user.streak, freezeConsumed: false, streakReset: false, noAction: true });
  }

  // Streak is broken (gap >= 2 days, or never had one)
  if (user.streak === 0) {
    return ok({ streak: 0, freezeConsumed: false, streakReset: false, noAction: true });
  }

  // Gap detected — try to consume a freeze
  if (user.streakFreezes > 0) {
    await db.user.update({
      where: { id: user.id },
      data: {
        streakFreezes: { decrement: 1 },
        // Mark yesterday as active so the streak continues to today
        lastActiveDate: yesterday,
      },
    });
    return ok({
      streak: user.streak,
      freezeConsumed: true,
      streakReset: false,
      freezesRemaining: user.streakFreezes - 1,
    });
  }

  // No freeze — reset streak
  await db.user.update({
    where: { id: user.id },
    data: { streak: 0 },
  });
  return ok({ streak: 0, freezeConsumed: false, streakReset: true });
});
