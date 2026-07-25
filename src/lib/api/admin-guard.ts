import { getSessionUser } from "@/lib/session";
import { fail } from "@/lib/api/responses";
import type { SessionUser } from "@/lib/types";

/** Returns the session user if they are an admin, otherwise a 403 response tuple. */
export async function requireAdmin(): Promise<
  { ok: true; user: SessionUser } | { ok: false; response: Response }
> {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    const { NextResponse } = await import("next/server");
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true, user: session };
}
