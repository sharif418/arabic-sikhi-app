import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

/**
 * Hash a password using scrypt (Node built-in — no external deps).
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const salt = randomBytes(16).toString("hex");
      const hash = scryptSync(password, salt, 64).toString("hex");
      resolve(`${salt}:${hash}`);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Verify a password against a stored "salt:hash" string.
 */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const hashBuf = Buffer.from(hash, "hex");
    const testBuf = scryptSync(password, salt, 64);
    return hashBuf.length === testBuf.length && timingSafeEqual(hashBuf, testBuf);
  } catch {
    return false;
  }
}

/**
 * Create a simple session token (signed-ish). For production you'd use
 * NextAuth / JWT lib, but this keeps the app self-contained.
 */
export function createSessionToken(userId: string): string {
  const payload = `${userId}.${Date.now()}.${randomBytes(8).toString("hex")}`;
  return Buffer.from(payload).toString("base64url");
}

export function parseSessionToken(token: string): { userId: string; ts: number } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [userId, ts] = decoded.split(".");
    if (!userId || !ts) return null;
    return { userId, ts: Number(ts) };
  } catch {
    return null;
  }
}
