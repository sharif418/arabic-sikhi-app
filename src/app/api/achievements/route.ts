import { db } from "@/lib/db";
import { apiHandler, ok } from "@/lib/api/responses";

export const GET = apiHandler(async () => {
  const achievements = await db.achievement.findMany({
    orderBy: { createdAt: "asc" },
  });
  return ok({ achievements });
});
