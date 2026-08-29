"use client";

import React from "react";
import { Download, Filter, PlayCircle, ArrowRight, ShieldCheck, CheckCircle } from "lucide-react";

interface HowItWorksProps {
  onOpenCheckout: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenCheckout }) => {
  const steps = [
    {
      step: "01",
      icon: Download,
      title: "Add GhostSweep to Chrome",
      description:
        "One-click install into Google Chrome. No account sign-ups or third-party registration required. Manifest V3 verified.",
      tag: "10 Seconds",
    },
    {
      step: "02",
      icon: Filter,
      title: "Filter & Whitelist VIPs",
      description:
        "Navigate to your Instagram Following list. GhostSweep instantly flags non-followers, inactive profiles, and demographic groups.",
      tag: "Smart Filters",
    },
    {
      step: "03",
      icon: PlayCircle,
      title: "Launch Safe Background Batch",
      description:
        "Click Start. GhostSweep unfollows in 10-account increments with human randomized jitter, keeping your account 100% safe.",
      tag: "Auto-Pilot Safe",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-surface/30 border-b border-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-sky/10 border border-accent-sky/30 text-accent-sky text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Simple 3-Step Setup
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            How GhostSweep Restores Your Feed
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            No complicated setup. No giving away your password. Start cleaning your algorithm in under 60 seconds.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl p-8 bg-card/80 border border-border hover:border-accent-sky/40 transition-all duration-300 group shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black text-slate-600 group-hover:text-accent-sky transition-colors font-mono">
                      {item.step}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-accent-sky/10 text-accent-sky border border-accent-sky/20">
                      {item.tag}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface border border-border w-fit mb-5 text-accent-sky group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-accent-sky">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Verified Safe Operation</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA bar */}
        <div className="mt-14 text-center">
          <button
            onClick={onOpenCheckout}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-accent-sky to-cyan-300 hover:from-cyan-300 hover:to-accent-sky transition-all shadow-glow-sky hover:scale-105"
          >
            <span>Start Cleaning Your Profile — $1.99</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
