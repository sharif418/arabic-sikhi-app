import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, ok } from "@/lib/api/responses";

export const GET = apiHandler(async () => {
  const session = await getSessionUser();
  if (!session) return ok({ user: null });

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      gems: true,
      xp: true,
      totalXp: true,
      level: true,
      streak: true,
      lastActiveDate: true,
      league: true,
      hearts: true,
    },
  });

  return ok({ user });
});
