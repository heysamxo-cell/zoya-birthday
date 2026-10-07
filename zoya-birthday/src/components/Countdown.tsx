"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import Section from "./ui/Section";
import { Rich } from "./Icons";
import { useBirthday, computeBirthday } from "@/lib/birthday";
import { useFx } from "./FxLayer";
import { useAvatar } from "./AvatarProvider";
import { SITE } from "@/lib/config";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    Days: Math.floor(s / 86400),
    Hours: Math.floor((s % 86400) / 3600),
    Minutes: Math.floor((s % 3600) / 60),
    Seconds: s % 60,
  };
}

function Tile({ label, value }: { label: string; value: number }) {
  const text = String(value).padStart(2, "0");
  return (
    <div className="glass glow-ring flex flex-col items-center rounded-[1.6rem] px-2 py-5 sm:rounded-[2rem] sm:px-4 sm:py-8" style={{ boxShadow: "0 0 50px rgba(255,77,148,.28), 0 24px 60px -26px rgba(179,36,106,.5), inset 0 1px 0 rgba(255,255,255,.9)" }}>
      <div className="relative h-[3.2rem] w-full overflow-hidden text-center sm:h-[5.2rem]" aria-live="off">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            initial={{ y: "70%", opacity: 0, filter: "blur(6px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-70%", opacity: 0, filter: "blur(6px)" }}
            transition={{ default: { type: "spring", stiffness: 300, damping: 26 }, filter: { duration: 0.3 } }}
            className="absolute inset-0 text-shimmer text-[2.6rem] font-extrabold leading-[1.2] tabular-nums sm:text-[4.4rem]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-deep/70 sm:text-sm sm:tracking-[0.28em]">{label}</span>
    </div>
  );
}

export default function Countdown() {
  const info = useBirthday();
  const [left, setLeft] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const fx = useFx();
  const { react } = useAvatar();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const celebrated = useRef(false);

  useEffect(() => {
    if (!info.ready || !info.target) return;
    if (info.isToday) {
      setDone(true);
      return;
    }
    const tick = () => {
      const now = new Date();
      const b = computeBirthday(now);
      if (b.isToday) {
        setDone(true);
        return;
      }
      setLeft(b.target!.getTime() - now.getTime());
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [info.ready, info.target, info.isToday]);

  // celebration when it's (or becomes) her birthday and the section is on screen
  useEffect(() => {
    if (!done || !inView || celebrated.current) return;
    celebrated.current = true;
    fx.confetti({ count: 160 });
    setTimeout(() => fx.heartRain(34), 500);
    react("celebrate", 5000, `It's my birthday!`);
  }, [done, inView, fx, react]);

  const p = left !== null ? parts(left) : { Days: 0, Hours: 0, Minutes: 0, Seconds: 0 };

  return (
    <Section id="countdown" eyebrow={done ? "the day is finally here" : "tick tock, tick tock"} title={done ? undefined : "Counting Down To Your Special Moment"}>
      <div ref={ref} className="mx-auto max-w-4xl">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key="count"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.9 }}
            >
              <div className="grid grid-cols-4 gap-2.5 sm:gap-6">
                {(Object.keys(p) as (keyof typeof p)[]).map((k) => (
                  <Tile key={k} label={k} value={p[k]} />
                ))}
              </div>
              <p className="mt-8 text-center text-base font-medium sm:text-lg" style={{ color: "var(--fg-soft)" }}>
                {info.ready ? (
                  <>
                    Until {SITE.name}&rsquo;s birthday on <b className="text-hot">{info.label}</b>
                  </>
                ) : (
                  " "
                )}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.85, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ default: { type: "spring", stiffness: 120, damping: 16 }, filter: { duration: 0.8 } }}
              className="glass glow-ring relative overflow-hidden rounded-[2.4rem] px-6 py-14 text-center sm:py-20"
              style={{ boxShadow: "0 0 80px rgba(255,77,148,.35), 0 30px 80px -30px rgba(179,36,106,.55)" }}
            >
              <motion.h2
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="text-shimmer text-balance text-4xl font-extrabold leading-tight sm:text-6xl md:text-7xl"
              >
                <Rich iconClass="text-hot">{`🎉 It's ${SITE.name}'s Birthday! 🎉`}</Rich>
              </motion.h2>
              <p className="mx-auto mt-5 max-w-lg text-lg" style={{ color: "var(--fg-soft)" }}>
                The moment has arrived. Today, the whole world is a little pinker because of you.
              </p>
              <button
                type="button"
                onClick={() => {
                  fx.confetti({ count: 140 });
                  fx.heartRain(30);
                  react("celebrate", 3500, "Yaaay!");
                }}
                className="btn-glow mt-8"
              >
                <Rich iconClass="text-white">Celebrate again ✨</Rich>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}
