"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Section from "./ui/Section";
import Modal from "./ui/Modal";
import { GALLERY } from "@/lib/content";
import { HEART_PATH } from "./Icons";
import { useAvatar } from "./AvatarProvider";

const TINTS = [
  "linear-gradient(135deg,#ffd9e8,#ffa6c9)",
  "linear-gradient(135deg,#ffe9f2,#e9c8ff)",
  "linear-gradient(135deg,#ffc2d9,#ff8fb8)",
  "linear-gradient(135deg,#fff0f6,#ffc2d9)",
  "linear-gradient(135deg,#f6d8ff,#ffa6c9)",
  "linear-gradient(135deg,#ffd0e3,#ffb3d1)",
];

function Photo({ i, sizes, priority = false }: { i: number; sizes: string; priority?: boolean }) {
  const g = GALLERY[i];
  if (g.src) {
    const remote = /^https?:/.test(g.src);
    return (
      <Image src={g.src} alt={g.alt} fill sizes={sizes} unoptimized={remote} priority={priority} loading={priority ? undefined : "lazy"} className="object-cover" />
    );
  }
  return (
    <div className="absolute inset-0 grid place-items-center" style={{ background: TINTS[i % TINTS.length] }} role="img" aria-label={`${g.alt} (placeholder)`}>
      <div className="flex flex-col items-center gap-2 text-white/90">
        <svg viewBox="0 0 24 24" className="h-12 w-12 drop-shadow-lg" fill="currentColor"><path d={HEART_PATH} /></svg>
        <span className="rounded-full bg-white/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white backdrop-blur">your photo here</span>
      </div>
    </div>
  );
}

export default function PhotoGallery() {
  const [open, setOpen] = useState<number | null>(null);
  const { react } = useAvatar();
  const tilts = [-2.5, 1.8, -1.2, 2.4, -2, 1.4];

  return (
    <Section id="gallery" eyebrow="moments worth keeping" title="Our Little Memories 📸" subtitle="Every picture is a tiny piece of a very big happy story.">
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
        {GALLERY.map((g, i) => (
          <motion.figure
            key={i}
            initial={{ opacity: 0, y: 50, rotate: tilts[i % 6] * 2 }}
            whileInView={{ opacity: 1, y: 0, rotate: tilts[i % 6] }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ type: "spring", stiffness: 90, damping: 15, delay: (i % 3) * 0.1 }}
            whileHover={{ rotate: 0, y: -8, scale: 1.02 }}
            className="group break-inside-avoid"
          >
            <button
              type="button"
              onClick={() => {
                setOpen(i);
                react("happy", 2000, "Good times 💗");
              }}
              className="glass glow-ring block w-full overflow-hidden rounded-[1.8rem] p-3 text-left transition-shadow duration-500 group-hover:shadow-[0_0_50px_rgba(255,77,148,.5)]"
              aria-label={`Open photo: ${g.caption}`}
            >
              <div className={`relative overflow-hidden rounded-[1.3rem] ${i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-square" : "aspect-[5/4]"}`}>
                <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110">
                  <Photo i={i} sizes="(max-width:640px) 90vw, (max-width:1024px) 45vw, 30vw" priority={false} />
                </div>
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#b3246a]/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
              <figcaption className="px-2 pb-1 pt-3 text-center text-lg font-semibold text-deep" style={{ fontFamily: "var(--font-script)", fontSize: "1.55rem" }}>
                {g.caption}
              </figcaption>
            </button>
          </motion.figure>
        ))}
      </div>

      <p className="mt-6 text-center text-sm font-medium" style={{ color: "var(--fg-soft)" }}>
        Replace these with your own photos: drop images in <code className="rounded bg-white/60 px-1.5 py-0.5 font-mono text-xs">/public/photos</code> and set the paths in <code className="rounded bg-white/60 px-1.5 py-0.5 font-mono text-xs">src/lib/content.ts</code>.
      </p>

      <Modal open={open !== null} onClose={() => setOpen(null)} label="Photo" wide>
        {open !== null && (
          <div>
            <div className="relative mx-auto aspect-[4/3] w-full max-h-[62vh] overflow-hidden rounded-[1.4rem]">
              <Photo i={open} sizes="90vw" priority />
            </div>
            <p className="mt-5 text-center text-3xl text-hot" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>
              {GALLERY[open].caption}
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button type="button" className="btn-soft" onClick={() => setOpen((open + GALLERY.length - 1) % GALLERY.length)}>← Previous</button>
              <button type="button" className="btn-glow !min-h-12 !px-6 !text-base" onClick={() => setOpen((open + 1) % GALLERY.length)}>Next →</button>
            </div>
          </div>
        )}
      </Modal>
    </Section>
  );
}
