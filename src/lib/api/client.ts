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
        achievementsUnlocked?: Array<{ slug: string; titleBn: string; icon: string; color: string }>;
      }>("/api/lessons/complete", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    search: (q: string) =>
      request<{
        results: Array<{
          id: string;
          title: string;
          titleBn: string;
          description: string;
          type: string;
          xpReward: number;
          gemReward: number;
          icon: string;
          order: number;
          course: { id: string; titleBn: string; icon: string; color: string; slug: string };
          unit: { id: string; titleBn: string };
          progress: { status: string; stars: number; score: number };
          contentMatches?: Array<{ field: string; value: string }>;
          matchType?: "title" | "content";
        }>;
        count: number;
      }>(`/api/lessons/search?q=${encodeURIComponent(q)}`),
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
    browse: (params?: { q?: string; category?: string; page?: number; limit?: number }) => {
      const sp = new URLSearchParams();
      sp.set("mode", "browse");
      if (params?.q) sp.set("q", params.q);
      if (params?.category) sp.set("category", params.category);
      if (params?.page) sp.set("page", String(params.page));
      if (params?.limit) sp.set("limit", String(params.limit));
      return request<{
        mode: string;
        cards: Array<{
          id: string;
          arabic: string;
          transliteration: string;
          bangla: string;
          english: string;
          partOfSpeech: string | null;
          category: string | null;
          exampleArabic: string | null;
          exampleBangla: string | null;
          difficulty: number;
          learned: boolean;
          box: number;
        }>;
        total: number;
        page: number;
        totalPages: number;
        categories: string[];
      }>(`/api/vocabulary?${sp.toString()}`);
    },
    review: (vocabularyId: string, quality: number) =>
      request<{ updated: unknown; xpAwarded: number; achievementsUnlocked?: Array<{ slug: string; titleBn: string; icon: string; color: string }> }>(
        "/api/vocabulary/review",
        { method: "POST", body: JSON.stringify({ vocabularyId, quality }) }
      ),
    add: (vocabularyId: string) =>
      request<{ alreadyAdded: boolean; userVocab: unknown }>("/api/vocabulary/add", {
        method: "POST",
        body: JSON.stringify({ vocabularyId }),
      }),
    wordOfDay: () =>
      request<{
        word: {
          id: string; arabic: string; transliteration: string; bangla: string;
          english: string; partOfSpeech: string | null; category: string | null;
          exampleArabic: string | null; exampleBangla: string | null; difficulty: number;
        };
        learned: boolean;
        box: number;
        dayOfYear: number;
      }>("/api/vocabulary/word-of-day"),
    categories: () =>
      request<{
        categories: Array<{ category: string; total: number; learned: number; pct: number }>;
        totalWords: number;
        totalLearned: number;
        overallPct: number;
      }>("/api/vocabulary/categories"),
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
  leaderboardFriends: () =>
    request<{
      entries: Array<{
        rank: number;
        userId: string;
        name: string;
        streak: number;
        level: number;
        league: string;
        weeklyXp: number;
        totalXp: number;
        isMe: boolean;
      }>;
      count: number;
    }>("/api/leaderboard/friends"),
  friends: {
    list: () =>
      request<{
        following: Array<{
          id: string;
          name: string;
          league: string;
          streak: number;
          level: number;
          totalXp: number;
          avatar: string | null;
          lastActiveDate: string | null;
          followedAt: string;
        }>;
        followersCount: number;
        followingCount: number;
      }>("/api/friends"),
    suggestions: (q?: string) =>
      request<{
        suggestions: Array<{
          id: string;
          name: string;
          league: string;
          streak: number;
          level: number;
          totalXp: number;
          avatar: string | null;
          lastActiveDate: string | null;
          followersCount: number;
        }>;
      }>(`/api/friends/suggestions${q ? `?q=${encodeURIComponent(q)}` : ""}`),
    toggle: (targetUserId: string) =>
      request<{ following: boolean; targetName: string }>("/api/friends/toggle", {
        method: "POST",
        body: JSON.stringify({ targetUserId }),
      }),
    feed: () =>
      request<{
        activities: Array<{
          id: string;
          type: "lesson" | "vocab";
          userId: string;
          userName: string;
          userLeague: string;
          userAvatar: string | null;
          timestamp: string;
          details: {
            lessonTitleBn?: string;
            lessonIcon?: string;
            xpReward?: number;
            stars?: number;
            arabicWord?: string;
            banglaMeaning?: string;
          };
        }>;
        count: number;
      }>("/api/friends/feed"),
  },
  dailyChallenge: {
    get: () =>
      request<{
        challengeId: string;
        date: string;
        questions: Array<{
          wordId: string;
          arabic: string;
          transliteration: string;
          correctAnswer: string;
          options: string[];
          category: string | null;
        }>;
        completed: boolean;
        rewards: { xp: number; gems: number; bonus: string };
      }>("/api/daily-challenge"),
    complete: (correctCount: number, totalCount: number) =>
      request<{ success: boolean; rewards: { xp: number; gems: number }; accuracy: number }>(
        "/api/daily-challenge",
        { method: "POST", body: JSON.stringify({ correctCount, totalCount }) }
      ),
  },
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
  activity: (weeks = 12) =>
    request<{
      weeks: Array<Array<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }>>;
      totalCompletions: number;
      activeDays: number;
      todayCount: number;
      streak: number;
      startDate: string;
      endDate: string;
    }>(`/api/user/activity?weeks=${weeks}`),
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

    analytics: (days = 14) =>
      request<{
        xpTrend: Array<{
          date: string; day: string; label: string;
          completions: number; avgScore: number; avgStars: number; index: number;
        }>;
        dauTrend: Array<{ date: string; activeUsers: number }>;
        leagueDistribution: Array<{ league: string; _count: number }>;
        courseCompletion: Array<{
          id: string; titleBn: string; icon: string; color: string;
          totalLessons: number; completions: number;
        }>;
        summary: {
          totalUsers: number;
          totalCompletions: number;
          avgScore: number;
          perfectLessons: number;
          currCompletions: number;
          prevCompletions: number;
          completionsDelta: number;
        };
      }>(`/api/admin/analytics?days=${days}`),

    leagueReset: () =>
      request<{
        success: boolean;
        promotions: number;
        demotions: number;
        details: {
          promotions: Array<{ userId: string; name: string; from: string; to: string }>;
          demotions: Array<{ userId: string; name: string; from: string; to: string }>;
        };
      }>("/api/admin/league-reset", { method: "POST" }),

    // Vocabulary CRUD
    vocabulary: {
      list: (params?: { q?: string; category?: string; page?: number; limit?: number }) => {
        const sp = new URLSearchParams();
        if (params?.q) sp.set("q", params.q);
        if (params?.category) sp.set("category", params.category);
        if (params?.page) sp.set("page", String(params.page));
        if (params?.limit) sp.set("limit", String(params.limit));
        const qs = sp.toString();
        return request<{
          words: Array<{
            id: string;
            arabic: string;
            transliteration: string;
            bangla: string;
            english: string;
            partOfSpeech: string | null;
            category: string | null;
            exampleArabic: string | null;
            exampleBangla: string | null;
            difficulty: number;
            createdAt: string;
          }>;
          total: number;
          page: number;
          totalPages: number;
          categories: string[];
        }>(`/api/admin/vocabulary${qs ? `?${qs}` : ""}`);
      },
      create: (data: {
        arabic: string; transliteration: string; bangla: string; english: string;
        partOfSpeech?: string | null; category?: string | null;
        exampleArabic?: string | null; exampleBangla?: string | null;
        difficulty?: number;
      }) => request<{ word: unknown }>("/api/admin/vocabulary", {
        method: "POST", body: JSON.stringify(data),
      }),
      update: (id: string, data: Record<string, unknown>) =>
        request<{ word: unknown }>(`/api/admin/vocabulary/${id}`, {
          method: "PUT", body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        request<{ success: boolean }>(`/api/admin/vocabulary/${id}`, { method: "DELETE" }),
    },

    // Lessons CRUD
    lessons: {
      list: (params?: { unitId?: string; courseId?: string; page?: number; limit?: number }) => {
        const sp = new URLSearchParams();
        if (params?.unitId) sp.set("unitId", params.unitId);
        if (params?.courseId) sp.set("courseId", params.courseId);
        if (params?.page) sp.set("page", String(params.page));
        if (params?.limit) sp.set("limit", String(params.limit));
        const qs = sp.toString();
        return request<{
          lessons: Array<{
            id: string; unitId: string; title: string; titleBn: string; description: string;
            type: string; xpReward: number; gemReward: number; icon: string; order: number;
            exercises: unknown[];
            unit: { id: string; titleBn: string; courseId: string; course: { titleBn: string } };
          }>;
          total: number;
          page: number;
          totalPages: number;
          units: Array<{ id: string; titleBn: string; course: { id: string; titleBn: string; slug: string; icon: string } }>;
        }>(`/api/admin/lessons${qs ? `?${qs}` : ""}`);
      },
      create: (data: {
        unitId: string; title: string; titleBn: string; description?: string;
        type?: string; xpReward?: number; gemReward?: number; icon?: string;
        exercises?: unknown[];
      }) => request<{ lesson: unknown }>("/api/admin/lessons", {
        method: "POST", body: JSON.stringify(data),
      }),
      update: (id: string, data: Record<string, unknown>) =>
        request<{ lesson: unknown }>(`/api/admin/lessons/${id}`, {
          method: "PUT", body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        request<{ success: boolean }>(`/api/admin/lessons/${id}`, { method: "DELETE" }),
    },

    // Users management
    users: {
      list: (params?: { q?: string; role?: string; page?: number; limit?: number }) => {
        const sp = new URLSearchParams();
        if (params?.q) sp.set("q", params.q);
        if (params?.role) sp.set("role", params.role);
        if (params?.page) sp.set("page", String(params.page));
        if (params?.limit) sp.set("limit", String(params.limit));
        const qs = sp.toString();
        return request<{
          users: Array<{
            id: string; name: string; email: string; role: string; createdAt: string;
            league: string; totalXp: number; level: number; streak: number; gems: number;
            lessonsCompleted: number;
          }>;
          total: number;
          page: number;
          totalPages: number;
        }>(`/api/admin/users${qs ? `?${qs}` : ""}`);
      },
      update: (id: string, data: { role?: string; league?: string; gems?: number; xp?: number; resetProgress?: boolean }) =>
        request<{ user: { id: string; name: string; role: string } }>(`/api/admin/users/${id}`, {
          method: "PUT", body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        request<{ success: boolean }>(`/api/admin/users/${id}`, { method: "DELETE" }),
    },
  },
};
