"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/stores/auth-store";
import { useNav } from "@/lib/stores/nav-store";
import { useGame } from "@/lib/stores/game-store";
import { ScreenRouter } from "@/components/app/screen-router";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading, refresh } = useAuth();
  const { stack } = useNav();
  const currentScreen = stack[stack.length - 1];
  const { hydrateFromServer } = useGame();

  // Check auth on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // When user logs in, hydrate game store + jump to home
  useEffect(() => {
    if (user) {
      hydrateFromServer({
        hearts: user.hearts,
        gems: user.gems,
        xp: user.xp,
        totalXp: user.totalXp,
        level: user.level,
        streak: user.streak,
        league: user.league,
      });
      // If currently on onboarding/auth, move to home
      if (currentScreen.name === "onboarding" || currentScreen.name === "auth") {
        useNav.getState().resetTo({ name: "home" });
      }
    }
  }, [user, currentScreen.name, hydrateFromServer]);

  // Splash / loading state
  if (loading && !user) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 gradient-hero">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl gradient-emerald text-white shadow-glow-emerald animate-pulse-glow">
            <span className="font-arabic text-4xl font-bold">ع</span>
          </div>
        </div>
        <div className="text-center">
          <h1 className="font-bengali text-xl font-extrabold">আরবি শিখি</h1>
          <p className="text-xs text-muted-foreground mt-1">Arabic Sikhi</p>
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-background shadow-2xl md:my-0">
      <ScreenRouter />
    </div>
  );
}
