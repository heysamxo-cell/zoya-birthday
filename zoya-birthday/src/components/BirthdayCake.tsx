"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import Section from "./ui/Section";
import ZoyaAvatar from "./ZoyaAvatar";
import { Rich, HEART_PATH, SPARKLE_PATH } from "./Icons";
import { useAvatar } from "./AvatarProvider";
import { useFx } from "./FxLayer";
import { chime } from "@/lib/music";
import { SITE } from "@/lib/config";

/** Scalloped frosting that hugs a tier's top edge. */
function frost(x0: number, x1: number, y: number, h: number) {
  const n = Math.max(4, Math.round((x1 - x0) / 28));
  const w = (x1 - x0) / n;
  let d = `M${x0} ${y}H${x1}V${y + h * 0.45}`;
  for (let i = n - 1; i >= 0; i--) {
    const xr = x0 + (i + 1) * w;
    const xl = x0 + i * w;
    const depth = h * (i % 3 === 0 ? 1.55 : i % 3 === 1 ? 1.05 : 1.3);
    d += `Q${(xr + xl) / 2} ${y + depth} ${xl} ${y + h * 0.45}`;
  }
  return d + "Z";
}

const CANDLES = [
  { x: 120, h: 52, c1: "#ff8fb8", c2: "#ffd0e3" },
  { x: 160, h: 62, c1: "#e9d5ff", c2: "#fff" },
  { x: 200, h: 70, c1: "#ff4d94", c2: "#ffc2d9" },
  { x: 240, h: 62, c1: "#e9d5ff", c2: "#fff" },
  { x: 280, h: 52, c1: "#ff8fb8", c2: "#ffd0e3" },
];

