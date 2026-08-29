"use client";

import React from "react";
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Chrome, 
  ArrowRight, 
  Lock, 
  RotateCcw,
  Star,
  CheckCircle2,
  HeartHandshake
} from "lucide-react";

interface PricingSectionProps {
  onOpenCheckout: () => void;
  onOpenLegal: (type: "refund") => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenCheckout, onOpenLegal }) => {
  const perks = [
    "Lifetime Access & All Future Manifest V3 Updates",
    "Unlimited Instagram Audits & Following Scans",
    "👨/👩 Demographic & Inactive (>90d) Filtering",
    "Safe 10-Account Staged Batches with 15s Jitter Delays",
    "Safe 75-Minute Auto-Pilot Cooldown Engine",
    "1-Click VIP Friends Whitelist Protection",
    "Instant License Key & Direct Chrome Extension Zip Package",
    "100% Client-Side Privacy (Zero Passwords Stored)",
  ];

  return (
    <section id="pricing" className="py-24 bg-background relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-accent-sky/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-sky/10 border border-accent-sky/30 text-accent-sky text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Simple Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            One Tiny Payment. Lifetime Clean Feed.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Say goodbye to \$30/month bot subscriptions. Get lifetime access to GhostSweep for less than a cup of coffee.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-xl mx-auto">
          <div className="relative rounded-3xl p-8 sm:p-10 bg-card/90 border-2 border-accent-sky/40 shadow-2xl shadow-accent-sky/10 backdrop-blur-xl group">
            {/* Top Popular Pill */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-accent-sky to-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-glow-sky flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              <span>90% OFF Launch Special</span>
            </div>

            <div className="text-center pb-8 border-b border-border">
              <h3 className="text-2xl font-black text-white mb-2">
                GhostSweep Lifetime License
              </h3>
              <p className="text-sm text-slate-400">
                Full unlocked suite with all demographic & safe batching features
              </p>

              {/* Price Display */}
              <div className="flex items-baseline justify-center gap-3 mt-6">
                <span className="text-slate-500 line-through text-2xl font-bold font-mono">
                  $19.99
                </span>
                <span className="text-5xl sm:text-6xl font-black text-white tracking-tight font-mono">
                  $1.99
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-accent-sky px-2.5 py-1 rounded-md bg-accent-sky/10 border border-accent-sky/30">
                  One-Time
                </span>
              </div>
              <p className="text-xs text-emerald-400 font-semibold mt-2">
                Pay once. Use forever. No recurring monthly subscriptions.
              </p>
            </div>

            {/* Perks Checklist */}
            <div className="py-8 space-y-3.5">
              {perks.map((perk, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                  <div className="p-1 rounded-full bg-accent-sky/10 text-accent-sky shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={onOpenCheckout}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-base font-extrabold text-slate-950 bg-gradient-to-r from-accent-sky via-cyan-300 to-accent-sky hover:from-cyan-300 hover:to-accent-sky transition-all duration-200 shadow-glow-sky hover:shadow-glow-sky hover:scale-[1.02] active:scale-[0.98]"
            >
              <Chrome className="w-5 h-5 text-slate-950" />
              <span>Get GhostSweep Extension Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* 14-Day Guarantee Seal */}
            <div className="mt-6 pt-6 border-t border-border flex items-center justify-center gap-3 text-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div className="text-left">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>14-Day 100% Money-Back Guarantee</span>
                  <button
                    onClick={() => onOpenLegal("refund")}
                    className="text-[11px] text-accent-sky underline hover:text-cyan-300"
                  >
                    Details
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  If GhostSweep doesn&apos;t save you hours of work, email support@ghostsweep.info for a prompt refund.
                </p>
              </div>
            </div>

            {/* Stripe Live Compliance Badges */}
            <div className="mt-6 pt-4 border-t border-border/60 grid grid-cols-2 gap-2 text-center text-[11px] text-slate-400">
              <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-surface/50 border border-border">
                <Lock className="w-3.5 h-3.5 text-accent-sky" />
                <span>256-Bit SSL Encrypted</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-surface/50 border border-border">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant License Key</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
