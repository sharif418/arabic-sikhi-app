import { NextResponse } from "next/server";

/**
 * Simple in-memory rate limiter for API endpoints.
 * Tracks requests by IP address within a time window.
 *
 * Note: This is a basic implementation suitable for a single-server deployment.
 * For distributed deployments, use Redis-based rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limit a request. Returns null if allowed, or a 429 response if rate limited.
 *
 * @param identifier - Unique identifier (IP address or user ID)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns null if allowed, NextResponse(429) if rate limited
 */
export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): NextResponse | null {
  const now = Date.now();
  const existing = store.get(identifier);

  if (!existing || existing.resetAt < now) {
    // First request or window expired
    store.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return null;
  }

  existing.count++;
  if (existing.count > maxRequests) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "অনেকবার চেষ্টা করেছেন। কিছুক্ষণ পরে আবার চেষ্টা করুন।", retryAfter },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  return null;
}

/**
 * Get the client IP address from a request.
 * Falls back to "unknown" if headers are not available.
 */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  const realIP = req.headers.get("x-real-ip");
  if (realIP) return realIP;
  return "unknown";
}
