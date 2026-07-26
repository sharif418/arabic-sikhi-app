import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, ok } from "@/lib/api/responses";

/**
 * Search lessons by title, description, OR exercise content (Arabic words,
 * Bengali meanings, English translations) across all courses.
 * Returns matching lessons with their unit/course info, progress, and
 * a list of matching exercise snippets for context.
 */
export const GET = apiHandler(async (req) => {
  const session = await getSessionUser();
  const userId = session?.id;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return ok({ results: [], count: 0 });
  }

  // Fetch ALL lessons (limited set — 48 lessons) so we can search
  // within the exercisesJson field (SQLite doesn't support JSON search)
  const allLessons = await db.lesson.findMany({
    include: {
      unit: {
        include: {
          course: {
            select: { id: true, titleBn: true, icon: true, color: true, slug: true },
          },
        },
      },
      progress: userId
        ? { where: { userId }, select: { status: true, stars: true, score: true } }
        : false,
    },
    orderBy: [{ unit: { course: { order: "asc" } } }, { unit: { order: "asc" } }, { order: "asc" }],
  });

  // Filter: match on title, titleBn, description, OR exercise content
  const results = allLessons
    .map((l) => {
      // Parse exercises to search within content
      let exercises: Array<Record<string, unknown>> = [];
      try {
        exercises = JSON.parse(l.exercisesJson) as Array<Record<string, unknown>>;
      } catch {
        // If JSON is invalid, skip exercise search
      }

      // Check title/description match
      const titleMatch =
        l.title.toLowerCase().includes(q.toLowerCase()) ||
        l.titleBn.includes(q) ||
        l.description.includes(q);

      // Check exercise content match
      const exerciseMatches: Array<{ field: string; value: string }> = [];
      if (!titleMatch) {
        for (const ex of exercises) {
          // Search in all string fields of the exercise
          for (const [key, val] of Object.entries(ex)) {
            if (typeof val === "string" && val.toLowerCase().includes(q.toLowerCase())) {
              exerciseMatches.push({ field: key, value: val });
            }
            // Also search in arrays (options, tokens, etc.)
            if (Array.isArray(val)) {
              for (const item of val) {
                if (typeof item === "string" && item.toLowerCase().includes(q.toLowerCase())) {
                  exerciseMatches.push({ field: key, value: item });
                }
                // Search in pair objects {left, right}
                if (item && typeof item === "object" && !Array.isArray(item)) {
                  const obj = item as Record<string, unknown>;
                  for (const [k, v] of Object.entries(obj)) {
                    if (typeof v === "string" && v.toLowerCase().includes(q.toLowerCase())) {
                      exerciseMatches.push({ field: `${key}.${k}`, value: v });
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (!titleMatch && exerciseMatches.length === 0) return null;

      const prog = l.progress?.[0];
      return {
        id: l.id,
        title: l.title,
        titleBn: l.titleBn,
        description: l.description,
        type: l.type,
        xpReward: l.xpReward,
        gemReward: l.gemReward,
        icon: l.icon,
        order: l.order,
        course: l.unit.course,
        unit: { id: l.unit.id, titleBn: l.unit.titleBn },
        progress: prog
          ? { status: prog.status, stars: prog.stars, score: prog.score }
          : { status: "locked", stars: 0, score: 0 },
        // Include up to 3 matching exercise snippets for context
        contentMatches: exerciseMatches.slice(0, 3),
        matchType: titleMatch ? "title" : "content",
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .slice(0, 30);

  return ok({ results, count: results.length });
});
