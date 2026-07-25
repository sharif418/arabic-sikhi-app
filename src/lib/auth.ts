import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "crypto";

/**
 * Hash a password using scrypt (Node built-in — no external deps).
 * Uses a random 16-byte salt and 64-byte key length.
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
 * Uses timingSafeEqual to prevent timing attacks.
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
 * Get the server secret for HMAC signing.
 * Falls back to a dev-only secret if not configured (with a warning).
 */
function getServerSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET environment variable must be set in production");
    }
    // Dev-only fallback — NOT secure for production
    console.warn("⚠️ SESSION_SECRET not set — using insecure dev fallback. Set SESSION_SECRET in production!");
    return "dev-only-insecure-secret-DO-NOT-USE-IN-PRODUCTION";
  }
  return secret;
}

/**
 * Create a cryptographically signed session token using HMAC-SHA256.
 * Format: base64url(payload).base64url(signature)
 * The payload contains userId, timestamp, and random nonce.
 * The signature prevents tampering — if any byte changes, verification fails.
 */
export function createSessionToken(userId: string): string {
  const secret = getServerSecret();
  const payload = JSON.stringify({
    userId,
    ts: Date.now(),
    nonce: randomBytes(8).toString("hex"),
  });
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  const signature = createHmac("sha256", secret).update(payloadB64).digest("base64url");
  return `${payloadB64}.${signature}`;
}

/**
 * Parse and verify a session token's HMAC signature.
 * Returns the userId if valid, null if tampered or malformed.
 */
export function parseSessionToken(token: string): { userId: string; ts: number } | null {
  try {
    const secret = getServerSecret();
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    // Verify the HMAC signature
    const expectedSignature = createHmac("sha256", secret).update(payloadB64).digest("base64url");
    const sigBuf = Buffer.from(signature, "base64url");
    const expectedBuf = Buffer.from(expectedSignature, "base64url");

    // Timing-safe comparison to prevent timing attacks
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    // Signature is valid — parse the payload
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (!payload.userId || !payload.ts) return null;

    // Optional: enforce token expiry (30 days)
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
    if (Date.now() - payload.ts > maxAge) return null;

    return { userId: payload.userId, ts: payload.ts };
  } catch {
    return null;
  }
}
