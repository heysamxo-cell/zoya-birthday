"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Section from "./ui/Section";
import ZoyaAvatar from "./ZoyaAvatar";
import HeartGame from "./HeartGame";
import MemoryGame from "./MemoryGame";
import SpinWheel from "./SpinWheel";
import { SITE } from "@/lib/config";

const TABS = [
  { id: "hearts", label: "Catch Hearts", blurb: "Tap the falling hearts — the more you catch, the happier she gets." },
  { id: "match", label: "Heart Match", blurb: "Flip the cards and find every matching pair." },
  { id: "wheel", label: "Spin the Wheel", blurb: "One spin, one little surprise. Let the stars decide." },
] as const;

export default function Games() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("hearts");
  const cur = TABS.find((t) => t.id === tab)!;

  return (
    <Section id="games" eyebrow="just for fun" title={`Play With ${SITE.name}`} subtitle="Three tiny games. No losing — only cuteness.">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end sm:justify-center sm:gap-8">
          <ZoyaAvatar className="w-[7.5rem] shrink-0 sm:w-[10rem]" />
          <div className="w-full max-w-md text-center sm:pb-6 sm:text-left">
            <div role="tablist" aria-label="Games" className="glass relative inline-flex w-full rounded-full p-1.5">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative z-10 min-h-11 flex-1 rounded-full px-2 text-[0.8rem] font-bold transition-colors sm:text-sm ${tab === t.id ? "text-white" : "text-deep/80 hover:text-deep"}`}
                >
                  {tab === t.id && (
                    <motion.span layoutId="game-tab" className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-rose to-hot shadow-glow" transition={{ type: "spring", stiffness: 350, damping: 30 }} />
                  )}
                  {t.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm font-medium sm:text-base" style={{ color: "var(--fg-soft)" }}>
              {cur.blurb}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              role="tabpanel"
              initial={{ opacity: 0, y: 30, filter: "blur(10px)", scale: 0.98 }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {tab === "hearts" && <HeartGame />}
              {tab === "match" && <MemoryGame />}
              {tab === "wheel" && <SpinWheel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}
