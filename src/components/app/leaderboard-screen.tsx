"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/stores/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Crown, Flame, Zap } from "lucide-react";
import { LEAGUES } from "@/lib/stores/game-store";
import { cn } from "@/lib/utils";

export function LeaderboardScreen() {
  const { user } = useAuth();
  const userLeague = user?.league ?? "Bronze";
  const [selectedLeague, setSelectedLeague] = useState(userLeague);

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", selectedLeague],
    queryFn: () => api.leaderboard(selectedLeague),
  });

  const entries = data?.entries ?? [];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <h1 className="font-bengali text-2xl font-extrabold">র‍্যাঙ্কিং</h1>
        <p className="font-bengali text-sm text-muted-foreground mt-0.5">
          প্রতি সপ্তাহে শীর্ষ ৩ উন্নতি পায়
        </p>
      </div>

      {/* League selector */}
      <div className="px-4 pb-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {LEAGUES.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedLeague(l.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all tap-scale border",
                selectedLeague === l.id
                  ? "text-primary-foreground border-transparent shadow-soft"
                  : "bg-card/70 border-border/50 text-muted-foreground hover:text-foreground"
              )}
              style={selectedLeague === l.id ? { backgroundColor: l.color } : undefined}
            >
              <span>{l.icon}</span>
              <span className="font-bengali">{l.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Podium */}
      {entries.length >= 3 && !isLoading && (
        <Podium entries={entries.slice(0, 3)} />
      )}

      {/* My rank card */}
      {data?.myRank && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-3 rounded-2xl gradient-emerald text-primary-foreground p-3 shadow-glow-emerald">
            <span className="text-lg font-extrabold w-8 text-center">#{data.myRank}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 font-bold text-sm">
              {user?.name?.[0] ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bengali font-bold text-sm truncate">{user?.name}</p>
              <p className="text-[11px] text-white/80">আপনার অবস্থান</p>
            </div>
            <div className="text-right">
              <p className="font-bold tabular-nums text-sm">{entries.find((e) => e.isMe)?.weeklyXp ?? 0}</p>
              <p className="text-[10px] text-white/80">XP</p>
            </div>
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="flex-1 overflow-y-auto premium-scroll px-4 pb-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {entries.map((e) => (
              <RankRow key={e.userId} entry={e} promotionZone={data?.promotionZone ?? []} />
            ))}
            {entries.length === 0 && (
              <p className="font-bengali text-center text-sm text-muted-foreground py-8">
                এই লিগে এখনও কেউ নেই
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Podium({ entries }: { entries: Array<{ name: string; weeklyXp: number; rank: number }> }) {
  const [first, second, third] = entries;
  const order = [second, first, third]; // 2nd, 1st, 3rd (visual layout)
  const heights = [76, 104, 60];
  const medals = ["🥈", "🥇", "🥉"];
  const medalColors = [
    "from-slate-300/50 to-slate-400/25",
    "from-amber-400/60 to-amber-600/30",
    "from-amber-700/40 to-amber-800/20",
  ];

  return (
    <div className="px-4 pb-3 pt-1">
      <div className="flex items-end justify-center gap-2.5">
        {order.map((e, i) => {
          const isFirst = i === 1;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.12, type: "spring", stiffness: 180, damping: 18 }}
              className="flex flex-col items-center"
              style={{ width: isFirst ? "34%" : "31%" }}
            >
              {/* Medal + avatar + name cluster ABOVE the pillar */}
              <div className={cn(
                "relative flex flex-col items-center mb-1.5",
                isFirst && "-mb-0.5"
              )}>
                <div className={cn(
                  "text-xl mb-0.5 drop-shadow",
                  isFirst && "text-2xl"
                )}>
                  {medals[i]}
                </div>
                <div className={cn(
                  "rounded-full bg-card border-2 flex items-center justify-center font-bold shadow-soft",
                  isFirst ? "h-11 w-11 text-sm border-amber-400" : "h-9 w-9 text-xs border-border"
                )}>
                  {e?.name?.[0] ?? "?"}
                </div>
                {isFirst && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full gradient-gold flex items-center justify-center text-[8px]">
                    👑
                  </div>
                )}
              </div>
              <p className="font-bengali text-[10px] font-bold truncate w-full text-center leading-tight mb-0.5">
                {e?.name}
              </p>
              <p className="text-[10px] text-muted-foreground tabular-nums font-semibold mb-1.5">
                {e?.weeklyXp ?? 0} XP
              </p>
              {/* Pillar */}
              <div
                className={cn(
                  "w-full rounded-t-2xl flex items-start justify-center pt-2 bg-gradient-to-b border-t-2 border-x border-white/20",
                  medalColors[i]
                )}
                style={{ height: heights[i] }}
              >
                <span className={cn(
                  "font-extrabold opacity-80",
                  isFirst ? "text-base" : "text-sm"
                )}>
                  #{e?.rank}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function RankRow({
  entry,
  promotionZone,
}: {
  entry: {
    rank: number;
    userId: string;
    name: string;
    streak: number;
    level: number;
    weeklyXp: number;
    totalXp: number;
    isMe: boolean;
  };
  promotionZone: string[];
}) {
  const isTop3 = entry.rank <= 3;
  const isPromoted = promotionZone.includes(entry.userId);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-2.5 border transition-all",
        entry.isMe
          ? "gradient-emerald text-primary-foreground border-transparent shadow-soft"
          : "bg-card/70 border-border/40"
      )}
    >
      <span
        className={cn(
          "w-7 text-center font-extrabold text-sm",
          entry.isMe ? "text-white" : isTop3 ? "text-amber-500" : "text-muted-foreground"
        )}
      >
        {entry.rank}
      </span>
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full font-bold text-sm",
          entry.isMe ? "bg-white/20" : "bg-muted"
        )}
      >
        {entry.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("font-bengali font-bold text-sm truncate", entry.isMe ? "text-white" : "")}>
          {entry.name} {entry.isMe && <span className="text-[10px] font-normal">(আপনি)</span>}
        </p>
        <div className={cn("flex items-center gap-2 text-[10px]", entry.isMe ? "text-white/80" : "text-muted-foreground")}>
          <span className="flex items-center gap-0.5">
            <Zap className="h-3 w-3" /> Lv {entry.level}
          </span>
          {entry.streak > 0 && (
            <span className="flex items-center gap-0.5">
              <Flame className="h-3 w-3" /> {entry.streak}
            </span>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={cn("font-bold tabular-nums text-sm", entry.isMe ? "text-white" : "")}>
          {entry.weeklyXp}
        </p>
        <p className={cn("text-[10px]", entry.isMe ? "text-white/70" : "text-muted-foreground")}>XP</p>
      </div>
      {isPromoted && (
        <Crown className={cn("h-4 w-4", entry.isMe ? "text-white" : "text-amber-500")} />
      )}
    </div>
  );
}
