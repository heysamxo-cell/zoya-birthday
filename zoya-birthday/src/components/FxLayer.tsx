"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useEnv } from "@/lib/useEnv";
import { HEART_PATH } from "./Icons";

/* One shared full-screen canvas for all one-shot effects:
   confetti, heart bursts, petals, star showers and the cursor trail.
   The render loop only runs while something is on screen. */

type Kind = "rect" | "heart" | "petal" | "star";
type P = {
  x: number; y: number; vx: number; vy: number; g: number; drag: number;
  rot: number; vr: number; size: number; life: number; max: number; color: string; kind: Kind;
  sway: number; phase: number;
};

export type FxApi = {
  confetti: (opts?: { x?: number; y?: number; count?: number }) => void;
  hearts: (x: number, y: number, count?: number) => void;
  heartRain: (count?: number) => void;
  petals: (count?: number) => void;
  stars: (x: number, y: number, count?: number) => void;
};

const noop = () => {};
const FxCtx = createContext<FxApi>({ confetti: noop, hearts: noop, heartRain: noop, petals: noop, stars: noop });
export const useFx = () => useContext(FxCtx);

const PINKS = ["#ff4d94", "#ff8fb8", "#ffc2d9", "#ffffff", "#e9d5ff", "#ffd36e", "#ff6aa8"];
const HEART = typeof Path2D !== "undefined" ? new Path2D(HEART_PATH) : null;
const STAR = typeof Path2D !== "undefined" ? new Path2D("M12 1.5c.7 5 2.6 8.8 10.5 10.5-7.9 1.7-9.8 5.5-10.5 10.5-.7-5-2.6-8.8-10.5-10.5C9.4 10.3 11.3 6.5 12 1.5z") : null;

