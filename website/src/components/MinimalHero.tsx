"use client";

import React, { useState } from "react";
import { Search, ArrowRight, Clipboard, Check, ShieldCheck, Zap, Lock, Sparkles, UserCheck } from "lucide-react";
import { GhostClosetAnimation } from "@/components/GhostClosetAnimation";

export type AuditTabType = "non-reciprocals" | "demographics" | "ghosts";

interface MinimalHeroProps {
  onAuditSubmit: (username: string) => Promise<void>;
  isLoading: boolean;
  activeTab: AuditTabType;
  onTabChange: (tab: AuditTabType) => void;
  onOpenCheckout: () => void;
}

export const MinimalHero: React.FC<MinimalHeroProps> = ({
  onAuditSubmit,
  isLoading,
  activeTab,
  onTabChange,
  onOpenCheckout,
}) => {
  const [inputVal, setInputVal] = useState("");
  const [pasted, setPasted] = useState(false);

  const sampleTags = [
    { label: "@alex.creator", val: "alex.creator" },
    { label: "@theleeparsons", val: "theleeparsons" },
    { label: "@sophia_vibe", val: "sophia_vibe" },
    { label: "@fitness_dan", val: "fitness_dan" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onAuditSubmit(inputVal.trim());
    }
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputVal(text.trim());
          setPasted(true);
          setTimeout(() => setPasted(false), 1500);
        }
      }
    } catch {
      const inputEl = document.getElementById("search-input") as HTMLInputElement;
      if (inputEl) inputEl.focus();
    }
  };

  return (
    <section className="pt-8 pb-4 sm:pt-12 sm:pb-6 max-w-4xl mx-auto px-4 sm:px-6 text-center">
      {/* 1. Top Dating/Nightlife Forensic Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider uppercase text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 mb-5 shadow-xs">
        <span>🕵️</span>
        <span>100% ANONYMOUS • NO INSTAGRAM LOGIN REQUIRED</span>
      </div>

      {/* 2. Ghost Mascot & High-Converting Hero Headline */}
      <div className="flex flex-col items-center justify-center mb-3">
        <GhostClosetAnimation />
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mt-3 leading-tight max-w-2xl">
          Who Did They Follow <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-pink-500">Last Night?</span>
        </h1>
      </div>

      {/* 3. High-Converting Subheadline */}
      <p className="text-xs sm:text-sm md:text-base text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto leading-relaxed mb-6 font-medium">
        Audit any public Instagram profile. See who they followed at the club, recent followers, and filter immediately by Guys vs. Girls.
      </p>

      {/* 4. Search Bar */}
      <div className="max-w-2xl mx-auto mb-4">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700/80 rounded-2xl p-1.5 sm:p-2 shadow-lg hover:border-zinc-400 dark:hover:border-zinc-600 focus-within:border-sky-500 dark:focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all"
        >
          <div className="pl-3 pr-2 text-zinc-400 dark:text-zinc-500">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <input
            id="search-input"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter @username (e.g. @theleeparsons)"
            className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-xs sm:text-sm font-semibold focus:outline-none py-2"
          />

          {/* Quick Paste Button */}
          <button
            type="button"
            onClick={handlePaste}
            title="Paste from clipboard"
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mr-1 shrink-0"
          >
            {pasted ? <Check className="w-4 h-4 text-emerald-500" /> : <Clipboard className="w-4 h-4" />}
          </button>

          {/* High-Converting Search Action Button */}
          <button
            id="audit-submit-btn"
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-black text-zinc-950 bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 hover:from-cyan-300 hover:to-sky-400 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Scanning Activity...</span>
              </span>
            ) : (
              <>
                <span>Track Recent Activity</span>
                <ArrowRight className="w-4 h-4 text-zinc-950 font-bold" />
              </>
            )}
          </button>
        </form>

        {/* Quick Example Tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-400 dark:text-zinc-500 font-medium">Try Live:</span>
          {sampleTags.map((t) => (
            <button
              key={t.val}
              type="button"
              onClick={() => {
                setInputVal(t.val);
                onAuditSubmit(t.val);
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors font-mono font-medium"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Nightlife Activity Trust Strip */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-3 px-4 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 font-medium max-w-2xl mx-auto shadow-xs mb-3">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>100% Anonymous Search</span>
        </span>
        <span className="text-zinc-300 dark:text-zinc-700">•</span>
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Live Chronological Order</span>
        </span>
        <span className="text-zinc-300 dark:text-zinc-700">•</span>
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-sky-400" />
          <span>Target is Never Notified</span>
        </span>
      </div>
    </section>
  );
};
