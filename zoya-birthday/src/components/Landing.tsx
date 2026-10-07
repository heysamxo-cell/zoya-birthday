"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ZoyaAvatar from "./ZoyaAvatar";
import FloatingHearts from "./FloatingHearts";
import { Rich } from "./Icons";
import { useAvatar, Mood } from "./AvatarProvider";
import { SITE } from "@/lib/config";
import { chime } from "@/lib/music";

const LINES: { text: string; mood: Mood; at: number }[] = [
  { text: `Hey ${SITE.name}... 💗`, mood: "happy", at: 700 },
  { text: "Someone made something special for you...", mood: "shy", at: 3300 },
  { text: "Because today isn't just another day...", mood: "idle", at: 6200 },
  { text: `Today is YOUR day, ${SITE.name}.`, mood: "excited", at: 9000 },
];
const BUTTON_AT = 10600;

export default function Landing({ onEnter }: { onEnter: () => void }) {
  const [step, setStep] = useState(-1);
  const [showBtn, setShowBtn] = useState(false);
  const { setBase, react } = useAvatar();

  useEffect(() => {
    const timers = LINES.map((l, i) =>
      setTimeout(() => {
        setStep(i);
        setBase(l.mood);
      }, l.at),
    );
    timers.push(setTimeout(() => setShowBtn(true), BUTTON_AT));
    return () => {
      timers.forEach(clearTimeout);
      setBase("idle");
    };
  }, [setBase]);

  const skip = () => {
    setStep(LINES.length - 1);
    setBase("excited");
    setShowBtn(true);
  };

  const enter = () => {
    chime("up");
    react("celebrate", 3000, "Let's go!");
    onEnter();
  };

  const clouds = useMemo(
    () => [
      { top: "8%", w: 280, d: 70, delay: -10, o: 0.55 },
      { top: "26%", w: 200, d: 95, delay: -40, o: 0.4 },
      { top: "62%", w: 320, d: 80, delay: -25, o: 0.45 },
      { top: "82%", w: 220, d: 110, delay: -60, o: 0.35 },
    ],
    [],
  );

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.14, filter: "blur(22px)" }}
      transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background:
          "radial-gradient(70rem 40rem at 50% 28%, rgba(255,255,255,.75), transparent 62%), radial-gradient(40rem 30rem at 85% 85%, rgba(233,213,255,.55), transparent 60%), radial-gradient(40rem 30rem at 10% 90%, rgba(255,143,184,.4), transparent 60%)",
      }}
    >
      {/* soft clouds */}
      {clouds.map((c, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 rounded-full bg-white blur-2xl"
          style={{
            top: c.top, width: c.w, height: c.w * 0.38, opacity: c.o,
            animation: `drift ${c.d}s linear infinite`, animationDelay: `${c.delay}s`,
          }}
        />
      ))}
      {/* light beams */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[70vh] w-[90vw] -translate-x-1/2 opacity-60"
        style={{
          background: "conic-gradient(from 180deg at 50% 0%, transparent 35%, rgba(255,255,255,.55) 45%, transparent 52%, rgba(255,214,235,.6) 58%, transparent 66%)",
          filter: "blur(18px)",
          maskImage: "linear-gradient(#000, transparent 85%)",
          WebkitMaskImage: "linear-gradient(#000, transparent 85%)",
        }}
      />

      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative"
        >
          <FloatingHearts count={10} className="scale-[1.35]" />
          <ZoyaAvatar className="relative w-[min(52vw,240px)] sm:w-[min(36vh,290px)]" />
        </motion.div>

        <div className="mt-4 flex min-h-[8.5rem] w-full max-w-2xl flex-col items-center justify-start text-center sm:min-h-[9.5rem]">
          <AnimatePresence mode="wait">
            {step >= 0 && (
              <motion.p
                key={step}
                initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
                transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
                className={
                  step === 0
                    ? "text-5xl text-hot sm:text-6xl"
                    : step === 3
                      ? "text-shimmer text-balance pb-3 text-4xl font-extrabold leading-[1.18] sm:text-6xl"
                      : "text-balance text-2xl italic sm:text-4xl"
                }
                style={
                  step === 0
                    ? { fontFamily: "var(--font-script)", fontWeight: 700, textShadow: "0 4px 24px rgba(255,255,255,.9)" }
                    : step === 3
                      ? { fontFamily: "var(--font-display)", filter: "drop-shadow(0 6px 24px rgba(255,77,148,.35))" }
                      : { fontFamily: "var(--font-display)", color: "var(--fg)", textShadow: "0 2px 18px rgba(255,255,255,.9)" }
                }
              >
                <Rich>{LINES[step].text}</Rich>
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="relative mt-3 h-20">
          <AnimatePresence>
            {showBtn && (
              <motion.button
                type="button"
                onClick={enter}
                initial={{ opacity: 0, y: 24, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="btn-glow text-balance !px-7 text-base sm:!px-10 sm:!text-xl"
                style={{ animation: "pulse-glow 2.6s ease-in-out infinite" }}
              >
                <Rich iconClass="text-white">✨ Enter Your Birthday World ✨</Rich>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {!showBtn && step >= 0 && (
          <motion.button
            type="button"
            onClick={skip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-6 text-sm font-semibold text-deep/70 underline-offset-4 hover:text-deep hover:underline"
          >
            skip intro
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
