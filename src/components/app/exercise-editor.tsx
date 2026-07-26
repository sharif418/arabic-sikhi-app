"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Exercise } from "@/lib/types";

const EXERCISE_TYPES: Array<{
  type: Exercise["type"];
  label: string;
  labelBn: string;
  icon: string;
}> = [
  { type: "multiple-choice", label: "Multiple Choice", labelBn: "বহুনির্বাচনী", icon: "🎯" },
  { type: "match-pairs", label: "Match Pairs", labelBn: "জোড় মেলানো", icon: "🔗" },
  { type: "build-sentence", label: "Build Sentence", labelBn: "বাক্য তৈরি", icon: "🏗️" },
  { type: "fill-blank", label: "Fill Blank", labelBn: "শূন্যস্থান", icon: "✏️" },
  { type: "listen-choose", label: "Listen & Choose", labelBn: "শুনে বাছাই", icon: "🔊" },
  { type: "translate", label: "Translate", labelBn: "অনুবাদ", icon: "🔄" },
];

interface ExerciseEditorProps {
  exercises: Exercise[];
  onSave: (exercises: Exercise[]) => Promise<void>;
  onClose: () => void;
}

export function ExerciseEditor({ exercises: initialExercises, onSave, onClose }: ExerciseEditorProps) {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [saving, setSaving] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const addExercise = (type: Exercise["type"]) => {
    const newEx = createDefaultExercise(type);
    setExercises([...exercises, newEx]);
    setShowTypePicker(false);
  };

  const updateExercise = (index: number, updated: Partial<Exercise>) => {
    setExercises(exercises.map((ex, i) => (i === index ? { ...ex, ...updated } as Exercise : ex)));
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const moveExercise = (index: number, dir: "up" | "down") => {
    const newIndex = dir === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= exercises.length) return;
    const next = [...exercises];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    setExercises(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(exercises);
      toast.success(`${exercises.length}টি অনুশীলন সংরক্ষিত হয়েছে`);
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto premium-scroll">
        <DialogHeader>
          <DialogTitle className="font-bengali flex items-center gap-2">
            ✏️ অনুশীলন সম্পাদক
            <span className="text-xs font-normal text-muted-foreground">({exercises.length}টি)</span>
          </DialogTitle>
        </DialogHeader>

        {/* Exercise list */}
        <div className="space-y-3 px-1">
          <AnimatePresence>
            {exercises.map((ex, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-2xl glass border border-border/50 p-3"
              >
                {/* Exercise header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveExercise(index, "up")}
                      disabled={index === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 tap-scale"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => moveExercise(index, "down")}
                      disabled={index === exercises.length - 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 tap-scale"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full gradient-emerald text-primary-foreground text-[10px] font-bold">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-xs font-bold text-muted-foreground">
                    {EXERCISE_TYPES.find((t) => t.type === ex.type)?.icon}{" "}
                    {EXERCISE_TYPES.find((t) => t.type === ex.type)?.labelBn}
                  </span>
                  <button
                    onClick={() => removeExercise(index)}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 tap-scale"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                {/* Exercise fields */}
                <ExerciseFields exercise={ex} index={index} onUpdate={updateExercise} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add exercise button / type picker */}
          {showTypePicker ? (
            <div className="grid grid-cols-3 gap-2">
              {EXERCISE_TYPES.map((t) => (
                <button
                  key={t.type}
                  onClick={() => addExercise(t.type)}
                  className="flex flex-col items-center gap-1 rounded-xl border-2 border-border/40 bg-card/40 p-2.5 tap-scale hover:border-primary/40 transition-all"
                >
                  <span className="text-xl">{t.icon}</span>
                  <span className="font-bengali text-[9px] font-bold text-center leading-tight">{t.labelBn}</span>
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => setShowTypePicker(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/40 p-3 text-sm font-bold text-muted-foreground hover:border-primary/40 hover:text-primary transition-all tap-scale"
            >
              <Plus className="h-4 w-4" /> নতুন অনুশীলন যোগ করুন
            </button>
          )}
        </div>

        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl">বাতিল</Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-xl gradient-emerald text-primary-foreground">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "সংরক্ষণ করুন"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Exercise-specific field editors ---------- */
function ExerciseFields({
  exercise,
  index,
  onUpdate,
}: {
  exercise: Exercise;
  index: number;
  onUpdate: (index: number, updated: Partial<Exercise>) => void;
}) {
  const commonPrompt = (
    <div className="space-y-1.5">
      <div>
        <Label className="text-[10px] font-bold text-muted-foreground">প্রশ্ন (বাংলা)</Label>
        <Input
          value={exercise.promptBn ?? ""}
          onChange={(e) => onUpdate(index, { promptBn: e.target.value })}
          className="h-9 font-bengali text-sm"
          placeholder="প্রশ্ন লিখুন..."
        />
      </div>
      <div>
        <Label className="text-[10px] font-bold text-muted-foreground">Prompt (English)</Label>
        <Input
          value={exercise.prompt}
          onChange={(e) => onUpdate(index, { prompt: e.target.value })}
          className="h-9 text-sm"
          placeholder="Enter prompt..."
        />
      </div>
    </div>
  );

  switch (exercise.type) {
    case "multiple-choice":
      return (
        <div className="space-y-2">
          {commonPrompt}
          <div>
            <Label className="text-[10px] font-bold text-muted-foreground">আরবি শব্দ</Label>
            <Input
              value={exercise.arabic ?? ""}
              onChange={(e) => onUpdate(index, { arabic: e.target.value })}
              className="h-9 font-arabic text-lg"
              dir="rtl"
              placeholder="السلام"
            />
          </div>
          <div>
            <Label className="text-[10px] font-bold text-muted-foreground">অপশন (প্রতি লাইনে একটি)</Label>
            <textarea
              value={exercise.options.join("\n")}
              onChange={(e) => onUpdate(index, { options: e.target.value.split("\n").filter(Boolean) })}
              className="w-full rounded-xl border border-border/60 bg-card/70 p-2 text-sm font-bengali"
              rows={4}
              placeholder="শান্তি&#10;অবস্থা&#10;তোমাদের উপর&#10;কেমন"
            />
          </div>
          <div>
            <Label className="text-[10px] font-bold text-muted-foreground">সঠিক উত্তর (০-থেকে শুরু)</Label>
            <Input
              type="number"
              min={0}
              max={exercise.options.length - 1}
              value={exercise.answer}
              onChange={(e) => onUpdate(index, { answer: Number(e.target.value) })}
              className="h-9 w-20"
            />
          </div>
        </div>
      );

    case "match-pairs":
      return (
        <div className="space-y-2">
          {commonPrompt}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-muted-foreground">জোড় (আরবি = বাংলা)</Label>
            {exercise.pairs.map((pair, pIdx) => (
              <div key={pIdx} className="flex gap-1.5">
                <Input
                  value={pair.left}
                  onChange={(e) => {
                    const pairs = [...exercise.pairs];
                    pairs[pIdx] = { ...pairs[pIdx], left: e.target.value };
                    onUpdate(index, { pairs });
                  }}
                  className="h-8 font-arabic text-sm flex-1"
                  dir="rtl"
                  placeholder="كتاب"
                />
                <span className="flex items-center text-muted-foreground">=</span>
                <Input
                  value={pair.right}
                  onChange={(e) => {
                    const pairs = [...exercise.pairs];
                    pairs[pIdx] = { ...pairs[pIdx], right: e.target.value };
                    onUpdate(index, { pairs });
                  }}
                  className="h-8 font-bengali text-sm flex-1"
                  placeholder="বই"
                />
                <button
                  onClick={() => onUpdate(index, { pairs: exercise.pairs.filter((_, i) => i !== pIdx) })}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive tap-scale shrink-0"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => onUpdate(index, { pairs: [...exercise.pairs, { left: "", right: "" }] })}
              className="flex items-center gap-1 text-[10px] font-bold text-primary tap-scale"
            >
              <Plus className="h-3 w-3" /> জোড় যোগ করুন
            </button>
          </div>
        </div>
      );

    case "build-sentence":
      return (
        <div className="space-y-2">
          {commonPrompt}
          <div>
            <Label className="text-[10px] font-bold text-muted-foreground">টোকেন (প্রতি লাইনে একটি)</Label>
            <textarea
              value={exercise.tokens.join("\n")}
              onChange={(e) => onUpdate(index, { tokens: e.target.value.split("\n").filter(Boolean) })}
              className="w-full rounded-xl border border-border/60 bg-card/70 p-2 text-sm font-arabic"
              dir="rtl"
              rows={3}
              placeholder="الْكِتَابُ&#10;جَمِيلٌ"
            />
          </div>
          <div>
            <Label className="text-[10px] font-bold text-muted-foreground">সঠিক উত্তর</Label>
            <Input
              value={exercise.answer}
              onChange={(e) => onUpdate(index, { answer: e.target.value })}
              className="h-9 font-arabic text-lg"
              dir="rtl"
              placeholder="الْكِتَابُ جَمِيلٌ"
            />
          </div>
        </div>
      );

    case "fill-blank":
      return (
        <div className="space-y-2">
          {commonPrompt}
          <div>
            <Label className="text-[10px] font-bold text-muted-foreground">বাক্য (___ দিয়ে শূন্যস্থান চিহ্নিত করুন)</Label>
            <Input
              value={exercise.arabic}
              onChange={(e) => onUpdate(index, { arabic: e.target.value })}
              className="h-9 font-arabic text-lg"
              dir="rtl"
              placeholder="هَذَا ___"
            />
          </div>
          <div>
            <Label className="text-[10px] font-bold text-muted-foreground">সঠিক উত্তর</Label>
            <Input
              value={exercise.answer}
              onChange={(e) => onUpdate(index, { answer: e.target.value })}
              className="h-9 font-arabic text-lg"
              dir="rtl"
              placeholder="قَلَمٌ"
            />
          </div>
          <div>
            <Label className="text-[10px] font-bold text-muted-foreground">অপশন (প্রতি লাইনে একটি)</Label>
            <textarea
              value={exercise.options.join("\n")}
              onChange={(e) => onUpdate(index, { options: e.target.value.split("\n").filter(Boolean) })}
              className="w-full rounded-xl border border-border/60 bg-card/70 p-2 text-sm font-arabic"
              dir="rtl"
              rows={3}
            />
          </div>
        </div>
      );

    case "listen-choose":
      return (
        <div className="space-y-2">
          {commonPrompt}
          <div>
            <Label className="text-[10px] font-bold text-muted-foreground">আরবি টেক্সট (শোনানো হবে)</Label>
            <Input
              value={exercise.audio}
              onChange={(e) => onUpdate(index, { audio: e.target.value, arabicText: e.target.value })}
              className="h-9 font-arabic text-lg"
              dir="rtl"
              placeholder="حَالٌ"
            />
          </div>
          <div>
            <Label className="text-[10px] font-bold text-muted-foreground">অপশন (ইংরেজি, প্রতি লাইনে একটি)</Label>
            <textarea
              value={exercise.options.join("\n")}
              onChange={(e) => onUpdate(index, { options: e.target.value.split("\n").filter(Boolean) })}
              className="w-full rounded-xl border border-border/60 bg-card/70 p-2 text-sm"
              rows={4}
              placeholder="condition&#10;peace&#10;how"
            />
          </div>
          <div>
            <Label className="text-[10px] font-bold text-muted-foreground">সঠিক উত্তর (০-থেকে শুরু)</Label>
            <Input
              type="number"
              min={0}
              max={exercise.options.length - 1}
              value={exercise.answer}
              onChange={(e) => onUpdate(index, { answer: Number(e.target.value) })}
              className="h-9 w-20"
            />
          </div>
        </div>
      );

    case "translate":
      return (
        <div className="space-y-2">
          {commonPrompt}
          <div>
            <Label className="text-[10px] font-bold text-muted-foreground">আরবি শব্দ</Label>
            <Input
              value={exercise.arabic}
              onChange={(e) => onUpdate(index, { arabic: e.target.value })}
              className="h-9 font-arabic text-lg"
              dir="rtl"
              placeholder="خُبْزٌ"
            />
          </div>
          <div>
            <Label className="text-[10px] font-bold text-muted-foreground">অপশন (আরবি, প্রতি লাইনে একটি)</Label>
            <textarea
              value={exercise.options.join("\n")}
              onChange={(e) => onUpdate(index, { options: e.target.value.split("\n").filter(Boolean) })}
              className="w-full rounded-xl border border-border/60 bg-card/70 p-2 text-sm font-arabic"
              dir="rtl"
              rows={3}
            />
          </div>
          <div>
            <Label className="text-[10px] font-bold text-muted-foreground">সঠিক উত্তর (০-থেকে শুরু)</Label>
            <Input
              type="number"
              min={0}
              max={exercise.options.length - 1}
              value={exercise.answer}
              onChange={(e) => onUpdate(index, { answer: Number(e.target.value) })}
              className="h-9 w-20"
            />
          </div>
        </div>
      );

    default:
      return commonPrompt;
  }
}

/* ---------- Create default exercise by type ---------- */
function createDefaultExercise(type: Exercise["type"]): Exercise {
  const base = { prompt: "", promptBn: "" };
  switch (type) {
    case "multiple-choice":
      return { ...base, type, arabic: "", options: ["", "", "", ""], answer: 0 };
    case "match-pairs":
      return { ...base, type, pairs: [{ left: "", right: "" }, { left: "", right: "" }] };
    case "build-sentence":
      return { ...base, type, tokens: [], answer: "" };
    case "fill-blank":
      return { ...base, type, arabic: "___", answer: "", options: ["", "", ""] };
    case "listen-choose":
      return { ...base, type, audio: "", arabicText: "", options: ["", "", ""], answer: 0 };
    case "translate":
      return { ...base, type, arabic: "", options: ["", "", ""], answer: 0 };
    default:
      return { ...base, type: "multiple-choice", options: [], answer: 0 };
  }
}
