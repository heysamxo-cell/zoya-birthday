"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Section from "./ui/Section";
import { Rich, IconHeart } from "./Icons";
import { WHY_LINES, WHY_END } from "@/lib/content";

export default function WhyTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <Section id="story" eyebrow="a short story" title="Why Zoya Is Special">
      <div ref={ref} className="relative mx-auto max-w-4xl">
        {/* rail */}
        <div aria-hidden="true" className="absolute bottom-0 left-5 top-0 w-[3px] rounded-full bg-white/60 md:left-1/2 md:-translate-x-1/2" />
        <motion.div
          aria-hidden="true"
          className="absolute left-5 top-0 h-full w-[3px] origin-top rounded-full md:left-1/2 md:-translate-x-1/2"
          style={{ scaleY: fill, background: "linear-gradient(#ff8fb8, #ff3d8b, #e9a6ff)", boxShadow: "0 0 18px rgba(255,61,139,.7)" }}
        />

        <ol className="space-y-14 md:space-y-24">
          {WHY_LINES.map((line, i) => {
            const right = i % 2 === 1;
            return (
              <li key={i} className="relative pl-14 md:grid md:grid-cols-2 md:gap-16 md:pl-0">
                <span aria-hidden="true" className="absolute left-5 top-6 -translate-x-1/2 md:left-1/2">
                  <motion.span
                    initial={{ scale: 0, rotate: -40 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true, margin: "-20% 0px" }}
                    transition={{ type: "spring", stiffness: 260, damping: 14 }}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white text-hot shadow-glow"
                  >
                    <IconHeart className="h-5 w-5" />
                  </motion.span>
                </span>
                <motion.div
                  initial={{ opacity: 0, x: right ? 70 : -70, filter: "blur(12px)" }}
                  whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-15% 0px" }}
                  transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
                  className={`glass glow-ring rounded-[1.8rem] p-6 sm:p-8 ${right ? "md:col-start-2" : "md:col-start-1 md:text-right"}`}
                >
                  <span className="text-sm font-bold uppercase tracking-[0.3em] text-hot">0{i + 1}</span>
                  <p className="mt-2 text-balance text-2xl font-semibold leading-snug text-deep sm:text-3xl" style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>
                    <Rich>{line}</Rich>
                  </p>
                </motion.div>
              </li>
            );
          })}
        </ol>

        <motion.p
          initial={{ opacity: 0, scale: 0.9, filter: "blur(14px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 1.3 }}
          className="text-shimmer mx-auto mt-24 max-w-2xl text-balance text-center text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl"
          style={{ fontFamily: "var(--font-display)", filter: "drop-shadow(0 8px 24px rgba(255,77,148,.25))" }}
        >
          <Rich>{WHY_END}</Rich>
        </motion.p>
      </div>
    </Section>
  );
}
