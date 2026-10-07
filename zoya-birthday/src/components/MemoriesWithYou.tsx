"use client";
import { motion } from "framer-motion";
import Section from "./ui/Section";
import { CardIcons } from "./Icons";
import { MEMORIES_WITH_YOU } from "@/lib/content";
import { useAvatar } from "./AvatarProvider";
import { useFx } from "./FxLayer";

const TILE = { background: "linear-gradient(135deg,#ff8fb8,#ff3d8b)" };
const BARS = Array.from({ length: 34 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)));

function Wave() {
  return (
    <div className="flex h-16 items-center justify-center gap-[3px] sm:h-20 sm:gap-1" aria-hidden="true">
      {BARS.map((h, i) => (
        <span
          key={i}
          className="wave-bar w-[3px] rounded-full bg-gradient-to-t from-rose to-hot sm:w-1"
          style={{
            height: `${h * 100}%`,
            "--lo": 0.35 + ((i * 7) % 5) * 0.14,
            animation: `wave ${1.1 + (i % 5) * 0.14}s ease-in-out ${i * 0.04}s infinite`,
            willChange: "transform",
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export default function MemoriesWithYou() {
  const { react } = useAvatar();
  const fx = useFx();
  const small = MEMORIES_WITH_YOU.filter((m) => !m.big);
  const big = MEMORIES_WITH_YOU.find((m) => m.big)!;
  const BigIcon = CardIcons[big.icon];

  return (
    <Section id="gallery" eyebrow="moments worth keeping" title="Memories With You 💗" subtitle="No photo could hold these — they live in chats, tweets, reels and one very sweet voice.">
      <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 sm:gap-6">
        {small.map((m, i) => {
          const Icon = CardIcons[m.icon];
          return (
            <motion.button
              key={m.title}
              type="button"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ type: "spring", stiffness: 110, damping: 16, delay: (i % 2) * 0.1 }}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                react("shy", 2200, "Aww… those are my favourites too 🙈");
                fx.hearts(e.clientX, e.clientY, 7);
              }}
              className="glass glow-ring flex items-start gap-4 rounded-[1.8rem] p-5 text-left sm:p-7"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white shadow-glow sm:h-16 sm:w-16" style={TILE}>
                <Icon className="h-8 w-8 sm:h-9 sm:w-9" />
              </span>
              <span>
                <span className="block text-xl font-bold text-deep sm:text-2xl">{m.title}</span>
                <span className="mt-1 block text-[0.95rem] font-medium leading-relaxed text-deep/75 sm:text-base">{m.text}</span>
              </span>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        type="button"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-8%" }}
        transition={{ type: "spring", stiffness: 90, damping: 15 }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
          react("love", 3200, "Your voice… the sweetest in the world 💗");
          fx.hearts(e.clientX, e.clientY, 12);
        }}
        className="glass glow-ring relative mx-auto mt-6 block w-full max-w-5xl overflow-hidden rounded-[2.2rem] p-6 text-center sm:mt-8 sm:p-12"
        aria-label="The sweetest voice in the world"
      >
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl text-white shadow-glow" style={TILE}>
          <BigIcon className="h-11 w-11" />
        </span>
        <h3 className="mt-5 text-2xl font-bold text-deep sm:text-3xl">{big.title}</h3>
        <div className="my-6">
          <Wave />
        </div>
        <p className="text-balance text-3xl leading-snug text-hot sm:text-5xl" style={{ fontFamily: "var(--font-script)", fontWeight: 700 }}>
          the sweetest voice in the world
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-relaxed text-deep/80 sm:text-lg">{big.text}</p>
      </motion.button>
    </Section>
  );
}
