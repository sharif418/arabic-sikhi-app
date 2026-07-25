import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

/**
 * Get the user's daily activity history for a GitHub-style contribution heatmap.
 * Returns the last `weeks` weeks of daily lesson completion counts.
 * Also includes streak days (based on lastActiveDate) for the heatmap.
 */
export const GET = apiHandler(async (req) => {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  const url = new URL(req.url);
  const weeks = Math.min(20, Math.max(4, Number(url.searchParams.get("weeks") ?? 12)));

  const now = new Date();
  now.setHours(23, 59, 59, 999);

  // Start from `weeks` weeks ago, aligned to Saturday (start of week in our calendar)
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - (weeks * 7 - 1));
  startDate.setHours(0, 0, 0, 0);
  // Align to Saturday: getDay() returns 0=Sun, 6=Sat. We want to go back to the most recent Saturday.
  const dayOfWeek = startDate.getDay();
  const daysToSaturday = (dayOfWeek + 1) % 7; // Sat=6 → 0, Sun=0 → 1, Mon=1 → 2, ... Fri=5 → 6
  startDate.setDate(startDate.getDate() - daysToSaturday);

  // Fetch all completed lessons in the range
  const completions = await db.userProgress.findMany({
    where: {
      userId: session.id,
      status: "completed",
      completedAt: { gte: startDate, lte: now },
    },
    select: { completedAt: true },
  });

  // Count completions per day
  const dayMap = new Map<string, number>();
  for (const c of completions) {
    if (!c.completedAt) continue;
    const key = c.completedAt.toISOString().slice(0, 10);
    dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
  }

  // Also mark active days (lastActiveDate from user, for streak continuity)
  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { lastActiveDate: true, streak: true },
  });

  // Build the weeks array: each week is an array of 7 days (Sat-Fri)
  const totalDays = weeks * 7;
  const days: Array<{
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
  }> = [];

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const count = dayMap.get(key) ?? 0;

    // Determine intensity level (0-4)
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count >= 5) level = 4;
    else if (count >= 3) level = 3;
    else if (count >= 2) level = 2;
    else if (count >= 1) level = 1;

    days.push({ date: key, count, level });
  }

  // Group into weeks (7 days each)
  const weeksArray: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeksArray.push(days.slice(i, i + 7));
  }

  // Stats
  const totalCompletions = completions.length;
  const activeDays = dayMap.size;
  const today = now.toISOString().slice(0, 10);
  const todayCount = dayMap.get(today) ?? 0;

  return ok({
    weeks: weeksArray,
    totalCompletions,
    activeDays,
    todayCount,
    streak: user?.streak ?? 0,
    startDate: startDate.toISOString().slice(0, 10),
    endDate: today,
  });
});
