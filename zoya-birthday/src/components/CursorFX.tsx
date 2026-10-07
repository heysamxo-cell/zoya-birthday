"use client";
import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEnv } from "@/lib/useEnv";
import { useState } from "react";

/** Soft pink cursor: a dot + a lagging ring. Desktop with a real pointer only. */
export default function CursorFX() {
  const env = useEnv();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 });
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (!env.finePointer) return;
    document.documentElement.classList.add("custom-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!seen) setSeen(true);
      const t = e.target as HTMLElement | null;
      setHover(!!t?.closest("a,button,[role='button'],[data-hover]"));
    };
    const dn = () => setDown(true);
    const up = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", dn);
    window.addEventListener("pointerup", up);
    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", dn);
      window.removeEventListener("pointerup", up);
    };
  }, [env.finePointer, seen, x, y]);

  if (!env.finePointer) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[99]" style={{ opacity: seen ? 1 : 0 }}>
      <motion.div
        className="absolute left-0 top-0 rounded-full"
        style={{
          x: env.reduced ? x : rx, y: env.reduced ? y : ry, translateX: "-50%", translateY: "-50%",
          width: 38, height: 38, border: "1.5px solid rgba(255,77,148,.7)",
          background: "radial-gradient(circle, rgba(255,255,255,.25), rgba(255,143,184,.18))",
          boxShadow: "0 0 18px rgba(255,105,168,.45)",
        }}
        animate={{ scale: down ? 0.7 : hover ? 1.6 : 1, opacity: hover ? 0.9 : 0.75 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      />
      <motion.div
        className="absolute left-0 top-0 rounded-full"
        style={{
          x, y, translateX: "-50%", translateY: "-50%", width: 9, height: 9,
          background: "linear-gradient(135deg,#ff8fb8,#ff3d8b)", boxShadow: "0 0 12px 2px rgba(255,61,139,.7)",
        }}
        animate={{ scale: hover ? 0.4 : 1 }}
      />
    </div>
  );
}
