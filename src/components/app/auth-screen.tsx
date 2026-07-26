"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/stores/auth-store";
import { useNav } from "@/lib/stores/nav-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, User, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";
type Step = "credentials" | "otp";

export function AuthScreen() {
  const { login } = useAuth();
  const { resetTo } = useNav();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [step, setStep] = useState<Step>("credentials");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [resendCooldown]);

  // Handle OTP input — auto-advance to next field
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpCode];
    next[index] = value;
    setOtpCode(next);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent): void => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtpCode(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  // Step 1: Submit credentials → send OTP
  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: mode === "signup" ? name : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Dev mode: show the code directly
      if (data.devCode) {
        setInfo(`ডেভ মোড: কোড হলো ${data.devCode}`);
        setOtpCode(data.devCode.split(""));
      } else {
        setInfo("যাচাই কোড আপনার ইমেইলে পাঠানো হয়েছে");
      }
      setStep("otp");
      setResendCooldown(30);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP → auto-login
  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const code = otpCode.join("");
      if (code.length !== 6) {
        throw new Error("৬-সংখ্যার কোড লিখুন");
      }

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, name: mode === "signup" ? name : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Auto-login: hydrate auth store with the returned user
      useAuth.setState({ user: data.user, loading: false });
      resetTo({ name: "home" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: mode === "signup" ? name : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInfo("নতুন কোড পাঠানো হয়েছে");
      setOtpCode(["", "", "", "", "", ""]);
      setResendCooldown(30);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Demo login (password-based, for existing accounts)
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
          <AnimatePresence mode="wait">
            {step === "credentials" ? (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
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

                <form onSubmit={submitCredentials} className="space-y-3.5">
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
                        {mode === "signup" ? "যাচাই কোড পাঠান" : "লগইন কোড পাঠান"}
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Info about OTP flow */}
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 px-3 py-2.5">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  <p className="font-bengali text-[11px] text-muted-foreground">
                    আমরা আপনার ইমেইলে একটি ৬-সংখ্যার কোড পাঠাব। পাসওয়ার্ড মনে রাখার দরকার নেই!
                  </p>
                </div>

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
              </motion.div>
            ) : (
              /* Step 2: OTP Verification */
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="text-center mb-6">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-emerald text-white shadow-glow-emerald mb-3">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <h2 className="font-bengali text-lg font-extrabold">ইমেইল যাচাই করুন</h2>
                  <p className="font-bengali text-xs text-muted-foreground mt-1">
                    {email} এ ৬-সংখ্যার কোড পাঠানো হয়েছে
                  </p>
                </div>

                {info && (
                  <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium text-center">
                    {info}
                  </div>
                )}

                {error && (
                  <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={verifyOTP} className="space-y-5">
                  {/* OTP inputs */}
                  <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                    {otpCode.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={cn(
                          "h-14 w-12 rounded-xl border-2 text-center text-2xl font-extrabold transition-all",
                          digit
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border/60 bg-card/60 text-foreground",
                          "focus:outline-none focus:border-primary focus:bg-primary/5"
                        )}
                      />
                    ))}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || otpCode.join("").length !== 6}
                    size="lg"
                    className="w-full h-12 gradient-emerald text-primary-foreground font-bold rounded-xl shadow-glow-emerald tap-scale"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        যাচাই করুন ও প্রবেশ করুন
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Resend + back */}
                <div className="mt-5 flex items-center justify-between">
                  <button
                    onClick={() => { setStep("credentials"); setError(null); setInfo(null); setOtpCode(["", "", "", "", "", ""]); }}
                    className="text-xs text-muted-foreground hover:text-foreground tap-scale"
                  >
                    ← ফিরে যান
                  </button>
                  <button
                    onClick={resendOTP}
                    disabled={resendCooldown > 0 || loading}
                    className="flex items-center gap-1 text-xs font-bold text-primary disabled:opacity-50 tap-scale"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {resendCooldown > 0 ? `পুনরায় পাঠান (${resendCooldown}s)` : "পুনরায় কোড পাঠান"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="font-bengali text-center text-[11px] text-muted-foreground mt-4 px-4 leading-relaxed">
          চালিয়ে গেলে আপনি আমাদের{" "}
          <span className="font-semibold text-foreground">শর্তাবলী</span> ও{" "}
          <span className="font-semibold text-foreground">গোপনীয়তা নীতিতে</span> সম্মত হচ্ছেন।
        </p>
      </div>
    </div>
  );
}
