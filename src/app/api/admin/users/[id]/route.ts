import { z } from "zod";
import { db } from "@/lib/db";
import { apiHandler, fail, ok } from "@/lib/api/responses";
import { requireAdmin } from "@/lib/api/admin-guard";

const updateUserSchema = z.object({
  role: z.enum(["user", "admin"]).optional(),
  league: z.string().optional(),
  gems: z.number().int().min(0).optional(),
  xp: z.number().int().min(0).optional(),
  resetProgress: z.boolean().optional(),
});

export const PUT = apiHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid input", 422, parsed.error.flatten());

  const existing = await db.user.findUnique({ where: { id } });
  if (!existing) return fail("User not found", 404);

  const { resetProgress, ...updates } = parsed.data;

  // Prevent self-demotion (last admin safeguard)
  if (existing.role === "admin" && updates.role === "user") {
    const adminCount = await db.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) return fail("Cannot demote the last admin", 400);
  }

  if (resetProgress) {
    await db.userProgress.deleteMany({ where: { userId: id } });
    await db.userVocabulary.deleteMany({ where: { userId: id } });
    await db.userAchievement.deleteMany({ where: { userId: id } });
    updates.xp = 0;
    updates.gems = existing.gems; // keep gems
  }

  const user = await db.user.update({ where: { id }, data: updates });
  return ok({ user: { id: user.id, name: user.name, role: user.role } });
});

export const DELETE = apiHandler(async (_req, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const existing = await db.user.findUnique({ where: { id } });
  if (!existing) return fail("User not found", 404);
  if (existing.role === "admin") {
    const adminCount = await db.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) return fail("Cannot delete the last admin", 400);
  }

  await db.user.delete({ where: { id } });
  return ok({ success: true });
});
