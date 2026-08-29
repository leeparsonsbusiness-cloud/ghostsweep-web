"use client";

import React, { useState } from "react";
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  Ghost, 
  Layers, 
  Sliders, 
  Users, 
  Chrome,
  Star
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { AuditResult, AuditAccountItem } from "@/app/api/audit/route";
import confetti from "canvas-confetti";

interface HeroSectionProps {
  onOpenCheckout: () => void;
  onAuditCompleted?: (data: AuditResult) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenCheckout,
  onAuditCompleted,
}) => {
  const [inputHandle, setInputHandle] = useState("alex.creator");
  const [isLoading, setIsLoading] = useState(false);
  const [auditData, setAuditData] = useState<AuditResult | null>(null);
  const [activeDemographicTab, setActiveDemographicTab] = useState<"all" | "male" | "female" | "inactive" | "non-followers">("non-followers");
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(new Set(["1", "2", "3", "4"]));

  const sampleTags = [
    { label: "@alex.creator", value: "alex.creator" },
    { label: "@sophia_vibe", value: "sophia_vibe" },
    { label: "@dropship_guru", value: "dropship_guru" },
    { label: "@fitness_dan", value: "fitness_dan" },
  ];

  const handleAudit = async (targetUsername?: string) => {
    const query = (targetUsername || inputHandle).trim().replace(/^@/, "");
    if (!query) return;

    setIsLoading(true);

    try {
      const res = await fetch(`/api/audit?username=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setAuditData(json.data);
        if (onAuditCompleted) onAuditCompleted(json.data);
        // Pre-select non-followers
        const nonFollowerIds = json.data.sampleAccounts
          .filter((a: AuditAccountItem) => !a.followsYou && !a.whitelisted)
          .map((a: AuditAccountItem) => a.id);
        setSelectedAccountIds(new Set(nonFollowerIds));
      }
    } catch (err) {
      console.error("Failed to run profile audit:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <section id="audit" className="relative pt-28 pb-16 md:pt-36 md:pb-24 bg-radial-hero overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-accent-sky/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Badge */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/90 border border-accent-sky/30 shadow-glow-sm backdrop-blur-md mb-6">
            <span className="flex h-2 w-2 rounded-full bg-accent-sky animate-ping" />
            <span className="text-xs font-semibold text-accent-sky tracking-wide uppercase">
              Free Anonymous Instagram Audit
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-xs font-medium text-slate-300">
              Zero Login Required
            </span>
          </div>

          {/* Main Title (tik.ninja style bold focused typography) */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight mb-4">
            Instagram Profile Health & <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-sky via-cyan-300 to-accent-indigo">
              Ghost Following Cleaner
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Audit non-reciprocal accounts, inspect follower quality, and safely batch unfollow inactive ghost profiles in the background.
          </p>
        </div>

        {/* Universal Search & Action Bar (tik.ninja signature input) */}
        <div className="max-w-3xl mx-auto mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAudit();
            }}
            className="relative flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-2xl bg-card/95 border-2 border-accent-sky/40 shadow-2xl shadow-accent-sky/10 backdrop-blur-2xl"
          >
            <div className="relative flex-1 flex items-center pl-3">
              <Search className="w-5 h-5 text-accent-sky shrink-0 mr-3" />
              <input
                type="text"
                value={inputHandle}
                onChange={(e) => setInputHandle(e.target.value)}
                placeholder="Enter Instagram @username (e.g. @alex.creator)"
                className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base font-medium focus:outline-none pr-4"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-accent-sky via-cyan-300 to-accent-sky hover:from-cyan-300 hover:to-accent-sky transition-all duration-200 shadow-glow-sky hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shrink-0"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Auditing Profile...
                </span>
              ) : (
                <>
                  <span>Audit Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Example Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-400">
            <span className="font-semibold text-slate-500">Popular Examples:</span>
            {sampleTags.map((tag) => (
              <button
                key={tag.value}
                onClick={() => {
                  setInputHandle(tag.value);
                  handleAudit(tag.value);
                }}
                className="px-2.5 py-1 rounded-lg bg-surface/80 hover:bg-card border border-border hover:border-accent-sky/40 text-slate-300 hover:text-white transition-colors"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Profile Audit Dashboard Result (Appears when audited or loaded) */}
        {auditData && (
          <div className="mt-10 rounded-3xl bg-card/90 border border-border p-6 sm:p-8 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Top Profile Summary Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <img
                  src={auditData.avatar}
                  alt={auditData.username}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-accent-sky/40 shadow-glow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">
                      @{auditData.username}
                    </h3>
                    {auditData.isVerified && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-sky/10 text-accent-sky border border-accent-sky/30">
                        Verified Creator
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{auditData.fullName}</p>
                </div>
              </div>

              {/* Follower Stats Badges */}
              <div className="flex items-center gap-3 text-xs">
                <div className="px-3.5 py-2 rounded-xl bg-surface border border-border text-center">
                  <div className="font-bold text-white font-mono text-sm">
                    {formatNumber(auditData.followers)}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase">Followers</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-surface border border-border text-center">
                  <div className="font-bold text-rose-400 font-mono text-sm">
                    {formatNumber(auditData.following)}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase">Following</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-surface border border-border text-center">
                  <div className="font-bold text-accent-gold font-mono text-sm">
                    {formatNumber(auditData.avgLikes)}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase">Avg Likes</span>
                </div>
              </div>
            </div>

            {/* Diagnostic Score Card & Metric Badges */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-center">
              {/* Left Score Gauge (4 cols) */}
              <div className="md:col-span-4 p-5 rounded-2xl bg-surface/70 border border-border flex items-center gap-4">
                <div className="relative flex items-center justify-center shrink-0">
                  <div className="w-20 h-20 rounded-full border-4 border-surface flex items-center justify-center bg-card shadow-inner">
                    <span className={`text-2xl font-black ${getScoreColor(auditData.healthScore)}`}>
                      {auditData.healthScore}%
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Authority Score
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    {auditData.healthScore >= 75
                      ? "Healthy Account"
                      : auditData.healthScore >= 50
                      ? "Moderate Risk"
                      : "Suppressed Reach"}
                  </h4>
                  <span className={`text-xs font-semibold ${getScoreColor(auditData.healthScore)}`}>
                    {auditData.ratioRating} Standing
                  </span>
                </div>
              </div>

              {/* Middle 2 Stats (4 cols) */}
              <div className="md:col-span-4 grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-surface/70 border border-border text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Ratio
                  </span>
                  <div className="text-lg font-black text-white mt-1">
                    {auditData.ratio}x
                  </div>
                  <span className="text-[10px] text-accent-sky font-semibold">
                    {auditData.ratioRating}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-surface/70 border border-border text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Reach Penalty
                  </span>
                  <div className={`text-lg font-black mt-1 ${auditData.reachPenalty > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {auditData.reachPenalty > 0 ? `-${auditData.reachPenalty}%` : "0%"}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {auditData.reachPenalty > 0 ? "Throttled" : "Clean"}
                  </span>
                </div>
              </div>

              {/* Right Fix CTA Box (4 cols) */}
              <div className="md:col-span-4 p-4 rounded-2xl bg-gradient-to-br from-accent-sky/15 via-surface to-accent-indigo/15 border border-accent-sky/40 text-center sm:text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-accent-sky uppercase">
                    Flagged For Cleaning
                  </span>
                  <span className="text-sm font-black text-white">
                    ~{formatNumber(auditData.estimatedGhosts)} accounts
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Safely remove ghost accounts with 10-batch human jitter delays.
                </p>
                <button
                  onClick={onOpenCheckout}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-accent-sky to-cyan-300 hover:from-cyan-300 hover:to-accent-sky transition-all shadow-glow-sm"
                >
                  <Chrome className="w-3.5 h-3.5" />
                  <span>Clean With Extension ($1.99)</span>
                </button>
              </div>
            </div>

            {/* Demographic Segmentation Tabs & Sample Accounts Preview */}
            <div className="pt-4 border-t border-border">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setActiveDemographicTab("non-followers")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeDemographicTab === "non-followers"
                        ? "bg-accent-sky text-slate-950 shadow-glow-sm"
                        : "bg-surface text-slate-300 border border-border"
                    }`}
                  >
                    🚫 Non-Followers ({auditData.demographics.nonFollowers})
                  </button>
                  <button
                    onClick={() => setActiveDemographicTab("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeDemographicTab === "all"
                        ? "bg-accent-sky text-slate-950 shadow-glow-sm"
                        : "bg-surface text-slate-300 border border-border"
                    }`}
                  >
                    All Audited ({auditData.demographics.totalAudited})
                  </button>
                  <button
                    onClick={() => setActiveDemographicTab("male")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeDemographicTab === "male"
                        ? "bg-accent-sky text-slate-950 shadow-glow-sm"
                        : "bg-surface text-slate-300 border border-border"
                    }`}
                  >
                    👨 Male ({auditData.demographics.male})
                  </button>
                  <button
                    onClick={() => setActiveDemographicTab("female")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeDemographicTab === "female"
                        ? "bg-accent-sky text-slate-950 shadow-glow-sm"
                        : "bg-surface text-slate-300 border border-border"
                    }`}
                  >
                    👩 Female ({auditData.demographics.female})
                  </button>
                  <button
                    onClick={() => setActiveDemographicTab("inactive")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeDemographicTab === "inactive"
                        ? "bg-accent-sky text-slate-950 shadow-glow-sm"
                        : "bg-surface text-slate-300 border border-border"
                    }`}
                  >
                    👻 Inactive &gt;90d ({auditData.demographics.inactiveOver90d})
                  </button>
                </div>

                <span className="text-xs text-slate-400">
                  <strong className="text-white">{selectedAccountIds.size}</strong> accounts queued
                </span>
              </div>

              {/* Sample Profile List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {auditData.sampleAccounts
                  .filter((acc) => {
                    if (activeDemographicTab === "male") return acc.gender === "male";
                    if (activeDemographicTab === "female") return acc.gender === "female";
                    if (activeDemographicTab === "inactive") return acc.inactiveDays >= 90;
                    if (activeDemographicTab === "non-followers") return !acc.followsYou;
                    return true;
                  })
                  .map((account) => {
                    const isSelected = selectedAccountIds.has(account.id);
                    return (
                      <div
                        key={account.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-surface border-accent-sky/40"
                            : "bg-surface/50 border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedAccountIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(account.id)) next.delete(account.id);
                                else next.add(account.id);
                                return next;
                              });
                            }}
                            className="w-4 h-4 rounded bg-card border-border text-accent-sky accent-accent-sky cursor-pointer"
                          />
                          <img
                            src={account.avatar}
                            alt={account.username}
                            className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                              <span>@{account.username}</span>
                              {account.gender === "male" && <span>👨</span>}
                              {account.gender === "female" && <span>👩</span>}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {account.name} • Inactive {account.inactiveDays}d
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!account.followsYou && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              Doesn&apos;t follow back
                            </span>
                          )}
                          <button
                            onClick={onOpenCheckout}
                            className="p-1 rounded-md hover:bg-card text-slate-400 hover:text-accent-gold"
                            title="Whitelist account"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
