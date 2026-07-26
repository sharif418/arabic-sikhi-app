import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

/**
 * Get a leaderboard with only the current user's friends (people they follow) + themselves.
 * Sorted by weekly XP.
 */
export const GET = apiHandler(async () => {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  // Get the user's following list
  const following = await db.follow.findMany({
    where: { followerId: session.id },
    select: { followingId: true },
  });
  const friendIds = [...following.map((f) => f.followingId), session.id];

  if (friendIds.length === 0) {
    return ok({ entries: [], count: 0 });
  }

  const entries = await db.leaderboardEntry.findMany({
    where: { userId: { in: friendIds } },
    include: {
      user: {
        select: { id: true, name: true, streak: true, level: true, league: true },
      },
    },
    orderBy: { weeklyXp: "desc" },
  });

  const ranked = entries.map((e, i) => ({
    rank: i + 1,
    userId: e.user.id,
    name: e.user.name,
    streak: e.user.streak,
    level: e.user.level,
    league: e.user.league,
    weeklyXp: e.weeklyXp,
    totalXp: e.totalXp,
    isMe: e.user.id === session.id,
  }));

  return ok({ entries: ranked, count: ranked.length });
});
