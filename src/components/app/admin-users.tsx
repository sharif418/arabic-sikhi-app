"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Pencil, Trash2, Loader2, Crown, Shield, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LEAGUES } from "@/lib/stores/game-store";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  league: string;
  totalXp: number;
  level: number;
  streak: number;
  gems: number;
  lessonsCompleted: number;
}

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, role, page],
    queryFn: () => api.admin.users.list({ q: search || undefined, role: role || undefined, page, limit: 15 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.users.delete(id),
    onSuccess: () => {
      toast.success("ব্যবহারকারী মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <div className="flex h-full flex-col">
      {/* Search bar */}
      <div className="px-4 py-3 border-b border-border/40 glass">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="নাম বা ইমেইল খুঁজুন..."
            className="pl-9 h-10 rounded-xl bg-card/70 border-border/60 font-bengali"
          />
        </div>
        <div className="mt-2 flex gap-1">
          {["", "user", "admin"].map((r) => (
            <button
              key={r || "all"}
              onClick={() => { setRole(r); setPage(1); }}
              className={cn(
                "px-3 py-1 rounded-full text-[11px] font-bold transition-all",
                role === r ? "gradient-emerald text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {r === "" ? "সব" : r === "user" ? "সাধারণ" : "অ্যাডমিন"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto premium-scroll p-3 space-y-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
        ) : data?.users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-5xl mb-2 opacity-50">👤</div>
            <p className="font-bengali text-sm text-muted-foreground">কোনো ব্যবহারকারী পাওয়া যায়নি</p>
          </div>
        ) : (
          data?.users.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl glass border border-border/50 p-3"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold text-sm",
                  user.role === "admin" ? "gradient-gold text-white" : "gradient-emerald text-white"
                )}>
                  {user.name[0]}
                  {user.role === "admin" && (
                    <div className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full gradient-gold flex items-center justify-center">
                      <Crown className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bengali text-sm font-bold truncate">{user.name}</p>
                    {user.role === "admin" && (
                      <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[8px] font-bold text-amber-600 dark:text-amber-400">
                        অ্যাডমিন
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setEditing(user)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 tap-scale"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`"${user.name}" মুছে ফেলবেন?`)) deleteMutation.mutate(user.id);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 tap-scale"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {/* Stats row */}
              <div className="mt-2.5 grid grid-cols-4 gap-1.5">
                <Stat label="লেভেল" value={user.level} color="emerald" />
                <Stat label="XP" value={user.totalXp} color="teal" />
                <Stat label="স্ট্রিক" value={user.streak} color="amber" />
                <Stat label="লেসন" value={user.lessonsCompleted} color="gold" />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border/40">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-8 rounded-lg">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-bold text-muted-foreground tabular-nums">
            {page} / {data.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)} className="h-8 rounded-lg">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Edit dialog */}
      {editing && (
        <UserEditDialog
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    teal: "text-teal-600 dark:text-teal-400",
    amber: "text-amber-600 dark:text-amber-400",
    gold: "text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="rounded-lg bg-muted/40 px-2 py-1 text-center">
      <p className={cn("font-extrabold text-sm tabular-nums leading-none", colors[color])}>{value}</p>
      <p className="text-[8px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function UserEditDialog({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [role, setRole] = useState(user.role);
  const [league, setLeague] = useState(user.league);
  const [gems, setGems] = useState(user.gems);
  const [xp, setXp] = useState(user.totalXp);
  const [resetProgress, setResetProgress] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.admin.users.update(user.id, { role, league, gems, xp, resetProgress });
      toast.success(resetProgress ? "ব্যবহারকারীর অগ্রগতি রিসেট হয়েছে" : "ব্যবহারকারী আপডেট হয়েছে");
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto premium-scroll">
        <DialogHeader>
          <DialogTitle className="font-bengali">ব্যবহারকারী সম্পাদনা</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 px-1">
          {/* User info */}
          <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full font-bold",
              user.role === "admin" ? "gradient-gold text-white" : "gradient-emerald text-white"
            )}>
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bengali font-bold truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground">ভূমিকা</Label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setRole("user")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition-all tap-scale",
                  role === "user" ? "gradient-emerald text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                <Shield className="h-3.5 w-3.5" /> সাধারণ
              </button>
              <button
                onClick={() => setRole("admin")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition-all tap-scale",
                  role === "admin" ? "gradient-gold text-white" : "bg-muted text-muted-foreground"
                )}
              >
                <Crown className="h-3.5 w-3.5" /> অ্যাডমিন
              </button>
            </div>
          </div>

          {/* League */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground">লিগ</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {LEAGUES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLeague(l.id)}
                  className={cn(
                    "flex items-center justify-center gap-1 rounded-lg py-2 text-[10px] font-bold transition-all tap-scale",
                    league === l.id ? "text-white" : "bg-muted text-muted-foreground"
                  )}
                  style={league === l.id ? { backgroundColor: l.color } : undefined}
                >
                  <span>{l.icon}</span>
                  <span className="font-bengali">{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Gems + XP */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">💎 রত্ন</Label>
              <Input
                type="number"
                value={gems}
                onChange={(e) => setGems(Number(e.target.value))}
                className="h-11"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">⚡ মোট XP</Label>
              <Input
                type="number"
                value={xp}
                onChange={(e) => setXp(Number(e.target.value))}
                className="h-11"
              />
            </div>
          </div>

          {/* Reset progress */}
          <button
            onClick={() => setResetProgress((r) => !r)}
            className={cn(
              "w-full flex items-center gap-2 rounded-xl border-2 p-3 transition-all tap-scale",
              resetProgress
                ? "border-destructive bg-destructive/10"
                : "border-border/60 bg-card/40"
            )}
          >
            <RotateCcw className={cn("h-4 w-4", resetProgress ? "text-destructive" : "text-muted-foreground")} />
            <div className="flex-1 text-left">
              <p className="font-bengali text-xs font-bold">অগ্রগতি রিসেট করুন</p>
              <p className="text-[10px] text-muted-foreground">সব লেসন ও শব্দ অগ্রগতি মুছে যাবে</p>
            </div>
            <div className={cn(
              "h-5 w-5 rounded-md border-2 flex items-center justify-center",
              resetProgress ? "bg-destructive border-destructive" : "border-muted-foreground/40"
            )}>
              {resetProgress && <span className="text-white text-[10px]">✓</span>}
            </div>
          </button>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl">বাতিল</Button>
          <Button onClick={save} disabled={saving} className="rounded-xl gradient-emerald text-primary-foreground">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "সংরক্ষণ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
