import { cookies } from "next/headers";
import { db } from "./db";
import { createSessionToken, parseSessionToken } from "./auth";

export const SESSION_COOKIE = "as_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

/** Create a session for a user and set the cookie. Call in a Server Action / route handler. */
export async function createSession(user: { id: string }) {
  const token = createSessionToken(user.id);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return token;
}

/** Get the current session user from the cookie. Returns null if not authed. */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const parsed = parseSessionToken(token);
    if (!parsed) return null;
    const user = await db.user.findUnique({
      where: { id: parsed.userId },
      select: { id: true, email: true, name: true, role: true },
    });
    return user ?? null;
  } catch {
    return null;
  }
}

/** Clear the session cookie. */
export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
