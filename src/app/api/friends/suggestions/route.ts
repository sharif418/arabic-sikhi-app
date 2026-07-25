import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

/**
 * Get suggested learners to follow — users not already followed by the current user,
 * sorted by XP (most active first). Excludes self and admins.
 */
export const GET = apiHandler(async (req) => {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const limit = Math.min(30, Math.max(1, Number(url.searchParams.get("limit") ?? "10")));

  // Get IDs the user already follows
  const following = await db.follow.findMany({
    where: { followerId: session.id },
    select: { followingId: true },
  });
  const followingIds = following.map((f) => f.followingId);
  const excludeIds = [...followingIds, session.id];

  const where = {
    id: { notIn: excludeIds },
    role: "user", // Don't suggest admins
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : {}),
  };

  const suggestions = await db.user.findMany({
    where,
    orderBy: { totalXp: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      league: true,
      streak: true,
      level: true,
      totalXp: true,
      avatar: true,
      lastActiveDate: true,
    },
  });

  // Get follower counts for each suggested user
  const userIds = suggestions.map((s) => s.id);
  const followerCounts = await db.follow.groupBy({
    by: ["followingId"],
    where: { followingId: { in: userIds } },
    _count: true,
  });
  const countMap = new Map(followerCounts.map((c) => [c.followingId, c._count]));

  return ok({
    suggestions: suggestions.map((s) => ({
      ...s,
      followersCount: countMap.get(s.id) ?? 0,
    })),
  });
});
