"use client";
import { useMemo } from "react";
import { HEART_PATH, SPARKLE_PATH } from "./Icons";

/** Decorative hearts + sparkles that gently bob around whatever they wrap (pure CSS → cheap). */
export default function FloatingHearts({
  count = 9,
  className = "",
  sparkles = true,
}: {
  count?: number;
  className?: string;
  sparkles?: boolean;
}) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + 0.4;
        const rx = 46 + ((i * 17) % 14);
        const ry = 44 + ((i * 29) % 12);
        return {
          left: 50 + Math.cos(a) * rx,
          top: 48 + Math.sin(a) * ry,
          size: 14 + ((i * 11) % 24),
          d: 5 + ((i * 7) % 5),
          delay: -((i * 13) % 7),
          dx: ((i * 9) % 20) - 10,
          color: ["#ff4d94", "#ff8fb8", "#ffc2d9", "#ff6aa8"][i % 4],
          op: 0.55 + ((i * 7) % 4) * 0.12,
          sparkle: sparkles && i % 3 === 2,
        };
      }),
    [count, sparkles],
  );
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      {items.map((it, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="float absolute"
          style={
            {
              left: `${it.left}%`,
              top: `${it.top}%`,
              width: it.size,
              height: it.size,
              opacity: it.op,
              color: it.sparkle ? "#fff" : it.color,
              "--d": `${it.d}s`,
              "--delay": `${it.delay}s`,
              "--dx": `${it.dx}px`,
              filter: it.sparkle ? "drop-shadow(0 0 6px #ff8fb8)" : "drop-shadow(0 4px 8px rgba(255,77,148,.35))",
            } as React.CSSProperties
          }
        >
          <path d={it.sparkle ? SPARKLE_PATH : HEART_PATH} fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
