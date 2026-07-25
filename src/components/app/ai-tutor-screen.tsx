"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/stores/auth-store";
import { useNav } from "@/lib/stores/nav-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Sparkles, Loader2, Trash2, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "السلام عليكم এর অর্থ কী?",
  "كتاب শব্দটি বাক্যে ব্যবহার করো",
  "আরবিতে কীভাবে ধন্যবাদ বলি?",
  "একটি সহজ আরবি বাক্য শেখাও",
];

export function AiTutorScreen() {
  const { user } = useAuth();
  const { back } = useNav();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "আসসালামু আলাইকুম! 👋 আমি আপনার AI আরবি শিক্ষক। আরবি ভাষা সম্পর্কে যেকোনো প্রশ্ন করুন, আমি সাহায্য করব ইনশাআল্লাহ।",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await api.ai.tutor(
        next.map((m) => ({ role: m.role, content: m.content })),
        { level: user?.level, currentLesson: undefined }
      );
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setMessages([
      {
        role: "assistant",
        content: "নতুন করে শুরু করি! আপনার প্রশ্ন করুন। 😊",
      },
    ]);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 glass-strong safe-top">
        <button onClick={back} className="tap-scale text-muted-foreground hover:text-foreground">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl gradient-aurora text-white">
          <Bot className="h-5 w-5" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
        </div>
        <div className="flex-1">
          <h1 className="font-bengali text-sm font-bold">AI আরবি শিক্ষক</h1>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> অনলাইন
          </p>
        </div>
        <button onClick={clear} className="tap-scale text-muted-foreground hover:text-foreground p-2">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto premium-scroll px-4 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-2", m.role === "user" ? "flex-row-reverse" : "")}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white",
                  m.role === "user" ? "bg-muted-foreground" : "gradient-aurora"
                )}
              >
                {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-3.5 py-2.5 font-bengali text-sm leading-relaxed",
                  m.role === "user"
                    ? "gradient-emerald text-primary-foreground rounded-tr-sm"
                    : "glass border border-border/50 rounded-tl-sm"
                )}
              >
                <FormattedContent text={m.content} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-aurora text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="glass border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Suggestions */}
        {messages.length <= 1 && !loading && (
          <div className="pt-2">
            <p className="font-bengali text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> এই প্রশ্নগুলো চেষ্টা করুন
            </p>
            <div className="grid gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left rounded-xl glass border border-border/50 px-3 py-2.5 font-bengali text-sm hover:border-primary/40 hover:bg-accent/40 tap-scale"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-border/40 glass-strong safe-bottom">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="আপনার প্রশ্ন লিখুন..."
            className="flex-1 h-11 rounded-full bg-card/70 border-border/60 font-bengali"
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || loading}
            className="h-11 w-11 rounded-full gradient-emerald text-primary-foreground shadow-soft tap-scale shrink-0"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}

/** Render Arabic text with RTL + transliteration styling. */
function FormattedContent({ text }: { text: string }) {
  // Split by lines and render Arabic segments with the arabic font
  const parts = text.split(/(«[^»]+»|"[^"]+")/g);
  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.startsWith("«") && part.endsWith("»")) {
          return (
            <span key={i} className="font-arabic text-base font-bold text-primary inline-block mx-0.5">
              {part.slice(1, -1)}
            </span>
          );
        }
        if (part.startsWith('"') && part.endsWith('"')) {
          return (
            <span key={i} className="font-arabic text-base font-bold inline-block mx-0.5">
              {part.slice(1, -1)}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}
