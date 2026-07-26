"use client";

import { create } from "zustand";
import { api } from "@/lib/api/client";
import type { SessionUser } from "@/lib/types";

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setLocal: (patch: Partial<SessionUser>) => void;
}

export const useAuth = create<AuthState>((set, _get) => ({
  user: null,
  loading: true,
  error: null,
  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const { user } = await api.auth.me();
      set({ user, loading: false });
    } catch (e) {
      set({ user: null, loading: false, error: (e as Error).message });
    }
  },
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { user } = await api.auth.login(email, password);
      set({ user, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
      throw e;
    }
  },
  signup: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { user } = await api.auth.signup(name, email, password);
      set({ user, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
      throw e;
    }
  },
  logout: async () => {
    await api.auth.logout();
    set({ user: null });
  },
  setLocal: (patch) =>
    set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
}));

/** Apply server gamification to the local game store (for hearts/gems display). */
export function syncGameFromUser(user: SessionUser) {
  // imported lazily to avoid circular import
  // handled by callers
  void user;
}
