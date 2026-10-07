"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Rich, HEART_PATH } from "./Icons";
import { useAvatar, Mood } from "./AvatarProvider";
import { useFx } from "./FxLayer";
import { useEnv } from "@/lib/useEnv";
import { chime } from "@/lib/music";
import { SITE } from "@/lib/config";

const DURATION = 30;
const HEART = typeof Path2D !== "undefined" ? new Path2D(HEART_PATH) : null;

type H = { x: number; y: number; vy: number; size: number; kind: "pink" | "white" | "gold"; color: string; phase: number; sway: number; pts: number };
type Burst = { x: number; y: number; vx: number; vy: number; life: number; size: number; color: string };
type Float = { x: number; y: number; life: number; text: string; color: string };

function moodFor(score: number): Mood {
  if (score >= 45) return "love";
  if (score >= 28) return "excited";
  if (score >= 10) return "happy";
  return "idle";
}

export default function HeartGame() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrapRef, { amount: 0.2 });
  const env = useEnv();
  const { setBase, react } = useAvatar();
  const fx = useFx();
  const [status, setStatus] = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [best, setBest] = useState(0);

  const st = useRef({
    hearts: [] as H[], bursts: [] as Burst[], floats: [] as Float[],
    score: 0, time: DURATION, spawn: 0, w: 0, h: 0, dpr: 1, status: "idle" as "idle" | "playing" | "over",
    lastSec: DURATION,
  });

  const size = useCallback(() => {
    const c = canvasRef.current;
    const w = wrapRef.current;
    if (!c || !w) return;
    const dpr = Math.min(window.devicePixelRatio || 1, env.lowEnd ? 1.5 : 2);
    const r = w.getBoundingClientRect();
    st.current.w = r.width;
    st.current.h = r.height;
    st.current.dpr = dpr;
    c.width = Math.floor(r.width * dpr);
    c.height = Math.floor(r.height * dpr);
  }, [env.lowEnd]);

  useEffect(() => {
    size();
    const ro = new ResizeObserver(size);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [size]);

  /* mood follows score */
  useEffect(() => {
    if (status === "playing") setBase(moodFor(score));
  }, [score, status, setBase]);
  useEffect(() => () => setBase("idle"), [setBase]);

  const start = () => {
    const s = st.current;
    s.hearts = [];
    s.bursts = [];
    s.floats = [];
    s.score = 0;
    s.time = DURATION;
    s.spawn = 0.2;
    s.lastSec = DURATION;
    s.status = "playing";
    setScore(0);
    setTime(DURATION);
    setStatus("playing");
    react("excited", 1600, "Catch them all!");
  };

  const finish = useCallback(() => {
    const s = st.current;
    s.status = "over";
    setStatus("over");
    setBest((b) => Math.max(b, s.score));
    setBase("happy");
    react("celebrate", 4200, "Infinite Cuteness!");
    chime("up");
    fx.confetti({ count: 130 });
  }, [fx, react, setBase]);

  /* game loop – only while visible & playing */
  useEffect(() => {
    if (status !== "playing" || !inView) return;
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    let raf = 0;
    let last = performance.now();
    const s = st.current;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      s.time -= dt;
      const sec = Math.max(0, Math.ceil(s.time));
      if (sec !== s.lastSec) {
        s.lastSec = sec;
        setTime(sec);
      }
      const prog = 1 - s.time / DURATION;
      s.spawn -= dt;
      if (s.spawn <= 0) {
        s.spawn = 0.62 - prog * 0.3 + Math.random() * 0.18;
        const base = Math.max(26, Math.min(54, s.w / 14));
        const r = Math.random();
        const kind: H["kind"] = r < 0.08 ? "gold" : r < 0.28 ? "white" : "pink";
        const sz = base * (0.75 + Math.random() * 0.6) * (kind === "gold" ? 1.15 : 1);
        s.hearts.push({
          x: sz + Math.random() * (s.w - sz * 2), y: -sz, size: sz,
          vy: (s.h / 4.3 + prog * s.h * 0.12) * (kind === "gold" ? 1.45 : kind === "white" ? 1.2 : 1) * (0.85 + Math.random() * 0.4),
          kind, color: kind === "gold" ? "#ffb347" : kind === "white" ? "#ffffff" : ["#ff4d94", "#ff8fb8", "#ff6aa8"][(Math.random() * 3) | 0],
          phase: Math.random() * 6, sway: 10 + Math.random() * 22, pts: kind === "gold" ? 5 : 1,
        });
      }
      for (const h of s.hearts) h.y += h.vy * dt;
      s.hearts = s.hearts.filter((h) => h.y < s.h + h.size);
      for (const b of s.bursts) {
        b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 260 * dt; b.life -= dt * 1.8;
      }
      s.bursts = s.bursts.filter((b) => b.life > 0);
      for (const f of s.floats) { f.y -= 50 * dt; f.life -= dt * 1.3; }
      s.floats = s.floats.filter((f) => f.life > 0);

      /* draw */
      const dpr = s.dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, s.w, s.h);
      for (const h of s.hearts) {
        const x = h.x + Math.sin(now / 700 + h.phase) * h.sway;
        ctx.save();
        ctx.translate(x, h.y);
        ctx.rotate(Math.sin(now / 600 + h.phase) * 0.25);
        const k = h.size / 24;
        ctx.scale(k, k);
        ctx.translate(-12, -12);
        ctx.shadowColor = h.kind === "gold" ? "rgba(255,200,80,.95)" : "rgba(255,77,148,.55)";
        ctx.shadowBlur = h.kind === "gold" ? 26 : 14;
        ctx.fillStyle = h.color;
        if (HEART) ctx.fill(HEART);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,255,255,.75)";
        ctx.beginPath();
        ctx.ellipse(8, 8.5, 2.6, 1.6, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      for (const b of s.bursts) {
        ctx.globalAlpha = Math.max(0, b.life);
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size * b.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.font = "800 22px Quicksand, system-ui, sans-serif";
      ctx.textAlign = "center";
      for (const f of s.floats) {
        ctx.globalAlpha = Math.max(0, f.life);
        ctx.fillStyle = f.color;
        ctx.fillText(f.text, f.x, f.y);
      }
      ctx.globalAlpha = 1;

      if (s.time <= 0) {
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [status, inView, finish]);

  /* tap / click */
  const onPointerDown = (e: React.PointerEvent) => {
    const s = st.current;
    if (s.status !== "playing") return;
    const r = canvasRef.current!.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const now = performance.now();
    let hit = -1;
    let bestD = Infinity;
    s.hearts.forEach((h, i) => {
      const hx = h.x + Math.sin(now / 700 + h.phase) * h.sway;
      const d = Math.hypot(hx - px, h.y - py);
      if (d < h.size * 0.95 + 10 && d < bestD) {
        bestD = d;
        hit = i;
      }
    });
    if (hit < 0) return;
    const h = s.hearts[hit];
    const hx = h.x + Math.sin(now / 700 + h.phase) * h.sway;
    s.hearts.splice(hit, 1);
    s.score += h.pts;
    setScore(s.score);
    s.floats.push({ x: hx, y: h.y - h.size * 0.6, life: 1, text: `+${h.pts}`, color: h.kind === "gold" ? "#ff9a1f" : "#ff3d8b" });
    const n = h.kind === "gold" ? 16 : 9;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 60 + Math.random() * 160;
      s.bursts.push({ x: hx, y: h.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: 1, size: 2 + Math.random() * 3.5, color: h.kind === "gold" ? "#ffd36e" : ["#ff4d94", "#ffc2d9", "#fff"][i % 3] });
    }
  };

  const happiness = Math.min(1, score / 50);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="glass rounded-full px-5 py-2.5 text-base font-bold text-deep sm:text-lg" aria-live="polite">
          {SITE.name}&rsquo;s Love Score: <span className="text-hot tabular-nums">{score}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden h-3 w-28 overflow-hidden rounded-full bg-white/70 sm:block" title="Happiness meter" aria-hidden="true">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-rose to-hot" animate={{ width: `${happiness * 100}%` }} />
          </div>
          <div className="glass grid h-11 min-w-[4.5rem] place-items-center rounded-full px-4 text-base font-bold tabular-nums text-deep">{status === "playing" ? `${time}s` : `${DURATION}s`}</div>
        </div>
      </div>

      <div
        ref={wrapRef}
        className="glass glow-ring relative aspect-[4/5] w-full touch-manipulation select-none overflow-hidden rounded-[2rem] sm:aspect-[16/10]"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,194,217,.45))" }}
      >
        <div className="absolute left-0 top-0 h-1.5 bg-gradient-to-r from-rose to-hot" style={{ width: `${status === "playing" ? (1 - time / DURATION) * 100 : status === "over" ? 100 : 0}%`, transition: "width 1s linear" }} />
        <canvas ref={canvasRef} onPointerDown={onPointerDown} className="absolute inset-0 h-full w-full" aria-label="Heart catching game area" />

        <AnimatePresence>
          {status !== "playing" && (
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute inset-0 grid place-items-center bg-white/35 p-5 text-center backdrop-blur-[3px]"
            >
              {status === "idle" ? (
                <div>
                  <h3 className="text-3xl font-bold text-deep sm:text-4xl">Catch the Hearts</h3>
                  <p className="mx-auto mt-2 max-w-xs text-base font-medium text-deep/75 sm:text-lg">Tap the falling hearts for {DURATION} seconds. Golden ones are worth 5!</p>
                  <button type="button" className="btn-glow mt-6" onClick={start}>
                    <Rich iconClass="text-white">Start 💗</Rich>
                  </button>
                </div>
              ) : (
                <div>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12 }} className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full bg-hot text-white shadow-glow">
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor"><path d={HEART_PATH} /></svg>
                  </motion.div>
                  <p className="text-sm font-bold uppercase tracking-[0.25em] text-hot">{SITE.name} unlocked</p>
                  <h3 className="text-shimmer mt-1 text-balance text-3xl font-extrabold leading-tight sm:text-5xl">
                    <Rich>{"Infinite Cuteness 💗"}</Rich>
                  </h3>
                  <p className="mt-3 text-lg font-semibold text-deep">
                    Final score: <span className="text-hot">{score}</span> · Best: <span className="text-hot">{best}</span>
                  </p>
                  <button type="button" className="btn-glow mt-5 !min-h-12" onClick={start}>
                    Play again
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
