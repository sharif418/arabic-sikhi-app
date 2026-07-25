import { db } from "@/lib/db";
import { apiHandler, fail, ok } from "@/lib/api/responses";
import { requireAdmin } from "@/lib/api/admin-guard";

const LEAGUE_ORDER = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Pearl"];

/**
 * Weekly league reset:
 * - Promote top 3 users in each league to the next league
 * - Demote bottom 3 users to the previous league
 * - Reset weeklyXp to 0 for all users
 * - Returns a summary of promotions/demotions
 *
 * This is a manual trigger (admin button). In production, a cron would call this weekly.
 */
export const POST = apiHandler(async () => {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const promotions: Array<{ userId: string; name: string; from: string; to: string }> = [];
  const demotions: Array<{ userId: string; name: string; from: string; to: string }> = [];

  for (const league of LEAGUE_ORDER) {
    const entries = await db.leaderboardEntry.findMany({
      where: { league },
      orderBy: { weeklyXp: "desc" },
      include: { user: { select: { id: true, name: true } } },
    });

    if (entries.length === 0) continue;

    const top3 = entries.slice(0, Math.min(3, entries.length));
    const bottom3 = entries.slice(-Math.min(3, entries.length));

    const nextLeague = LEAGUE_ORDER[LEAGUE_ORDER.indexOf(league) + 1];
    const prevLeague = LEAGUE_ORDER[LEAGUE_ORDER.indexOf(league) - 1];

    // Promote top 3 (if not already in top league)
    if (nextLeague) {
      for (const e of top3) {
        // Don't promote users with 0 weekly XP (inactive)
        if (e.weeklyXp === 0) continue;
        await db.leaderboardEntry.update({
          where: { userId: e.userId },
          data: { league: nextLeague, weeklyXp: 0 },
        });
        await db.user.update({
          where: { id: e.userId },
          data: { league: nextLeague },
        });
        promotions.push({
          userId: e.userId,
          name: e.user.name,
          from: league,
          to: nextLeague,
        });
      }
    }

    // Demote bottom 3 (if not already in lowest league)
    if (prevLeague) {
      for (const e of bottom3) {
        // Don't demote if already promoted
        if (promotions.some((p) => p.userId === e.userId)) continue;
        await db.leaderboardEntry.update({
          where: { userId: e.userId },
          data: { league: prevLeague, weeklyXp: 0 },
        });
        await db.user.update({
          where: { id: e.userId },
          data: { league: prevLeague },
        });
        demotions.push({
          userId: e.userId,
          name: e.user.name,
          from: league,
          to: prevLeague,
        });
      }
    }

    // Reset weeklyXp for remaining users in this league (those not promoted/demoted)
    const movedIds = new Set([
      ...promotions.map((p) => p.userId),
      ...demotions.map((d) => d.userId),
    ]);
    for (const e of entries) {
      if (!movedIds.has(e.userId) && e.weeklyXp !== 0) {
        await db.leaderboardEntry.update({
          where: { userId: e.userId },
          data: { weeklyXp: 0 },
        });
      }
    }
  }

  return ok({
    success: true,
    promotions: promotions.length,
    demotions: demotions.length,
    details: { promotions, demotions },
  });
});
