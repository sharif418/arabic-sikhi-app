"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";

const CACHE_KEY = "as-offline-lessons";
const MAX_CACHED = 3;

interface CachedLesson {
  lessonId: string;
  titleBn: string;
  exercises: unknown[];
  cachedAt: number;
}

/**
 * Hook for pre-caching the next available lessons for offline use.
 * Fetches lesson data and stores it in localStorage so users can
 * access lessons even without a network connection.
 */
export function useOfflineLessons(availableLessonId: string | null) {
  const [cachedCount, setCachedCount] = useState(0);
  const [isCaching, setIsCaching] = useState(false);

  // Load cached count on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CachedLesson[];
        setCachedCount(parsed.length);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  // Pre-cache the available lesson + next lessons when it changes
  useEffect(() => {
    if (!availableLessonId) return;

    let active = true;
    setIsCaching(true);

    (async () => {
      try {
        // Fetch the current lesson
        const { lesson } = await api.lessons.get(availableLessonId);
        if (!active) return;

        // Load existing cache
        let cache: CachedLesson[] = [];
        try {
          const stored = localStorage.getItem(CACHE_KEY);
          if (stored) cache = JSON.parse(stored) as CachedLesson[];
        } catch {
          // Start fresh
        }

        // Add or update this lesson in cache
        const newEntry: CachedLesson = {
          lessonId: lesson.id,
          titleBn: lesson.titleBn,
          exercises: lesson.exercises,
          cachedAt: Date.now(),
        };

        // Remove existing entry for this lesson (if any)
        cache = cache.filter((c) => c.lessonId !== lesson.id);
        // Add new entry at the front
        cache.unshift(newEntry);

        // Try to fetch the next lesson too (if available from the response)
        // We don't have nextLessonId here, but the courses API gives us the path
        // For now, just cache the current lesson

        // Trim to max
        cache = cache.slice(0, MAX_CACHED);

        // Check localStorage quota (rough estimate: ~5MB limit)
        const serialized = JSON.stringify(cache);
        if (serialized.length < 4_000_000) {
          localStorage.setItem(CACHE_KEY, serialized);
          if (active) setCachedCount(cache.length);
        }
      } catch {
        // Network error or lesson not found — can't cache
      } finally {
        if (active) setIsCaching(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [availableLessonId]);

  /**
   * Get a cached lesson by ID (for offline use).
   * Returns null if not cached.
   */
  const getCachedLesson = (lessonId: string): CachedLesson | null => {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (!stored) return null;
      const cache = JSON.parse(stored) as CachedLesson[];
      return cache.find((c) => c.lessonId === lessonId) ?? null;
    } catch {
      return null;
    }
  };

  /**
   * Clear all cached lessons.
   */
  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    setCachedCount(0);
  };

  return { cachedCount, isCaching, getCachedLesson, clearCache };
}
