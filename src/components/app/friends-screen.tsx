"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useNav } from "@/lib/stores/nav-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserPlus, UserCheck, Flame, Zap, Users } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LEAGUES } from "@/lib/stores/game-store";

type Tab = "suggestions" | "following";

export function FriendsScreen() {
  const { back } = useNav();
  const [tab, setTab] = useState<Tab>("suggestions");
  const [search, setSearch] = useState("");

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="relative px-4 pt-4 pb-3 gradient-aurora text-white safe-top">
        <div className="absolute inset-0 opacity-20 pattern-islamic" />
        <div className="relative flex items-center gap-3">
          <button onClick={back} className="tap-scale text-white/90 hover:text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="font-bengali text-lg font-extrabold">বন্ধুরা</h1>
            <p className="text-[11px] text-white/80">অন্য শিক্ষার্থীদের ফলো করুন</p>
          </div>
          <Users className="h-5 w-5 text-white/80" />
        </div>

        {/* Tabs */}
        <div className="relative mt-3 grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/10">
          <button
            onClick={() => setTab("suggestions")}
            className={cn(
              "py-1.5 rounded-lg text-xs font-bold transition-all tap-scale",
              tab === "suggestions" ? "bg-white text-emerald-700" : "text-white/80"
            )}
          >
            সাজেশন
          </button>
          <button
            onClick={() => setTab("following")}
            className={cn(
              "py-1.5 rounded-lg text-xs font-bold transition-all tap-scale",
              tab === "following" ? "bg-white text-emerald-700" : "text-white/80"
            )}
          >
            ফলোয়িং
          </button>
        </div>

        {/* Search (only for suggestions tab) */}
        {tab === "suggestions" && (
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="শিক্ষার্থী খুঁজুন..."
              className="w-full pl-9 pr-3 h-10 rounded-xl bg-white/15 backdrop-blur border border-white/20 text-white placeholder:text-white/60 font-bengali text-sm focus:outline-none focus:bg-white/25"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto premium-scroll p-3">
        {tab === "suggestions" ? (
          <SuggestionsTab search={search} />
        ) : (
          <FollowingTab />
        )}
      </div>
    </div>
  );
}

/* ---------- Suggestions Tab ---------- */
function SuggestionsTab({ search }: { search: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["friend-suggestions", search],
    queryFn: () => api.friends.suggestions(search || undefined),
  });

  const toggleMutation = useMutation({
    mutationFn: (userId: string) => api.friends.toggle(userId),
    onSuccess: (res) => {
      toast.success(res.following ? `${res.targetName} কে ফলো করছেন` : `${res.targetName} কে আনফলো করেছেন`);
      queryClient.invalidateQueries({ queryKey: ["friend-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
      </div>
    );
  }

  const suggestions = data?.suggestions ?? [];

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-5xl mb-2 opacity-50">👥</div>
        <p className="font-bengali text-sm text-muted-foreground">কোনো নতুন শিক্ষার্থী নেই</p>
        <p className="font-bengali text-xs text-muted-foreground/70 mt-1">সবাইকে ইতিমধ্যে ফলো করছেন!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {suggestions.map((user, i) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="rounded-2xl glass border border-border/50 p-3 flex items-center gap-3"
        >
          <FriendAvatar name={user.name} league={user.league} />
          <div className="flex-1 min-w-0">
            <p className="font-bengali text-sm font-bold truncate">{user.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground">
                <Zap className="h-3 w-3" /> Lv {user.level}
              </span>
              {user.streak > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  <Flame className="h-3 w-3" /> {user.streak}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground tabular-nums">{user.totalXp} XP</span>
            </div>
          </div>
          <button
            onClick={() => toggleMutation.mutate(user.id)}
            disabled={toggleMutation.isPending}
            className="shrink-0 flex items-center gap-1 rounded-full gradient-emerald text-primary-foreground px-3 py-1.5 text-[11px] font-bold tap-scale disabled:opacity-50"
          >
            <UserPlus className="h-3.5 w-3.5" /> ফলো
          </button>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------- Following Tab ---------- */
function FollowingTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: api.friends.list,
  });
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: (userId: string) => api.friends.toggle(userId),
    onSuccess: (res) => {
      toast.info(`${res.targetName} কে আনফলো করেছেন`);
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-suggestions"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
      </div>
    );
  }

  const following = data?.following ?? [];

  if (following.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-5xl mb-2 opacity-50">💌</div>
        <p className="font-bengali text-sm text-muted-foreground">আপনি এখনো কাউকে ফলো করেন না</p>
        <p className="font-bengali text-xs text-muted-foreground/70 mt-1">সাজেশন ট্যাবে গিয়ে শিক্ষার্থী খুঁজুন</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="rounded-2xl glass border border-border/50 p-3 text-center">
          <p className="text-2xl font-extrabold tabular-nums">{data?.followingCount ?? 0}</p>
          <p className="font-bengali text-[10px] text-muted-foreground">ফলোয়িং</p>
        </div>
        <div className="rounded-2xl glass border border-border/50 p-3 text-center">
          <p className="text-2xl font-extrabold tabular-nums">{data?.followersCount ?? 0}</p>
          <p className="font-bengali text-[10px] text-muted-foreground">ফলোয়ার</p>
        </div>
      </div>

      {following.map((user, i) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="rounded-2xl glass border border-border/50 p-3 flex items-center gap-3"
        >
          <FriendAvatar name={user.name} league={user.league} />
          <div className="flex-1 min-w-0">
            <p className="font-bengali text-sm font-bold truncate">{user.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground">
                <Zap className="h-3 w-3" /> Lv {user.level}
              </span>
              {user.streak > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  <Flame className="h-3 w-3" /> {user.streak}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground tabular-nums">{user.totalXp} XP</span>
            </div>
          </div>
          <button
            onClick={() => toggleMutation.mutate(user.id)}
            disabled={toggleMutation.isPending}
            className="shrink-0 flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 text-[11px] font-bold tap-scale disabled:opacity-50"
          >
            <UserCheck className="h-3.5 w-3.5" /> ফলোয়িং
          </button>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------- Friend Avatar ---------- */
function FriendAvatar({ name, league }: { name: string; league: string }) {
  const leagueInfo = LEAGUES.find((l) => l.id === league);
  return (
    <div className="relative shrink-0">
      <div className="flex h-11 w-11 items-center justify-center rounded-full gradient-emerald text-white font-bold text-sm">
        {name[0]}
      </div>
      {leagueInfo && (
        <div
          className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background text-[8px]"
          style={{ backgroundColor: leagueInfo.color }}
        >
          {leagueInfo.icon}
        </div>
      )}
    </div>
  );
}
