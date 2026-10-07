"use client";
import { useEffect, useId, useMemo, useRef } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Mood, useAvatar } from "./AvatarProvider";
import { useEnv } from "@/lib/useEnv";
import { HEART_PATH, Rich } from "./Icons";

/* ──────────────────────────────────────────────────────────────
   Zoya — an imaginary, illustrated girl rigged with a tiny
   spring-based animation system. No images: it's all SVG, driven
   by one requestAnimationFrame loop that writes straight to the
   DOM (no React re-renders per frame → buttery on phones).

   Moods: idle · happy · shy · excited · surprised · love · celebrate
   ────────────────────────────────────────────────────────────── */

type Pose = {
  tilt: number; headX: number; headY: number;
  lookX: number; lookY: number; eyeScale: number; happyEyes: number;
  smile: number; big: number; oMouth: number; shyMouth: number;
  blush: number; browY: number; browTilt: number;
  uL: number; fL: number; uR: number; fR: number;
  heart: number; bounce: number; wave: number; waveBoth: number; sway: number;
};

const base: Pose = {
  tilt: 0, headX: 0, headY: 0, lookX: 0, lookY: 0, eyeScale: 1, happyEyes: 0,
  smile: 1, big: 0, oMouth: 0, shyMouth: 0, blush: 0.35, browY: 0, browTilt: 0,
  uL: 7, fL: -50, uR: 7, fR: -50, heart: 0, bounce: 0, wave: 0, waveBoth: 0, sway: 0,
};

const POSES: Record<Mood, Pose> = {
  idle: base,
  happy: { ...base, tilt: 3, smile: 0, big: 1, blush: 0.6, uL: 9, fL: -40, uR: 128, fR: 55, wave: 24, bounce: 4, sway: 2 },
  shy: {
    ...base, tilt: -7, headX: -3, headY: 3, lookX: -7, lookY: 4, eyeScale: 0.97, smile: 0, shyMouth: 1,
    blush: 1, browY: 2, browTilt: 7, uL: 30, fL: -120, uR: 30, fR: -120,
  },
  excited: {
    ...base, smile: 0, big: 1, eyeScale: 1.08, blush: 0.7, browY: -3, uL: 150, fL: 12, uR: 150, fR: 12,
    bounce: 16, waveBoth: 9, sway: 3,
  },
  surprised: {
    ...base, eyeScale: 1.22, browY: -8, smile: 0, oMouth: 1, blush: 0.2, headY: -3, uL: 36, fL: -44, uR: 36, fR: -44,
  },
  love: {
    ...base, tilt: 5, happyEyes: 1, blush: 1, heart: 1, uL: 22, fL: -132, uR: 22, fR: -132, bounce: 2, sway: 1.5,
  },
  celebrate: {
    ...base, happyEyes: 1, smile: 0, big: 1, blush: 0.8, uL: 145, fL: 20, uR: 145, fR: 20,
    bounce: 12, waveBoth: 14, sway: 6,
  },
};

const KEYS = Object.keys(base) as (keyof Pose)[];
const FAST = new Set<keyof Pose>(["happyEyes", "smile", "big", "oMouth", "shyMouth"]);

const CLICK_REACTIONS: { mood: Mood; say: string }[] = [
  { mood: "happy", say: "Hi Zoya! 💗" },
  { mood: "shy", say: "Hehe… you're staring 🙈" },
  { mood: "surprised", say: "Eek! You surprised me!" },
  { mood: "love", say: "Sending you love 💗" },
  { mood: "excited", say: "It's your birthday!!" },
];

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

type Props = {
  className?: string;
  /** Show the speech bubble above her head. */
  showBubble?: boolean;
  /** Tap/click the avatar for a random reaction. */
  interactive?: boolean;
  /** Add small hearts / confetti around her on emotional moods. */
  effects?: boolean;
  /** Force a mood (ignores the shared mood). */
  moodOverride?: Mood;
};

