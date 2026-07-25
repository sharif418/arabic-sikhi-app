"use client";

/**
 * Error boundary for route segments.
 * Catches unhandled errors in the current route segment and shows a friendly fallback.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 px-6 gradient-hero">
      <div className="text-6xl animate-float">😵</div>
      <div className="text-center">
        <h2 className="font-bengali text-xl font-extrabold">কিছু সমস্যা হয়েছে</h2>
        <p className="font-bengali text-sm text-muted-foreground mt-1">
          অপ্রত্যাশিত একটি ত্রুটি ঘটেছে। আবার চেষ্টা করুন।
        </p>
        {process.env.NODE_ENV === "development" && (
          <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs text-destructive font-mono">
            {error.message}
          </p>
        )}
      </div>
      <button
        onClick={reset}
        className="rounded-xl gradient-emerald text-primary-foreground font-bold px-6 py-3 tap-scale shadow-glow-emerald"
      >
        আবার চেষ্টা করুন
      </button>
    </div>
  );
}
