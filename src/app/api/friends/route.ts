import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

/**
 * Get the current user's friends (people they follow) + followers count.
 * Returns: following list (with stats), followers count, following count.
 */
export const GET = apiHandler(async () => {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  const [following, followersCount, followingCount] = await Promise.all([
    db.follow.findMany({
      where: { followerId: session.id },
      include: {
        following: {
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
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.follow.count({ where: { followingId: session.id } }),
    db.follow.count({ where: { followerId: session.id } }),
  ]);

  return ok({
    following: following.map((f) => ({
      id: f.following.id,
      name: f.following.name,
      league: f.following.league,
      streak: f.following.streak,
      level: f.following.level,
      totalXp: f.following.totalXp,
      avatar: f.following.avatar,
      lastActiveDate: f.following.lastActiveDate,
      followedAt: f.createdAt,
    })),
    followersCount,
    followingCount,
  });
});
