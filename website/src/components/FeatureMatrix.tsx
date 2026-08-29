"use client";

import React from "react";
import { 
  ShieldCheck, 
  Layers, 
  Users, 
  Clock, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  EyeOff, 
  Cpu, 
  Fingerprint,
  Zap,
  Star
} from "lucide-react";

export const FeatureMatrix: React.FC = () => {
  const features = [
    {
      id: "privacy",
      icon: Lock,
      badge: "Zero Password Required",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      title: "Native Session Privacy",
      description:
        "Operates 100% inside your active Chrome browser tab using your existing session cookies. We never ask for, see, or store your Instagram login credentials.",
      accent: "from-emerald-500/20 to-accent-sky/20",
      borderGlow: "hover:border-emerald-500/40",
      bullets: [
        "100% client-side Manifest V3 sandbox",
        "No remote API servers or external proxies",
        "Zero data transmission or analytics logging",
      ],
    },
    {
      id: "batches",
      icon: Layers,
      badge: "Safe Human Simulation",
      badgeColor: "text-accent-sky bg-accent-sky/10 border-accent-sky/30",
      title: "10-Account Staged Batches",
      description:
        "Never trigger Instagram's suspicious activity threshold. GhostSweep executes 10 unfollow actions at human-like intervals with randomized micro-jitter (12s–25s).",
      accent: "from-accent-sky/20 to-accent-indigo/20",
      borderGlow: "hover:border-accent-sky/40",
      bullets: [
        "Dynamic jitter delays (12–25 seconds)",
        "Staggered 10-account safety batches",
        "Bypasses 2026 Meta bot heuristic detectors",
      ],
    },
    {
      id: "demographics",
      icon: Users,
      badge: "Smart Segmentation",
      badgeColor: "text-accent-gold bg-accent-gold/10 border-accent-gold/30",
      title: "👨/👩 Demographic Segmentation",
      description:
        "Filter your following list by gender heuristics, non-reciprocal status, inactivity threshold (>90 days), and low-engagement ghost accounts in seconds.",
      accent: "from-accent-gold/20 to-accent-rose/20",
      borderGlow: "hover:border-accent-gold/40",
      bullets: [
        "Male / Female demographic segmentation",
        "Filter by inactive days (>60d, >90d, >180d)",
        "1-click whitelist for friends & VIP creators",
      ],
    },
    {
      id: "autopilot",
      icon: Clock,
      badge: "Continuous Auto-Pilot",
      badgeColor: "text-cyan-300 bg-cyan-500/10 border-cyan-500/30",
      title: "Safe 75-Min Auto-Pilot Engine",
      description:
        "Need to clean 500+ accounts? Turn on Auto-Pilot and leave the tab in the background. GhostSweep pauses 75 minutes between major cycles for zero ban risk.",
      accent: "from-cyan-500/20 to-accent-indigo/20",
      borderGlow: "hover:border-cyan-500/40",
      bullets: [
        "Automated 75-minute rest cycles",
        "Clean up to 200+ accounts safely per 24h",
        "Automatic stop on temporary action cooldowns",
      ],
    },
  ];

  return (
    <section id="features" className="py-20 bg-surface/50 border-b border-border relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-sky/10 border border-accent-sky/30 text-accent-sky text-xs font-semibold uppercase tracking-wider mb-4">
            <Cpu className="w-3.5 h-3.5" />
            Engine Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Built for Maximum Reach & Zero Account Risk
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Traditional Instagram cleaner apps get accounts flagged and banned by running cloud bots. 
            GhostSweep runs entirely inside your active Chrome session.
          </p>
        </div>

        {/* 4 Core Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className={`relative rounded-2xl p-7 sm:p-8 bg-card border border-border transition-all duration-300 ${feature.borderGlow} hover:shadow-xl group overflow-hidden`}
              >
                {/* Subtle top gradient glow */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.accent}`}
                />

                <div className="flex items-start justify-between mb-6">
                  <div className="p-3.5 rounded-xl bg-surface/90 border border-border group-hover:scale-105 transition-transform duration-200">
                    <Icon className="w-6 h-6 text-accent-sky" />
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${feature.badgeColor}`}
                  >
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                  {feature.description}
                </p>

                <div className="space-y-2.5 pt-4 border-t border-border/70">
                  {feature.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-accent-sky shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