export default function ZoyaAvatar({
  className = "w-[260px]",
  showBubble = true,
  interactive = true,
  effects = true,
  moodOverride,
}: Props) {
  const { mood: sharedMood, bubble, react, pulse } = useAvatar();
  const env = useEnv();
  const mood = moodOverride ?? sharedMood;
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: "120px" });
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (n: string) => `${n}-${uid}`;

  const els = useRef<Record<string, SVGElement | null>>({});
  const r = (k: string) => (el: SVGElement | null) => {
    els.current[k] = el;
  };

  const moodRef = useRef<Mood>(mood);
  moodRef.current = mood;
  const reducedRef = useRef(false);
  reducedRef.current = env.reduced;
  const pointer = useRef({ x: 0, y: 0 });

  /* pointer-follow (desktop only) */
  useEffect(() => {
    if (!env.finePointer) return;
    const onMove = (e: PointerEvent) => {
      const box = wrapRef.current?.getBoundingClientRect();
      if (!box) return;
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height * 0.35;
      pointer.current.x = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth * 0.45)));
      pointer.current.y = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight * 0.45)));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [env.finePointer]);

  /* the animation rig */
  useEffect(() => {
    if (!inView) return;
    const x = {} as Record<keyof Pose, number>;
    const v = {} as Record<keyof Pose, number>;
    KEYS.forEach((k) => {
      x[k] = POSES[moodRef.current][k];
      v[k] = 0;
    });
    let raf = 0;
    let last = performance.now();
    let nextBlink = last + 1500 + Math.random() * 2500;
    let blinkStart = -1;
    let nextWander = last + 2500;
    let wanderUntil = 0;
    const wander = { tilt: 0, hx: 0, lx: 0, ly: 0 };

    const set = (k: string, attr: string, val: string) => els.current[k]?.setAttribute(attr, val);

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      const t = now / 1000;
      const reduced = reducedRef.current;
      const m = moodRef.current;
      const target = POSES[m];

      /* idle wandering (head tilts, glances) */
      if (!reduced) {
        if (now > nextWander) {
          wander.tilt = (Math.random() - 0.5) * 8;
          wander.hx = (Math.random() - 0.5) * 8;
          wander.lx = (Math.random() - 0.5) * 9;
          wander.ly = (Math.random() - 0.5) * 4;
          wanderUntil = now + 1400 + Math.random() * 1200;
          nextWander = now + 3500 + Math.random() * 3500;
        }
        if (now > wanderUntil) {
          wander.tilt = wander.hx = wander.lx = wander.ly = 0;
        }
      }
      const wScale = m === "idle" ? 1 : m === "happy" ? 0.4 : 0.15;
      const shy = m === "shy";

      for (const k of KEYS) {
        let tv = target[k];
        if (k === "tilt") tv += wander.tilt * wScale + pointer.current.x * 3 * (shy ? 0 : 1);
        if (k === "headX") tv += wander.hx * wScale + pointer.current.x * 2.5 * (shy ? 0 : 1);
        if (k === "lookX") tv += wander.lx * wScale + (shy ? 0 : pointer.current.x * 4.5);
        if (k === "lookY") tv += wander.ly * wScale + (shy ? 0 : pointer.current.y * 3);
        if (reduced && (k === "bounce" || k === "wave" || k === "waveBoth" || k === "sway")) tv = 0;
        const K = FAST.has(k) ? 320 : k === "blush" ? 60 : reduced ? 400 : 130;
        const C = FAST.has(k) ? 36 : k === "blush" ? 14 : reduced ? 40 : 15;
        v[k] += ((tv - x[k]) * K - v[k] * C) * dt;
        x[k] += v[k] * dt;
      }

      /* blinking */
      let open = 1;
      if (now > nextBlink && blinkStart < 0) blinkStart = now;
      if (blinkStart >= 0) {
        const p = (now - blinkStart) / 170;
        if (p >= 1) {
          blinkStart = -1;
          nextBlink = now + 2200 + Math.random() * 3600;
        } else {
          open = 1 - Math.sin(p * Math.PI) * 0.96;
        }
      }

      const breath = reduced ? 0 : Math.sin(t * 1.7);
      const bounceY = reduced ? 0 : x.bounce * Math.pow(Math.abs(Math.sin(t * Math.PI * 1.9)), 0.9);
      const sway = reduced ? 0 : Math.sin(t * 5.2) * x.sway;

      set("figure", "transform", `translate(0 ${(-bounceY).toFixed(2)})`);
      set("shadow", "transform", `translate(200 552) scale(${(1 - bounceY * 0.012).toFixed(3)} 1)`);
      set("shadow", "opacity", String(0.28 - bounceY * 0.006));
      set("body", "transform", `translate(0 ${(breath * 1.4).toFixed(2)})`);
      set("arms", "transform", `translate(0 ${(breath * 1.4).toFixed(2)})`);
      set("hairBack", "transform", `rotate(${(reduced ? 0 : Math.sin(t * 1.1) * 1.1 + sway * 0.25).toFixed(2)} 200 70) translate(0 ${(breath * 0.8).toFixed(2)})`);
      set(
        "head",
        "transform",
        `translate(${x.headX.toFixed(2)} ${(x.headY + breath * 2 ).toFixed(2)}) rotate(${(x.tilt + sway).toFixed(2)} 200 290)`,
      );
      const lockSway = reduced ? 0 : Math.sin(t * 1.5 + 1) * 1.6;
      set("lockL", "transform", `rotate(${(lockSway + sway * 0.4).toFixed(2)} 124 180)`);
      set("lockR", "transform", `rotate(${(-lockSway * 0.9 + sway * 0.4).toFixed(2)} 276 180)`);

      /* eyes */
      const es = x.eyeScale;
      const eyeT = (cx: number) => {
        const cy = 210;
        return `translate(${cx} ${cy}) scale(${es.toFixed(3)} ${(es * Math.max(0.04, open)).toFixed(3)}) translate(${-cx} ${-cy})`;
      };
      set("eyeL", "transform", eyeT(161));
      set("eyeR", "transform", eyeT(239));
      const lx = Math.max(-9, Math.min(9, x.lookX));
      const ly = Math.max(-6, Math.min(6, x.lookY));
      set("irisL", "transform", `translate(${lx.toFixed(2)} ${ly.toFixed(2)})`);
      set("irisR", "transform", `translate(${lx.toFixed(2)} ${ly.toFixed(2)})`);
      const he = clamp01(x.happyEyes);
      set("eyesOpen", "opacity", (1 - he).toFixed(3));
      set("eyesHappy", "opacity", he.toFixed(3));
      const by = x.browY;
      set("browL", "transform", `translate(0 ${by.toFixed(2)}) rotate(${(-x.browTilt).toFixed(2)} 160 168)`);
      set("browR", "transform", `translate(0 ${by.toFixed(2)}) rotate(${x.browTilt.toFixed(2)} 240 168)`);

      /* mouth + blush */
      set("mSmile", "opacity", clamp01(x.smile).toFixed(3));
      set("mBig", "opacity", clamp01(x.big).toFixed(3));
      set("mO", "opacity", clamp01(x.oMouth).toFixed(3));
      set("mShy", "opacity", clamp01(x.shyMouth).toFixed(3));
      set("blushL", "opacity", clamp01(x.blush).toFixed(3));
      set("blushR", "opacity", clamp01(x.blush).toFixed(3));

      /* arms (outward angle is positive; right arm is mirrored) */
      const wv = reduced ? 0 : Math.sin(t * 8.5);
      const waveR = x.wave * wv + x.waveBoth * Math.sin(t * 8.5 + 1.2);
      const waveL = x.waveBoth * Math.sin(t * 8.5 + 2.6);
      const idleArm = reduced ? 0 : Math.sin(t * 1.7 + 0.6) * 1.2;
      set("armL", "transform", `rotate(${(x.uL + idleArm).toFixed(2)} 150 330)`);
      set("foreL", "transform", `rotate(${(x.fL + waveL).toFixed(2)} 150 400)`);
      set("armR", "transform", `rotate(${(-(x.uR - idleArm * 0.6)).toFixed(2)} 250 330)`);
      set("foreR", "transform", `rotate(${(-(x.fR + waveR)).toFixed(2)} 250 400)`);

      /* heart-hands */
      const h = clamp01(x.heart);
      const pulseS = 1 + (reduced ? 0 : Math.sin(t * 5) * 0.07);
      set("heartG", "opacity", h.toFixed(3));
      set("heartG", "transform", `translate(200 ${(364 + (1 - h) * 14).toFixed(1)}) scale(${(h * 2.5 * pulseS).toFixed(3)}) translate(-12 -12)`);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  const onClick = () => {
    if (!interactive) return;
    const c = CLICK_REACTIONS[Math.floor(Math.random() * CLICK_REACTIONS.length)];
    react(c.mood, 2600, c.say);
  };

  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        x: ((i * 37) % 100) - 50,
        up: 90 + ((i * 53) % 110),
        rot: ((i * 71) % 360) - 180,
        delay: (i % 8) * 0.04,
        hue: ["#ff4d94", "#ff8fb8", "#ffc2d9", "#ffffff", "#e9d5ff", "#ffd36e"][i % 6],
        w: 6 + (i % 3) * 3,
      })),
    [],
  );

  const showHearts = effects && !env.reduced && (mood === "love" || mood === "happy" || mood === "excited");
  const showConfetti = effects && !env.reduced && mood === "celebrate";

  const G = {
    skin: id("skin"), skinSh: id("skinSh"), hairB: id("hairB"), hairF: id("hairF"),
    iris: id("iris"), dress: id("dress"), sleeve: id("sleeve"), bow: id("bow"),
    skirtClip: id("skirtClip"), blurS: id("blurS"), blurM: id("blurM"), clipL: id("clipL"), clipR: id("clipR"), glow: id("glow"),
    hl: id("hl"),
  };

  const eye = (cx: number, cy: number, o: 1 | -1, clip: string, rootKey: string, irisKey: string) => (
    <g ref={r(rootKey)}>
      <clipPath id={clip}>
        <ellipse cx={cx} cy={cy} rx="21" ry="25.5" />
      </clipPath>
      <ellipse cx={cx} cy={cy} rx="21" ry="25.5" fill="#fffafc" />
      <g clipPath={`url(#${clip})`}>
        <g ref={r(irisKey)}>
          <ellipse cx={cx} cy={cy + 1} rx="18.5" ry="24" fill={`url(#${G.iris})`} />
          <ellipse cx={cx} cy={cy + 2} rx="8.5" ry="12" fill="#3a0f2e" />
          <ellipse cx={cx - o * 7} cy={cy - 8} rx="6" ry="6.8" fill="#fff" />
          <circle cx={cx + o * 8} cy={cy + 9} r="3" fill="#fff" opacity=".95" />
          <circle cx={cx + o * 3} cy={cy + 14} r="1.5" fill="#fff" opacity=".8" />
        </g>
        <ellipse cx={cx} cy={cy - 20} rx="24" ry="9" fill="#5b1642" opacity=".28" />
      </g>
      <path
        d={`M${cx - o * 22} ${cy - 6} Q${cx - o * 14} ${cy - 28} ${cx + o * 2} ${cy - 28} Q${cx + o * 19} ${cy - 27} ${cx + o * 23} ${cy - 6} L${cx + o * 30} ${cy - 13}`}
        fill="none" stroke="#2f0c26" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d={`M${cx - o * 13} ${cy + 25} Q${cx} ${cy + 30} ${cx + o * 13} ${cy + 25}`} fill="none" stroke="#7a2a5e" strokeWidth="1.6" strokeLinecap="round" opacity=".35" />
    </g>
  );

  const happyEye = (cx: number, o: 1 | -1) => (
    <g>
      <path d={`M${cx - 18} ${cy0 + 6} Q${cx} ${cy0 - 18} ${cx + 18} ${cy0 + 6}`} fill="none" stroke="#2f0c26" strokeWidth="5.5" strokeLinecap="round" />
      <path d={`M${cx + o * 17} ${cy0 + 4} l${o * 6} -6`} stroke="#2f0c26" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
  const cy0 = 210;

  return (
    <div ref={wrapRef} className={`relative select-none ${className}`}>
      {/* speech bubble */}
      <AnimatePresence>
        {showBubble && bubble && inView && (
          <div className="pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2">
            <motion.div
              key={bubble}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 380, damping: 24 }}
              className="relative whitespace-nowrap rounded-full border border-white/80 bg-white/90 px-4 py-2 text-sm font-semibold text-deep shadow-soft backdrop-blur-md sm:text-base"
            >
              <Rich>{bubble}</Rich>
              <span className="absolute -bottom-1.5 left-1/2 ml-[-6px] h-3 w-3 rotate-45 border-b border-r border-white/80 bg-white/90" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={onClick}
        aria-label={`${"Zoya"} — tap to say hi`}
        className="block w-full cursor-pointer rounded-[2rem] outline-none focus-visible:ring-4 focus-visible:ring-hot/40"
        style={{ filter: "drop-shadow(0 18px 34px rgba(179,36,106,.28)) drop-shadow(0 0 28px rgba(255,143,184,.35))" }}
      >
        <svg viewBox="0 0 400 560" className="block h-auto w-full overflow-visible" role="img" aria-label="Illustration of Zoya, a smiling girl with long hair and a pink dress">
          <defs>
            <linearGradient id={G.skin} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff1e8" />
              <stop offset="1" stopColor="#ffd9c9" />
            </linearGradient>
            <linearGradient id={G.skinSh} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f4b9a6" />
              <stop offset="1" stopColor="#ffd9c9" />
            </linearGradient>
            <linearGradient id={G.hairB} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3b1233" />
              <stop offset=".55" stopColor="#6a2a5b" />
              <stop offset="1" stopColor="#d5659f" />
            </linearGradient>
            <linearGradient id={G.hairF} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4a1a40" />
              <stop offset="1" stopColor="#80376f" />
            </linearGradient>
            <radialGradient id={G.iris} cx=".5" cy=".75" r=".8">
              <stop offset="0" stopColor="#ffb3d2" />
              <stop offset=".55" stopColor="#d9528f" />
              <stop offset="1" stopColor="#6d1f58" />
            </radialGradient>
            <linearGradient id={G.dress} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffd0e3" />
              <stop offset="1" stopColor="#ff86b4" />
            </linearGradient>
            <radialGradient id={G.sleeve} cx=".4" cy=".3" r=".9">
              <stop offset="0" stopColor="#fffafc" />
              <stop offset="1" stopColor="#ffc9de" />
            </radialGradient>
            <linearGradient id={G.bow} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff8fb8" />
              <stop offset="1" stopColor="#ff3d8b" />
            </linearGradient>
            <radialGradient id={G.glow}>
              <stop offset="0" stopColor="#ff4d94" stopOpacity=".65" />
              <stop offset="1" stopColor="#ff4d94" stopOpacity="0" />
            </radialGradient>
            <clipPath id={G.skirtClip}><path d="M162 424L238 424C262 480 320 530 352 560L48 560C80 530 138 480 162 424Z" /></clipPath>
            <filter id={G.blurS} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <filter id={G.blurM} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
          </defs>

          {/* ground shadow */}
          <ellipse ref={r("shadow")} cx="0" cy="0" rx="120" ry="12" fill="#b3246a" opacity=".28" transform="translate(200 552)" filter={`url(#${G.blurS})`} />

          <g ref={r("figure")}>
            {/* long back hair */}
            <g ref={r("hairBack")}>
              <path
                d="M200 58C118 58 76 130 78 228C80 296 62 352 70 410C76 452 100 478 134 474C150 472 164 462 176 456L224 456C236 462 250 472 266 474C300 478 324 452 330 410C338 352 320 296 322 228C324 130 282 58 200 58z"
                fill={`url(#${G.hairB})`}
              />
              <path d="M96 250c-6 50-2 110 14 160M304 250c6 50 2 110-14 160" stroke="#ff9cc7" strokeOpacity=".35" strokeWidth="5" strokeLinecap="round" fill="none" />
            </g>

            {/* body */}
            <g ref={r("body")}>
              {/* neck */}
              <path d="M183 262h34l2 54q-19 16-38 0z" fill={`url(#${G.skinSh})`} />
              {/* skirt */}
              <path d="M162 424L238 424C262 480 320 530 352 560L48 560C80 530 138 480 162 424Z" fill={`url(#${G.dress})`} />
              <path d="M200 430c-6 40-20 84-52 130M200 430c6 40 20 84 52 130M200 430c0 40 0 84 0 130" stroke="#fff" strokeOpacity=".28" strokeWidth="2.5" fill="none" />
              <path clipPath={`url(#${G.skirtClip})`} d="M30 540q20-12 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0V580H30z" fill="#fff" opacity=".94" />
              {/* bodice */}
              <path d="M148 326c16-20 88-20 104 0l8 62c0 20-12 36-24 46h-72c-12-10-24-26-24-46z" fill="#fff8fb" />
              <path d="M148 326c16-20 88-20 104 0" fill="none" stroke="#ffc2d9" strokeWidth="3" />
              {/* sash */}
              <path d="M140 414h120v22H140z" fill="#ff6aa5" />
              <path d="M140 414h120" stroke="#ffb3d1" strokeWidth="3" />
              <path d="M200 425l-22-14 4 28zM200 425l22-14-4 28z" fill="#ff4d94" />
              <circle cx="200" cy="425" r="6.5" fill="#ff2e83" />
              {/* collar + brooch */}
              <path d="M168 312q32 26 64 0l10 12q-42 36-84 0z" fill="#fff" stroke="#ffc2d9" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M200 337c-6-3-9-8-5-11 2-2 5-1 5 2 0-3 3-4 5-2 4 3 1 8-5 11z" fill="#ff4d94" />

              {/* heart-hands glow */}
              <g ref={r("heartG")} opacity="0" transform="translate(200 378) scale(0) translate(-12 -12)">
                <circle cx="12" cy="12" r="14" fill={`url(#${G.glow})`} />
                <path d={HEART_PATH} fill="#ff4d94" stroke="#fff" strokeWidth=".9" strokeLinejoin="round" />
                <ellipse cx="8" cy="8.5" rx="2.2" ry="1.4" fill="#fff" opacity=".7" transform="rotate(-30 8 8.5)" />
              </g>
            </g>

            {/* head */}
            <g ref={r("head")}>
              {/* ears */}
              <ellipse cx="119" cy="214" rx="9" ry="13" fill="#ffd9c9" />
              <ellipse cx="281" cy="214" rx="9" ry="13" fill="#ffd9c9" />
              {/* face */}
              <path d="M117 192C117 128 154 100 200 100s83 28 83 92c0 54-33 94-83 94s-83-40-83-94z" fill={`url(#${G.skin})`} />
              <ellipse cx="200" cy="150" rx="70" ry="28" fill="#c9788f" opacity=".16" filter={`url(#${G.blurM})`} />

              {/* blush */}
              <ellipse ref={r("blushL")} cx="137" cy="240" rx="17" ry="10" fill="#ff7fae" opacity=".35" filter={`url(#${G.blurS})`} />
              <ellipse ref={r("blushR")} cx="263" cy="240" rx="17" ry="10" fill="#ff7fae" opacity=".35" filter={`url(#${G.blurS})`} />

              {/* brows */}
              <path ref={r("browL")} d="M145 170q15-9 30-1" fill="none" stroke="#4a1a40" strokeWidth="3.6" strokeLinecap="round" />
              <path ref={r("browR")} d="M225 169q15-8 30 1" fill="none" stroke="#4a1a40" strokeWidth="3.6" strokeLinecap="round" />

              {/* eyes */}
              <g ref={r("eyesOpen")}>
                {eye(161, cy0, -1, G.clipL, "eyeL", "irisL")}
                {eye(239, cy0, 1, G.clipR, "eyeR", "irisR")}
              </g>
              <g ref={r("eyesHappy")} opacity="0">
                {happyEye(161, -1)}
                {happyEye(239, 1)}
              </g>

              {/* nose */}
              <path d="M197.500 237q2.500 3.500 5 0" fill="none" stroke="#e59a8a" strokeWidth="2.2" strokeLinecap="round" />

              {/* mouths */}
              <g ref={r("mSmile")}>
                <path d="M185 250q15 15 30 0" fill="none" stroke="#c23b78" strokeWidth="3.6" strokeLinecap="round" />
              </g>
              <g ref={r("mBig")} opacity="0">
                <path d="M180 247q20 6 40 0q-2 24-20 24t-20-24z" fill="#a31d58" />
                <path d="M184 249q16 4 32 0" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                <ellipse cx="200" cy="264" rx="9" ry="5" fill="#ff8fb8" />
              </g>
              <g ref={r("mO")} opacity="0">
                <ellipse cx="200" cy="256" rx="7.500" ry="10" fill="#a31d58" />
                <ellipse cx="200" cy="260" rx="4.500" ry="4" fill="#ff8fb8" />
              </g>
              <g ref={r("mShy")} opacity="0">
                <path d="M189 253q6 4 11 0t11 0" fill="none" stroke="#c23b78" strokeWidth="3.400" strokeLinecap="round" />
              </g>

              {/* front hair: fringe */}
              <path
                d="M106 206C86 112 138 54 200 54s114 58 94 152c-3-30-14-52-30-66-14 12-34 16-52 9-8 18-20 24-30 8-18 10-40 6-52-8-14 14-22 34-24 51z"
                fill={`url(#${G.hairF})`}
              />
              <path d="M132 100c20-24 62-36 100-26" fill="none" stroke="#e2a0c6" strokeOpacity=".55" strokeWidth="7" strokeLinecap="round" filter={`url(#${G.blurS})`} />
              <path d="M150 122c10-14 24-22 40-26M214 98c18 2 34 12 44 26" fill="none" stroke="#a04c8a" strokeOpacity=".55" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M178 150c-6-14-4-30 4-42M222 148c6-12 6-26 0-40" fill="none" stroke="#2f0c26" strokeOpacity=".3" strokeWidth="2" strokeLinecap="round" />

              {/* face-framing locks */}
              <g ref={r("lockL")}>
                <path d="M110 186C92 250 98 318 116 376c14-40 16-110 20-172z" fill={`url(#${G.hairB})`} />
                <path d="M114 230c-2 50 0 90 6 120" stroke="#ff9cc7" strokeOpacity=".4" strokeWidth="3" strokeLinecap="round" fill="none" />
              </g>
              <g ref={r("lockR")}>
                <path d="M290 186c18 64 12 132-6 190-14-40-16-110-20-172z" fill={`url(#${G.hairB})`} />
                <path d="M286 230c2 50 0 90-6 120" stroke="#ff9cc7" strokeOpacity=".4" strokeWidth="3" strokeLinecap="round" fill="none" />
              </g>

              {/* bow */}
              <g transform="translate(262 92) rotate(14)">
                <path d="M0 6C-26-20-48 2-30 20c10 8 22-2 30-14z" fill={`url(#${G.bow})`} />
                <path d="M0 6c26-26 48-4 30 14C20 28 8 18 0 6z" fill={`url(#${G.bow})`} />
                <path d="M-8 12l-10 28 12-6 6 10 6-28z" fill="#ff4d94" opacity=".9" />
                <path d="M-20-2c4-8 12-10 16-6" stroke="#fff" strokeOpacity=".7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <circle cx="0" cy="8" r="9" fill="#ff2e83" />
                <circle cx="-2.500" cy="5" r="2.800" fill="#fff" opacity=".6" />
              </g>
              {/* tiny hair clip */}
              <path d="M146 96l3.200 7 7.600.8-5.600 5.200 1.600 7.400-6.800-3.800-6.800 3.800 1.600-7.400-5.600-5.200 7.600-.8z" fill="#fff" stroke="#ffc2d9" strokeWidth="1.500" transform="translate(0 -4) scale(1)" />
            </g>

            <g ref={r("arms")}>

              {/* arms */}
              {(
                [
                  { key: "L", px: 150 },
                  { key: "R", px: 250 },
                ] as const
              ).map(({ key, px }) => (
                <g key={key} ref={r(`arm${key}`)} transform={`rotate(0 ${px} 330)`}>
                  <rect x={px - 9} y="326" width="18" height="80" rx="9" fill={`url(#${G.skin})`} />
                  <g ref={r(`fore${key}`)} transform={`rotate(0 ${px} 400)`}>
                    <rect x={px - 8} y="394" width="16" height="66" rx="8" fill={`url(#${G.skin})`} />
                    <rect x={px - 9} y="446" width="18" height="6" rx="3" fill="#ff8fb8" />
                    <ellipse cx={px} cy="466" rx="13" ry="14" fill={`url(#${G.skin})`} />
                    <path d={`M${px - 4} 474v-6M${px + 1} 475v-7`} stroke="#f2b3a0" strokeWidth="1.4" strokeLinecap="round" />
                  </g>
                  {/* puffed sleeve */}
                  <ellipse cx={px} cy="338" rx="23" ry="21" fill={`url(#${G.sleeve})`} stroke="#ffc2d9" strokeWidth="2.5" />
                  <path d={`M${px - 17} 350q17 9 34 0`} fill="none" stroke="#ff9cc7" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              ))}
            </g>
          </g>
        </svg>
      </button>

      {/* mood effects */}
      <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
        <AnimatePresence>
          {showHearts &&
            particles.slice(0, 6).map((p, i) => (
              <motion.svg
                key={`h-${pulse}-${i}`}
                viewBox="0 0 24 24"
                className="absolute left-1/2 top-[34%] h-5 w-5 text-hot"
                style={{ marginLeft: p.x * 1.2 }}
                initial={{ opacity: 0, y: 0, scale: 0.3 }}
                animate={{ opacity: [0, 0.95, 0], y: -p.up - 40, scale: [0.3, 1, 0.8], rotate: p.rot / 8 }}
                transition={{ duration: 2.2, delay: p.delay * 3, ease: "easeOut" }}
              >
                <path d={HEART_PATH} fill="currentColor" />
              </motion.svg>
            ))}
        </AnimatePresence>
        <AnimatePresence>
          {showConfetti &&
            particles.map((p, i) => (
              <motion.span
                key={`c-${pulse}-${i}`}
                className="absolute left-1/2 top-[30%] block rounded-[2px]"
                style={{ width: p.w, height: p.w * 1.6, background: p.hue, marginLeft: p.x * 2.4 }}
                initial={{ opacity: 1, y: 0, scale: 0.6 }}
                animate={{ opacity: [1, 1, 0], y: [0, -p.up * 1.2, p.up * 0.6], rotate: p.rot * 2, scale: 1 }}
                transition={{ duration: 2.4, delay: p.delay, ease: "easeOut" }}
              />
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
