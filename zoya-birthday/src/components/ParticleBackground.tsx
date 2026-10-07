"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useEnv } from "@/lib/useEnv";
import { useAvatar } from "./AvatarProvider";
import { HEART_PATH, SPARKLE_PATH } from "./Icons";

/* Ambient world: hearts, sparkles, tiny stars, bubbles and petals.
   Sprites are pre-rendered once, so each frame is just drawImage calls.
   Stars brighten when a scene asks for "night" (blown-out candles, finale). */

type Kind = "heart" | "sparkle" | "star" | "bubble" | "petal";
type Part = {
  kind: Kind; x: number; y: number; size: number; speed: number; depth: number;
  phase: number; sway: number; rot: number; vr: number; sprite: number;
};

function sprite(size: number, draw: (c: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d")!, size);
  return c;
}

function buildSprites() {
  const heart = (fill: string) =>
    sprite(72, (c, s) => {
      c.scale(s / 24, s / 24);
      c.shadowColor = "rgba(255,255,255,.9)";
      c.shadowBlur = 2;
      c.fillStyle = fill;
      c.fill(new Path2D(HEART_PATH));
    });
  const sparkle = sprite(64, (c, s) => {
    c.scale(s / 24, s / 24);
    c.fillStyle = "#fff";
    c.shadowColor = "#ff8fb8";
    c.shadowBlur = 5;
    c.fill(new Path2D(SPARKLE_PATH));
  });
  const bubble = sprite(96, (c, s) => {
    const g = c.createRadialGradient(s * 0.35, s * 0.3, s * 0.05, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(255,255,255,.95)");
    g.addColorStop(0.35, "rgba(255,225,240,.35)");
    g.addColorStop(0.9, "rgba(255,143,184,.22)");
    g.addColorStop(1, "rgba(255,143,184,0)");
    c.fillStyle = g;
    c.beginPath();
    c.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.55)";
    c.lineWidth = 1.2;
    c.stroke();
  });
  const petal = (fill: string) =>
    sprite(48, (c, s) => {
      c.translate(s / 2, s / 2);
      const g = c.createLinearGradient(0, -s / 2, 0, s / 2);
      g.addColorStop(0, "#fff");
      g.addColorStop(1, fill);
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(0, 0, s * 0.2, s * 0.42, 0, 0, Math.PI * 2);
      c.fill();
    });
  const star = sprite(24, (c, s) => {
    const g = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.35, "rgba(255,255,255,.8)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, s, s);
  });
  return {
    hearts: [heart("#ff8fb8"), heart("#ffc2d9"), heart("#ff4d94"), heart("#ffffff")],
    petals: [petal("#ff9cc7"), petal("#ffc2d9")],
    sparkle, bubble, star,
  };
}

export default function ParticleBackground() {
  const env = useEnv();
  const { night } = useAvatar();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nightRef = useRef(0);
  const nightTarget = useRef(0);
  nightTarget.current = night ? 1 : 0;

  useEffect(() => {
    if (!env.mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const S = buildSprites();
    let W = 0;
    let H = 0;
    let raf = 0;
    const density = env.lowEnd ? 0.5 : 1;
    const counts = { heart: 11, sparkle: 12, star: 34, bubble: 8, petal: 8 };
    const parts: Part[] = [];

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    const resize = () => {
      // phones fire "resize" when the URL bar slides in/out — re-allocating the canvas then causes visible jank
      if (W && window.innerWidth === W && Math.abs(window.innerHeight - H) < 160) return;
      const dpr = Math.min(window.devicePixelRatio || 1, env.lowEnd ? 1.25 : 1.75);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (env.reduced) draw(0);
    };

    const make = () => {
      parts.length = 0;
      (Object.keys(counts) as Kind[]).forEach((k) => {
        const n = Math.max(2, Math.round(counts[k] * density * (env.reduced ? 0.6 : 1)));
        for (let i = 0; i < n; i++) {
          const depth = rnd(0.35, 1);
          parts.push({
            kind: k, x: Math.random(), y: Math.random(), depth,
            size: k === "heart" ? rnd(12, 30) * depth + 6
              : k === "sparkle" ? rnd(8, 16) * depth + 4
              : k === "star" ? rnd(2.5, 6)
              : k === "bubble" ? rnd(24, 70) * depth
              : rnd(12, 20) * depth + 4,
            speed: k === "star" ? 0 : rnd(0.012, 0.03) * depth,
            phase: Math.random() * 10, sway: rnd(8, 26), rot: rnd(0, 6.28), vr: rnd(-0.6, 0.6),
            sprite: (Math.random() * 4) | 0,
          });
        }
      });
    };

    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;
      nightRef.current += (nightTarget.current - nightRef.current) * Math.min(1, dt * 2.2);
      const n = nightRef.current;
      const sy = window.scrollY;
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        if (!env.reduced) {
          if (p.kind === "star" || p.kind === "sparkle") {
            /* stay in place, twinkle */
          } else if (p.kind === "petal") {
            p.y += p.speed * dt * 1.4;
            p.rot += p.vr * dt;
            if (p.y > 1.06) { p.y = -0.06; p.x = Math.random(); }
          } else {
            p.y -= p.speed * dt;
            if (p.y < -0.08) { p.y = 1.08; p.x = Math.random(); }
          }
        }
        const par = (sy * p.depth * 0.06) % (H + 120);
        const px = p.x * W + (env.reduced ? 0 : Math.sin(t * 0.6 + p.phase) * p.sway);
        let py = p.y * H - par;
        if (py < -60) py += H + 120;
        ctx.save();
        ctx.translate(px, py);
        switch (p.kind) {
          case "heart": {
            ctx.globalAlpha = (0.32 + p.depth * 0.4) * (1 - n * 0.45);
            ctx.rotate(Math.sin(t * 0.5 + p.phase) * 0.35);
            ctx.drawImage(S.hearts[p.sprite], -p.size / 2, -p.size / 2, p.size, p.size);
            break;
          }
          case "sparkle": {
            const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.8 + p.phase));
            ctx.globalAlpha = tw * (0.55 + n * 0.3);
            const s = p.size * (0.7 + tw * 0.5);
            ctx.rotate(p.rot * 0.2);
            ctx.drawImage(S.sparkle, -s / 2, -s / 2, s, s);
            break;
          }
          case "star": {
            const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.4 + p.phase * 3));
            ctx.globalAlpha = (0.18 + n * 0.8) * tw;
            ctx.drawImage(S.star, -p.size, -p.size, p.size * 2, p.size * 2);
            break;
          }
          case "bubble": {
            ctx.globalAlpha = 0.55 * (1 - n * 0.4);
            ctx.drawImage(S.bubble, -p.size / 2, -p.size / 2, p.size, p.size);
            break;
          }
          case "petal": {
            ctx.globalAlpha = 0.7 * (1 - n * 0.3);
            ctx.rotate(p.rot + Math.sin(t + p.phase) * 0.6);
            ctx.drawImage(S.petals[p.sprite & 1], -p.size / 2, -p.size / 2, p.size, p.size);
            break;
          }
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    };

    const minGap = env.lowEnd ? 1000 / 30 : 1000 / 50;
    let lastDraw = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - lastDraw < minGap) return;
      lastDraw = now;
      draw(now);
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !env.reduced) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    resize();
    make();
    window.addEventListener("resize", resize);
    if (env.reduced) draw(performance.now());
    else raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
    };
  }, [env.mounted, env.reduced, env.lowEnd]);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] h-full w-full" />
      {/* night veil */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[2]"
        style={{ background: "radial-gradient(120% 90% at 50% 18%, #8c2472 0%, #4b1252 48%, #220a36 100%)" }}
        initial={false}
        animate={{ opacity: night ? 0.8 : 0 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
    </>
  );
}
