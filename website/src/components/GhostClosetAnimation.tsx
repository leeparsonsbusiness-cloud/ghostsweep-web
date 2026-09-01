"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Smartphone, Radio, CheckCircle2, Search, User, ShieldAlert } from "lucide-react";

interface GhostPhoneScanAnimationProps {
  onAnimationComplete?: () => void;
}

interface HolographicProfile {
  id: number;
  handle: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  gender: "female" | "male";
  timeAgo: string;
  delay: number;
  xOffset: number;
  yOffset: number;
  rotation: number;
}

const HOLOGRAPHIC_PROFILES: HolographicProfile[] = [
  {
    id: 1,
    handle: "@sophia.la",
    name: "Sophia Miller",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    isVerified: true,
    gender: "female",
    timeAgo: "~2h ago",
    delay: 1.1,
    xOffset: -85,
    yOffset: -65,
    rotation: -8,
  },
  {
    id: 2,
    handle: "@dan_fit",
    name: "Dan Thorne",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    isVerified: false,
    gender: "male",
    timeAgo: "~4h ago",
    delay: 1.6,
    xOffset: 85,
    yOffset: -75,
    rotation: 7,
  },
  {
    id: 3,
    handle: "@chloe.vibe",
    name: "Chloe Bennett",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    isVerified: true,
    gender: "female",
    timeAgo: "~6h ago",
    delay: 2.2,
    xOffset: -50,
    yOffset: -115,
    rotation: -4,
  },
  {
    id: 4,
    handle: "@lucas_film",
    name: "Lucas Vance",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    isVerified: false,
    gender: "male",
    timeAgo: "~8h ago",
    delay: 2.8,
    xOffset: 55,
    yOffset: -120,
    rotation: 5,
  },
  {
    id: 5,
    handle: "@isabella_art",
    name: "Isabella Rossi",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
    isVerified: true,
    gender: "female",
    timeAgo: "~12h ago",
    delay: 3.4,
    xOffset: 0,
    yOffset: -145,
    rotation: 0,
  },
];

