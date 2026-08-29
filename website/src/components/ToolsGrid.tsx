"use client";

import React from "react";
import { 
  BarChart3, 
  Ghost, 
  Users, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Chrome 
} from "lucide-react";

interface ToolsGridProps {
  onOpenCheckout: () => void;
  onSelectTool: (toolId: string) => void;
}

export const ToolsGrid: React.FC<ToolsGridProps> = ({ onOpenCheckout, onSelectTool }) => {
  const tools = [
    {
      id: "analyzer",
      title: "Health & Ratio Analyzer",
      badge: "Free Online Tool",
      badgeColor: "bg-accent-sky/10 text-accent-sky border-accent-sky/30",
      icon: BarChart3,
      description:
        "Instant Instagram authority scoring. Analyzes follower-to-following ratios and algorithm reach penalty thresholds.",
      cta: "Open Analyzer",
      action: () => {
        const el = document.getElementById("analyzer");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
    },
    {
      id: "ghosts",
      title: "Ghost Follower Cleaner",
      badge: "Manifest V3 Ready",
      badgeColor: "bg-accent-gold/10 text-accent-gold border-accent-gold/30",
      icon: Ghost,
      description:
        "Detect and filter inactive accounts (>90 days) and non-reciprocal profiles without sharing your Instagram password.",
      cta: "Clean Inactive Profiles",
      action: onOpenCheckout,
    },
    {
      id: "demographics",
      title: "Demographic Segmentation",
      badge: "Smart Filters",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      icon: Users,
      description:
        "Segment your following list by 👨 Male, 👩 Female, business accounts, and mutual friends with 1-click whitelist protection.",
      cta: "Explore Demographics",
      action: () => {
        const el = document.getElementById("sandbox");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
    },
    {
      id: "sandbox",
      title: "Live Extension Sandbox",
      badge: "Interactive Demo",
      badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
      icon: Layers,
      description:
        "Experience simulated 10-batch unfollow runs with safe human randomized delays (12–25s) right in your browser.",
      cta: "Test Sandbox Demo",
      action: () => {
        const el = document.getElementById("sandbox");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
    },
  ];

  return (
    <section className="py-16 bg-surface/50 border-y border-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-sky/10 border border-accent-sky/30 text-accent-sky text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            GhostSweep Suite
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
            Everything You Need to Fix Your Algorithm
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Browser-based tools inspired by the clean, anonymous simplicity of modern web utilities.
          </p>
        </div>

        {/* 4 Tool Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="rounded-2xl p-6 bg-card border border-border hover:border-accent-sky/40 transition-all duration-300 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-surface border border-border text-accent-sky group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {tool.description}
                  </p>
                </div>

                <button
                  onClick={tool.action}
                  className="w-full flex items-center justify-between py-2 px-3.5 rounded-xl bg-surface hover:bg-slate-800 border border-border text-xs font-bold text-slate-200 hover:text-white transition-colors group/btn"
                >
                  <span>{tool.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-accent-sky group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
