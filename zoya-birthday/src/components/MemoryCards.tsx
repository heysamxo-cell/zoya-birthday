"use client";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Section from "./ui/Section";
import Modal from "./ui/Modal";
import { CardIcons, Rich } from "./Icons";
import { MEMORY_CARDS } from "@/lib/content";
import { useAvatar } from "./AvatarProvider";
import { useFx } from "./FxLayer";
import { SITE } from "@/lib/config";

function Card({ i, onOpen }: { i: number; onOpen: (e: React.MouseEvent) => void }) {
  const c = MEMORY_CARDS[i];
  const Icon = CardIcons[c.icon];
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 200, damping: 20 });
  const sy = useSpring(my, { stiffness: 200, damping: 20 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-9, 9]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [9, -9]);
  const shine = useTransform(sx, [-0.5, 0.5], ["20%", "80%"]);

  const move = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    const r = ref.current!.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const leave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ type: "spring", stiffness: 110, damping: 16, delay: (i % 3) * 0.1 }}
      style={{ perspective: 900 }}
    >
      <motion.button
        ref={ref}
        type="button"
        onClick={onOpen}
        onPointerMove={move}
        onPointerLeave={leave}
        whileTap={{ scale: 0.97 }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="glass glow-ring group relative block w-full overflow-hidden rounded-[2rem] p-6 text-left sm:p-8"
        aria-label={`${c.title} — open message`}
      >
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: useTransform(shine, (s) => `radial-gradient(circle at ${s} 20%, rgba(255,255,255,.75), transparent 55%)`) }}
        />
        <span
          className="relative grid h-16 w-16 place-items-center rounded-2xl text-white shadow-glow transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
          style={{ background: "linear-gradient(135deg,#ff8fb8,#ff3d8b)", transform: "translateZ(30px)" }}
        >
          <Icon className="h-9 w-9" />
        </span>
        <h3 className="relative mt-5 text-2xl font-bold text-deep sm:text-[1.7rem]" style={{ transform: "translateZ(20px)" }}>
          {c.title}
        </h3>
        <p className="relative mt-1 text-[0.95rem] font-medium text-deep/70">{c.teaser}</p>
        <span className="relative mt-5 inline-flex items-center gap-2 text-sm font-bold text-hot">
          Tap to open
          <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
            →
          </motion.span>
        </span>
      </motion.button>
    </motion.div>
  );
}

export default function MemoryCards() {
  const [open, setOpen] = useState<number | null>(null);
  const { react } = useAvatar();
  const fx = useFx();

  const show = (i: number, e: React.MouseEvent) => {
    setOpen(i);
    react("shy", 2600, "Aww… you noticed? 🙈");
    fx.hearts(e.clientX, e.clientY, 8);
  };
  const c = open !== null ? MEMORY_CARDS[open] : null;
  const Icon = c ? CardIcons[c.icon] : null;

  return (
    <Section id="cards" eyebrow="a few of my favourites" title="Little Things That Make You Special 💗" subtitle="Tap each card to open a tiny message.">
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {MEMORY_CARDS.map((_, i) => (
          <Card key={i} i={i} onOpen={(e) => show(i, e)} />
        ))}
      </div>

      <Modal open={open !== null} onClose={() => setOpen(null)} label={c?.title ?? "Message"}>
        {c && Icon && (
          <div className="text-center">
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
              className="mx-auto grid h-20 w-20 place-items-center rounded-3xl text-white shadow-glow"
              style={{ background: "linear-gradient(135deg,#ff8fb8,#ff3d8b)" }}
            >
              <Icon className="h-11 w-11" />
            </motion.span>
            <p className="mt-4 text-2xl text-hot" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>
              for {SITE.name}
            </p>
            <h3 className="text-3xl font-bold sm:text-4xl">{c.title}</h3>
            <div className="mt-6 space-y-4 text-lg leading-relaxed sm:text-xl" style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>
              {c.message.map((line, k) => (
                <motion.p
                  key={k}
                  initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.3 + k * 0.45, duration: 0.8 }}
                >
                  <Rich>{line}</Rich>
                </motion.p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button type="button" className="btn-soft" onClick={() => setOpen((open! + MEMORY_CARDS.length - 1) % MEMORY_CARDS.length)}>
                ← Previous
              </button>
              <button type="button" className="btn-glow !min-h-12 !px-6 !text-base" onClick={() => setOpen((open! + 1) % MEMORY_CARDS.length)}>
                Next →
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Section>
  );
}
