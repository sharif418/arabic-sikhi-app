"use client";

import { useServiceWorker } from "@/hooks/use-service-worker";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shows an offline banner when the network is unavailable,
 * and an update banner when a new service worker version is available.
 */
export function OfflineIndicator() {
  const { isOnline, updateAvailable, applyUpdate } = useServiceWorker();

  return (
    <AnimatePresence>
      {/* Offline banner */}
      {!isOnline && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 bg-amber-600 text-white py-1.5 px-4 text-xs font-bold safe-top"
        >
          <WifiOff className="h-3.5 w-3.5" />
          আপনি অফলাইনে আছেন — ক্যাশ করা কন্টেন্ট দেখানো হচ্ছে
        </motion.div>
      )}

      {/* Update available banner */}
      {updateAvailable && isOnline && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between gap-2 gradient-emerald text-white py-2 px-4 safe-top"
        >
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="text-xs font-bold">নতুন আপডেট পাওয়া যায়েছে!</span>
          </div>
          <Button
            onClick={applyUpdate}
            size="sm"
            className="h-7 bg-white text-emerald-700 font-bold rounded-lg text-xs tap-scale"
          >
            আপডেট করুন
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
