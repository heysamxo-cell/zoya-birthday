"use client";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import { Rich, IconHeart } from "./Icons";
import { WHEEL, COMPLIMENTS, SECRETS, WheelKey } from "@/lib/content";
import { useAvatar, Mood } from "./AvatarProvider";
import { useFx } from "./FxLayer";
import { chime } from "@/lib/music";
import { SITE } from "@/lib/config";

const N = WHEEL.length;
const SEG = 360 / N;
const R = 200;
const FILLS = ["#ffe0ec", "#ffa9cb", "#fff0f6", "#ff86b6", "#ffd0e3", "#ff6aa8"];
const TEXT = ["#8a1f55", "#fff", "#8a1f55", "#fff", "#8a1f55", "#fff"];

function polar(deg: number, r: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [R + r * Math.cos(a), R + r * Math.sin(a)];
}
function slice(i: number, r: number) {
  const [x1, y1] = polar(i * SEG, r);
  const [x2, y2] = polar((i + 1) * SEG, r);
  return `M${R} ${R}L${x1} ${y1}A${r} ${r} 0 0 1 ${x2} ${y2}Z`;
}

const RESULTS: Record<WheelKey, { title: string; mood: Mood; say: string; body: () => string; fx: "hearts" | "stars" | "confetti" | "rain" }> = {
  compliment: { title: "A Compliment", mood: "shy", say: "Stop, I'm blushing 🙈", body: () => COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)], fx: "hearts" },
  secret: { title: "A Little Secret", mood: "surprised", say: "Ooh, a secret!", body: () => SECRETS[Math.floor(Math.random() * SECRETS.length)], fx: "stars" },
  wish: { title: "Make a Wish", mood: "love", say: "Close your eyes…", body: () => "Close your eyes, hold it tight in your heart, and make a wish. It's already on its way to you.", fx: "stars" },
  surprise: { title: "Birthday Surprise", mood: "celebrate", say: "A surprise?!", body: () => `Today, whatever you crave — you get to choose it. That's ${SITE.name}'s birthday rule, and it can't be argued with.`, fx: "confetti" },
  hug: { title: "Virtual Hug", mood: "love", say: "Hug received 💗", body: () => "Sending you the warmest, longest, tightest hug in the world. Hold on for as long as you need.", fx: "hearts" },
  love: { title: "More Love", mood: "excited", say: "So much love!", body: () => "Here's an extra helping of love, just because you deserve it — today and every day.", fx: "rain" },
};

