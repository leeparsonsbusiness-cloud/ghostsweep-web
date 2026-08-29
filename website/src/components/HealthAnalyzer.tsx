"use client";

import React, { useState, useMemo } from "react";
import { 
  Activity, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  ArrowRight, 
  ShieldAlert, 
  RefreshCw,
  Info,
  Zap,
  BarChart3
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface HealthAnalyzerProps {
  onOpenCheckout: () => void;
}

export const HealthAnalyzer: React.FC<HealthAnalyzerProps> = ({ onOpenCheckout }) => {
  // Input states
  const [followers, setFollowers] = useState<number>(4850);
  const [following, setFollowing] = useState<number>(3420);
  const [avgLikes, setAvgLikes] = useState<number>(85);

  // Quick scenario presets
  const presets = [
    { label: "Bloated / Ghost Heavy", followers: 4850, following: 3420, avgLikes: 85 },
    { label: "Average Creator", followers: 12500, following: 2800, avgLikes: 350 },
    { label: "High Authority / Clean", followers: 28400, following: 620, avgLikes: 1450 },
    { label: "Personal Account", followers: 1200, following: 1450, avgLikes: 45 },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setFollowers(preset.followers);
    setFollowing(preset.following);
    setAvgLikes(preset.avgLikes);
  };

  // Calculations
  const metrics = useMemo(() => {
    const safeFollowers = Math.max(1, followers);
    const safeFollowing = Math.max(1, following);
    const safeLikes = Math.max(0, avgLikes);

    const ratio = safeFollowers / safeFollowing;
    const engagementRate = (safeLikes / safeFollowers) * 100;

    // Rating determination
    let ratioRating = "Poor";
    let ratioColor = "text-rose-400";
    let ratioBg = "bg-rose-500/10 border-rose-500/30";
    if (ratio >= 3.0) {
      ratioRating = "Elite (High Authority)";
      ratioColor = "text-emerald-400";
      ratioBg = "bg-emerald-500/10 border-emerald-500/30";
    } else if (ratio >= 1.2) {
      ratioRating = "Healthy";
      ratioColor = "text-accent-sky";
      ratioBg = "bg-accent-sky/10 border-accent-sky/30";
    } else if (ratio >= 0.7) {
      ratioRating = "Fair";
      ratioColor = "text-amber-400";
      ratioBg = "bg-amber-500/10 border-amber-500/30";
    }

    // Health Score (0 - 100)
    let score = 0;
    // Ratio component (up to 40)
    if (ratio >= 2.5) score += 40;
    else if (ratio >= 1.5) score += 32;
    else if (ratio >= 1.0) score += 25;
    else if (ratio >= 0.6) score += 15;
    else score += 5;

    // Engagement component (up to 45)
    if (engagementRate >= 4.0) score += 45;
    else if (engagementRate >= 2.5) score += 38;
    else if (engagementRate >= 1.5) score += 28;
    else if (engagementRate >= 0.8) score += 18;
    else score += 8;

    // Following Bloat Penalty (up to 15 bonus if low following, penalty if > 2500)
    if (safeFollowing < 800) score += 15;
    else if (safeFollowing < 1500) score += 10;
    else if (safeFollowing < 3000) score += 5;
    else score -= 5;

    score = Math.min(100, Math.max(8, score));

    // Estimated Reach Penalty
    let reachPenalty = 0;
    if (score < 40) reachPenalty = 68;
    else if (score < 60) reachPenalty = 48;
    else if (score < 75) reachPenalty = 26;
    else if (score < 88) reachPenalty = 10;
    else reachPenalty = 0;

    // Ghost estimate in following
    const estimatedGhosts = Math.round(
      Math.max(0, safeFollowing * (1 - Math.min(1, (score / 100) * 1.2)))
    );

    return {
      ratio: ratio.toFixed(2),
      ratioRating,
      ratioColor,
      ratioBg,
      engagementRate: engagementRate.toFixed(2),
      score,
      reachPenalty,
      estimatedGhosts,
    };
  }, [followers, following, avgLikes]);

  // Score circle parameters
  const circleRadius = 58;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (metrics.score / 100) * circumference;

  const getScoreGradient = (score: number) => {
    if (score >= 75) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <section id="analyzer" className="py-20 bg-surface/40 border-y border-border/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-sky/10 border border-accent-sky/30 text-accent-sky text-xs font-semibold uppercase tracking-wider mb-4">
            <BarChart3 className="w-3.5 h-3.5" />
            Free Diagnostic Tool
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Instagram Profile Health & Ratio Analyzer
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            See how non-reciprocal following and inactive accounts trigger Instagram’s 
            reach dampening filter. Get your real-time algorithm authority score.
          </p>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="text-xs text-slate-500 font-medium mr-1">Quick Presets:</span>
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className="px-3 py-1 text-xs rounded-lg bg-card/80 hover:bg-card border border-border text-slate-300 hover:text-white transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Analyzer Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Controls Column (5 cols) */}
          <div className="lg:col-span-5 bg-card/90 border border-border rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-accent-sky/10 text-accent-sky">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Your Account Metrics</h3>
                  <p className="text-xs text-slate-400">Slide or enter your current stats</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Followers Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Followers Count
                  </label>
                  <span className="text-sm font-bold text-accent-sky font-mono">
                    {formatNumber(followers)}
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="100000"
                  step="50"
                  value={followers}
                  onChange={(e) => setFollowers(Number(e.target.value))}
                  className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-accent-sky"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>100</span>
                  <span>100K+</span>
                </div>
              </div>

              {/* Following Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Following Count
                  </label>
                  <span className="text-sm font-bold text-rose-400 font-mono">
                    {formatNumber(following)}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="7500"
                  step="25"
                  value={following}
                  onChange={(e) => setFollowing(Number(e.target.value))}
                  className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>50</span>
                  <span>7,500 (IG Limit)</span>
                </div>
              </div>

              {/* Average Likes Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Average Likes Per Post
                  </label>
                  <span className="text-sm font-bold text-accent-gold font-mono">
                    {formatNumber(avgLikes)}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="5000"
                  step="5"
                  value={avgLikes}
                  onChange={(e) => setAvgLikes(Number(e.target.value))}
                  className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-accent-gold"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>5</span>
                  <span>5,000+</span>
                </div>
              </div>

              {/* Quick Diagnostic Notice */}
              <div className="p-3.5 rounded-xl bg-surface/70 border border-border/80 text-xs text-slate-400 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-accent-sky shrink-0 mt-0.5" />
                <span>
                  Instagram’s 2026 algorithm penalizes accounts where following exceeds 1.5x of followers, assuming bot behavior or spam reciprocity.
                </span>
              </div>
            </div>
          </div>

          {/* Results & Score Output Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Score Card */}
            <div className="bg-card/90 border border-border rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent-sky/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
                {/* Radial Gauge */}
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-36 h-36 transform -rotate-90">
                    {/* Background Track */}
                    <circle
                      cx="72"
                      cy="72"
                      r={circleRadius}
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-surface"
                      fill="transparent"
                    />
                    {/* Active Progress */}
                    <circle
                      cx="72"
                      cy="72"
                      r={circleRadius}
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className={`${getScoreGradient(metrics.score)} transition-all duration-500 ease-out`}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className={`text-3xl font-black ${getScoreGradient(metrics.score)}`}>
                      {metrics.score}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Health Score
                    </span>
                  </div>
                </div>

                {/* Score Breakdown & Status */}
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Authority Status
                    </span>
                    <h4 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                      {metrics.score >= 75
                        ? "Optimal Authority Standing"
                        : metrics.score >= 50
                        ? "Moderate Quality Risk"
                        : "Severe Algorithm Reach Penalty"}
                    </h4>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {metrics.score >= 75
                      ? "Your account maintains a healthy ratio and clean following. Regular maintenance will preserve your feed distribution."
                      : metrics.score >= 50
                      ? "High following relative to followers is dragging down your explore page recommendation threshold."
                      : "Instagram is severely throttling your post reach due to high following bloat and non-reciprocal ghost accounts."}
                  </p>
                </div>
              </div>

              {/* Metric Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-border">
                {/* Ratio Rating */}
                <div className={`p-3.5 rounded-xl border ${metrics.ratioBg}`}>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">
                    Follower / Following
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-black text-white">{metrics.ratio}x</span>
                    <span className={`text-xs font-bold ${metrics.ratioColor}`}>
                      {metrics.ratioRating}
                    </span>
                  </div>
                </div>

                {/* Estimated Reach Penalty */}
                <div className="p-3.5 rounded-xl border bg-surface/60 border-border">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">
                    Est. Reach Penalty
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`text-lg font-black ${metrics.reachPenalty > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {metrics.reachPenalty > 0 ? `-${metrics.reachPenalty}%` : "0% (Clean)"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {metrics.reachPenalty > 0 ? "Suppressed" : "Unrestricted"}
                    </span>
                  </div>
                </div>

                {/* Estimated Ghost Accounts */}
                <div className="p-3.5 rounded-xl border bg-surface/60 border-border">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">
                    Flagged for Cleaning
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-black text-accent-sky">
                      ~{formatNumber(metrics.estimatedGhosts)}
                    </span>
                    <span className="text-[11px] text-slate-400">accounts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* High-Converting CTA Banner directly below results */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-accent-indigo/20 via-surface to-accent-sky/20 border border-accent-sky/40 shadow-glow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-accent-sky uppercase tracking-wide">
                  <Zap className="w-4 h-4" />
                  Recommended Fix
                </div>
                <h5 className="text-base sm:text-lg font-bold text-white">
                  Clean your ~{formatNumber(metrics.estimatedGhosts)} flagged accounts safely
                </h5>
                <p className="text-xs text-slate-400">
                  Run safe 10-account batches in your active Chrome tab. No passwords required.
                </p>
              </div>

              <button
                onClick={onOpenCheckout}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-accent-sky to-cyan-300 hover:from-cyan-300 hover:to-accent-sky transition-all shadow-glow-sky shrink-0 hover:scale-105 active:scale-95"
              >
                <span>Clean With GhostSweep</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
