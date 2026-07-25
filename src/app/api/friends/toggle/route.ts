import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { apiHandler, fail, ok } from "@/lib/api/responses";

const toggleSchema = z.object({
  targetUserId: z.string().min(1),
});

/**
 * Toggle follow/unfollow for a target user.
 * Returns the new follow status.
 */
export const POST = apiHandler(async (req) => {
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  const body = await req.json().catch(() => null);
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid input", 422, parsed.error.flatten());

  const { targetUserId } = parsed.data;

  // Can't follow yourself
  if (targetUserId === session.id) return fail("Cannot follow yourself", 400);

  // Verify target user exists
  const target = await db.user.findUnique({ where: { id: targetUserId }, select: { id: true, name: true } });
  if (!target) return fail("User not found", 404);

  // Check if already following
  const existing = await db.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.id,
        followingId: targetUserId,
      },
    },
  });

  if (existing) {
    // Unfollow
    await db.follow.delete({ where: { id: existing.id } });
    return ok({ following: false, targetName: target.name });
  } else {
    // Follow
    await db.follow.create({
      data: {
        followerId: session.id,
        followingId: targetUserId,
      },
    });
    return ok({ following: true, targetName: target.name });
  }
});
