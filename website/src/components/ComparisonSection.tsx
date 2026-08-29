"use client";

import React from "react";
import { Check, X, Shield, Sparkles, AlertCircle } from "lucide-react";

export const ComparisonSection: React.FC = () => {
  const rows = [
    {
      feature: "Instagram Password Required?",
      ghostsweep: "Never (100% Local Session)",
      manual: "No",
      bots: "Yes (High Security Risk)",
      ghostsweepPositive: true,
      manualPositive: true,
      botsPositive: false,
    },
    {
      feature: "Account Ban / Shadowban Risk",
      ghostsweep: "Zero (Safe 10-Batch Delays)",
      manual: "Low",
      bots: "Extreme (IP & Device Mismatch)",
      ghostsweepPositive: true,
      manualPositive: true,
      botsPositive: false,
    },
    {
      feature: "👨/👩 Demographic & Gender Filters",
      ghostsweep: "Included (Instant)",
      manual: "Manual Inspection Only",
      bots: "Rare / Paid Upsell",
      ghostsweepPositive: true,
      manualPositive: false,
      botsPositive: false,
    },
    {
      feature: "Inactive Account Detection (>90d)",
      ghostsweep: "Automated Heuristic",
      manual: "Check Each Profile One by One",
      bots: "Basic",
      ghostsweepPositive: true,
      manualPositive: false,
      botsPositive: false,
    },
    {
      feature: "1-Click VIP Whitelist Protection",
      ghostsweep: "Included",
      manual: "Manual Memory",
      bots: "Inconsistent",
      ghostsweepPositive: true,
      manualPositive: false,
      botsPositive: false,
    },
    {
      feature: "Pricing Model",
      ghostsweep: "$1.99 One-Time Lifetime",
      manual: "Hours of Your Time",
      bots: "$29 - $49 / Month Recurring",
      ghostsweepPositive: true,
      manualPositive: false,
      botsPositive: false,
    },
  ];

  return (
    <section className="py-20 bg-background border-b border-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-sky/10 border border-accent-sky/30 text-accent-sky text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Clear Comparison
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Why GhostSweep Beats Cloud Bots & Manual Work
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Compare our native Chrome extension against risky third-party subscriptions and agonizing manual unfollowing.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-1/3">
                  Feature / Capability
                </th>
                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-accent-sky bg-card/60 rounded-t-xl border-t border-x border-accent-sky/30">
                  <div className="flex items-center gap-2 text-sm font-black text-white">
                    <span>GhostSweep</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-accent-sky text-slate-950 font-bold">
                      Recommended
                    </span>
                  </div>
                </th>
                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Manual Unfollowing
                </th>
                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Risky Cloud Bots
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-surface/30 transition-colors">
                  <td className="py-4 px-4 text-sm font-medium text-white">
                    {row.feature}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-accent-sky bg-card/60 border-x border-accent-sky/20">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{row.ghostsweep}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      {row.manualPositive ? (
                        <Check className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span>{row.manual}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      {row.botsPositive ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className={!row.botsPositive ? "text-rose-400/90 font-medium" : ""}>
                        {row.bots}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
