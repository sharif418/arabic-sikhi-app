import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, ok } from "@/lib/api/responses";

export const GET = apiHandler(async (req) => {
  const url = new URL(req.url);
  const league = url.searchParams.get("league");

  const session = await getSessionUser();

  // If a league is specified, return that league's board; else user's league
  let targetLeague = league;
  if (!targetLeague && session) {
    const user = await db.user.findUnique({ where: { id: session.id }, select: { league: true } });
    targetLeague = user?.league ?? "Bronze";
  }
  if (!targetLeague) targetLeague = "Bronze";

  const entries = await db.leaderboardEntry.findMany({
    where: { league: targetLeague },
    include: { user: { select: { id: true, name: true, streak: true, level: true } } },
    orderBy: { weeklyXp: "desc" },
    take: 50,
  });

  const ranked = entries.map((e, i) => ({
    rank: i + 1,
    userId: e.user.id,
    name: e.user.name,
    streak: e.user.streak,
    level: e.user.level,
    weeklyXp: e.weeklyXp,
    totalXp: e.totalXp,
    isMe: session?.id === e.user.id,
  }));

  // Promotion zone (top 3) & demotion zone (bottom 3)
  const promotionZone = ranked.slice(0, 3).map((r) => r.userId);
  const demotionZone = ranked.slice(-3).map((r) => r.userId);

  return ok({
    league: targetLeague,
    entries: ranked,
    myRank: session ? ranked.find((r) => r.isMe)?.rank ?? null : null,
    promotionZone,
    demotionZone,
  });
});
