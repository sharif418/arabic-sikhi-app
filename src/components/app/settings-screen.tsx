"use client";

import { useNav } from "@/lib/stores/nav-store";
import { useGame } from "@/lib/stores/game-store";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Heart, Target, Bell, Globe, Info, Shield, ChevronRight, Volume2, Vibrate, Clock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/use-notifications";

export function SettingsScreen() {
  const { back } = useNav();
  const { theme, setTheme } = useTheme();
  const { dailyGoalXp, setDailyGoal, gems, refillHearts, hearts, maxHearts } = useGame();

  const HEART_REFILL_COST = 30;
  const isDark = theme === "dark";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 py-3 glass-strong border-b border-border/40 safe-top">
        <button onClick={back} className="tap-scale text-muted-foreground hover:text-foreground">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="font-bengali text-base font-bold">সেটিংস</h1>
      </div>

      <div className="flex-1 overflow-y-auto premium-scroll p-4 space-y-4">
        {/* Appearance */}
        <Section title="উপস্থিতি">
          <Row icon={isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} label="থিম">
            <div className="flex rounded-full bg-muted p-0.5">
              <button
                onClick={() => setTheme("light")}
                className={cn("px-3 py-1 rounded-full text-xs font-bold transition-all", theme === "light" ? "gradient-emerald text-primary-foreground" : "text-muted-foreground")}
              >
                লাইট
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn("px-3 py-1 rounded-full text-xs font-bold transition-all", theme === "dark" ? "gradient-emerald text-primary-foreground" : "text-muted-foreground")}
              >
                ডার্ক
              </button>
            </div>
          </Row>
        </Section>

        {/* Learning */}
        <Section title="শেখা">
          <Row icon={<Target className="h-4 w-4" />} label="দৈনিক লক্ষ্য (XP)">
            <div className="flex gap-1">
              {[10, 30, 50, 100].map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setDailyGoal(g);
                    toast.success(`দৈনিক লক্ষ্য ${g} XP এ সেট করা হয়েছে`);
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold transition-all",
                    dailyGoalXp === g ? "gradient-emerald text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </Row>
          <ReminderTimeRow />
          <Row icon={<Volume2 className="h-4 w-4" />} label="শব্দার্থ উচ্চারণ">
            <ToggleSwitch defaultOn />
          </Row>
          <Row icon={<Vibrate className="h-4 w-4" />} label="হ্যাপটিক ফিডব্যাক">
            <ToggleSwitch defaultOn />
          </Row>
          <Row icon={<Bell className="h-4 w-4" />} label="বিজ্ঞপ্তি">
            <ToggleSwitch />
          </Row>
        </Section>

        {/* Hearts */}
        <Section title="হার্ট">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                <span className="font-bengali text-sm font-bold">{hearts} / {maxHearts}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                💎 {gems}
              </span>
            </div>
            <Button
              onClick={() => {
                if (hearts >= maxHearts) {
                  toast.info("হার্ট ইতিমধ্যে পূর্ণ!");
                } else if (refillHearts(HEART_REFILL_COST)) {
                  toast.success("হার্ট পূরণ হয়েছে! ❤️");
                } else {
                  toast.error("পর্যাপ্ত রত্ন নেই");
                }
              }}
              disabled={hearts >= maxHearts}
              className="w-full h-10 gradient-gold text-white font-bold rounded-xl tap-scale"
            >
              💎 {HEART_REFILL_COST} দিয়ে হার্ট পূরণ করুন
            </Button>
            <p className="font-bengali text-[11px] text-muted-foreground mt-2 text-center">
              হার্ট ৩০ মিনিটে একটি করে ফিরে আসে
            </p>
          </div>
        </Section>

        {/* About */}
        <Section title="সম্পর্কে">
          <Row icon={<Info className="h-4 w-4" />} label="অ্যাপ সংস্করণ">
            <span className="text-xs text-muted-foreground">v1.0.0</span>
          </Row>
          <Row icon={<Shield className="h-4 w-4" />} label="গোপনীয়তা নীতি">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Row>
          <Row icon={<Globe className="h-4 w-4" />} label="ভাষা">
            <span className="text-xs text-muted-foreground font-bengali">বাংলা</span>
          </Row>
        </Section>

        <div className="text-center py-2">
          <p className="font-bengali text-[11px] text-muted-foreground">
            ⭐ আস-সুন্নাহ ফাউন্ডেশনের একটি উদ্যোগ
          </p>
          <p className="font-arabic text-sm text-muted-foreground mt-1">
            جزاكم الله خيرا
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Reminder Time Row ---------- */
function ReminderTimeRow() {
  const { supported, permission, enabled, reminderTime, setReminder, setReminderTime } = useNotifications();

  const times = [
    { value: "06:00", label: "সকাল ৬টা" },
    { value: "09:00", label: "সকাল ৯টা" },
    { value: "12:00", label: "দুপুর ১২টা" },
    { value: "15:00", label: "বিকেল ৩টা" },
    { value: "19:00", label: "সন্ধ্যা ৭টা" },
    { value: "21:00", label: "রাত ৯টা" },
  ];

  const currentLabel = times.find((t) => t.value === reminderTime)?.label ?? reminderTime;

  // If notifications aren't supported, show a disabled state
  if (!supported) {
    return (
      <div className="flex items-center gap-3 px-3.5 py-3 opacity-60">
        <span className="text-muted-foreground">
          <Clock className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="font-bengali text-sm font-semibold">রিমাইন্ডার সময়</p>
          <p className="font-bengali text-[10px] text-muted-foreground mt-0.5">এই ব্রাউজারে সমর্থিত নয়</p>
        </div>
      </div>
    );
  }

  const handleToggle = async (v: boolean) => {
    if (v) {
      const ok = await setReminder(true, reminderTime);
      if (ok) {
        toast.success(`রিমাইন্ডার চালু হয়েছে · প্রতিদিন ${currentLabel}`);
      } else {
        toast.error("বিজ্ঞপ্তি অনুমতি প্রয়োজন। ব্রাউজার সেটিংসে অনুমতি দিন।");
      }
    } else {
      await setReminder(false, reminderTime);
      toast.info("রিমাইন্ডার বন্ধ করা হয়েছে");
    }
  };

  return (
    <div className="flex items-center gap-3 px-3.5 py-3">
      <span className={cn("transition-colors", enabled ? "text-primary" : "text-muted-foreground")}>
        <Clock className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <p className="font-bengali text-sm font-semibold">রিমাইন্ডার সময়</p>
        <p className="font-bengali text-[10px] text-muted-foreground mt-0.5">
          {enabled
            ? permission === "granted"
              ? `প্রতিদিন ${currentLabel} এ বিজ্ঞপ্তি পাবেন`
              : "বিজ্ঞপ্তি অনুমতি প্রয়োজন"
            : "বন্ধ আছে"}
        </p>
      </div>
      {enabled && permission === "granted" && (
        <select
          value={reminderTime}
          onChange={(e) => {
            setReminderTime(e.target.value);
            const label = times.find((t) => t.value === e.target.value)?.label;
            toast.success(`রিমাইন্ডার ${label} এ সেট করা হয়েছে`);
          }}
          className="h-9 rounded-lg border border-border/60 bg-card/70 px-2 text-xs font-bold font-bengali"
        >
          {times.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      )}
      <ToggleSwitch on={enabled} onToggle={handleToggle} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-bengali text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
        {title}
      </h2>
      <div className="rounded-2xl glass border border-border/50 divide-y divide-border/40 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-3">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 font-bengali text-sm font-semibold">{label}</span>
      {children}
    </div>
  );
}

function ToggleSwitch({
  defaultOn = false,
  on: controlledOn,
  onToggle,
}: {
  defaultOn?: boolean;
  on?: boolean;
  onToggle?: (v: boolean) => void;
}) {
  const [internalOn, setInternalOn] = useState(defaultOn);
  const isControlled = controlledOn !== undefined;
  const on = isControlled ? controlledOn : internalOn;

  const handleClick = () => {
    const next = !on;
    if (!isControlled) setInternalOn(next);
    onToggle?.(next);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors",
        on ? "gradient-emerald" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all",
          on ? "left-[22px]" : "left-0.5"
        )}
      />
    </button>
  );
}