export function FxProvider({ children }: { children: React.ReactNode }) {
  const env = useEnv();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parts = useRef<P[]>([]);
  const trail = useRef<{ x: number; y: number; t: number }[]>([]);
  const raf = useRef(0);
  const running = useRef(false);
  const scale = useRef(1);
  const glow = useRef<HTMLCanvasElement | null>(null);
  const envRef = useRef(env);
  envRef.current = env;

  const resize = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, envRef.current.lowEnd ? 1.25 : 2);
    scale.current = dpr;
    c.width = Math.floor(window.innerWidth * dpr);
    c.height = Math.floor(window.innerHeight * dpr);
  }, []);

  const loop = useCallback(function frame(now: number) {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) {
      running.current = false;
      return;
    }
    const dpr = scale.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, c.width / dpr, c.height / dpr);
    const dt = 1 / 60;
    const H = c.height / dpr;

    /* cursor trail */
    const tr = trail.current;
    while (tr.length && now - tr[0].t > 520) tr.shift();
    if (tr.length && glow.current) {
      for (const p of tr) {
        const a = 1 - (now - p.t) / 520;
        ctx.globalAlpha = a * 0.55;
        const s = 10 + 26 * a;
        ctx.drawImage(glow.current, p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    }

    /* particles */
    const arr = parts.current;
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i];
      p.life += dt;
      if (p.life >= p.max || p.y > H + 60) {
        arr.splice(i, 1);
        continue;
      }
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.g * dt;
      p.x += p.vx + Math.sin(p.life * 3 + p.phase) * p.sway;
      p.y += p.vy;
      p.rot += p.vr;
      const k = p.life / p.max;
      ctx.globalAlpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.kind === "rect") {
        ctx.scale(1, Math.abs(Math.cos(p.life * 8 + p.phase)) * 0.8 + 0.2);
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
      } else if (p.kind === "heart" && HEART) {
        const s = p.size / 24;
        ctx.scale(s, s);
        ctx.translate(-12, -12);
        ctx.fill(HEART);
      } else if (p.kind === "star" && STAR) {
        const s = (p.size / 24) * (0.7 + 0.3 * Math.sin(p.life * 10 + p.phase));
        ctx.scale(s, s);
        ctx.translate(-12, -12);
        ctx.fill(STAR);
      } else {
        // petal
        ctx.scale(p.size / 20, p.size / 20);
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 9, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    if (arr.length || tr.length) {
      raf.current = requestAnimationFrame(frame);
    } else {
      running.current = false;
      ctx.clearRect(0, 0, c.width / dpr, c.height / dpr);
    }
  }, []);

  const ensure = useCallback(() => {
    if (running.current) return;
    running.current = true;
    raf.current = requestAnimationFrame(loop);
  }, [loop]);

  const add = useCallback(
    (p: Partial<P> & { kind: Kind; x: number; y: number }) => {
      const cap = envRef.current.lowEnd ? 160 : 320;
      if (parts.current.length > cap) return;
      parts.current.push({
        vx: 0, vy: 0, g: 0.12, drag: 0.992, rot: 0, vr: 0, size: 12, life: 0, max: 2.4,
        color: PINKS[(Math.random() * PINKS.length) | 0], sway: 0, phase: Math.random() * 6, ...p,
      });
    },
    [],
  );

  const api = useMemo<FxApi>(() => {
    const mult = () => (envRef.current.lowEnd ? 0.55 : 1);
    return {
      confetti: ({ x, y, count = 120 } = {}) => {
        if (envRef.current.reduced) count = Math.min(count, 24);
        const W = window.innerWidth;
        const H = window.innerHeight;
        const n = Math.round(count * mult());
        const burst = x !== undefined && y !== undefined;
        for (let i = 0; i < n; i++) {
          const a = burst ? Math.random() * Math.PI * 2 : -Math.PI / 2 + (Math.random() - 0.5) * 1.1;
          const sp = burst ? 3 + Math.random() * 8 : 7 + Math.random() * 10;
          const left = i % 2 === 0;
          add({
            kind: Math.random() < 0.28 ? "heart" : "rect",
            x: burst ? x! : left ? W * 0.12 : W * 0.88,
            y: burst ? y! : H * 0.95,
            vx: burst ? Math.cos(a) * sp : (left ? 1 : -1) * Math.abs(Math.cos(a)) * sp * 0.55 + (Math.random() - 0.5) * 2,
            vy: burst ? Math.sin(a) * sp : Math.sin(a) * sp,
            g: 0.22, drag: 0.985, vr: (Math.random() - 0.5) * 0.3,
            size: 8 + Math.random() * 9, max: 3.4 + Math.random() * 1.6,
          });
        }
      },
      hearts: (x, y, count = 10) => {
        const n = Math.round(count * mult());
        for (let i = 0; i < n; i++) {
          const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
          const sp = 2 + Math.random() * 4.5;
          add({
            kind: "heart", x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: -0.012, drag: 0.975,
            size: 12 + Math.random() * 16, max: 1.6 + Math.random() * 1.2, vr: (Math.random() - 0.5) * 0.06,
            color: ["#ff4d94", "#ff8fb8", "#ff6aa8", "#ffffff"][(Math.random() * 4) | 0], sway: 0.35,
          });
        }
      },
      heartRain: (count = 40) => {
        const n = Math.round(count * mult());
        for (let i = 0; i < n; i++) {
          add({
            kind: "heart", x: Math.random() * window.innerWidth, y: -20 - Math.random() * 300,
            vx: 0, vy: 1 + Math.random() * 1.5, g: 0.004, drag: 1, size: 12 + Math.random() * 18,
            max: 6 + Math.random() * 2, sway: 0.5, vr: (Math.random() - 0.5) * 0.03,
            color: ["#ff4d94", "#ff8fb8", "#ffc2d9", "#ffffff"][(Math.random() * 4) | 0],
          });
        }
      },
      petals: (count = 36) => {
        const n = Math.round(count * mult());
        for (let i = 0; i < n; i++) {
          add({
            kind: "petal", x: Math.random() * window.innerWidth, y: -30 - Math.random() * 400,
            vx: 0.6 + Math.random() * 0.8, vy: 0.8 + Math.random() * 1.4, g: 0.003, drag: 1,
            size: 14 + Math.random() * 12, max: 8, sway: 0.9, vr: (Math.random() - 0.5) * 0.06,
            color: ["#ffc2d9", "#ff9cc7", "#ffe4ee", "#ffb3d1"][(Math.random() * 4) | 0],
          });
        }
      },
      stars: (x, y, count = 14) => {
        const n = Math.round(count * mult());
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2;
          const sp = 1 + Math.random() * 5;
          add({
            kind: "star", x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 0.02, drag: 0.96,
            size: 10 + Math.random() * 12, max: 1.6 + Math.random(), color: ["#fff", "#ffe08a", "#ffc2d9"][(Math.random() * 3) | 0],
          });
        }
      },
    };
  }, [add]);

  // wrap api so that every call also wakes the loop
  const wrapped = useMemo<FxApi>(() => {
    const w = {} as FxApi;
    (Object.keys(api) as (keyof FxApi)[]).forEach((k) => {
      (w as Record<string, unknown>)[k] = (...args: unknown[]) => {
        (api[k] as (...a: unknown[]) => void)(...args);
        ensure();
      };
    });
    return w;
  }, [api, ensure]);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf.current);
      running.current = false;
    };
  }, [resize]);

  /* glow sprite for the trail */
  useEffect(() => {
    const g = document.createElement("canvas");
    g.width = g.height = 64;
    const x = g.getContext("2d")!;
    const grad = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,0.95)");
    grad.addColorStop(0.25, "rgba(255,143,184,0.75)");
    grad.addColorStop(1, "rgba(255,77,148,0)");
    x.fillStyle = grad;
    x.fillRect(0, 0, 64, 64);
    glow.current = g;
  }, []);

  /* cursor trail + click hearts (desktop only) */
  useEffect(() => {
    if (!env.finePointer) return;
    let lastT = 0;
    const move = (e: PointerEvent) => {
      if (envRef.current.reduced) return;
      const now = performance.now();
      if (now - lastT < 18) return;
      lastT = now;
      trail.current.push({ x: e.clientX, y: e.clientY, t: now });
      if (trail.current.length > 28) trail.current.shift();
      ensure();
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      wrapped.hearts(e.clientX, e.clientY, 4);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
    };
  }, [env.finePointer, ensure, wrapped]);

  return (
    <FxCtx.Provider value={wrapped}>
      {children}
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[95] h-full w-full" />
    </FxCtx.Provider>
  );
}
