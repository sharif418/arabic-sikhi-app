"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "as-install-dismissed";

/**
 * Shows a PWA install prompt banner when the browser fires
 * the beforeinstallprompt event (and the user hasn't dismissed it before).
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if previously dismissed
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md"
        >
          <div className="rounded-2xl glass-strong border border-border/50 p-4 shadow-2xl flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-emerald text-white">
              <Download className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bengali text-sm font-bold">অ্যাপ ইনস্টল করুন</p>
              <p className="font-bengali text-[11px] text-muted-foreground mt-0.5">
                অফলাইনে শিখুন · দ্রুত অ্যাক্সেস
              </p>
            </div>
            <Button
              onClick={handleInstall}
              size="sm"
              className="h-9 gradient-emerald text-primary-foreground font-bold rounded-xl tap-scale shrink-0"
            >
              ইনস্টল
            </Button>
            <button
              onClick={handleDismiss}
              className="shrink-0 text-muted-foreground hover:text-foreground tap-scale p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
