"use client";

import type { SVGProps } from "react";

/** Premium custom SVG icons for the gamification system. */

export function HeartIcon({
  filled = true,
  ...props
}: SVGProps<SVGSVGElement> & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 21s-7.5-4.8-10-9.3C.3 8.5 1.7 4.5 5.5 4.1c2.1-.2 3.7 1 4.5 2.3.8-1.3 2.4-2.5 4.5-2.3 3.8.4 5.2 4.4 3.5 7.6C19.5 16.2 12 21 12 21z"
        fill={filled ? "url(#heart-grad)" : "none"}
        stroke={filled ? "oklch(0.45 0.18 25)" : "currentColor"}
        strokeWidth={filled ? 0.8 : 1.6}
        strokeLinejoin="round"
      />
      {filled && (
        <defs>
          <linearGradient id="heart-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.7 0.22 25)" />
            <stop offset="100%" stopColor="oklch(0.52 0.2 22)" />
          </linearGradient>
        </defs>
      )}
      {filled && (
        <path
          d="M8 9.5c0-1 .6-1.8 1.4-2"
          stroke="white"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.6"
        />
      )}
    </svg>
  );
}

export function GemIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="gem-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.85 0.13 85)" />
          <stop offset="50%" stopColor="oklch(0.72 0.14 70)" />
          <stop offset="100%" stopColor="oklch(0.6 0.12 55)" />
        </linearGradient>
      </defs>
      <path
        d="M6 3h12l3 5-9 13L3 8l3-5z"
        fill="url(#gem-grad)"
        stroke="oklch(0.5 0.1 55)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path d="M3 8h18M9 3l-3 5 6 13 6-13-3-5M9 3l3 5 3-5" stroke="oklch(0.4 0.08 55)" strokeWidth="0.6" opacity="0.5" />
      <path d="M10 8l2-5 2 5" stroke="white" strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
}

export function StreakIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="streak-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.82 0.16 70)" />
          <stop offset="50%" stopColor="oklch(0.7 0.2 45)" />
          <stop offset="100%" stopColor="oklch(0.55 0.22 25)" />
        </linearGradient>
      </defs>
      <path
        d="M13 2c1 3.5-1.5 5.5-3 7.5C8.3 11.8 8 14 9.5 16c-3-1-5-3.5-4.5-7 .3-2.2 2-4 3.5-5.5C9.5 2.3 11 1.5 13 2zM14 11c2.5 1.5 4 4 3.5 7-.4 2.2-2.3 4-4.5 4.5-2.8.6-5.2-1-6-3.5 1.8.8 3.8.3 5-1.2 1.3-1.6 1.5-3.8 0-5.8-.8-1-1-2.2 0-3.5z"
        fill="url(#streak-grad)"
        stroke="oklch(0.45 0.18 25)"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function XpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="xp-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.7 0.14 162)" />
          <stop offset="100%" stopColor="oklch(0.5 0.12 185)" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l2.5 5.5L20 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 2z"
        fill="url(#xp-grad)"
        stroke="oklch(0.4 0.1 165)"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CrownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="crown-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.88 0.14 88)" />
          <stop offset="100%" stopColor="oklch(0.68 0.13 65)" />
        </linearGradient>
      </defs>
      <path
        d="M3 8l4 3 5-6 5 6 4-3-2 10H5L3 8z"
        fill="url(#crown-grad)"
        stroke="oklch(0.5 0.1 65)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="5" r="1.2" fill="oklch(0.5 0.1 65)" />
      <circle cx="3" cy="8" r="1" fill="oklch(0.5 0.1 65)" />
      <circle cx="21" cy="8" r="1" fill="oklch(0.5 0.1 65)" />
    </svg>
  );
}

export function StarIcon({
  filled = true,
  ...props
}: SVGProps<SVGSVGElement> & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="star-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.9 0.14 88)" />
          <stop offset="100%" stopColor="oklch(0.7 0.15 65)" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l2.6 6.3 6.8.5-5.2 4.4 1.7 6.6L12 16.9 6.1 19.8l1.7-6.6L2.6 8.8l6.8-.5L12 2z"
        fill={filled ? "url(#star-grad)" : "none"}
        stroke={filled ? "oklch(0.5 0.1 65)" : "currentColor"}
        strokeWidth={filled ? 0.7 : 1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor" opacity="0.15" />
      <path
        d="M8 11V8a4 4 0 1 1 8 0v3M7 11h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="15.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function TrophyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="trophy-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.88 0.14 88)" />
          <stop offset="100%" stopColor="oklch(0.65 0.13 60)" />
        </linearGradient>
      </defs>
      <path
        d="M7 4h10v3a5 5 0 0 1-10 0V4z"
        fill="url(#trophy-grad)"
        stroke="oklch(0.5 0.1 60)"
        strokeWidth="0.7"
      />
      <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" stroke="oklch(0.5 0.1 60)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M10 12h4l-.5 3h1.5v2H9v-2h1.5L10 12z" fill="url(#trophy-grad)" stroke="oklch(0.5 0.1 60)" strokeWidth="0.7" strokeLinejoin="round" />
      <rect x="8" y="17" width="8" height="2.5" rx="1" fill="oklch(0.5 0.1 60)" />
    </svg>
  );
}
