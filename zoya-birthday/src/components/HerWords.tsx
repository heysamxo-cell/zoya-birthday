"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Section from "./ui/Section";
import ZoyaAvatar from "./ZoyaAvatar";
import { IconHeart } from "./Icons";
import { HANDLE, PORTRAIT, PROFILE_URL, TWEETS, Tweet } from "@/lib/tweets";
import { useAvatar } from "./AvatarProvider";

const Repost = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 3l4 4-4 4M3 11V9a2 2 0 012-2h16M7 21l-4-4 4-4M21 13v2a2 2 0 01-2 2H3" />
  </svg>
);
const Eye = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.600-7 10-7 10 7 10 7-3.600 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

function Byline() {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-rose to-hot text-lg font-extrabold text-white shadow-md ring-2 ring-white">
        Z
      </span>
      <div className="leading-tight">
        <p className="font-bold text-deep">Zoya 🕊️</p>
        <p className="text-sm font-semibold text-deep/60">{HANDLE}</p>
      </div>
    </div>
  );
}

function Stats({ t }: { t: Tweet }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-white/70 pt-3 text-sm font-semibold text-deep/75">
      <span className="inline-flex items-center gap-1.5 text-hot"><IconHeart className="h-4 w-4" />{t.likes}</span>
      {t.reposts && <span className="inline-flex items-center gap-1.5"><Repost />{t.reposts}</span>}
      {t.views && <span className="inline-flex items-center gap-1.5"><Eye />{t.views}</span>}
      <span className="ml-auto text-xs font-bold uppercase tracking-wider text-deep/55">{t.date}</span>
    </div>
  );
}

function TweetCard({ t, i, featured = false }: { t: Tweet; i: number; featured?: boolean }) {
  const [shown, setShown] = useState(!t.note);
  const { react } = useAvatar();
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ type: "spring", stiffness: 90, damping: 16, delay: (i % 2) * 0.1 }}
      whileHover={{ y: -4 }}
     
      className={`glass glow-ring relative break-inside-avoid overflow-hidden rounded-[1.8rem] p-5 sm:p-7 ${featured ? "sm:p-10" : ""}`}
    >
      <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-6 select-none text-[8rem] leading-none text-hot/10" style={{ fontFamily: "var(--font-display)" }}>
        ”
      </span>
      <Byline />
      <div className="relative mt-5">
        <p
          className={`whitespace-pre-line text-balance leading-snug text-deep transition-[filter] duration-500 ${featured ? "text-3xl sm:text-5xl" : "text-xl sm:text-2xl"} ${shown ? "" : "select-none blur-md"}`}
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
          aria-hidden={!shown}
        >
          {t.text}
        </p>
        {!shown && (
          <button
            type="button"
            onClick={() => {
              setShown(true);
              react("shy", 1800, "That one’s heavy 💗");
            }}
            className="absolute inset-0 grid place-items-center text-center"
          >
            <span className="btn-soft !min-h-0 !px-4 !py-2 !text-sm">Content note: {t.note} — tap to read</span>
          </button>
        )}
      </div>
      {t.context && <p className="mt-3 text-sm italic" style={{ color: "var(--fg-soft)" }}>{t.context}</p>}
      <Stats t={t} />
    </motion.article>
  );
}

export default function HerWords() {
  const [first, ...rest] = TWEETS;
  const { react } = useAvatar();
  return (
    <Section id="batein" eyebrow={PORTRAIT.eyebrow} title="Zoya Ki Batein 🕊️" subtitle="Her words, her voice — the posts the whole internet stopped to read.">
      {/* portrait */}
      <div className="glass glow-ring mx-auto grid max-w-5xl items-center gap-8 rounded-[2.2rem] p-6 sm:p-10 md:grid-cols-[minmax(0,15rem)_1fr]">
        <div className="mx-auto w-40 sm:w-52 md:w-full">
          <ZoyaAvatar className="w-full" />
        </div>
        <div>
          <h3 className="text-3xl font-bold text-deep sm:text-4xl">{PORTRAIT.title}</h3>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-deep/90 sm:text-lg">
            {PORTRAIT.paragraphs.map((p, i) => (
              <motion.p key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }} transition={{ duration: 0.7, delay: i * 0.05 }}>
                {p}
              </motion.p>
            ))}
          </div>
          <dl className="mt-7 grid grid-cols-3 gap-3 text-center">
            {PORTRAIT.stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/60 px-2 py-3 ring-1 ring-white/80">
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-2xl font-extrabold text-hot sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>{s.value}</dd>
                <dd className="mt-0.5 text-[0.7rem] font-semibold leading-tight text-deep/70 sm:text-sm">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* most-loved posts */}
      <h3 className="mx-auto mb-8 mt-20 text-center text-4xl text-hot sm:text-5xl" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>
        Her most-loved posts
      </h3>
      <div className="mx-auto max-w-5xl">
        <TweetCard t={first} i={0} featured />
        <div className="mt-6 columns-1 gap-6 md:columns-2 [&>*]:mb-6">
          {rest.map((t, i) => (
            <TweetCard key={t.id} t={t} i={i + 1} />
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        <a href={PROFILE_URL} target="_blank" rel="noopener noreferrer" className="btn-glow !px-9 !text-lg">
          Read more of her on X →
        </a>
        <p className="max-w-xl text-xs font-medium" style={{ color: "var(--fg-soft)" }}>
          Posts by {HANDLE}, quoted with credit. Counts are approximate (October 2026) and may have changed.
        </p>
      </div>
    </Section>
  );
}
