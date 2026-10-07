"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { music } from "@/lib/music";
import { IconNote } from "./Icons";

const KEY = "zoya-music";

/** Floating 🎵 button. Never autoplays; remembers on/off for the session. */
export default function MusicPlayer() {
  const [on, setOn] = useState(false);
  const [hint, setHint] = useState(true);

  // if she turned music on earlier this session (e.g. before a refresh), resume on the first tap
  useEffect(() => {
    let pref: string | null = null;
    try {
      pref = sessionStorage.getItem(KEY);
    } catch {}
    if (pref === "on") {
      const resume = async () => {
        window.removeEventListener("pointerdown", resume);
        await music.start();
        setOn(music.playing);
      };
      window.addEventListener("pointerdown", resume, { once: true });
      return () => window.removeEventListener("pointerdown", resume);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHint(false), 9000);
    return () => clearTimeout(t);
  }, []);

  const toggle = async () => {
    setHint(false);
    if (music.playing) {
      music.stop();
      setOn(false);
      try { sessionStorage.setItem(KEY, "off"); } catch {}
    } else {
      await music.start();
      setOn(music.playing);
      try { sessionStorage.setItem(KEY, "on"); } catch {}
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[88] flex items-center gap-3 sm:bottom-6 sm:right-6">
      {hint && !on && (
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2.5 }}
          className="glass hidden rounded-full px-4 py-2 text-sm font-semibold text-deep sm:block"
        >
          Tap for dreamy music
        </motion.span>
      )}
      <motion.button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        aria-label={on ? "Pause background music" : "Play background music"}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="glass glow-ring relative grid h-14 w-14 place-items-center rounded-full text-hot"
        style={on ? { animation: "pulse-glow 2.4s ease-in-out infinite" } : undefined}
      >
        {on ? (
          <span className="flex h-5 items-end gap-[3px]" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="w-[3px] origin-bottom rounded-full bg-hot"
                style={{ height: "100%", animation: `eq ${0.7 + i * 0.13}s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </span>
        ) : (
          <IconNote className="h-6 w-6" />
        )}
        {!on && <span className="absolute h-[2px] w-8 rotate-[-40deg] rounded-full bg-hot/70" aria-hidden="true" />}
      </motion.button>
    </div>
  );
}
