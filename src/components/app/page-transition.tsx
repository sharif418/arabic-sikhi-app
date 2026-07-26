"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps screen content with a smooth fade + slide transition.
 * Used by screen-router for consistent page transitions.
 */
export function PageTransition({ children, screenKey }: { children: ReactNode; screenKey: string }) {
  return (
    <motion.div
      key={screenKey}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
