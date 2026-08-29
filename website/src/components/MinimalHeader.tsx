"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Sun, Moon, Chrome } from "lucide-react";

interface MinimalHeaderProps {
  onOpenCheckout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const MinimalHeader: React.FC<MinimalHeaderProps> = ({
  onOpenCheckout,
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

        {/* Right: Theme toggle & Clean extension link */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            id="navbar-cta-btn"
            onClick={onOpenCheckout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Chrome className="w-3.5 h-3.5 text-sky-500" />
            <span>Chrome Extension</span>
            <span className="text-sky-600 dark:text-sky-400 font-bold ml-0.5">$1.99</span>
          </button>
        </div>
      </div>
    </header>
  );
};
