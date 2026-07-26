import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";

import { apiHandler, fail, ok } from "@/lib/api/responses";
import { rateLimit, getClientIP } from "@/lib/api/rate-limit";

const verifyOTPSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  name: z.string().min(2).max(60).optional(),
});

/**
 * Verify a 6-digit OTP code.
 * - If the user exists: marks email as verified, creates session (auto-login)
 * - If the user doesn't exist: creates a new account with the provided name, auto-login
 * - If the OTP is invalid/expired: returns error
 * - If too many failed attempts: deletes the OTP, requires re-request
 */
export const POST = apiHandler(async (req) => {
  // Rate limit: 5 verification attempts per 5 minutes per IP
  const ip = getClientIP(req);
  const limited = rateLimit(`verify:${ip}`, 5, 5 * 60 * 1000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const parsed = verifyOTPSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid input", 422, parsed.error.flatten());

  const { email, code, name } = parsed.data;

  // Find the OTP record
  const otpRecord = await db.emailOTP.findFirst({
    where: { email, code, verified: false },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    return fail("ভুল কোড। আবার চেষ্টা করুন।", 400);
  }

  // Check expiry
  if (otpRecord.expiresAt < new Date()) {
    await db.emailOTP.delete({ where: { id: otpRecord.id } });
    return fail("কোডের মেয়াদ শেষ হয়ে গেছে। নতুন কোড অনুরোধ করুন।", 400);
  }

  // Check attempts (max 5)
  if (otpRecord.attempts >= 5) {
    await db.emailOTP.delete({ where: { id: otpRecord.id } });
    return fail("অনেকবার ভুল কোড। নতুন কোড অনুরোধ করুন।", 429);
  }

  // Mark OTP as verified
  await db.emailOTP.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  // Find or create the user
  let user = await db.user.findUnique({ where: { email } });

  if (!user) {
    // Create new user (OTP-only — no password)
    user = await db.user.create({
      data: {
        email,
        name: name ?? email.split("@")[0],
        passwordHash: "", // Empty — OTP-only auth
        emailVerified: true,
      },
    });

    // Initialize leaderboard entry
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
  } else {
    // Mark existing user as verified
    user = await db.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });
  }

  // Create session (auto-login!)
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
      emailVerified: true,
    },
    message: "স্বাগতম! আপনি সফলভাবে লগইন করেছেন।",
  });
});
