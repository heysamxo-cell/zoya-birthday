"use client";
import { useEffect, useState } from "react";

export type Env = {
  mounted: boolean;
  reduced: boolean;
  finePointer: boolean;
  lowEnd: boolean;
  mobile: boolean;
};

const initial: Env = { mounted: false, reduced: false, finePointer: false, lowEnd: false, mobile: false };

/** Device capability flags (computed on the client after mount). */
export function useEnv(): Env {
  const [env, setEnv] = useState<Env>(initial);
  useEffect(() => {
    const compute = () => {
      const nav = navigator as Navigator & { deviceMemory?: number };
      const mobile = window.innerWidth < 700;
      const lowEnd =
        (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4) ||
        (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
        mobile;
      setEnv({
        mounted: true,
        reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        finePointer: window.matchMedia("(hover: hover) and (pointer: fine)").matches,
        lowEnd,
        mobile,
      });
    };
    compute();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", compute);
    window.addEventListener("resize", compute);
    return () => {
      mq.removeEventListener("change", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);
  return env;
}
