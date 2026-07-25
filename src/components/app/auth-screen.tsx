"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/stores/auth-store";
import { useNav } from "@/lib/stores/nav-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthScreen() {
  const { login, signup } = useAuth();
  const { resetTo } = useNav();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      resetTo({ name: "home" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      await login("learner@arabicsikhi.com", "demo1234");
      resetTo({ name: "home" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col overflow-y-auto premium-scroll gradient-hero">
      {/* Brand header */}
      <div className="flex flex-col items-center pt-12 pb-6 px-6 safe-top">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl gradient-emerald text-white shadow-glow-emerald">
            <span className="font-arabic text-4xl font-bold">ع</span>
          </div>
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full gradient-gold shadow-soft flex items-center justify-center">
            <span className="text-[10px]">✦</span>
          </div>
        </motion.div>
        <h1 className="font-bengali mt-4 text-2xl font-extrabold text-foreground">
          আরবি শিখি
        </h1>
        <p className="text-xs text-muted-foreground font-medium mt-1">
          Arabic Sikhi — Premium Quranic Arabic Learning
        </p>
        <p className="font-bengali text-[11px] text-muted-foreground/80 mt-0.5">
          আস-সুন্নাহ ফাউন্ডেশনের একটি উদ্যোগ
        </p>
      </div>

      {/* Form card */}
      <div className="flex-1 px-5 pb-8">
        <div className="glass-strong rounded-3xl p-5 shadow-soft border border-border/50">
          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-muted/60 mb-5">
            <button
              onClick={() => setMode("signup")}
              className={cn(
                "py-2.5 rounded-xl text-sm font-bold transition-all tap-scale",
                mode === "signup"
                  ? "gradient-emerald text-primary-foreground shadow-soft"
                  : "text-muted-foreground"
              )}
            >
              নতুন অ্যাকাউন্ট
            </button>
            <button
              onClick={() => setMode("login")}
              className={cn(
                "py-2.5 rounded-xl text-sm font-bold transition-all tap-scale",
                mode === "login"
                  ? "gradient-emerald text-primary-foreground shadow-soft"
                  : "text-muted-foreground"
              )}
            >
              লগইন
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground">
                  নাম
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="আপনার নাম"
                    className="pl-9 h-12 rounded-xl bg-card/60 border-border/60"
                    required
                    minLength={2}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
                ইমেইল
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-9 h-12 rounded-xl bg-card/60 border-border/60"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                পাসওয়ার্ড
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-9 h-12 rounded-xl bg-card/60 border-border/60"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full h-12 gradient-emerald text-primary-foreground font-bold rounded-xl shadow-glow-emerald tap-scale"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {mode === "signup" ? "অ্যাকাউন্ট তৈরি করুন" : "লগইন করুন"}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              অথবা
            </span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          {/* Demo login */}
          <Button
            type="button"
            onClick={fillDemo}
            disabled={loading}
            variant="outline"
            className="w-full h-11 rounded-xl font-semibold tap-scale"
          >
            <span className="mr-1.5">🎮</span> ডেমো অ্যাকাউন্টে প্রবেশ করুন
          </Button>
        </div>

        <p className="font-bengali text-center text-[11px] text-muted-foreground mt-4 px-4 leading-relaxed">
          চালিয়ে যগগলে আপনি আমাদের{" "}
          <span className="font-semibold text-foreground">শর্তাবলী</span> ও{" "}
          <span className="font-semibold text-foreground">গোপনীয়তা নীতিতে</span> সম্মত হচ্ছেন।
        </p>
      </div>
    </div>
  );
}
