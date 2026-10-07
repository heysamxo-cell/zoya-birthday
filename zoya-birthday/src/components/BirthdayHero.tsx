"use client";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ZoyaAvatar from "./ZoyaAvatar";
import FloatingHearts from "./FloatingHearts";
import { Rich } from "./Icons";
import { useAvatar } from "./AvatarProvider";
import { scrollToId } from "@/lib/scroll";
import { SITE } from "@/lib/config";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.5 } } };
const word = {
  hidden: { opacity: 0, y: 50, filter: "blur(14px)", rotateX: -40 },
  show: { opacity: 1, y: 0, filter: "blur(0px)", rotateX: 0, transition: { default: { type: "spring" as const, stiffness: 120, damping: 16 }, filter: { duration: 0.9 } } },
};

export default function BirthdayHero() {
  const { react } = useAvatar();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const avatarY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  useEffect(() => {
    const t = setTimeout(() => react("happy", 3600, `Happy Birthday, ${SITE.name}!`), 1300);
    return () => clearTimeout(t);
  }, [react]);

  const start = () => {
    react("excited", 2200, "Let's begin!");
    scrollToId("countdown");
  };

  return (
    <section id="hero" ref={ref} className="relative z-10 flex min-h-[100svh] items-center overflow-hidden px-5 pb-16 pt-28 sm:px-8 lg:pt-20">
      <motion.div
        aria-hidden="true"
        style={{ y: glowY }}
        className="pointer-events-none absolute right-[-10%] top-[10%] h-[60vh] w-[60vh] rounded-full bg-hot/25 blur-3xl"
      />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-6 lg:grid-cols-2 lg:gap-10">
        <motion.div style={{ y: textY }} className="order-1 text-center lg:text-left" variants={container} initial="hidden" animate="show">
          <motion.p variants={word} className="text-2xl text-hot sm:text-3xl" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>
            a little world, made just for you
          </motion.p>
          <h1
            className="mt-2 text-balance text-[2.9rem] font-extrabold leading-[1.02] sm:text-7xl lg:text-[5.6rem]"
            style={{ perspective: 800 }}
          >
            <motion.span variants={word} className="inline-block" style={{ color: "var(--fg)" }}>
              Happy
            </motion.span>{" "}
            <motion.span variants={word} className="inline-block" style={{ color: "var(--fg)" }}>
              Birthday,
            </motion.span>
            <br />
            <motion.span variants={word} className="text-shimmer inline-block pb-2" style={{ filter: "drop-shadow(0 8px 24px rgba(255,77,148,.3))" }}>
              <Rich>{`${SITE.name} 💗`}</Rich>
            </motion.span>
          </h1>
          <motion.p variants={word} className="mx-auto mt-4 max-w-lg text-lg font-medium leading-relaxed sm:text-xl lg:mx-0" style={{ color: "var(--fg-soft)" }}>
            To the sweetest girl who deserves a world full of happiness.
          </motion.p>
          <motion.div variants={word} className="mt-8 flex justify-center lg:justify-start">
            <button type="button" onClick={start} className="btn-glow text-lg">
              <Rich iconClass="text-white">Start the Surprise 🎀</Rich>
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          className="order-2 flex justify-center"
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.3, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ y: avatarY }}
        >
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-[48%] h-[88%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 blur-2xl"
              style={{ background: "radial-gradient(closest-side, rgba(255,255,255,.95), rgba(255,194,217,.4) 60%, transparent)" }}
            />
            <FloatingHearts count={12} className="scale-[1.3]" />
            <ZoyaAvatar className="relative w-[min(72vw,300px)] sm:w-[360px] lg:w-[min(42vh,420px)] lg:min-w-[320px]" />
          </div>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={() => scrollToId("countdown")}
        aria-label="Scroll down"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 2.4 }}
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs font-bold uppercase tracking-[0.25em] text-deep/70 sm:flex"
      >
        scroll
        <motion.span animate={{ y: [0, 7, 0] }} transition={{ duration: 1.8, repeat: Infinity }} className="block h-6 w-3.5 rounded-full border-2 border-deep/40 p-[3px]">
          <span className="block h-1.5 w-full rounded-full bg-deep/60" />
        </motion.span>
      </motion.button>
    </section>
  );
}
