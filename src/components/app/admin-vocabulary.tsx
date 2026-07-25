"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2, Loader2, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VocabWord {
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
}

const PARTS_OF_SPEECH = ["noun", "verb", "adjective", "phrase", "particle", "adverb"];
const CATEGORIES = ["greeting", "family", "food", "objects", "places", "people", "time", "nature", "deen", "adjectives", "verbs"];

export function AdminVocabulary() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<VocabWord | null>(null);
  const [creating, setCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-vocab", search, category, page],
    queryFn: () => api.admin.vocabulary.list({ q: search || undefined, category: category || undefined, page, limit: 15 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.vocabulary.delete(id),
    onSuccess: () => {
      toast.success("শব্দ মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-vocab"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <div className="flex h-full flex-col">
      {/* Search bar */}
      <div className="px-4 py-3 border-b border-border/40 glass">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="আরবি, বাংলা, ইংরেজি খুঁজুন..."
              className="pl-9 h-10 rounded-xl bg-card/70 border-border/60 font-bengali"
            />
          </div>
          <Button
            onClick={() => setCreating(true)}
            className="h-10 px-3 gradient-emerald text-primary-foreground font-bold rounded-xl tap-scale shrink-0"
          >
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">নতুন</span>
          </Button>
        </div>
        {/* Category chips */}
        <div className="mt-2 flex gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { setCategory(""); setPage(1); }}
            className={cn(
              "shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all",
              !category ? "gradient-emerald text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            সব
          </button>
          {data?.categories.map((c) => (
            <button
              key={c}
              onClick={() => { setCategory(c); setPage(1); }}
              className={cn(
                "shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all",
                category === c ? "gradient-emerald text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto premium-scroll p-3 space-y-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
        ) : data?.words.length === 0 ? (
          <EmptyState message="কোনো শব্দ পাওয়া যায়নি" />
        ) : (
          data?.words.map((word, i) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl glass border border-border/50 p-3 flex items-center gap-3"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                <span className="font-arabic text-xl font-bold text-emerald-600 dark:text-emerald-400">{word.arabic[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-arabic text-base font-bold truncate">{word.arabic}</span>
                  <span className="text-[10px] text-muted-foreground italic truncate">{word.transliteration}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-bengali text-xs font-semibold truncate">{word.bangla}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground truncate">{word.english}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {word.category && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">{word.category}</span>
                  )}
                  {word.partOfSpeech && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">{word.partOfSpeech}</span>
                  )}
                  <span className="text-[9px] text-muted-foreground">⭐ {word.difficulty}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => setEditing(word)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 tap-scale"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`"${word.arabic}" মুছে ফেলবেন?`)) deleteMutation.mutate(word.id);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 tap-scale"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border/40">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="h-8 rounded-lg"
          >
            পূর্ববর্তী
          </Button>
          <span className="text-xs font-bold text-muted-foreground tabular-nums">
            {page} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="h-8 rounded-lg"
          >
            পরবর্তী
          </Button>
        </div>
      )}

      {/* Create/Edit dialog */}
      {(creating || editing) && (
        <VocabFormDialog
          word={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-vocab"] });
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function VocabFormDialog({
  word,
  onClose,
  onSaved,
}: {
  word: VocabWord | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    arabic: word?.arabic ?? "",
    transliteration: word?.transliteration ?? "",
    bangla: word?.bangla ?? "",
    english: word?.english ?? "",
    partOfSpeech: word?.partOfSpeech ?? "",
    category: word?.category ?? "",
    exampleArabic: word?.exampleArabic ?? "",
    exampleBangla: word?.exampleBangla ?? "",
    difficulty: word?.difficulty ?? 1,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.arabic || !form.bangla) {
      toast.error("আরবি ও বাংলা ফিল্ড আবশ্যক");
      return;
    }
    setSaving(true);
    try {
      if (word) {
        await api.admin.vocabulary.update(word.id, form);
        toast.success("শব্দ আপডেট হয়েছে");
      } else {
        await api.admin.vocabulary.create(form);
        toast.success("নতুন শব্দ যোগ হয়েছে");
      }
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
          <DialogTitle className="font-bengali">
            {word ? "শব্দ সম্পাদনা" : "নতুন শব্দ যোগ করুন"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 px-1">
          <div className="grid grid-cols-2 gap-3">
            <Field label="আরবি *">
              <Input
                value={form.arabic}
                onChange={(e) => setForm({ ...form, arabic: e.target.value })}
                className="font-arabic text-lg h-11"
                dir="rtl"
              />
            </Field>
            <Field label="ট্রান্সলিটারেশন">
              <Input
                value={form.transliteration}
                onChange={(e) => setForm({ ...form, transliteration: e.target.value })}
                className="h-11"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="বাংলা *">
              <Input
                value={form.bangla}
                onChange={(e) => setForm({ ...form, bangla: e.target.value })}
                className="font-bengali h-11"
              />
            </Field>
            <Field label="ইংরেজি">
              <Input
                value={form.english}
                onChange={(e) => setForm({ ...form, english: e.target.value })}
                className="h-11"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="পদ প্রকার">
              <select
                value={form.partOfSpeech}
                onChange={(e) => setForm({ ...form, partOfSpeech: e.target.value })}
                className="h-11 w-full rounded-xl border border-border/60 bg-card/70 px-3 text-sm"
              >
                <option value="">—</option>
                {PARTS_OF_SPEECH.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="ক্যাটাগরি">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-11 w-full rounded-xl border border-border/60 bg-card/70 px-3 text-sm"
              >
                <option value="">—</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <Field label="কঠিনতা (১-৫)">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => setForm({ ...form, difficulty: d })}
                  className={cn(
                    "flex-1 h-10 rounded-lg font-bold text-sm transition-all tap-scale",
                    form.difficulty === d ? "gradient-gold text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </Field>
          <Field label="উদাহরণ (আরবি)">
            <Input
              value={form.exampleArabic}
              onChange={(e) => setForm({ ...form, exampleArabic: e.target.value })}
              className="font-arabic h-11"
              dir="rtl"
            />
          </Field>
          <Field label="উদাহরণ (বাংলা)">
            <Input
              value={form.exampleBangla}
              onChange={(e) => setForm({ ...form, exampleBangla: e.target.value })}
              className="font-bengali h-11"
            />
          </Field>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl">বাতিল</Button>
          <Button onClick={save} disabled={saving} className="rounded-xl gradient-emerald text-primary-foreground">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : word ? "আপডেট" : "যোগ করুন"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-semibold text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-5xl mb-2 opacity-50">📭</div>
      <p className="font-bengali text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
