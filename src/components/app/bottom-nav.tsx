"use client";

import { useNav, type TabName } from "@/lib/stores/nav-store";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const TABS: {
  id: TabName;
  label: string;
  labelBn: string;
  icon: (active: boolean) => React.ReactNode;
}[] = [
  {
    id: "home",
    label: "Learn",
    labelBn: "শেখা",
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth={a ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
      </svg>
    ),
  },
  {
    id: "vocabulary",
    label: "Words",
    labelBn: "শব্দ",
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth={a ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h12a3 3 0 0 1 3 3v11a1 1 0 0 1-1.5.87L12 16.5l-5.5 3.37A1 1 0 0 1 5 19V8a3 3 0 0 1 3-3H4z" opacity={a ? 1 : 1} />
        <path d="M8 9h6M8 12h4" opacity={a ? 0.6 : 1} />
      </svg>
    ),
  },
  {
    id: "leaderboard",
    label: "Ranks",
    labelBn: "র‍্যাঙ্ক",
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth={a ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 4h10v3a5 5 0 0 1-10 0V4z" />
        <path d="M5 5H3v2a3 3 0 0 0 3 3M19 5h2v2a3 3 0 0 1-3 3M10 12h4l-.5 3h1.5v2H9v-2h1.5L10 12zM8 17h8v2.5H8z" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    labelBn: "প্রোফাইল",
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth={a ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const { activeTab, setTab } = useNav();

  // Check for due vocabulary reviews to show a badge
  const { data: vocabData } = useQuery({
    queryKey: ["vocab-due-count"],
    queryFn: () => api.vocabulary.due("due"),
    staleTime: 60 * 1000,
  });
  const dueCount = vocabData?.count ?? 0;

  // Badges per tab
  const badges: Record<TabName, number | null> = {
    home: null,
    vocabulary: dueCount > 0 ? dueCount : null,
    leaderboard: null,
    profile: null,
  };

  return (
    <nav className="sticky bottom-0 z-40 glass-strong border-t border-border/40 safe-bottom">
      <div className="flex items-stretch justify-around px-2 py-1.5">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const badge = badges[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-1.5 tap-scale"
              aria-label={tab.labelBn}
            >
              <span
                className={cn(
                  "relative flex h-9 w-12 items-center justify-center rounded-2xl transition-all duration-200",
                  active
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-2xl gradient-emerald shadow-soft"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.icon(active)}</span>
                {/* Badge */}
                {badge && !active && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full gradient-gold px-1 text-[8px] font-bold text-white shadow-soft z-20"
                  >
                    {badge > 9 ? "9+" : badge}
                  </motion.span>
                )}
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {tab.labelBn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
