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

/** Wrap an async route handler with uniform error handling. */
export function apiHandler<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<Response>
) {
  return async (...args: TArgs): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      console.error("[api] unhandled error:", err);
      const message = err instanceof Error ? err.message : "Internal server error";
      return fail(message, 500);
    }
  };
}
