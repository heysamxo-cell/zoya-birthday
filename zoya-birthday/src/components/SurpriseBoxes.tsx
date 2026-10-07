"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Section from "./ui/Section";
import Modal from "./ui/Modal";
import { Rich } from "./Icons";
import { SURPRISE_BOXES } from "@/lib/content";
import { useAvatar } from "./AvatarProvider";
import { useFx } from "./FxLayer";
import ZoyaAvatar from "./ZoyaAvatar";
import { chime } from "@/lib/music";

const TONES = {
  rose: { a: "#ff8fb8", b: "#ff5c9d", rib: "#fff" },
  blush: { a: "#ffd0e3", b: "#ffa6c9", rib: "#ff4d94" },
  hot: { a: "#ff6aa8", b: "#e0287a", rib: "#ffe4ee" },
  lav: { a: "#ead7ff", b: "#c9a6f5", rib: "#ff4d94" },
  gold: { a: "#ffe6a8", b: "#ffb95e", rib: "#ff4d94" },
} as const;

function Gift({ tone, opened, id }: { tone: keyof typeof TONES; opened: boolean; id: string }) {
  const t = TONES[tone];
  return (
    <svg viewBox="0 0 140 150" className="h-auto w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={t.a} />
          <stop offset="1" stopColor={t.b} />
        </linearGradient>
        <radialGradient id={`b-${id}`} cx=".5" cy="1" r="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="70" cy="140" rx="48" ry="7" fill="#b3246a" opacity=".22" />
      {/* light from inside */}
      <motion.path
        d="M30 70L8 -40 132 -40 110 70z"
        fill={`url(#b-${id})`}
        initial={false}
        animate={{ opacity: opened ? 0.8 : 0 }}
        transition={{ duration: 0.6 }}
      />
      {/* box body */}
      <rect x="20" y="66" width="100" height="72" rx="10" fill={`url(#g-${id})`} />
      <rect x="62" y="66" width="16" height="72" fill={t.rib} opacity=".92" />
      <rect x="20" y="66" width="100" height="10" rx="5" fill="#000" opacity=".08" />
      {/* lid */}
      <motion.g
        initial={false}
        animate={opened ? { y: -46, x: 26, rotate: 24 } : { y: 0, x: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 11 }}
        style={{ originX: 0.5, originY: 0.5 }}
      >
        <rect x="14" y="48" width="112" height="24" rx="9" fill={`url(#g-${id})`} />
        <rect x="14" y="48" width="112" height="9" rx="4.5" fill="#fff" opacity=".28" />
        <rect x="62" y="48" width="16" height="24" fill={t.rib} opacity=".95" />
        {/* bow */}
        <path d="M70 48C52 22 30 34 42 46c8 8 22 4 28 2z" fill={t.rib} />
        <path d="M70 48c18-26 40-14 28-2-8 8-22 4-28 2z" fill={t.rib} />
        <path d="M70 48c18-26 40-14 28-2-8 8-22 4-28 2z" fill="#000" opacity=".06" />
        <circle cx="70" cy="48" r="7" fill={t.rib} />
        <circle cx="70" cy="48" r="7" fill="#000" opacity=".1" />
      </motion.g>
    </svg>
  );
}

