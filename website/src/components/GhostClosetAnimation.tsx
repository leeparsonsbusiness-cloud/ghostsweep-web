"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";

interface GhostClosetAnimationProps {
  onAnimationComplete?: () => void;
}

interface TossedProfile {
  id: number;
  avatar: string;
  handle: string;
  x: number;
  y: number;
  rotate: number;
}

const MOCK_PROFILES = [
  { handle: "@bot_9912", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" },
  { handle: "@dropship_guru", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80" },
  { handle: "@inactive_2023", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
  { handle: "@fake_growth_x", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
  { handle: "@ghost_dan88", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" },
  { handle: "@spam_vibe_9", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80" },
  { handle: "@dead_profile", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" },
  { handle: "@silent_lurk", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80" },
  { handle: "@non_reciprocal", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80" },
  { handle: "@bot_cluster_5", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80" },
];

export const GhostClosetAnimation: React.FC<GhostClosetAnimationProps> = ({
  onAnimationComplete,
}) => {
  const [phase, setPhase] = useState<"opening" | "tossing" | "closing" | "idle">("opening");
  const [tossedList, setTossedList] = useState<TossedProfile[]>([]);
  const [count, setCount] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setPhase("opening");
    setTossedList([]);
    setCount(0);

    const timers: NodeJS.Timeout[] = [];

    // Phase 1: At 0.5s, switch to tossing
    timers.push(
      setTimeout(() => {
        setPhase("tossing");

        // Toss 10 items spaced every 280ms (from 0.6s to 3.4s)
        MOCK_PROFILES.forEach((p, idx) => {
          timers.push(
            setTimeout(() => {
              const isEven = idx % 2 === 0;
              const xOffset = isEven
                ? -90 - Math.random() * 90
                : 90 + Math.random() * 90;
              const yOffset = -50 - Math.random() * 80;
              const rot = (Math.random() - 0.5) * 320;

              setTossedList((prev) => [
                ...prev,
                {
                  id: idx + 1,
                  avatar: p.avatar,
                  handle: p.handle,
                  x: xOffset,
                  y: yOffset,
                  rotate: rot,
                },
              ]);
              setCount(idx + 1);
            }, idx * 280)
          );
        });
      }, 500)
    );

    // Phase 2: At 3.8s, close the door
    timers.push(
      setTimeout(() => {
        setPhase("closing");
      }, 3800)
    );

    // Phase 3: At 4.8s, become still image
    timers.push(
      setTimeout(() => {
        setPhase("idle");
        if (onAnimationComplete) onAnimationComplete();
      }, 4800)
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [key]);

  const handleReplay = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-lg mx-auto h-40 select-none overflow-visible">
      {/* 3D Stage */}
      <div className="relative w-80 h-32 flex items-center justify-center" style={{ perspective: "1000px" }}>
        {/* The Closet (Visible during opening, tossing, closing) */}
        {phase !== "idle" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -35 }}
            animate={{ opacity: 1, scale: 1, x: -35 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute z-10 w-24 h-32 rounded-t-xl bg-zinc-900 border-2 border-sky-400/60 shadow-xl overflow-visible flex items-center justify-center"
          >
            {/* Interior Shelf & Ghost Clutter */}
            <div className="absolute inset-1 rounded-t-lg bg-zinc-950 flex flex-col items-center justify-between p-1.5 overflow-hidden">
              <div className="w-full h-1 bg-zinc-800 rounded mt-2" />
              <div className="text-[8px] font-black text-sky-400/70 uppercase tracking-wider font-mono">
                CLOSET
              </div>
              <div className="w-full flex justify-around opacity-40">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
              </div>
            </div>

            {/* Swinging Door */}
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{
                rotateY: phase === "opening" || phase === "tossing" ? -115 : 0,
              }}
              transition={{
                duration: 0.55,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              style={{ transformOrigin: "left center" }}
              className="absolute inset-0 rounded-t-xl bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 border border-sky-300/40 shadow-2xl flex items-center justify-end pr-2 z-20"
            >
              {/* Golden Handle */}
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-md border border-amber-200" />
            </motion.div>
          </motion.div>
        )}

        {/* Ghost Mascot */}
        <motion.div
          animate={
            phase === "opening"
              ? { x: 5, y: -4, rotate: -6, scale: 1.05 }
              : phase === "tossing"
              ? {
                  x: [-5, 10, -8, 12],
                  y: [-2, -10, 2, -8],
                  rotate: [-8, 6, -10, 8],
                  scale: [1.02, 1.08, 1.02, 1.08],
                  transition: {
                    repeat: Infinity,
                    duration: 0.4,
                    ease: "easeInOut",
                  },
                }
              : phase === "closing"
              ? { x: 0, y: [0, -12, 0], rotate: 0, scale: 1.05 }
              : { x: 0, y: [0, -4, 0], rotate: 0, scale: 1 }
          }
          transition={{ duration: 0.4 }}
          onClick={handleReplay}
          className="relative z-30 cursor-pointer group"
          title="Click to replay animation"
        >
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 drop-shadow-xl">
            <Image
              src="/logo.png"
              alt="GhostSweep Mascot"
              width={96}
              height={96}
              className="object-contain transition-transform group-hover:scale-105"
              priority
            />

            {/* Sparkle burst during toss */}
            {phase === "tossing" && (
              <motion.div
                animate={{ rotate: 360, scale: [0.9, 1.3, 0.9] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="absolute -top-1 -right-1 text-amber-400 pointer-events-none"
              >
                <Sparkles className="w-5 h-5 fill-amber-300 drop-shadow" />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Tossed Profile Avatars */}
        <AnimatePresence>
          {tossedList.map((item) => (
            <motion.div
              key={item.id}
              initial={{
                opacity: 1,
                scale: 0.3,
                x: -30,
                y: 0,
                rotate: 0,
              }}
              animate={{
                opacity: [1, 1, 0.8, 0],
                scale: [0.3, 1.1, 0.9, 0.2],
                x: item.x,
                y: [0, item.y, item.y + 70],
                rotate: item.rotate,
              }}
              transition={{
                duration: 1.2,
                ease: "easeOut",
              }}
              className="absolute z-40 pointer-events-none flex flex-col items-center"
            >
              {/* Instagram-style circular avatar badge */}
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-lg">
                <img
                  src={item.avatar}
                  alt={item.handle}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white dark:border-zinc-900"
                />
                <span className="absolute -top-1 -right-1 text-[8px] bg-rose-600 text-white font-black rounded-full w-3.5 h-3.5 flex items-center justify-center shadow">
                  ✕
                </span>
              </div>
              <span className="mt-0.5 text-[8px] font-bold text-rose-500 dark:text-rose-400 bg-white/95 dark:bg-zinc-900/95 px-1 rounded shadow-sm border border-rose-200 dark:border-rose-800 line-clamp-1">
                {item.handle}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress pill / Replay trigger */}
      <div className="h-5 flex items-center justify-center mt-1">
        {phase !== "idle" ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800/80 text-[10px] font-bold text-sky-600 dark:text-sky-400 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
            <span>
              {phase === "opening"
                ? "Opening closet..."
                : phase === "tossing"
                ? `Sweeping inactive accounts (${count}/10)...`
                : "Closet swept & secured!"}
            </span>
          </div>
        ) : (
          <button
            onClick={handleReplay}
            className="group inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-sky-500 dark:text-zinc-500 dark:hover:text-sky-400 transition-colors focus:outline-none"
          >
            <RefreshCw className="w-2.5 h-2.5 group-hover:rotate-180 transition-transform duration-300" />
            <span>Replay Cleaning Animation</span>
          </button>
        )}
      </div>
    </div>
  );
};
