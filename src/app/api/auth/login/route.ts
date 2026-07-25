import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const POST = apiHandler(async (req) => {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid input", 422);

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return fail("Invalid credentials", 401);

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return fail("Invalid credentials", 401);

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
