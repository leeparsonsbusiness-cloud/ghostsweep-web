"use client";

import React from "react";
import { Chrome, ShieldCheck, Download, Check, Sparkles, ArrowRight, Lock, Clock, Zap } from "lucide-react";

interface ExtensionSpotlightProps {
  onOpenCheckout: () => void;
}

export const ExtensionSpotlight: React.FC<ExtensionSpotlightProps> = ({ onOpenCheckout }) => {
  const browserList = [
    { name: "Google Chrome", version: "Manifest V3", ready: true },
    { name: "Brave Browser", version: "Native Shield", ready: true },
    { name: "Microsoft Edge", version: "Chromium Engine", ready: true },
    { name: "Arc / Opera", version: "Full Support", ready: true },
  ];

  const highlights = [
    "Injects safe clean buttons directly onto Instagram following lists",
    "Executes staggered 10-account batches with human jitter delays (12–25s)",
    "75-minute automated rest cycles for heavy cleanings (200+ accounts/day)",
    "100% client-side execution — zero login passwords or tokens required",
  ];

  return (
    <section className="py-20 bg-background border-b border-border relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[400px] bg-accent-sky/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text & Benefits (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-sky/10 border border-accent-sky/30 text-accent-sky text-xs font-semibold uppercase tracking-wider">
              <Chrome className="w-3.5 h-3.5" />
              Companion Browser Extension
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              GhostSweep for Chrome, Brave & Edge
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Why pay \$30/month for cloud bots that put your Instagram account at risk of shadowbans? 
              GhostSweep installs in 30 seconds, runs directly inside your active browser session, and cleans your profile in the background safely.
            </p>

            <div className="space-y-3 pt-2">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                  <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* CTA + Instant Download */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onOpenCheckout}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-accent-sky to-cyan-300 hover:from-cyan-300 hover:to-accent-sky transition-all shadow-glow-sky hover:scale-105"
              >
                <Chrome className="w-4 h-4 text-slate-950" />
                <span>Get Lifetime Extension — $1.99</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="/api/download-extension?licenseKey=GSWEEP-DEMO-VIP8-2026"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-xs font-semibold text-slate-300 bg-surface hover:bg-card border border-border transition-colors"
              >
                <Download className="w-4 h-4 text-accent-sky" />
                <span>Download Extension Package (.zip)</span>
              </a>
            </div>
          </div>

          {/* Right Browser Compatibility & Visual Box (6 cols) */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl p-6 sm:p-8 bg-card border border-border shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-accent-sky/10 text-accent-sky">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Browser Compatibility</h4>
                    <p className="text-[11px] text-slate-400">Tested & verified on all Chromium platforms</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  100% Passed
                </span>
              </div>

              {/* Browser List Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {browserList.map((b) => (
                  <div key={b.name} className="p-3.5 rounded-xl bg-surface/70 border border-border">
                    <div className="text-xs font-bold text-white">{b.name}</div>
                    <div className="text-[10px] text-accent-sky font-medium mt-0.5">{b.version}</div>
                  </div>
                ))}
              </div>

              {/* Safety Specs */}
              <div className="p-4 rounded-2xl bg-surface/40 border border-border/80 text-xs text-slate-400 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Local Storage Footprint</span>
                  <strong className="text-white font-mono">&lt; 1.2 MB</strong>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Permissions Requested</span>
                  <strong className="text-white font-mono">activeTab only</strong>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Server Telemetry</span>
                  <strong className="text-emerald-400 font-mono">Zero (0) bytes</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
