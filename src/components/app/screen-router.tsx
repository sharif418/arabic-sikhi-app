"use client";

import { useCurrentScreen, useNav } from "@/lib/stores/nav-store";
import { TopBar } from "./top-bar";
import { BottomNav } from "./bottom-nav";
import { OnboardingScreen } from "./onboarding-screen";
import { AuthScreen } from "./auth-screen";
import { HomeScreen } from "./home-screen";
import { LessonScreen } from "./lesson-screen";
import { VocabularyScreen } from "./vocabulary-screen";
import { LeaderboardScreen } from "./leaderboard-screen";
import { ProfileScreen } from "./profile-screen";
import { AchievementsScreen } from "./achievements-screen";
import { AiTutorScreen } from "./ai-tutor-screen";
import { SettingsScreen } from "./settings-screen";
import { AdminScreen } from "./admin-screen";
import { ShopScreen } from "./shop-screen";
import { DictionaryScreen } from "./dictionary-screen";
import { SearchScreen } from "./search-screen";
import { AnimatePresence, motion } from "framer-motion";

/** Screens that should NOT show the top bar / bottom nav (full-screen experiences). */
const FULLSCREEN_SCREENS = new Set(["onboarding", "auth", "lesson", "ai-tutor", "shop", "dictionary", "search"]);

export function ScreenRouter() {
  const screen = useCurrentScreen();

  // Full-screen experiences (own header, no bottom nav)
  if (screen.name === "onboarding") return <OnboardingScreen />;
  if (screen.name === "auth") return <AuthScreen />;
  if (screen.name === "lesson")
    return <LessonScreen lessonId={screen.lessonId} />;
  if (screen.name === "ai-tutor") return <AiTutorScreen />;
  if (screen.name === "shop") return <ShopScreen />;
  if (screen.name === "dictionary") return <DictionaryScreen />;
  if (screen.name === "search") return <SearchScreen />;

  // App shell with header + bottom nav
  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen.name + ("lessonId" in screen ? screen.lessonId : "")}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <ScreenContent screen={screen} />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}

function ScreenContent({ screen }: { screen: ReturnType<typeof useCurrentScreen> }) {
  switch (screen.name) {
    case "home":
      return <HomeScreen />;
    case "vocabulary":
      return <VocabularyScreen />;
    case "vocab-deck":
      return <VocabularyScreen />;
    case "leaderboard":
      return <LeaderboardScreen />;
    case "profile":
      return <ProfileScreen />;
    case "achievements":
      return <AchievementsScreen />;
    case "settings":
      return <SettingsScreen />;
    case "admin":
      return <AdminScreen />;
    default:
      return <HomeScreen />;
  }
}
