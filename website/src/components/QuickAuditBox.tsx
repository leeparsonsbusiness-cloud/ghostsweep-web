"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";

export function QuickAuditBox({ suggestedUsername = "theleeparsons" }: { suggestedUsername?: string }) {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim().replace(/^@/, "");
    if (!clean) return;
    router.push(`/?target=${encodeURIComponent(clean)}`);
  };

  return (
    <div className="my-8 bg-gradient-to-br from-slate-900 via-slate-900/90 to-sky-950/40 border border-sky-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
        <Sparkles className="w-4 h-4" />
        Live Forensic Scanner
      </div>

      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
        Audit Anyone's Recent Follows Right Now
      </h3>
      <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-xl">
        Enter any public Instagram username to inspect their latest followings in chronological order. 100% anonymous — no Instagram login required.
      </p>

      <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">@</span>
          <input
            type="text"
            placeholder={suggestedUsername}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full pl-9 pr-4 py-3.5 bg-slate-950/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>

        <button
          type="submit"
          className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 shrink-0 active:scale-95"
        >
          <Search className="w-4 h-4" />
          <span>Run Live Audit</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero Instagram Login</span>
        </div>
        <span>•</span>
        <div>100% Anonymous</div>
        <span>•</span>
        <div>Chronological Diffing</div>
      </div>
    </div>
  );
}
