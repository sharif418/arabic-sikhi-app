import { z } from "zod";
import { db } from "@/lib/db";
import { apiHandler, fail, ok } from "@/lib/api/responses";
import { requireAdmin } from "@/lib/api/admin-guard";

const userQuerySchema = z.object({
  q: z.string().optional(),
  role: z.enum(["user", "admin"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const GET = apiHandler(async (req) => {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const parsed = userQuerySchema.safeParse({
    q: url.searchParams.get("q") ?? undefined,
    role: (url.searchParams.get("role") as "user" | "admin" | null) ?? undefined,
    page: url.searchParams.get("page") ?? "1",
    limit: url.searchParams.get("limit") ?? "20",
  });
  if (!parsed.success) return fail("Invalid query", 422, parsed.error.flatten());

  const { q, role, page, limit } = parsed.data;
  const where = {
    ...(q
      ? {
          OR: [{ name: { contains: q } }, { email: { contains: q } }],
        }
      : {}),
    ...(role ? { role } : {}),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        league: true,
        totalXp: true,
        level: true,
        streak: true,
        gems: true,
        _count: { select: { progress: { where: { status: "completed" } } } },
      },
    }),
    db.user.count({ where }),
  ]);

  return ok({
    users: users.map((u) => ({
      ...u,
      lessonsCompleted: u._count.progress,
      _count: undefined,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});
