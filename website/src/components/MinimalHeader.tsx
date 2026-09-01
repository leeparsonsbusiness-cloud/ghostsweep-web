"use client";

import React from "react";
import Image from "next/image";
import { Sun, Moon, User, Lock, Sparkles } from "lucide-react";

interface MinimalHeaderProps {
  onOpenCheckout?: () => void;
  onOpenAuth?: () => void;
  userEmail?: string | null;
  unlockedCount?: number;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const MinimalHeader: React.FC<MinimalHeaderProps> = ({
  onOpenCheckout,
  onOpenAuth,
  userEmail,
  unlockedCount = 0,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Simple ghostsweep wordmark with logo */}
        <a href="/" className="flex items-center gap-2 group focus:outline-none">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="GhostSweep Logo"
              width={28}
              height={28}
              className="object-contain transition-transform group-hover:scale-110"
              priority
            />
          </div>
          <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
            ghostsweep<span className="text-sky-500 font-black text-sm">.info</span>
          </span>
        </a>

        {/* Right: Theme toggle & Sign In / My Audits link */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Subtle Sign In / My Audits Member Button */}
          <button
            id="navbar-auth-btn"
            onClick={onOpenAuth}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <User className="w-3.5 h-3.5 text-sky-500" />
            {userEmail ? (
              <span className="truncate max-w-[120px]">{userEmail}</span>
            ) : (
              <span>Sign In / My Audits</span>
            )}
            {unlockedCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-bold border border-sky-300 dark:border-sky-800">
                {unlockedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
