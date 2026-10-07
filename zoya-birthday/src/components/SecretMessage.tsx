"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Section from "./ui/Section";
import ZoyaAvatar from "./ZoyaAvatar";
import FloatingHearts from "./FloatingHearts";
import { Rich, HEART_PATH } from "./Icons";
import { LETTER } from "@/lib/content";
import { SITE } from "@/lib/config";
import { useAvatar } from "./AvatarProvider";
import { useFx } from "./FxLayer";
import { useEnv } from "@/lib/useEnv";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import { chime } from "@/lib/music";

type Stage = "locked" | "unlocking" | "opening" | "rising";

function Envelope({ stage }: { stage: Stage }) {
  const open = stage === "opening" || stage === "rising";
  return (
    <svg viewBox="0 0 340 250" className="h-auto w-full overflow-visible" role="img" aria-label="A locked pink envelope">
      <defs>
        <linearGradient id="env1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb3d1" />
          <stop offset="1" stopColor="#ff6aa8" />
        </linearGradient>
        <linearGradient id="env2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd0e3" />
          <stop offset="1" stopColor="#ff8fb8" />
        </linearGradient>
        <linearGradient id="lock" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="1" stopColor="#f2b64c" />
        </linearGradient>
        <filter id="envsh" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#b3246a" floodOpacity=".35" />
        </filter>
      </defs>
      <ellipse cx="170" cy="236" rx="130" ry="10" fill="#b3246a" opacity=".2" />
      <g filter="url(#envsh)">
        <rect x="20" y="70" width="300" height="160" rx="16" fill="url(#env1)" />
        {/* letter */}
        <motion.g initial={false} animate={{ y: stage === "rising" ? -70 : 0 }} transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}>
          <rect x="44" y="86" width="252" height="130" rx="8" fill="#fffaf5" />
          <path d="M66 112h150M66 134h190M66 156h120" stroke="#ffb3d1" strokeWidth="4" strokeLinecap="round" />
          <path d={HEART_PATH} transform="translate(250 150) scale(1.7)" fill="#ff8fb8" />
        </motion.g>
        {/* front pockets */}
        <path d="M20 230V86l150 100z" fill="url(#env2)" />
        <path d="M320 230V86L170 186z" fill="url(#env2)" />
        <path d="M20 230l150-96 150 96z" fill="url(#env1)" />
        <path d="M20 230l150-96 150 96" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="2.5" />
        {/* flap */}
        <motion.path
          d="M20 78q0-8 8-8h284q8 0 8 8L170 176z"
          fill="url(#env2)"
          initial={false}
          animate={{ scaleY: open ? -1 : 1 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          style={{ originX: 0.5, originY: 0 }}
        />
      </g>
      {/* padlock */}
      <AnimatePresence>
        {stage !== "opening" && stage !== "rising" && (
          <motion.g exit={{ opacity: 0, scale: 0.4, y: -10 }} transition={{ duration: 0.4 }} style={{ originX: 0.5, originY: 0.5 }}>
            <motion.path
              d="M150 164v-18a20 20 0 0140 0v18"
              fill="none"
              stroke="#d99a2b"
              strokeWidth="8"
              strokeLinecap="round"
              initial={false}
              animate={stage === "unlocking" ? { y: -12, rotate: -18 } : { y: 0, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              style={{ originX: 0.84, originY: 1 }}
            />
            <motion.g animate={stage === "locked" ? { rotate: [0, -3, 3, 0] } : { rotate: 0 }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }} style={{ originX: 0.5, originY: 0.5 }}>
              <rect x="136" y="160" width="68" height="52" rx="12" fill="url(#lock)" stroke="#fff" strokeWidth="3" />
              <path d={HEART_PATH} transform="translate(158 170) scale(1.1)" fill="#ff4d94" />
            </motion.g>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

/* ───────── full-screen letter ───────── */
function Letter({ onClose }: { onClose: () => void }) {
  const env = useEnv();
  const text = useMemo(() => LETTER.join("\n"), []);
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);
  const { setBase } = useAvatar();
  const fx = useFx();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [run, setRun] = useState(0);

  useEffect(() => {
    lockScroll();
    setBase("love");
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => {
      unlockScroll();
      setBase("idle");
      window.removeEventListener("keydown", k);
    };
  }, [onClose, setBase]);

  useEffect(() => {
    if (!env.mounted) return;
    setN(0);
    setDone(false);
    if (env.reduced) {
      setN(text.length);
      setDone(true);
      return;
    }
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const step = () => {
      i += 1;
      setN(i);
      if (i >= text.length) {
        setDone(true);
        chime("up");
        fx.heartRain(26);
        return;
      }
      const ch = text[i - 1];
      let d = 32 + Math.random() * 26;
      if (ch === "\n") d = text[i] === "\n" || text[i - 2] === "\n" ? 520 : 380;
      else if (ch === "," || ch === ".") d = 280;
      t = setTimeout(step, d);
    };
    t = setTimeout(step, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [env.mounted, env.reduced, text, run]);

  const lastRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = lastRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.bottom > window.innerHeight - 140) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [n]);

  const shown = text.slice(0, n);
  const lines = shown.split("\n");
  const full = text.split("\n");

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`A secret letter for ${SITE.name}`}
      className="fixed inset-0 z-[85] overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1 }}
      style={{ background: "radial-gradient(120% 90% at 50% 15%, #ff7fb4 0%, #c8266f 45%, #4a0f38 100%)" }}
    >
      {/* slow breathing light */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[8%] h-[70vh] w-[70vh] -translate-x-1/2 rounded-full bg-white/25 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <FloatingHearts count={14} className="opacity-70" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 180px 40px rgba(40,5,30,.55)" }} />

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close letter"
        className="fixed right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:scale-110 hover:bg-white/35 sm:right-6 sm:top-6"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>

      <div className="relative mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 160, damping: 14 }} className="mb-6 text-white">
          <svg viewBox="0 0 24 24" className="mx-auto h-10 w-10 drop-shadow-[0_0_14px_rgba(255,255,255,.8)]" fill="currentColor"><path d={HEART_PATH} /></svg>
        </motion.div>

        <div className="relative w-full text-left" style={{ fontFamily: "var(--font-script)" }}>
          {/* invisible full text reserves the height so nothing jumps */}
          <div aria-hidden="true" className="invisible text-[1.9rem] font-bold leading-[1.45] sm:text-[2.6rem]">
            {full.map((l, i) => (
              <p key={i} className="min-h-[1.45em]">{l.replace(/💗/g, "♥")}</p>
            ))}
          </div>
          <div className="absolute inset-0 text-[1.9rem] font-bold leading-[1.45] text-white sm:text-[2.6rem]" style={{ textShadow: "0 0 30px rgba(255,200,230,.75), 0 2px 12px rgba(80,0,50,.45)" }} aria-label={LETTER.join(" ").replace(/\s+/g, " ")}>
            {lines.map((l, i) => {
              const last = i === lines.length - 1;
              return (
                <p key={i} ref={last ? lastRef : undefined} className={`min-h-[1.45em] ${last && !done ? "caret" : ""}`}>
                  <Rich iconClass="text-white">{l}</Rich>
                </p>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.3 }} className="mt-10 flex flex-col items-center gap-6">
              {SITE.fromName && (
                <p className="text-3xl text-white/95" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>
                  — Yours, {SITE.fromName}
                </p>
              )}
              <ZoyaAvatar className="w-36 sm:w-44" showBubble={false} interactive={false} />
              <div className="flex flex-wrap justify-center gap-3">
                <button type="button" onClick={() => setRun((r) => r + 1)} className="rounded-full border border-white/50 bg-white/10 px-6 py-3 font-bold text-white backdrop-blur-md transition hover:bg-white/25">
                  Read it again
                </button>
                <button type="button" onClick={onClose} className="rounded-full bg-white px-7 py-3 font-bold text-deep shadow-glow transition hover:scale-105">
                  Keep it in my heart
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function SecretMessage() {
  const [stage, setStage] = useState<Stage>("locked");
  const [reading, setReading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { react } = useAvatar();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    setMounted(true);
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const openIt = () => {
    if (stage !== "locked") return;
    chime("soft");
    react("surprised", 2000, "A secret?!");
    setStage("unlocking");
    timers.current.push(setTimeout(() => setStage("opening"), 700));
    timers.current.push(setTimeout(() => setStage("rising"), 1400));
    timers.current.push(setTimeout(() => setReading(true), 2500));
  };

  const close = useCallback(() => {
    setReading(false);
    timers.current.push(setTimeout(() => setStage("locked"), 700));
  }, []);

  return (
    <Section id="secret" eyebrow="shhh… it's a secret" title="You found a secret..." contentClass="max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
        className="flex flex-col items-center"
      >
        <motion.div className="relative w-[min(86vw,420px)]" animate={stage === "locked" ? { y: [0, -8, 0] } : { y: 0 }} transition={{ duration: 4, repeat: stage === "locked" ? Infinity : 0, ease: "easeInOut" }}>
          <div aria-hidden="true" className="absolute inset-[-8%] rounded-full bg-hot/20 blur-3xl" />
          <Envelope stage={stage} />
        </motion.div>
        <button type="button" onClick={openIt} disabled={stage !== "locked"} className="btn-glow mt-8 disabled:opacity-80">
          <Rich iconClass="text-white">Open My Heart 💌</Rich>
        </button>
        <p className="mt-4 text-sm font-medium" style={{ color: "var(--fg-soft)" }}>
          A little letter, written only for you.
        </p>
      </motion.div>

      {mounted && createPortal(<AnimatePresence>{reading && <Letter key="letter" onClose={close} />}</AnimatePresence>, document.body)}
    </Section>
  );
}