export default function BirthdayCake() {
  const [out, setOut] = useState<boolean[]>(() => CANDLES.map(() => false));
  const allOut = out.every(Boolean);
  const { react, setNight, setBase } = useAvatar();
  const fx = useFx();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const done = useRef(false);

  // night mode while candles are out and she's looking at the cake
  useEffect(() => {
    setNight("cake", allOut && inView);
    return () => setNight("cake", false);
  }, [allOut, inView, setNight]);

  useEffect(() => {
    if (!allOut) {
      done.current = false;
      return;
    }
    if (done.current) return;
    done.current = true;
    chime("up");
    react("celebrate", 4200, "Wish made! 💗");
    const box = ref.current?.getBoundingClientRect();
    const cx = box ? box.left + box.width * 0.62 : window.innerWidth / 2;
    const cy = box ? box.top + box.height * 0.4 : window.innerHeight / 2;
    fx.hearts(cx, cy, 22);
    const t = setTimeout(() => fx.heartRain(26), 700);
    const t2 = setTimeout(() => fx.stars(cx, cy, 16), 400);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [allOut, fx, react]);

  useEffect(() => () => setBase("idle"), [setBase]);

  const blow = (i: number) => {
    setOut((o) => {
      if (o[i]) return o;
      const n = [...o];
      n[i] = true;
      return n;
    });
    if (!out.every(Boolean)) react("surprised", 900);
  };
  const blowAll = () => {
    react("surprised", 900);
    CANDLES.forEach((_, i) => setTimeout(() => blow(i), i * 160));
  };
  const relight = () => {
    setOut(CANDLES.map(() => false));
    react("happy", 1800, "Again? Okay! 💗");
  };

  const sprinkles = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        x: 62 + ((i * 47) % 276),
        y: 300 + ((i * 29) % 40),
        r: (i * 53) % 180,
        c: ["#fff", "#ff4d94", "#e9d5ff", "#ffd36e"][i % 4],
      })),
    [],
  );
  const stars = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        left: ((i * 37) % 100),
        top: ((i * 53) % 90),
        size: 8 + ((i * 7) % 14),
        d: 2 + ((i * 3) % 4),
        delay: -((i * 5) % 6),
      })),
    [],
  );

  return (
    <Section
      id="cake"
      eyebrow="close your eyes…"
      title={`Make a Wish, ${SITE.name} 💗`}
      subtitle="Tap the candles — or blow them all out at once."
    >
      <div ref={ref} className="relative mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-[minmax(0,.8fr)_minmax(0,1fr)]">
        {/* night stars */}
        <AnimatePresence>
          {allOut &&
            stars.map((s, i) => (
              <motion.svg
                key={i}
                viewBox="0 0 24 24"
                className="twinkle pointer-events-none absolute text-yellow-100"
                style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, "--d": `${s.d}s`, "--delay": `${s.delay}s`, filter: "drop-shadow(0 0 8px #ffe08a)" } as React.CSSProperties}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
              >
                <path d={SPARKLE_PATH} fill="currentColor" />
              </motion.svg>
            ))}
        </AnimatePresence>

        <div className="order-2 flex justify-center md:order-1">
          <ZoyaAvatar className="w-[min(52vw,230px)] md:w-[min(30vw,300px)]" />
        </div>

        <div className="order-1 md:order-2">
          <motion.div
            className="relative mx-auto w-full max-w-[460px]"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ type: "spring", stiffness: 100, damping: 16 }}
          >
            <svg viewBox="0 0 400 420" className="h-auto w-full overflow-visible" role="img" aria-label="A pink birthday cake with five candles">
              <defs>
                <linearGradient id="ck1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffe3ee" />
                  <stop offset="1" stopColor="#ffb3d1" />
                </linearGradient>
                <linearGradient id="ck2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffd0e3" />
                  <stop offset="1" stopColor="#ff8fb8" />
                </linearGradient>
                <linearGradient id="ck3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffc2d9" />
                  <stop offset="1" stopColor="#ff6aa8" />
                </linearGradient>
                <linearGradient id="frost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fffafc" />
                  <stop offset="1" stopColor="#ffeaf3" />
                </linearGradient>
                <radialGradient id="flame" cx=".5" cy=".7" r=".6">
                  <stop offset="0" stopColor="#fff7c2" />
                  <stop offset=".5" stopColor="#ffc857" />
                  <stop offset="1" stopColor="#ff6a3d" />
                </radialGradient>
                <radialGradient id="flameGlow">
                  <stop offset="0" stopColor="#ffd36e" stopOpacity=".75" />
                  <stop offset="1" stopColor="#ffd36e" stopOpacity="0" />
                </radialGradient>
                <filter id="cs" x="-20%" y="-20%" width="140%" height="150%">
                  <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#b3246a" floodOpacity=".3" />
                </filter>
              </defs>

              {/* plate */}
              <ellipse cx="200" cy="398" rx="190" ry="20" fill="#fff" opacity=".85" />
              <ellipse cx="200" cy="394" rx="170" ry="14" fill="#ffe3ee" />

              <g filter="url(#cs)">
                {/* bottom tier */}
                <path d="M30 330h340v54c0 10-8 14-18 14H48c-10 0-18-4-18-14z" fill="url(#ck3)" />
                <path d="M30 330h340v10H30z" fill="#fff" opacity=".18" />
                {/* middle tier */}
                <path d="M72 262h256v72H72z" fill="url(#ck2)" />
                <path d="M72 262h256v10H72z" fill="#fff" opacity=".18" />
                {/* top tier */}
                <path d="M104 196h192v70H104z" fill="url(#ck1)" />
                {/* frosting drips */}
                <path d={frost(104, 296, 196, 30)} fill="url(#frost)" />
                <path d={frost(72, 328, 262, 30)} fill="url(#frost)" />
                <path d={frost(30, 370, 330, 30)} fill="url(#frost)" />
                {/* piped hearts */}
                {[88, 140, 192, 244, 296].map((x, i) => (
                  <path key={i} d={HEART_PATH} transform={`translate(${x} 241) scale(.9)`} fill="#ff4d94" opacity=".95" />
                ))}
                {[56, 110, 164, 218, 272, 326].map((x, i) => (
                  <circle key={i} cx={x + 8} cy={318} r="5" fill="#fff" opacity=".9" />
                ))}
                {/* sprinkles */}
                {sprinkles.map((s, i) => (
                  <rect key={i} x={s.x} y={s.y} width="9" height="3.4" rx="1.7" fill={s.c} transform={`rotate(${s.r} ${s.x} ${s.y})`} opacity=".9" />
                ))}
                <path d="M120 150l0 0" />
              </g>

              {/* candles */}
              {CANDLES.map((c, i) => {
                const top = 196 - c.h;
                return (
                  <g key={i}>
                    <rect x={c.x - 7} y={top} width="14" height={c.h + 4} rx="4" fill={c.c2} />
                    <path d={`M${c.x - 7} ${top + 12}l14 -5M${c.x - 7} ${top + 26}l14 -5M${c.x - 7} ${top + 40}l14 -5`} stroke={c.c1} strokeWidth="5" strokeLinecap="round" opacity=".9" />
                    <path d={`M${c.x} ${top}v-5`} stroke="#6b3a55" strokeWidth="2" strokeLinecap="round" />
                    {/* flame */}
                    <AnimatePresence>
                      {!out[i] && (
                        <motion.g exit={{ opacity: 0, scale: 0.2, y: -6 }} transition={{ duration: 0.4 }} style={{ originX: 0.5, originY: 1 }}>
                          <circle cx={c.x} cy={top - 18} r="26" fill="url(#flameGlow)" />
                          <motion.path
                            d={`M${c.x} ${top - 36}c8 9 11 15 11 21a11 11 0 01-22 0c0-6 3-10 6-14 1 3 3 4 5 4-1-4-1-8 0-11z`}
                            fill="url(#flame)"
                            style={{ originX: 0.5, originY: 1 }}
                            animate={{ scaleY: [1, 1.12, 0.94, 1.08, 1], scaleX: [1, 0.94, 1.05, 0.97, 1], rotate: [0, -3, 2, -2, 0] }}
                            transition={{ duration: 1.1 + i * 0.13, repeat: Infinity, ease: "easeInOut" }}
                          />
                          <ellipse cx={c.x} cy={top - 11} rx="3.4" ry="5" fill="#fff" opacity=".85" />
                        </motion.g>
                      )}
                    </AnimatePresence>
                    {/* smoke */}
                    <AnimatePresence>
                      {out[i] &&
                        [0, 1, 2].map((k) => (
                          <motion.circle
                            key={k}
                            cx={c.x}
                            cy={top - 6}
                            r={3 + k}
                            fill="#fff"
                            initial={{ opacity: 0.8, y: 0, x: 0 }}
                            animate={{ opacity: 0, y: -40 - k * 12, x: (k - 1) * 8 }}
                            transition={{ duration: 2 + k * 0.4, delay: k * 0.15, ease: "easeOut" }}
                          />
                        ))}
                    </AnimatePresence>
                    {/* hit area */}
                    <rect
                      x={c.x - 22}
                      y={top - 52}
                      width="44"
                      height={c.h + 56}
                      fill="transparent"
                      className="cursor-pointer"
                      role="button"
                      tabIndex={0}
                      aria-label={out[i] ? "Candle blown out" : "Blow out this candle"}
                      onClick={() => blow(i)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && blow(i)}
                      data-hover
                    />
                  </g>
                );
              })}
            </svg>

            {/* glow of flames onto frosting */}
            {!allOut && <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[8%] h-[40%] w-[70%] -translate-x-1/2 rounded-full bg-yellow-200/40 blur-3xl" />}
          </motion.div>

          <div className="mt-6 flex min-h-[8.5rem] flex-col items-center text-center">
            <AnimatePresence mode="wait">
              {!allOut ? (
                <motion.button
                  key="blow"
                  type="button"
                  onClick={blowAll}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="btn-glow"
                >
                  <Rich iconClass="text-white">Blow the candles ✨</Rich>
                </motion.button>
              ) : (
                <motion.div
                  key="wish"
                  initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 1.2, delay: 0.6 }}
                  className="flex flex-col items-center"
                >
                  <p className="text-balance text-2xl font-semibold italic leading-snug sm:text-3xl" style={{ fontFamily: "var(--font-display)", color: "var(--fg)", textShadow: "0 0 24px rgba(255,200,230,.55)" }}>
                    May every little wish in your heart come true.
                  </p>
                  <button type="button" onClick={relight} className="btn-soft mt-5">
                    Light them again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Section>
  );
}
