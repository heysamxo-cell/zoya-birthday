"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { AvatarProvider } from "./AvatarProvider";
import { FxProvider } from "./FxLayer";
import ParticleBackground from "./ParticleBackground";
import CursorFX from "./CursorFX";
import MusicPlayer from "./MusicPlayer";
import Landing from "./Landing";
import Navigation from "./Navigation";
import BirthdayHero from "./BirthdayHero";
import { lockScroll, unlockScroll } from "@/lib/scroll";

import Countdown from "./Countdown";
import BirthdayCake from "./BirthdayCake";
import MemoryCards from "./MemoryCards";
import SurpriseBoxes from "./SurpriseBoxes";
import WhyTimeline from "./WhyTimeline";
import Games from "./Games";
import SecretMessage from "./SecretMessage";
import PhotoGallery from "./PhotoGallery";
import HerWords from "./HerWords";
import FinalSurprise from "./FinalSurprise";

export default function BirthdayApp() {
  const [phase, setPhase] = useState<"landing" | "world">("landing");
  const [showWorld, setShowWorld] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (phase !== "landing") return;
    lockScroll();
    return () => unlockScroll();
  }, [phase]);

  const enter = useCallback(() => {
    setPhase("world");
    timers.current.push(
      setTimeout(() => {
        setShowWorld(true);
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      }, 500),
    );
  }, []);

  const replay = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    timers.current.push(
      setTimeout(() => {
        setPhase("landing");
        timers.current.push(
          setTimeout(() => {
            setShowWorld(false);
            setRunKey((k) => k + 1);
          }, 1200),
        );
      }, 1100),
    );
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <AvatarProvider>
        <FxProvider>
          <ParticleBackground />
          <CursorFX />
          <MusicPlayer />

          <AnimatePresence>{phase === "landing" && <Landing key={`landing-${runKey}`} onEnter={enter} />}</AnimatePresence>

          {showWorld && (
            <motion.main
              key={runKey}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative z-10"
            >
              <Navigation />
              <BirthdayHero />
              <Countdown />
              <BirthdayCake />
              <MemoryCards />
              <SurpriseBoxes />
              <WhyTimeline />
              <Games />
              <SecretMessage />
              <PhotoGallery />
              <HerWords />
              <FinalSurprise onReplay={replay} />
            </motion.main>
          )}
        </FxProvider>
      </AvatarProvider>
    </MotionConfig>
  );
}
