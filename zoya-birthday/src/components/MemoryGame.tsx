"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Rich, HEART_PATH, SPARKLE_PATH } from "./Icons";
import { useAvatar } from "./AvatarProvider";
import { useFx } from "./FxLayer";
import { chime } from "@/lib/music";

/* six pink symbols, drawn as inline SVG */
const SYMBOLS: Record<string, React.ReactNode> = {
  heart: <path d={HEART_PATH} fill="url(#mg)" />,
  sparkle: <path d={SPARKLE_PATH} fill="url(#mg)" />,
  bow: (
    <g fill="url(#mg)">
      <path d="M12 12C9 7.500 3.500 6.500 2.500 9.500s2.500 6 9.500 2.500z" />
      <path d="M12 12c3-4.500 8.500-5.500 9.500-2.500s-2.500 6-9.500 2.500z" />
      <path d="M11 13l-3 7 2.500-1.200L12 21l1-6zM13 13l3 7-2.500-1.200L12 21z" opacity=".75" />
      <circle cx="12" cy="12" r="2.400" />
    </g>
  ),
  blossom: (
    <g fill="url(#mg)">
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="12" cy="6.200" rx="3.400" ry="4.600" transform={`rotate(${a} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="2.400" fill="#fff" opacity=".9" />
    </g>
  ),
  key: (
    <g fill="none" stroke="url(#mg)" strokeWidth="2.400" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="4.500" />
      <path d="M11.300 11.300L20 20M16 16l3-3M13.500 13.500l2.500-2.500" />
    </g>
  ),
  letter: (
    <g>
      <rect x="2" y="5" width="20" height="14" rx="3" fill="url(#mg)" />
      <path d="M3 7.500l9 6.500 9-6.500" fill="none" stroke="#fff" strokeWidth="1.600" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
};
const KEYS = Object.keys(SYMBOLS);

type Card = { id: number; sym: string; matched: boolean };
const shuffle = () => {
  const deck = [...KEYS, ...KEYS].map((sym, i) => ({ id: i, sym, matched: false }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck as Card[];
};

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>(() => shuffle());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const lock = useRef(false);
  const { react } = useAvatar();
  const fx = useFx();
  const won = cards.every((c) => c.matched);
  const pairs = cards.filter((c) => c.matched).length / 2;

  const pick = (i: number) => {
    if (lock.current || cards[i].matched || flipped.includes(i)) return;
    const next = [...flipped, i];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      lock.current = true;
      const [a, b] = next;
      if (cards[a].sym === cards[b].sym) {
        setTimeout(() => {
          setCards((cs) => cs.map((c, k) => (k === a || k === b ? { ...c, matched: true } : c)));
          setFlipped([]);
          lock.current = false;
          react("happy", 1300, "A match!");
          chime("soft");
        }, 550);
      } else {
        setTimeout(() => {
          setFlipped([]);
          lock.current = false;
        }, 950);
      }
    }
  };

  useEffect(() => {
    if (!won) return;
    const t = setTimeout(() => {
      fx.confetti({ count: 140 });
      react("celebrate", 4200, "Perfect!");
      chime("up");
    }, 450);
    return () => clearTimeout(t);
  }, [won, fx, react]);

  const reset = useCallback(() => {
    lock.current = false;
    setFlipped([]);
    setMoves(0);
    setCards(shuffle());
  }, []);

  return (
    <div className="mx-auto w-full max-w-xl">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="mg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff8fb8" />
            <stop offset="1" stopColor="#ff2e83" />
          </linearGradient>
        </defs>
      </svg>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="glass rounded-full px-5 py-2.5 text-base font-bold text-deep">
          Pairs <span className="text-hot tabular-nums">{pairs}/{KEYS.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass rounded-full px-5 py-2.5 text-base font-bold text-deep">
            Moves <span className="text-hot tabular-nums">{moves}</span>
          </div>
          <button type="button" className="btn-soft !min-h-11 !px-4" onClick={reset} aria-label="Shuffle and restart">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11a8 8 0 10-2.300 6.300M20 4v7h-7" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3.5" style={{ perspective: 1000 }}>
        {cards.map((c, i) => {
          const face = c.matched || flipped.includes(i);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => pick(i)}
              aria-label={face ? `Card: ${c.sym}` : "Hidden card"}
              className="relative aspect-square w-full touch-manipulation"
              disabled={c.matched}
            >
              <motion.div
                className="absolute inset-0"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: face ? 180 : 0, scale: c.matched ? [1, 1.12, 1] : 1 }}
                transition={{ rotateY: { type: "spring", stiffness: 180, damping: 18 }, scale: { duration: 0.5 } }}
                whileHover={face ? undefined : { y: -4 }}
              >
                {/* back */}
                <div
                  className="absolute inset-0 grid place-items-center rounded-2xl border border-white/70 shadow-soft"
                  style={{ backfaceVisibility: "hidden", background: "linear-gradient(135deg,#ff9cc7,#ff4d94)" }}
                >
                  <div className="absolute inset-1.5 rounded-xl border border-white/40" />
                  <svg viewBox="0 0 24 24" className="h-1/3 w-1/3 text-white/90" fill="currentColor"><path d={HEART_PATH} /></svg>
                </div>
                {/* front */}
                <div
                  className={`absolute inset-0 grid place-items-center rounded-2xl border border-white/80 ${c.matched ? "shadow-glow" : "shadow-soft"}`}
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: c.matched ? "linear-gradient(135deg,#fff,#ffe0ee)" : "linear-gradient(135deg,#fff,#fff0f6)" }}
                >
                  <svg viewBox="0 0 24 24" className="h-3/5 w-3/5" aria-hidden="true">{SYMBOLS[c.sym]}</svg>
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 min-h-[5.5rem] text-center">
        <AnimatePresence>
          {won && (
            <motion.div initial={{ opacity: 0, y: 14, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.5 }}>
              <p className="text-shimmer text-3xl font-extrabold sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
                <Rich>{"Perfect! Just like you. 💗"}</Rich>
              </p>
              <button type="button" className="btn-soft mt-3" onClick={reset}>
                Play again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
