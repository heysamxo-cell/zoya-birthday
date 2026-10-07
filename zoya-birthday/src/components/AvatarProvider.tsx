"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type Mood = "idle" | "happy" | "shy" | "excited" | "surprised" | "love" | "celebrate";

type Ctx = {
  /** The mood the avatar is showing right now (reaction overrides base). */
  mood: Mood;
  /** Long-lived mood (e.g. driven by the heart game score). */
  setBase: (m: Mood) => void;
  /** Temporary reaction; returns to base after `ms`. `say` shows a speech bubble. */
  react: (m: Mood, ms?: number, say?: string) => void;
  bubble: string | null;
  /** Scenes can request the "night" look (dim sky, bright stars). */
  night: boolean;
  setNight: (key: string, on: boolean) => void;
  /** increments on every celebrate/love reaction so effects can re-fire */
  pulse: number;
};

const AvatarCtx = createContext<Ctx | null>(null);

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const [base, setBase] = useState<Mood>("idle");
  const [override, setOverride] = useState<Mood | null>(null);
  const [bubble, setBubble] = useState<string | null>(null);
  const [nightKeys, setNightKeys] = useState<Record<string, boolean>>({});
  const [pulse, setPulse] = useState(0);
  const t1 = useRef<ReturnType<typeof setTimeout>>();
  const t2 = useRef<ReturnType<typeof setTimeout>>();

  const react = useCallback((m: Mood, ms = 2400, say?: string) => {
    clearTimeout(t1.current);
    clearTimeout(t2.current);
    setOverride(m);
    setPulse((p) => p + 1);
    if (say) {
      setBubble(say);
      t2.current = setTimeout(() => setBubble(null), Math.max(1600, ms));
    }
    t1.current = setTimeout(() => setOverride(null), ms);
  }, []);

  const setNight = useCallback((key: string, on: boolean) => {
    setNightKeys((prev) => {
      if (!!prev[key] === on) return prev;
      const next = { ...prev };
      if (on) next[key] = true;
      else delete next[key];
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(t1.current);
      clearTimeout(t2.current);
    };
  }, []);

  const night = Object.keys(nightKeys).length > 0;
  useEffect(() => {
    document.documentElement.dataset.night = night ? "true" : "false";
  }, [night]);

  const value = useMemo<Ctx>(
    () => ({ mood: override ?? base, setBase, react, bubble, night, setNight, pulse }),
    [override, base, react, bubble, night, setNight, pulse],
  );
  return <AvatarCtx.Provider value={value}>{children}</AvatarCtx.Provider>;
}

export function useAvatar(): Ctx {
  const c = useContext(AvatarCtx);
  if (!c) throw new Error("useAvatar must be used inside <AvatarProvider>");
  return c;
}
