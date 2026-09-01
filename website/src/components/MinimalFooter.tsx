"use client";

import React from "react";

interface MinimalFooterProps {
  onOpenLegal: (type: "terms" | "privacy" | "refund" | "contact") => void;
}

export const MinimalFooter: React.FC<MinimalFooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-850 py-8 px-4 sm:px-6 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-950/50 mt-auto transition-colors">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
        {/* Links row */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-medium">
          <button
            onClick={() => onOpenLegal("terms")}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Terms of Service
          </button>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <button
            onClick={() => onOpenLegal("privacy")}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Privacy Policy
          </button>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <button
            onClick={() => onOpenLegal("refund")}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Refund Policy
          </button>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <button
            onClick={() => onOpenLegal("contact")}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            support@ghostsweep.info
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-zinc-400 dark:text-zinc-400 max-w-lg leading-normal">
          © {new Date().getFullYear()} ghostsweep.info. Independent Instagram intelligence &amp; forensic audit utility. Not affiliated with, endorsed by, or connected to Instagram, Meta, or TikTok.
        </p>
      </div>
    </footer>
  );
};