export default function SurpriseBoxes() {
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const hintT = useRef<ReturnType<typeof setTimeout>>();
  const { react } = useAvatar();
  const fx = useFx();

  const firstFour = SURPRISE_BOXES.slice(0, 4).every((b) => opened[b.id]);

  const click = (id: string, e: React.MouseEvent) => {
    const b = SURPRISE_BOXES.find((x) => x.id === id)!;
    if (id === "last" && !firstFour) {
      setHint("Open the other four boxes first — this one is shy");
      react("shy", 2000, "Patience… 💗");
      clearTimeout(hintT.current);
      hintT.current = setTimeout(() => setHint(null), 2800);
      return;
    }
    setOpened((o) => ({ ...o, [id]: true }));
    chime("up");
    react(b.mood, 3200, b.say);
    const x = e.clientX;
    const y = e.clientY;
    if (b.fx === "hearts") fx.hearts(x, y, 18);
    if (b.fx === "petals") fx.petals(40);
    if (b.fx === "stars") fx.stars(x, y, 22);
    if (b.fx === "confetti") fx.confetti({ count: 150 });
    setTimeout(() => setActive(id), 750);
  };

  const cur = SURPRISE_BOXES.find((b) => b.id === active) ?? null;
  const count = SURPRISE_BOXES.filter((b) => opened[b.id]).length;

  return (
    <Section id="surprises" eyebrow="five little gifts" title="Pick a Surprise" subtitle={`${count} of ${SURPRISE_BOXES.length} opened — the last one is a secret.`}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-5">
        {SURPRISE_BOXES.map((b, i) => {
          const isOpen = !!opened[b.id];
          const locked = b.id === "last" && !firstFour;
          return (
            <motion.div
              key={b.id}
              className={`flex flex-col items-center ${i === 4 ? "col-span-2 sm:col-span-1 sm:col-start-2 lg:col-start-auto" : ""}`}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ type: "spring", stiffness: 100, damping: 14, delay: i * 0.1 }}
            >
              <motion.button
                type="button"
                onClick={(e) => click(b.id, e)}
                aria-label={`${b.label}${locked ? " (locked)" : ""}`}
                className="group relative w-[8.5rem] sm:w-40"
                animate={locked && hint ? { x: [0, -8, 8, -6, 6, 0] } : { y: [0, -10, 0] }}
                transition={locked && hint ? { duration: 0.5 } : { duration: 3.2 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                whileHover={{ scale: 1.08, rotate: i % 2 ? 3 : -3 }}
                whileTap={{ scale: 0.92 }}
                style={{ opacity: locked ? 0.65 : 1 }}
              >
                <span aria-hidden="true" className="absolute inset-[-12%] -z-10 rounded-full bg-hot/20 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                <Gift tone={b.tone} opened={isOpen} id={b.id} />
                {locked && (
                  <span className="absolute left-1/2 top-[62%] grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-deep shadow-soft" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M7 10V8a5 5 0 0110 0v2h1a1 1 0 011 1v9a1 1 0 01-1 1H6a1 1 0 01-1-1v-9a1 1 0 011-1zm2 0h6V8a3 3 0 00-6 0z" /></svg>
                  </span>
                )}
                {isOpen && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-1 top-6 grid h-8 w-8 place-items-center rounded-full bg-hot text-white shadow-glow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
                  </motion.span>
                )}
              </motion.button>
              <span className="mt-3 text-center text-base font-bold sm:text-lg" style={{ color: "var(--fg)" }}>
                <Rich>{`${b.emoji} ${b.label}`}</Rich>
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 h-8 text-center">
        <AnimatePresence>
          {hint && (
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="inline-block rounded-full bg-white/80 px-5 py-1.5 text-sm font-bold text-deep shadow-soft">
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <Modal open={!!cur} onClose={() => setActive(null)} label={cur?.title ?? "Surprise"}>
        {cur && (
          <div className="text-center">
            <div className="mx-auto mb-2 w-32 sm:w-36">
              <ZoyaAvatar className="w-full" showBubble={false} effects={false} interactive={false} />
            </div>
            <p className="text-2xl text-hot" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>
              <Rich>{`${cur.emoji} ${cur.label}`}</Rich>
            </p>
            <h3 className="mt-1 text-balance text-3xl font-bold sm:text-4xl">{cur.title}</h3>
            <motion.p
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.25, duration: 0.8 }}
              className="mx-auto mt-5 max-w-md text-balance text-lg leading-relaxed sm:text-xl"
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
            >
              <Rich>{cur.body}</Rich>
            </motion.p>
            <button type="button" className="btn-glow mt-7 !min-h-12 !px-8 !text-base" onClick={() => setActive(null)}>
              <Rich iconClass="text-white">Thank you 💗</Rich>
            </button>
          </div>
        )}
      </Modal>
    </Section>
  );
}
