"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronRight, BookOpen, ListChecks } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ExerciseEditor } from "./exercise-editor";
import type { Exercise } from "@/lib/types";

interface AdminLesson {
  id: string;
  unitId: string;
  title: string;
  titleBn: string;
  description: string;
  type: string;
  xpReward: number;
  gemReward: number;
  icon: string;
  order: number;
  exercises: unknown[];
  unit: { id: string; titleBn: string; courseId: string; course: { titleBn: string } };
}

interface AdminUnit {
  id: string;
  titleBn: string;
  course: { id: string; titleBn: string; slug: string; icon: string };
}

const LESSON_TYPES = [
  { value: "standard", label: "সাধারণ", icon: "⭐" },
  { value: "boss", label: "বস", icon: "👑" },
  { value: "review", label: "পর্যালোচনা", icon: "🔄" },
  { value: "treasure", label: "ট্রেজার", icon: "💎" },
];

export function AdminLessons() {
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<AdminLesson | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingExercises, setEditingExercises] = useState<AdminLesson | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-lessons", courseFilter],
    queryFn: () => api.admin.lessons.list({ courseId: courseFilter || undefined, limit: 100 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.lessons.delete(id),
    onSuccess: () => {
      toast.success("লেসন মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  // Group lessons by unit
  const units = data?.units ?? [];
  const lessonsByUnit = (data?.lessons ?? []).reduce((acc, lesson) => {
    if (!acc[lesson.unitId]) acc[lesson.unitId] = [];
    acc[lesson.unitId].push(lesson);
    return acc;
  }, {} as Record<string, AdminLesson[]>);

  // Filter units by course
  const visibleUnits = units.filter((u) => !courseFilter || u.course.id === courseFilter);
  // Group units by course for the filter
  const courses = Array.from(new Map(units.map((u) => [u.course.id, u.course]).values()).values());

  const toggle = (unitId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Course filter */}
      <div className="px-4 py-3 border-b border-border/40 glass">
        <div className="flex gap-2 items-center">
          <Button
            onClick={() => setCreating(true)}
            className="h-10 px-3 gradient-emerald text-primary-foreground font-bold rounded-xl tap-scale shrink-0"
          >
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">নতুন লেসন</span>
          </Button>
          <div className="flex gap-1 overflow-x-auto no-scrollbar flex-1">
            <button
              onClick={() => setCourseFilter("")}
              className={cn(
                "shrink-0 px-3 py-2 rounded-lg text-[11px] font-bold transition-all",
                !courseFilter ? "gradient-emerald text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              সব কোর্স
            </button>
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => setCourseFilter(c.id)}
                className={cn(
                  "shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-[11px] font-bold transition-all",
                  courseFilter === c.id ? "gradient-emerald text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                <span>{c.icon}</span>
                {c.titleBn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Units with lessons */}
      <div className="flex-1 overflow-y-auto premium-scroll p-3 space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)
        ) : visibleUnits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-5xl mb-2 opacity-50">📚</div>
            <p className="font-bengali text-sm text-muted-foreground">কোনো ইউনিট পাওয়া যায়নি</p>
          </div>
        ) : (
          visibleUnits.map((unit) => {
            const unitLessons = lessonsByUnit[unit.id] ?? [];
            const isOpen = expanded.has(unit.id);
            return (
              <div key={unit.id} className="rounded-2xl glass border border-border/50 overflow-hidden">
                <button
                  onClick={() => toggle(unit.id)}
                  className="w-full flex items-center gap-2 p-3 hover:bg-accent/30 transition-colors"
                >
                  {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <BookOpen className="h-4 w-4 text-primary" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-bengali text-sm font-bold truncate">{unit.titleBn}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{unit.course.titleBn}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {unitLessons.length} লেসন
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border/40"
                    >
                      {unitLessons.length === 0 ? (
                        <p className="p-3 text-center text-xs text-muted-foreground">কোনো লেসন নেই</p>
                      ) : (
                        <div className="p-2 space-y-1">
                          {unitLessons.map((lesson) => {
                            const typeInfo = LESSON_TYPES.find((t) => t.value === lesson.type);
                            return (
                              <div key={lesson.id} className="flex items-center gap-2 rounded-xl bg-card/40 p-2">
                                <span className="text-lg">{lesson.icon || typeInfo?.icon || "⭐"}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bengali text-xs font-bold truncate">{lesson.titleBn}</p>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] text-muted-foreground">#{lesson.order}</span>
                                    {lesson.type !== "standard" && (
                                      <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[8px] font-bold text-amber-600 dark:text-amber-400">
                                        {typeInfo?.label}
                                      </span>
                                    )}
                                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400">+{lesson.xpReward}XP</span>
                                    <span className="text-[9px] text-amber-600 dark:text-amber-400">+{lesson.gemReward}💎</span>
                                    <span className="text-[9px] text-muted-foreground">{lesson.exercises.length} অনুশীলন</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setEditingExercises(lesson)}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 tap-scale"
                                  title="অনুশীলন সম্পাদনা"
                                >
                                  <ListChecks className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => setEditing(lesson)}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 tap-scale"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`"${lesson.titleBn}" মুছে ফেলবেন?`)) deleteMutation.mutate(lesson.id);
                                  }}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 tap-scale"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit dialog */}
      {(creating || editing) && data && (
        <LessonFormDialog
          lesson={editing}
          units={data.units}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      {/* Exercise editor dialog */}
      {editingExercises && (
        <ExerciseEditor
          exercises={editingExercises.exercises as Exercise[]}
          onSave={async (exercises) => {
            await api.admin.lessons.update(editingExercises.id, { exercises });
            queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
          }}
          onClose={() => setEditingExercises(null)}
        />
      )}
    </div>
  );
}

function LessonFormDialog({
  lesson,
  units,
  onClose,
  onSaved,
}: {
  lesson: AdminLesson | null;
  units: AdminUnit[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    unitId: lesson?.unitId ?? units[0]?.id ?? "",
    title: lesson?.title ?? "",
    titleBn: lesson?.titleBn ?? "",
    description: lesson?.description ?? "",
    type: lesson?.type ?? "standard",
    xpReward: lesson?.xpReward ?? 10,
    gemReward: lesson?.gemReward ?? 2,
    icon: lesson?.icon ?? "⭐",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.unitId || !form.titleBn) {
      toast.error("ইউনিট ও বাংলা শিরোনাম আবশ্যক");
      return;
    }
    setSaving(true);
    try {
      if (lesson) {
        await api.admin.lessons.update(lesson.id, form);
        toast.success("লেসন আপডেট হয়েছে");
      } else {
        await api.admin.lessons.create({ ...form, title: form.title || form.titleBn });
        toast.success("নতুন লেসন যোগ হয়েছে");
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
            {lesson ? "লেসন সম্পাদনা" : "নতুন লেসন যোগ করুন"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 px-1">
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground">ইউনিট *</Label>
            <select
              value={form.unitId}
              onChange={(e) => setForm({ ...form, unitId: e.target.value })}
              className="h-11 w-full rounded-xl border border-border/60 bg-card/70 px-3 text-sm font-bengali"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.course.icon} {u.course.titleBn} → {u.titleBn}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">বাংলা শিরোনাম *</Label>
              <Input
                value={form.titleBn}
                onChange={(e) => setForm({ ...form, titleBn: e.target.value })}
                className="font-bengali h-11"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">ইংরেজি শিরোনাম</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="h-11"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground">বিবরণ</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="font-bengali h-11"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground">লেসন টাইপ</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {LESSON_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setForm({ ...form, type: t.value })}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg py-2 transition-all tap-scale",
                    form.type === t.value ? "gradient-emerald text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <span className="text-base">{t.icon}</span>
                  <span className="text-[9px] font-bold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">আইকন</Label>
              <Input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="h-11 text-center text-lg"
                maxLength={2}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">XP</Label>
              <Input
                type="number"
                value={form.xpReward}
                onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })}
                className="h-11"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">💎</Label>
              <Input
                type="number"
                value={form.gemReward}
                onChange={(e) => setForm({ ...form, gemReward: Number(e.target.value) })}
                className="h-11"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl">বাতিল</Button>
          <Button onClick={save} disabled={saving} className="rounded-xl gradient-emerald text-primary-foreground">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : lesson ? "আপডেট" : "যোগ করুন"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
