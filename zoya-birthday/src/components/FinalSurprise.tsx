"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import ZoyaAvatar from "./ZoyaAvatar";
import { Rich, HEART_PATH, SPARKLE_PATH } from "./Icons";
import { useAvatar } from "./AvatarProvider";
import { useFx } from "./FxLayer";
import { useEnv } from "@/lib/useEnv";
import { chime } from "@/lib/music";
import { SITE } from "@/lib/config";

const INTRO = ["Before you leave...", "Remember one thing.", "You are incredibly special."];

export default function FinalSurprise({ onReplay }: { onReplay: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.55 });
  const env = useEnv();
  const { setNight, setBase, react } = useAvatar();
  const fx = useFx();
  const [line, setLine] = useState(-1); // 0..2 intro, 3 = title, 4 = last line, 5 = button
  const started = useRef(false);

  useEffect(() => {
    setNight("finale", inView);
    return () => setNight("finale", false);
  }, [inView, setNight]);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const gap = env.reduced ? 600 : 2600;
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => { setLine(0); setBase("shy"); }, 800));
    t.push(setTimeout(() => { setLine(1); setBase("idle"); }, 800 + gap));
    t.push(setTimeout(() => { setLine(2); setBase("love"); }, 800 + gap * 2));
    t.push(
      setTimeout(() => {
        setLine(3);
        setBase("celebrate");
        chime("up");
        fx.confetti({ count: 120 });
        fx.heartRain(30);
        react("celebrate", 5000, `Happy Birthday!`);
      }, 800 + gap * 3),
    );
    t.push(setTimeout(() => { setLine(4); setBase("love"); }, 800 + gap * 3 + 2800));
    t.push(setTimeout(() => setLine(5), 800 + gap * 3 + 5600));
    return () => t.forEach(clearTimeout);
  }, [inView, env.reduced, setBase, react, fx]);

  useEffect(() => () => setBase("idle"), [setBase]);

  const replay = () => {
    started.current = false;
    chime("soft");
    onReplay();
  };

  /* slowly appearing stars + hearts */
  const sky = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        left: (i * 29 + 7) % 100,
        top: (i * 47 + 11) % 96,
        size: 8 + ((i * 7) % 16),
        heart: i % 4 === 0,
        d: 2.4 + ((i * 3) % 4),
        delay: -((i * 5) % 6),
        appear: 0.2 + (i % 17) * 0.18,
      })),
    [],
  );

  return (
    <section ref={ref} id="finale" className="relative z-10 flex min-h-[110svh] flex-col items-center justify-center overflow-hidden px-5 pb-36 pt-24 text-center">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {sky.map((s, i) => (
          <motion.svg
            key={i}
            viewBox="0 0 24 24"
            className="twinkle absolute"
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, color: s.heart ? "#ff8fb8" : "#fff4c9", "--d": `${s.d}s`, "--delay": `${s.delay}s`, filter: `drop-shadow(0 0 8px ${s.heart ? "#ff4d94" : "#ffe08a"})` } as React.CSSProperties}
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ delay: inView ? s.appear : 0, duration: 1.2 }}
          >
            <path d={s.heart ? HEART_PATH : SPARKLE_PATH} fill="currentColor" />
          </motion.svg>
        ))}
      </div>

      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[120%] w-[160%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-hot/25 blur-3xl" />
        <ZoyaAvatar className="relative w-[min(58vw,250px)] sm:w-[min(36vh,300px)]" />
      </motion.div>

      <div className="relative mt-6 flex min-h-[15rem] w-full max-w-3xl flex-col items-center justify-start sm:min-h-[16rem]">
        <AnimatePresence mode="wait">
          {line >= 0 && line <= 2 && (
            <motion.p
              key={line}
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
              transition={{ duration: 1 }}
              className="text-balance text-3xl italic text-white sm:text-5xl"
              style={{ fontFamily: "var(--font-display)", textShadow: "0 0 30px rgba(255,170,215,.7)" }}
            >
              {INTRO[line]}
            </motion.p>
          )}
        </AnimatePresence>

        {line >= 3 && (
          <div className="flex flex-col items-center">
            <motion.h2
              initial={{ opacity: 0, scale: 0.7, filter: "blur(14px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ default: { type: "spring", stiffness: 90, damping: 14 }, filter: { duration: 1 } }}
              className="text-shimmer-light text-balance text-5xl font-extrabold leading-tight sm:text-7xl"
              style={{ filter: "drop-shadow(0 0 28px rgba(255,120,190,.7))" }}
            >
              <Rich iconClass="text-white">{`Happy Birthday, ${SITE.name} 💗`}</Rich>
            </motion.h2>
            <AnimatePresence>
              {line >= 4 && (
                <motion.p
                  initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 1.4 }}
                  className="mt-6 max-w-xl text-balance text-xl italic leading-relaxed text-white/95 sm:text-2xl"
                  style={{ fontFamily: "var(--font-display)", textShadow: "0 0 24px rgba(255,170,215,.6)" }}
                >
                  May your smile stay brighter than every star in the sky.
                </motion.p>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {line >= 5 && (
                <motion.button
                  type="button"
                  onClick={replay}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 160, damping: 14 }}
                  className="btn-glow mt-10 !px-10 !text-lg"
                  style={{ animation: "pulse-glow 2.6s ease-in-out infinite" }}
                >
                  <Rich iconClass="text-white">Replay My Birthday ✨</Rich>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <p className="relative mt-10 text-sm font-medium text-white/60">Made with love, only for {SITE.name}.</p>
    </section>
  );
}
