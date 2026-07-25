"use client";

/**
 * Global error boundary — catches errors that error.tsx cannot,
 * such as errors thrown in the root layout itself.
 * This component replaces the entire <html> document.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="bn">
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "1rem",
          padding: "1.5rem",
          fontFamily: "system-ui, sans-serif",
          background: "oklch(0.985 0.012 95)",
          color: "oklch(0.26 0.04 165)",
        }}
      >
        <div style={{ fontSize: "3rem" }}>😵</div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
            গুরুতর ত্রুটি
          </h2>
          <p style={{ fontSize: "0.875rem", color: "oklch(0.5 0.03 165)", marginTop: "0.25rem" }}>
            অ্যাপ্লিকেশনে একটি গুরুতর সমস্যা ঘটেছে। পেজ রিফ্রেশ করুন।
          </p>
        </div>
        <button
          onClick={reset}
          style={{
            borderRadius: "0.75rem",
            background: "oklch(0.45 0.12 165)",
            color: "white",
            fontWeight: 700,
            padding: "0.75rem 1.5rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          আবার চেষ্টা করুন
        </button>
      </body>
    </html>
  );
}
