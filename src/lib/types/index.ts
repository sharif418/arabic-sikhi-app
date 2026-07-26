export type Exercise =
  | {
      type: "multiple-choice";
      prompt: string;
      promptBn?: string;
      arabic?: string;
      audio?: string;
      options: string[];
      answer: number;
      hint?: string;
    }
  | {
      type: "match-pairs";
      prompt: string;
      promptBn?: string;
      pairs: { left: string; right: string }[];
    }
  | {
      type: "build-sentence";
      prompt: string;
      promptBn?: string;
      tokens: string[];
      answer: string;
    }
  | {
      type: "fill-blank";
      prompt: string;
      promptBn?: string;
      arabic: string;
      answer: string;
      options: string[];
    }
  | {
      type: "listen-choose";
      prompt: string;
      promptBn?: string;
      audio: string;
      arabicText: string;
      options: string[];
      answer: number;
    }
  | {
      type: "translate";
      prompt: string;
      promptBn?: string;
      arabic: string;
      options: string[];
      answer: number;
    };

export type LessonProgress = {
  status: "locked" | "available" | "completed";
  stars: number;
  score: number;
};

export type CourseSummary = {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  subtitle: string;
  description: string;
  color: string;
  icon: string;
  order: number;
  totalLessons: number;
  completedLessons: number;
  progressPct: number;
  units: CourseUnit[];
};

export type CourseUnit = {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  icon: string;
  order: number;
  lessons: CourseLesson[];
};

export type CourseLesson = {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  type: string;
  xpReward: number;
  gemReward: number;
  icon: string;
  order: number;
  progress?: LessonProgress[];
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  gems: number;
  xp: number;
  totalXp: number;
  level: number;
  streak: number;
  lastActiveDate?: string | null;
  league: string;
  hearts: number;
  streakFreezes?: number;
  emailVerified?: boolean;
};
