# Zoya's Birthday World 💗

An interactive, romantic birthday website — Next.js 14 · React 18 · TypeScript · Tailwind CSS · Framer Motion.
Zoya is an illustrated, fully animated SVG avatar (no image files needed).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
# production:
npm run build && npm start
```

Needs Node 18.17+ (tested on Node 22).

## Make it hers — 3 files

| What | Where |
| --- | --- |
| **Her birthday date** (countdown), your name on the letter, optional own song | `src/lib/config.ts` |
| **All the words**: little-thing cards, surprise boxes, "why she's special", the secret letter, wheel messages, photo captions | `src/lib/content.ts` |
| **Memories with you** (chat, messages, tweets, reels, voice notes) | `MEMORIES_WITH_YOU` in `content.ts` |
| **Her tweets & portrait** | `src/lib/tweets.ts` · her photo/banner: `public/photos/zoya.jpg`, `zoya-banner.jpg` |

> 🎂 The birthday is set to **November 21** (`birthday` in `config.ts`).

### Own music
The built-in music is a generated, royalty-free "dreamy music box" (Web Audio, no files). To use a real song,
put an mp3 in `public/audio/` and set `musicSrc: "/audio/our-song.mp3"` in `config.ts`.
Music never autoplays — she taps the 🎵 button; the choice is remembered for the session.

## Zoya Ki Batein (her tweets)
`src/lib/tweets.ts` holds her portrait text and the posts shown in the "Her Words" section (`HerWords.tsx`).
Add a post by copying one object in `TWEETS`; posts with a `note` sit behind a tap-to-read content note.

## Test links
- `/?preview=birthday` → shows the "It's Zoya's Birthday!" celebration
- `/?date=2026-10-08` → pretend her birthday is that date

## Structure
```
src/
  app/                 layout, page, global styles
  lib/                 config.ts, content.ts, music engine, helpers
  components/
    ZoyaAvatar.tsx     animated avatar + mood system (idle/happy/shy/excited/surprised/love/celebrate)
    AvatarProvider.tsx shared mood + "night" scene state (useAvatar().react("happy"))
    Landing, BirthdayHero, Countdown, BirthdayCake, MemoryCards, SurpriseBoxes,
    WhyTimeline, Games (HeartGame, MemoryGame, SpinWheel), SecretMessage,
    MemoriesWithYou, FinalSurprise, Navigation, MusicPlayer, CursorFX,
    ParticleBackground, FloatingHearts, FxLayer (confetti/hearts/petals canvas)
```

## Performance & accessibility
Canvas particles with pre-rendered sprites, GPU transforms, lazy images, fewer particles on phones/low-end
devices, `prefers-reduced-motion` respected (static background, no bounce/typing animation), keyboard-friendly
modals, custom cursor only on desktop mice.
