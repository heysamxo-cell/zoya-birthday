"use client";
import { useEffect, useState } from "react";
import { SITE } from "./config";

export type BirthdayInfo = {
  ready: boolean;
  /** Target moment for the countdown (next birthday at local midnight). */
  target: Date | null;
  /** Is it her birthday right now (or ?preview=birthday)? */
  isToday: boolean;
  label: string;
};

function parseOverride(): { m: number; d: number } | null {
  const q = new URLSearchParams(window.location.search).get("date");
  if (!q) return null;
  const m = q.match(/(?:\d{4}-)?(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  return { m: Number(m[1]), d: Number(m[2]) };
}

export function computeBirthday(now = new Date()): BirthdayInfo {
  const params = new URLSearchParams(window.location.search);
  const preview = params.get("preview") === "birthday";
  const o = parseOverride();
  const month = o?.m ?? SITE.birthday.month;
  const day = o?.d ?? SITE.birthday.day;
  const isToday = preview || (now.getMonth() + 1 === month && now.getDate() === day);
  let year = now.getFullYear();
  let target = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (!isToday && target.getTime() <= now.getTime()) {
    target = new Date(year + 1, month - 1, day, 0, 0, 0, 0);
  }
  const label = new Date(2000, month - 1, day).toLocaleDateString(undefined, { month: "long", day: "numeric" });
  return { ready: true, target, isToday, label };
}

export function useBirthday(): BirthdayInfo {
  const [info, setInfo] = useState<BirthdayInfo>({ ready: false, target: null, isToday: false, label: "" });
  useEffect(() => {
    setInfo(computeBirthday());
  }, []);
  return info;
}
