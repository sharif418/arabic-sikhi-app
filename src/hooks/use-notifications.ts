"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "arabic-sikhi-reminder";

interface ReminderConfig {
  enabled: boolean;
  time: string; // "HH:MM"
  lastShown: string | null; // YYYY-MM-DD
}

/**
 * Hook for managing browser notifications at a scheduled reminder time.
 * Checks every minute if it's time to show a reminder.
 */
function loadInitialConfig(): ReminderConfig {
  if (typeof window === "undefined") {
    return { enabled: false, time: "19:00", lastShown: null };
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch { /* ignore */ }
  }
  return { enabled: false, time: "19:00", lastShown: null };
}

function getInitialPermission(): NotificationPermission {
  if (typeof window !== "undefined" && "Notification" in window) {
    return Notification.permission;
  }
  return "default";
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(getInitialPermission);
  const [config, setConfig] = useState<ReminderConfig>(loadInitialConfig);

  // Save config to localStorage
  const saveConfig = useCallback((next: ReminderConfig) => {
    setConfig(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, []);

  // Enable/disable reminders
  const setReminder = useCallback(async (enabled: boolean, time: string) => {
    if (enabled) {
      const granted = await requestPermission();
      if (!granted) return false;
    }
    saveConfig({ enabled, time, lastShown: config.lastShown });
    return true;
  }, [config.lastShown, requestPermission, saveConfig]);

  // Update reminder time
  const setReminderTime = useCallback((time: string) => {
    saveConfig({ ...config, time });
  }, [config, saveConfig]);

  // Check every minute if it's time to show a notification
  useEffect(() => {
    if (!config.enabled || permission !== "granted") return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const check = () => {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      if (config.lastShown === todayStr) return;

      const [h, m] = config.time.split(":").map(Number);
      if (now.getHours() === h && now.getMinutes() >= m) {
        // Time to show!
        try {
          new Notification("আরবি শিখি 🔥", {
            body: `আজকের লেসন সম্পন্ন করুন! আপনার স্ট্রিক ধরে রাখুন।`,
            icon: "/app-icon.png",
            tag: "daily-reminder",
          });
          saveConfig({ ...config, lastShown: todayStr });
        } catch { /* ignore */ }
      }
    };

    check(); // Check immediately
    const interval = setInterval(check, 60_000); // Then every minute
    return () => clearInterval(interval);
  }, [config, permission, saveConfig]);

  return {
    permission,
    supported: typeof window !== "undefined" && "Notification" in window,
    enabled: config.enabled,
    reminderTime: config.time,
    setReminder,
    setReminderTime,
    requestPermission,
  };
}
