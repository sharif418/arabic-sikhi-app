import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

const signupSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const POST = apiHandler(async (req) => {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Invalid input", 422, parsed.error.flatten());
  }
  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return fail("Email already registered", 409);

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
    },
  });

  await db.leaderboardEntry.create({
    data: { userId: user.id, league: "Bronze" },
  });

  // Unlock the first lesson
  const firstLesson = await db.lesson.findFirst({
    orderBy: [{ unit: { order: "asc" } }, { order: "asc" }],
    include: { unit: true },
  });
  if (firstLesson) {
    await db.userProgress.create({
      data: { userId: user.id, lessonId: firstLesson.id, status: "available" },
    });
  }

  await createSession(user);

  return ok({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      gems: user.gems,
      xp: user.xp,
      totalXp: user.totalXp,
      level: user.level,
      streak: user.streak,
      league: user.league,
      hearts: user.hearts,
    },
  });
});
