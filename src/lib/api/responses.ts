import { NextResponse } from "next/server";

/** Standard JSON success response. */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

/** Standard JSON error response. */
export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { error: message, details },
    { status }
  );
}

/**
 * Wrap an async route handler with uniform error handling.
 * In production, raw error messages are NOT leaked to clients —
 * only a generic "Internal server error" is returned.
 * The actual error is logged server-side for debugging.
 *
 * Usage:
 *   export const GET = apiHandler(async (req: NextRequest) => { ... });
 *   export const POST = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => { ... });
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function apiHandler<T extends (...args: any[]) => Promise<Response>>(
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (err) {
      // Log the full error server-side
      console.error("[api] unhandled error:", err);

      // In production, never leak raw error messages to clients
      if (process.env.NODE_ENV === "production") {
        return fail("Internal server error", 500);
      }

      // In development, include the error message for easier debugging
      const message = err instanceof Error ? err.message : "Internal server error";
      return fail(message, 500);
    }
  }) as T;
}
