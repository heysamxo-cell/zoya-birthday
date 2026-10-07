"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Rich } from "../Icons";

type Props = {
  id: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  contentClass?: string;
};

export const reveal = {
  hidden: { opacity: 0, y: 40, filter: "blur(12px)", scale: 0.98 },
  show: { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 },
};

/** Shared section shell with a blur/slide/fade entrance. */
export default function Section({ id, eyebrow, title, subtitle, children, className = "", contentClass = "" }: Props) {
  return (
    <section id={id} className={`relative z-10 overflow-x-clip px-5 py-20 sm:px-8 md:py-28 ${className}`}>
      <div className={`mx-auto w-full max-w-6xl ${contentClass}`}>
        {(eyebrow || title) && (
          <motion.header
            className="mx-auto mb-12 max-w-3xl text-center md:mb-16"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-12% 0px" }}
            variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          >
            {eyebrow && (
              <motion.p variants={reveal} transition={{ duration: 0.8 }} className="font-script text-2xl text-hot sm:text-3xl" style={{ fontFamily: "var(--font-script)" }}>
                {eyebrow}
              </motion.p>
            )}
            {title && (
              <motion.h2
                variants={reveal}
                transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
                className="mt-1 text-balance text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
                style={{ color: "var(--fg)" }}
              >
                <Rich>{title}</Rich>
              </motion.h2>
            )}
            {subtitle && (
              <motion.p variants={reveal} transition={{ duration: 0.9 }} className="mx-auto mt-4 max-w-xl text-base sm:text-lg" style={{ color: "var(--fg-soft)" }}>
                {subtitle}
              </motion.p>
            )}
          </motion.header>
        )}
        {children}
      </div>
    </section>
  );
}
