import type { SessionUser } from "@/lib/types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { error?: string }).error ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  auth: {
    me: () => request<{ user: SessionUser | null }>("/api/auth/me"),
    login: (email: string, password: string) =>
      request<{ user: SessionUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    signup: (name: string, email: string, password: string) =>
      request<{ user: SessionUser }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      }),
    logout: () =>
      request<{ success: boolean }>("/api/auth/logout", { method: "POST" }),
  },
  courses: {
    list: () =>
      request<{ courses: import("@/lib/types").CourseSummary[] }>("/api/courses"),
    get: (slug: string) =>
      request<{ course: import("@/lib/types").CourseSummary }>(
        `/api/courses?slug=${slug}`
      ),
  },
  lessons: {
    get: (id: string) =>
      request<{
        lesson: {
          id: string;
          title: string;
          titleBn: string;
          description: string;
          type: string;
          xpReward: number;
          gemReward: number;
          icon: string;
          exercises: import("@/lib/types").Exercise[];
          unit: { id: string; titleBn: string; course: { id: string; titleBn: string; color: string; slug: string } };
          progress: import("@/lib/types").LessonProgress | null;
        };
      }>(`/api/lessons/${id}`),
    complete: (payload: {
      lessonId: string;
      score: number;
      stars: number;
      correctCount: number;
      totalCount: number;
    }) =>
      request<{
        progress: unknown;
        rewards: { xp: number; gems: number; stars: number };
        nextLessonId: string | null;
      }>("/api/lessons/complete", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
  vocabulary: {
    due: (mode = "due", category?: string) =>
      request<{
        mode: string;
        cards: Array<{
          id: string;
          arabic: string;
          transliteration: string;
          bangla: string;
          english: string;
          partOfSpeech?: string | null;
          category?: string | null;
          exampleArabic?: string | null;
          exampleBangla?: string | null;
          difficulty: number;
          isNew?: boolean;
          box?: number;
        }>;
        count: number;
      }>(`/api/vocabulary?mode=${mode}${category ? `&category=${category}` : ""}`),
    review: (vocabularyId: string, quality: number) =>
      request<{ updated: unknown; xpAwarded: number }>(
        "/api/vocabulary/review",
        { method: "POST", body: JSON.stringify({ vocabularyId, quality }) }
      ),
  },
  leaderboard: (league?: string) =>
    request<{
      league: string;
      entries: Array<{
        rank: number;
        userId: string;
        name: string;
        streak: number;
        level: number;
        weeklyXp: number;
        totalXp: number;
        isMe: boolean;
      }>;
      myRank: number | null;
      promotionZone: string[];
      demotionZone: string[];
    }>(`/api/leaderboard${league ? `?league=${league}` : ""}`),
  userStats: () =>
    request<{
      user: SessionUser;
      stats: {
        lessonsCompleted: number;
        totalStars: number;
        perfectLessons: number;
        vocabLearned: number;
        dueVocab: number;
        averageScore: number;
      };
      achievements: Array<{
        id: string;
        slug: string;
        title: string;
        titleBn: string;
        description: string;
        icon: string;
        color: string;
        unlockedAt: string;
      }>;
    }>("/api/user/stats"),
  achievements: () =>
    request<{
      achievements: Array<{
        id: string;
        slug: string;
        title: string;
        titleBn: string;
        description: string;
        descriptionBn: string;
        icon: string;
        color: string;
      }>;
    }>("/api/achievements"),
  ai: {
    tutor: (
      messages: Array<{ role: "user" | "assistant"; content: string }>,
      context?: { level?: number; currentLesson?: string }
    ) =>
      request<{ reply: string }>("/api/ai/tutor", {
        method: "POST",
        body: JSON.stringify({ messages, context }),
      }),
  },
  admin: {
    stats: () =>
      request<{
        totals: {
          users: number;
          lessons: number;
          vocab: number;
          completedLessons: number;
          lessonsToday: number;
          activeToday: number;
        };
        leagueDistribution: Array<{ league: string; _count: number }>;
        recentUsers: Array<{
          id: string;
          name: string;
          email: string;
          createdAt: string;
          league: string;
          totalXp: number;
        }>;
        courseProgress: Array<{ id: string; title: string; titleBn: string; slug: string; _count: { units: number } }>;
      }>("/api/admin/stats"),
  },
};
