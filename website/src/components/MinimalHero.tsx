"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, ArrowRight, Clipboard, Check, Info, Shield, Users, Ghost, UserX } from "lucide-react";
import { AuditResult } from "@/app/api/audit/route";
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
      {/* 1. Tagline Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/60 mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
        <span>Anonymous • Free • Instant</span>
      </div>

      {/* 2. Ghost Mascot with Closet Door & Tossing Animation */}
      <div className="flex flex-col items-center justify-center mb-2">
        <GhostClosetAnimation />
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white lowercase mt-1">
          ghost<span className="text-sky-500">sweep</span>
        </h1>
      </div>

      {/* 3. Subtitle (1 line, muted gray) */}
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed mb-7">
        Instagram profile auditor — inspect follower ratios, reach penalties, and inactive accounts without logging in.
      </p>

      {/* 4. Search Bar (Clean, wide, focused) */}
      <div className="max-w-2xl mx-auto mb-5">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700/80 rounded-xl p-1.5 shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600 focus-within:border-sky-500 dark:focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all"
        >
          <div className="pl-3 pr-2 text-zinc-400 dark:text-zinc-500">
            <Search className="w-4 h-4" />
          </div>

          <input
            id="search-input"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="@username or profile link"
            className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-xs sm:text-sm font-medium focus:outline-none py-2"
          />

          {/* Quick Paste Button */}
          <button
            type="button"
            onClick={handlePaste}
            title="Paste from clipboard"
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mr-1 shrink-0"
          >
            {pasted ? <Check className="w-4 h-4 text-emerald-500" /> : <Clipboard className="w-4 h-4" />}
          </button>

          {/* High-Contrast Action Button */}
          <button
            id="audit-submit-btn"
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-zinc-900 hover:bg-black dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-zinc-950 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shrink-0"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Auditing...</span>
              </span>
            ) : (
              <>
                <span>AUDIT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Example Tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-400 dark:text-zinc-500 font-medium">Try:</span>
          {sampleTags.map((t) => (
            <button
              key={t.val}
              type="button"
              onClick={() => {
                setInputVal(t.val);
                onAuditSubmit(t.val);
              }}
              className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Sub-Tabs below Search (Updated to the 3 required tabs) */}
      <div className="flex items-center justify-center gap-1.5 max-w-lg mx-auto p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl mb-4 text-xs font-bold shadow-xs">
        <button
          type="button"
          id="tab-non-reciprocals"
          onClick={() => onTabChange("non-reciprocals")}
          className={`flex-1 py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "non-reciprocals"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-extrabold"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <span>🚫 Non-Reciprocals</span>
        </button>

        <button
          type="button"
          id="tab-demographics"
          onClick={() => onTabChange("demographics")}
          className={`flex-1 py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "demographics"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-extrabold"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <span>👥 Demographics (M/F)</span>
        </button>

        <button
          type="button"
          id="tab-ghosts"
          onClick={() => onTabChange("ghosts")}
          className={`flex-1 py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "ghosts"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-extrabold"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <span>🤖 Ghost &amp; Bots</span>
        </button>
      </div>
    </section>
  );
};
