"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { scrollToId, lockScroll, unlockScroll } from "@/lib/scroll";
import { IconHeart } from "./Icons";

export const NAV = [
  { id: "hero", label: "Home" },
  { id: "countdown", label: "Countdown" },
  { id: "cake", label: "Make a Wish" },
  { id: "cards", label: "Little Things" },
  { id: "surprises", label: "Surprises" },
  { id: "story", label: "Why You" },
  { id: "games", label: "Play" },
  { id: "secret", label: "Secret" },
  { id: "gallery", label: "Memories" },
  { id: "batein", label: "Her Words" },
  { id: "finale", label: "Finale" },
];

export default function Navigation() {
  const [active, setActive] = useState("hero");
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", k);
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    setTimeout(() => scrollToId(id), open ? 250 : 0);
  };

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="fixed left-0 right-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-rose via-hot to-lav"
        style={{ scaleX: progress }}
      />

      <motion.nav
        aria-label="Sections"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="fixed left-4 right-4 top-4 z-[65] flex items-center justify-between sm:left-6 sm:right-6 sm:top-6"
      >
        <button
          type="button"
          onClick={() => go("hero")}
          className="glass flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-deep"
          aria-label="Back to top"
        >
          <IconHeart className="h-4 w-4 text-hot" />
          <span>For Zoya</span>
        </button>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="glass grid h-11 w-11 place-items-center rounded-full text-deep lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h10" />
          </svg>
        </button>
      </motion.nav>

      {/* desktop dot rail */}
      <motion.ul
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="fixed bottom-0 right-5 top-0 z-[65] my-auto hidden h-fit flex-col gap-3 lg:flex"
      >
        {NAV.map((n) => (
          <li key={n.id} className="group relative flex items-center justify-end">
            <span className="glass pointer-events-none absolute right-8 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold text-deep opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
              {n.label}
            </span>
            <button
              type="button"
              onClick={() => go(n.id)}
              aria-label={n.label}
              aria-current={active === n.id}
              className="grid h-6 w-6 place-items-center"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  active === n.id ? "h-3.5 w-3.5 bg-hot shadow-glow" : "h-2 w-2 bg-white/80 ring-1 ring-hot/40 hover:bg-rose"
                }`}
              />
            </button>
          </li>
        ))}
      </motion.ul>

      {/* mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[85] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-[#5a1840]/45 backdrop-blur-lg" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="glass glow-ring relative w-full max-w-sm rounded-[2rem] p-6"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              <p className="mb-3 text-center text-2xl text-hot" style={{ fontFamily: "var(--font-script)" }}>
                Where to, Zoya?
              </p>
              <ul className="grid grid-cols-2 gap-2">
                {NAV.map((n, i) => (
                  <motion.li key={n.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}>
                    <button
                      type="button"
                      onClick={() => go(n.id)}
                      className={`min-h-12 w-full rounded-2xl px-3 py-2 text-sm font-bold transition ${
                        active === n.id ? "bg-hot text-white shadow-glow" : "bg-white/70 text-deep hover:bg-white"
                      }`}
                    >
                      {n.label}
                    </button>
                  </motion.li>
                ))}
              </ul>
              <button type="button" onClick={() => setOpen(false)} className="btn-soft mx-auto mt-4 flex" aria-label="Close menu">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
