/**
 * ─────────────────────────────────────────────────────────────
 *  ZOYA'S BIRTHDAY WORLD — easy settings
 *  Everything personal lives in this file and in content.ts.
 * ─────────────────────────────────────────────────────────────
 */
export const SITE = {
  /** Her name — used everywhere. */
  name: "Zoya",

  /**
   * Her birthday (month 1–12, day 1–31).
   * The countdown always aims at the NEXT occurrence of this date.
     */
  birthday: { month: 11, day: 21 },

  /**
   * Your name, shown under the secret letter ("— Yours, ...").
   * Leave empty "" to keep the letter unsigned.
   */
  fromName: "",

  /**
   * Optional: use your own song instead of the built-in dreamy music.
   * 1. Put an mp3 in /public/audio (e.g. /public/audio/our-song.mp3)
   * 2. Set musicSrc to "/audio/our-song.mp3"
   * Leave "" to use the generated, royalty-free dreamy melody.
   */
  musicSrc: "",
};

/**
 * Handy testing links (no code changes needed):
 *   /?preview=birthday  → jump straight to the "It's Zoya's Birthday!" celebration
 *   /?date=2026-10-08   → pretend her birthday is on that date (counts down to it)
 */