export const GhostClosetAnimation: React.FC<GhostPhoneScanAnimationProps> = ({
  onAnimationComplete,
}) => {
  // Animation Phases: "opening" (0-1.2s) -> "scanning" (1.2-5.5s) -> "complete" (5.5-6.5s) -> "still" (6.5s+)
  const [phase, setPhase] = useState<"opening" | "scanning" | "complete" | "still">("opening");
  const [key, setKey] = useState(0);
  const [scannedCount, setScannedCount] = useState(0);

  useEffect(() => {
    setPhase("opening");
    setScannedCount(0);

    const timers: NodeJS.Timeout[] = [];

    // Phase 1 -> Scanning at 1.1s
    timers.push(
      setTimeout(() => {
        setPhase("scanning");
      }, 1100)
    );

    // Incremental profile counter during scan
    HOLOGRAPHIC_PROFILES.forEach((p, idx) => {
      timers.push(
        setTimeout(() => {
          setScannedCount(idx + 1);
        }, Math.floor(p.delay * 1000) + 400)
      );
    });

    // Phase 2 -> Complete / Converge at 5.5s
    timers.push(
      setTimeout(() => {
        setPhase("complete");
      }, 5500)
    );

    // Phase 3 -> Go Still at 6.8s (within 5-8 second range)
    timers.push(
      setTimeout(() => {
        setPhase("still");
        if (onAnimationComplete) onAnimationComplete();
      }, 6800)
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [key]);

  const handleReplay = () => {
    setKey((prev) => prev + 1);
  };

  const isScanning = phase === "scanning" || phase === "opening";

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-xl mx-auto select-none pt-4 pb-2 overflow-visible">
      {/* 3D Holographic Stage */}
      <div 
        className="relative w-80 sm:w-96 h-48 sm:h-52 flex items-center justify-center"
        style={{ perspective: "1000px" }}
      >
        {/* Holographic Projection Beam (Projects upwards from the phone screen) */}
        {phase === "scanning" && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ transformOrigin: "bottom center" }}
            className="absolute bottom-6 w-72 h-44 pointer-events-none z-15 overflow-hidden flex flex-col items-center justify-end"
          >
            {/* Conic Hologram Light Cone */}
            <div 
              className="w-full h-full bg-gradient-to-t from-cyan-400/35 via-sky-500/15 to-transparent blur-[1px]"
              style={{
                clipPath: "polygon(35% 100%, 65% 100%, 100% 0%, 0% 0%)",
              }}
            />

            {/* Glowing Laser Scanline Sweeping Vertically */}
            <motion.div
              animate={{
                y: [120, -20, 120],
                opacity: [0.3, 0.9, 0.3],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.8,
                ease: "easeInOut",
              }}
              className="absolute w-64 h-0.5 bg-cyan-300 shadow-[0_0_12px_#38bdf8] rounded-full"
            />
          </motion.div>
        )}

        {/* Floating Holographic Instagram Profiles */}
        <AnimatePresence>
          {phase === "scanning" &&
            HOLOGRAPHIC_PROFILES.map((profile) => (
              <motion.div
                key={profile.id}
                initial={{
                  opacity: 0,
                  scale: 0.2,
                  x: 0,
                  y: 10,
                  rotateX: 30,
                  rotateZ: 0,
                }}
                animate={{
                  opacity: [0, 0.95, 0.9, 0.95],
                  scale: [0.2, 1, 0.98, 1],
                  x: profile.xOffset,
                  y: profile.yOffset,
                  rotateX: [20, 0, 5, 0],
                  rotateZ: profile.rotation,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.1,
                  y: 15,
                  transition: { duration: 0.4 },
                }}
                transition={{
                  delay: profile.delay - 1.0,
                  duration: 0.8,
                  ease: "easeOut",
                }}
                className="absolute z-30 pointer-events-none flex items-center gap-1.5 p-1.5 pr-2.5 rounded-xl bg-zinc-950/85 dark:bg-zinc-900/90 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.35)] backdrop-blur-md"
              >
                {/* Instagram Gradient Ring Avatar */}
                <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-sm shrink-0">
                  <img
                    src={profile.avatar}
                    alt={profile.handle}
                    className="w-6 h-6 rounded-full object-cover border border-zinc-900"
                  />
                  {profile.isVerified && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-sky-500 text-white rounded-full flex items-center justify-center text-[7px] font-black">
                      ✓
                    </span>
                  )}
                </div>

                {/* Profile Details */}
                <div className="text-left leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-white font-mono truncate max-w-[80px]">
                      {profile.handle}
                    </span>
                    <span className={`text-[8px] px-1 py-0.2 rounded font-bold ${
                      profile.gender === "female" 
                        ? "bg-pink-500/20 text-pink-300 border border-pink-500/40" 
                        : "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    }`}>
                      {profile.gender === "female" ? "👩" : "👨"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] text-cyan-300/80 font-mono">
                    <span>{profile.timeAgo}</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-emerald-400">Scanned</span>
                  </div>
                </div>

                {/* Hologram Pulse Indicator */}
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0 ml-0.5" />
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Ghost Mascot Container */}
        <motion.div
          animate={
            phase === "opening"
              ? { y: [0, -6, 0], scale: 1.02 }
              : phase === "scanning"
              ? {
                  y: [-3, 3, -3],
                  rotate: [-1.5, 1.5, -1.5],
                  transition: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
                }
              : phase === "complete"
              ? { y: [0, -8, 0], scale: 1.05 }
              : { y: 0, scale: 1, rotate: 0 } // Still State
          }
          onClick={handleReplay}
          className="relative z-20 cursor-pointer group flex flex-col items-center"
          title="Click to replay holographic scan"
        >
          {/* Cute Ghost Mascot */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_10px_20px_rgba(56,189,248,0.25)]">
            <Image
              src="/logo.png"
              alt="GhostSweep Ghost Mascot"
              width={96}
              height={96}
              className="object-contain transition-transform group-hover:scale-105"
              priority
            />

            {/* Sparkle Glint during scanning */}
            {phase === "scanning" && (
              <motion.div
                animate={{ rotate: 360, scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="absolute -top-1 -right-1 text-cyan-400 pointer-events-none"
              >
                <Sparkles className="w-5 h-5 fill-cyan-300 drop-shadow" />
              </motion.div>
            )}
          </div>

          {/* Futuristic Smartphone Held by Ghost */}
          <motion.div
            initial={{ rotateX: 65, y: -10, scale: 0.85 }}
            animate={
              phase === "opening"
                ? { rotateX: [65, 35], y: [-10, -4], scale: 1 }
                : phase === "scanning"
                ? {
                    rotateX: 25,
                    y: -2,
                    boxShadow: "0 0 25px rgba(6,182,212,0.6)",
                    scale: 1,
                  }
                : phase === "complete"
                ? { rotateX: 45, y: -4, scale: 0.95 }
                : { rotateX: 30, y: -2, scale: 1 } // Still Image
            }
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative -mt-3.5 w-28 sm:w-32 h-14 sm:h-16 rounded-xl bg-zinc-950 border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex flex-col items-center justify-between p-1 overflow-hidden"
          >
            {/* Phone Screen Notch / Dynamic Island */}
            <div className="w-8 h-1.5 rounded-full bg-zinc-800 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-sky-500" />
            </div>

            {/* Holographic Radar / Instagram Screen Grid */}
            <div className="relative w-full flex-1 rounded-lg bg-gradient-to-b from-zinc-900 via-sky-950/60 to-zinc-950 border border-cyan-500/30 flex items-center justify-center overflow-hidden">
              {/* Radar Sweep Arc */}
              {phase === "scanning" ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute w-24 h-24 rounded-full border border-cyan-400/40"
                  style={{
                    background: "conic-gradient(from 0deg, transparent 0deg, rgba(6,182,212,0.4) 60deg, transparent 90deg)",
                  }}
                />
              ) : (
                <div className="flex items-center gap-1 text-[8px] font-bold text-cyan-400/80 font-mono">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  <span>READY</span>
                </div>
              )}

              {/* Instagram Logo / Telemetry */}
              <div className="relative z-10 flex items-center gap-1 text-[8px] font-mono text-cyan-300 font-bold">
                {phase === "scanning" ? (
                  <span className="animate-pulse">SCANNING IG...</span>
                ) : phase === "complete" ? (
                  <span className="text-emerald-400">LOCKED</span>
                ) : (
                  <span>STANDBY</span>
                )}
              </div>
            </div>

            {/* Bottom Home Indicator */}
            <div className="w-6 h-0.5 rounded-full bg-zinc-600" />
          </motion.div>
        </motion.div>
      </div>

      {/* Status Pill / Replay Control */}
      <div className="h-6 flex items-center justify-center mt-1">
        {phase !== "still" ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-950/60 border border-cyan-400/40 text-[10px] font-bold text-cyan-600 dark:text-cyan-300 shadow-xs">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>
              {phase === "opening"
                ? "Booting forensic radar..."
                : phase === "scanning"
                ? `Holographic Instagram scan active (${scannedCount}/5)...`
                : "Target activity locked & verified!"}
            </span>
          </div>
        ) : (
          <button
            onClick={handleReplay}
            className="group inline-flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-cyan-400 dark:text-zinc-500 dark:hover:text-cyan-300 transition-colors focus:outline-none"
          >
            <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
            <span>Replay Holographic Scan</span>
          </button>
        )}
      </div>
    </div>
  );
};
