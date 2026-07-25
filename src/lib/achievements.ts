import { db } from "@/lib/db";

/**
 * Achievement requirement types:
 * - lessons-completed: total completed lessons >= value
 * - streak: current streak >= value
 * - gems: current gems >= value
 * - level: current level >= value
 * - vocab-learned: learned vocabulary count >= value
 * - perfect-lesson: lessons with 3 stars >= value
 */

type Requirement =
  | { type: "lessons-completed"; value: number }
  | { type: "streak"; value: number }
  | { type: "gems"; value: number }
  | { type: "level"; value: number }
  | { type: "vocab-learned"; value: number }
  | { type: "perfect-lesson"; value: number };

export interface AchievementCheckResult {
  /** Slugs of newly unlocked achievements. */
  unlocked: Array<{
    slug: string;
    titleBn: string;
    icon: string;
    color: string;
  }>;
}

/**
 * Evaluate all achievements for a user and unlock any newly-earned ones.
 * Returns the list of newly unlocked achievements (for toast notifications).
 */
export async function checkAndUnlockAchievements(userId: string): Promise<AchievementCheckResult> {
  // Gather user stats needed for evaluation
  const [user, progressCount, perfectCount, vocabCount] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { streak: true, gems: true, level: true },
    }),
    db.userProgress.count({ where: { userId, status: "completed" } }),
    db.userProgress.count({ where: { userId, status: "completed", stars: 3 } }),
    db.userVocabulary.count({ where: { userId } }),
  ]);

  if (!user) return { unlocked: [] };

  const stats = {
    "lessons-completed": progressCount,
    streak: user.streak,
    gems: user.gems,
    level: user.level,
    "vocab-learned": vocabCount,
    "perfect-lesson": perfectCount,
  };

  // Get all achievements + already-unlocked slugs
  const [allAchievements, alreadyUnlocked] = await Promise.all([
    db.achievement.findMany(),
    db.userAchievement.findMany({
      where: { userId },
      select: { achievement: { select: { slug: true } } },
    }),
  ]);

  const unlockedSlugs = new Set(alreadyUnlocked.map((u) => u.achievement.slug));
  const newlyUnlocked: AchievementCheckResult["unlocked"] = [];

  for (const ach of allAchievements) {
    if (unlockedSlugs.has(ach.slug)) continue;

    let req: Requirement;
    try {
      req = JSON.parse(ach.requirement);
    } catch {
      continue;
    }

    const currentValue = stats[req.type];
    if (currentValue === undefined) continue;

    if (currentValue >= req.value) {
      // Unlock it
      await db.userAchievement.create({
        data: { userId, achievementId: ach.id },
      });
      newlyUnlocked.push({
        slug: ach.slug,
        titleBn: ach.titleBn,
        icon: ach.icon,
        color: ach.color,
      });

      // Bonus gems for unlocking an achievement
      await db.user.update({
        where: { id: userId },
        data: { gems: { increment: 10 } },
      });
    }
  }

  return { unlocked: newlyUnlocked };
}
