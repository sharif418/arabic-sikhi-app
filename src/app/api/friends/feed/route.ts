import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

/**
 * Get the activity feed for the current user's friends.
 * Returns recent lesson completions by people the user follows.
 */
export const GET = apiHandler(async () => {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  // Get the user's following list
  const following = await db.follow.findMany({
    where: { followerId: session.id },
    select: { followingId: true },
  });
  const followingIds = following.map((f) => f.followingId);

  if (followingIds.length === 0) {
    return ok({ activities: [], count: 0 });
  }

  // Get recent completions by followed users
  const recentCompletions = await db.userProgress.findMany({
    where: {
      userId: { in: followingIds },
      status: "completed",
      completedAt: { not: null },
    },
    include: {
      user: {
        select: { id: true, name: true, league: true, avatar: true },
      },
      lesson: {
        select: { id: true, titleBn: true, icon: true, xpReward: true },
      },
    },
    orderBy: { completedAt: "desc" },
    take: 20,
  });

  // Also get recent vocabulary reviews by followed users
  const recentVocabReviews = await db.userVocabulary.findMany({
    where: {
      userId: { in: followingIds },
      lastReviewed: { not: null },
    },
    include: {
      user: {
        select: { id: true, name: true, league: true, avatar: true },
      },
      vocabulary: {
        select: { id: true, arabic: true, bangla: true },
      },
    },
    orderBy: { lastReviewed: "desc" },
    take: 10,
  });

  // Merge and sort by timestamp
  type Activity = {
    id: string;
    type: "lesson" | "vocab";
    userId: string;
    userName: string;
    userLeague: string;
    userAvatar: string | null;
    timestamp: Date;
    details: {
      lessonTitleBn?: string;
      lessonIcon?: string;
      xpReward?: number;
      stars?: number;
      arabicWord?: string;
      banglaMeaning?: string;
    };
  };

  const activities: Activity[] = [];

  for (const c of recentCompletions) {
    if (!c.completedAt) continue;
    activities.push({
      id: c.id,
      type: "lesson",
      userId: c.user.id,
      userName: c.user.name,
      userLeague: c.user.league,
      userAvatar: c.user.avatar,
      timestamp: c.completedAt,
      details: {
        lessonTitleBn: c.lesson.titleBn,
        lessonIcon: c.lesson.icon,
        xpReward: c.lesson.xpReward,
        stars: c.stars,
      },
    });
  }

  for (const v of recentVocabReviews) {
    if (!v.lastReviewed) continue;
    activities.push({
      id: v.id,
      type: "vocab",
      userId: v.user.id,
      userName: v.user.name,
      userLeague: v.user.league,
      userAvatar: v.user.avatar,
      timestamp: v.lastReviewed,
      details: {
        arabicWord: v.vocabulary.arabic,
        banglaMeaning: v.vocabulary.bangla,
      },
    });
  }

  // Sort by timestamp desc and take 20
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const topActivities = activities.slice(0, 20);

  return ok({
    activities: topActivities.map((a) => ({
      ...a,
      timestamp: a.timestamp.toISOString(),
    })),
    count: topActivities.length,
  });
});