export default function SpinWheel() {
  const rot = useMotionValue(0);
  const pointer = useMotionValue(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ key: WheelKey; text: string } | null>(null);
  const { react } = useAvatar();
  const fx = useFx();
  const lastSeg = useRef(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const bulbs = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    react("excited", 5600, "Spin, spin, spin!");
    const idx = Math.floor(Math.random() * N);
    const centre = idx * SEG + SEG / 2;
    const jitter = (Math.random() - 0.5) * (SEG * 0.6);
    const cur = rot.get();
    const delta = ((-(centre + jitter) - cur) % 360 + 360) % 360;
    const target = cur + 360 * 5 + delta;
    lastSeg.current = Math.floor((((-cur % 360) + 360) % 360) / SEG);
    animate(rot, target, {
      duration: 5.4,
      ease: [0.12, 0.72, 0.14, 1],
      onUpdate: (v) => {
        const seg = Math.floor((((-v % 360) + 360) % 360) / SEG);
        if (seg !== lastSeg.current) {
          lastSeg.current = seg;
          animate(pointer, [0, -22, 0], { duration: 0.18 });
        }
      },
      onComplete: () => {
        setSpinning(false);
        const key = WHEEL[idx].key;
        const r = RESULTS[key];
        setResult({ key, text: r.body() });
        react(r.mood, 3800, r.say);
        chime("up");
        const box = wheelRef.current?.getBoundingClientRect();
        const cx = box ? box.left + box.width / 2 : window.innerWidth / 2;
        const cy = box ? box.top + box.height / 2 : window.innerHeight / 2;
        if (r.fx === "hearts") fx.hearts(cx, cy, 24);
        if (r.fx === "stars") fx.stars(cx, cy, 24);
        if (r.fx === "confetti") fx.confetti({ x: cx, y: cy, count: 120 });
        if (r.fx === "rain") fx.heartRain(34);
      },
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center">
      <div ref={wheelRef} className="relative w-[min(88vw,430px)]">
        {/* glow */}
        <div aria-hidden="true" className="absolute inset-[-6%] rounded-full bg-hot/30 blur-3xl" />
        {/* pointer */}
        <div className="absolute left-1/2 top-[-3.5%] z-20 w-[12%] -translate-x-1/2 drop-shadow-lg" aria-hidden="true">
         <motion.div style={{ rotate: pointer, originX: 0.5, originY: 0.2 }}>
          <svg viewBox="0 0 48 60" className="h-auto w-full">
            <defs>
              <linearGradient id="ptr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ff5c9d" />
                <stop offset="1" stopColor="#c01a64" />
              </linearGradient>
            </defs>
            <path d="M24 58L6 28C-2 14 8 2 24 2s26 12 18 26z" fill="url(#ptr)" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="24" cy="20" r="6" fill="#fff" opacity=".9" />
          </svg>
         </motion.div>
        </div>

        <motion.div style={{ rotate: rot }} className="relative aspect-square w-full will-change-transform">
          <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible" role="img" aria-label="Spinning wheel with six birthday treats">
            <defs>
              <radialGradient id="rim" cx=".5" cy=".5" r=".5">
                <stop offset=".9" stopColor="#ff4d94" />
                <stop offset="1" stopColor="#c01a64" />
              </radialGradient>
              <filter id="wsh" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#b3246a" floodOpacity=".35" />
              </filter>
            </defs>
            <circle cx={R} cy={R} r="198" fill="url(#rim)" filter="url(#wsh)" />
            <circle cx={R} cy={R} r="190" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2" />
            {WHEEL.map((w, i) => (
              <g key={w.key}>
                <path d={slice(i, 172)} fill={FILLS[i]} stroke="#fff" strokeWidth="3" />
                <g transform={`rotate(${i * SEG + SEG / 2 - 90} ${R} ${R})`}>
                  <text x={R + 52} y={R - 5} fontSize="17" fontWeight="800" fill={TEXT[i]} style={{ fontFamily: "var(--font-body)" }}>
                    {w.line1}
                  </text>
                  <text x={R + 52} y={R + 15} fontSize="17" fontWeight="800" fill={TEXT[i]} style={{ fontFamily: "var(--font-body)" }}>
                    {w.line2}
                  </text>
                  <g transform={`translate(${R + 142} ${R}) rotate(90)`} fill={TEXT[i]} opacity=".9">
                    <svg x="-11" y="-11" width="22" height="22" viewBox="0 0 24 24">
                      <use href={`#ico-${w.key}`} />
                    </svg>
                  </g>
                </g>
              </g>
            ))}
            {/* bulbs */}
            {bulbs.map((b) => {
              const [x, y] = polar((b * 360) / bulbs.length, 185);
              return <circle key={b} cx={x} cy={y} r="3.6" fill="#fff" style={{ animation: "bulb 1.4s ease-in-out infinite", animationDelay: `${(b % 2) * 0.7}s`, filter: "drop-shadow(0 0 4px #fff)" }} />;
            })}
            <circle cx={R} cy={R} r="44" fill="#fff" stroke="#ff8fb8" strokeWidth="5" />
          </svg>
          {/* symbol library for the slice icons */}
          <svg width="0" height="0" className="absolute" aria-hidden="true">
            <defs>
              <symbol id="ico-compliment" viewBox="0 0 24 24"><path d="M12 21s-7.500-4.600-9.600-9.300C.9 8.300 3 4.500 6.700 4.500c2.100 0 3.600 1.100 5.300 3.100 1.700-2 3.200-3.100 5.300-3.100 3.700 0 5.800 3.800 4.300 7.200C19.500 16.400 12 21 12 21z" /></symbol>
              <symbol id="ico-secret" viewBox="0 0 24 24"><path d="M7 10V8a5 5 0 0110 0v2h1a1 1 0 011 1v9a1 1 0 01-1 1H6a1 1 0 01-1-1v-9a1 1 0 011-1zm2 0h6V8a3 3 0 00-6 0z" /></symbol>
              <symbol id="ico-wish" viewBox="0 0 24 24"><path d="M12 1.500c.7 5 2.600 8.800 10.500 10.500-7.900 1.700-9.800 5.500-10.500 10.500-.7-5-2.600-8.800-10.500-10.500C9.400 10.300 11.300 6.500 12 1.500z" /></symbol>
              <symbol id="ico-surprise" viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="12" rx="2.500" /><rect x="2" y="6" width="20" height="4.500" rx="2" /></symbol>
              <symbol id="ico-hug" viewBox="0 0 24 24"><path d="M12 21s-7.500-4.600-9.600-9.300C.9 8.300 3 4.500 6.700 4.500c2.100 0 3.600 1.100 5.300 3.100 1.700-2 3.200-3.100 5.300-3.100 3.700 0 5.800 3.800 4.300 7.200C19.500 16.400 12 21 12 21z" /></symbol>
              <symbol id="ico-love" viewBox="0 0 24 24"><path d="M12 21s-7.500-4.600-9.600-9.300C.9 8.300 3 4.500 6.700 4.500c2.100 0 3.600 1.100 5.300 3.100 1.700-2 3.200-3.100 5.300-3.100 3.700 0 5.800 3.800 4.300 7.200C19.500 16.400 12 21 12 21z" /></symbol>
            </defs>
          </svg>
        </motion.div>

        {/* hub button (does not rotate) */}
        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          aria-label="Spin the wheel"
          className="absolute left-1/2 top-1/2 z-10 grid h-[24%] w-[24%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-rose to-hot text-white shadow-glow transition-transform hover:scale-105 active:scale-95 disabled:opacity-90"
          style={{ boxShadow: "0 0 0 5px #fff, 0 10px 30px rgba(255,61,139,.55)" }}
        >
          <span className="text-center text-[0.9rem] font-extrabold leading-none tracking-wide sm:text-lg">
            {spinning ? <IconHeart className="mx-auto h-6 w-6 animate-pulse" /> : "SPIN"}
          </span>
        </button>
      </div>

      <div className="mt-8 min-h-[11rem] w-full">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key={result.key + result.text}
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 180, damping: 16 }}
              className="glass glow-ring rounded-[1.8rem] px-6 py-6 text-center sm:px-8"
            >
              <p className="text-2xl text-hot" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>
                <Rich>{WHEEL.find((w) => w.key === result.key)!.label}</Rich>
              </p>
              <p className="mx-auto mt-2 max-w-md text-balance text-lg italic leading-relaxed text-deep sm:text-xl" style={{ fontFamily: "var(--font-display)" }}>
                {result.text}
              </p>
              <button type="button" className="btn-soft mt-4" onClick={spin}>
                Spin again
              </button>
            </motion.div>
          ) : (
            <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-8 text-center text-lg font-semibold" style={{ color: "var(--fg-soft)" }}>
              {spinning ? "Round and round…" : "Tap SPIN and see what the stars decide."}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
