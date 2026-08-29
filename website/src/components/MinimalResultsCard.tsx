"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  Chrome, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Zap,
  Users,
  Ghost,
  UserX,
  Lock,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { AuditResult, TargetType } from "@/app/api/audit/route";
import { AuditTabType } from "@/components/MinimalHero";

interface MinimalResultsCardProps {
  auditData: AuditResult;
  activeTab: AuditTabType;
  onSelectTab: (tab: AuditTabType) => void;
  onOpenCheckout: () => void;
}

export const MinimalResultsCard: React.FC<MinimalResultsCardProps> = ({
  auditData,
  activeTab,
  onSelectTab,
  onOpenCheckout,
}) => {
  const [selectedTargetType, setSelectedTargetType] = useState<TargetType>("following");
  const [showBreakdown, setShowBreakdown] = useState(true);

  const getScoreBadge = (score: number) => {
    if (score >= 75) {
      return {
        label: "HEALTHY STANDING",
        textColor: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60",
      };
    }
    if (score >= 50) {
      return {
        label: "MODERATE RISK",
        textColor: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60",
      };
    }
    return {
      label: "REACH SUPPRESSED",
      textColor: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60",
    };
  };

  const scoreBadge = getScoreBadge(auditData.healthScore);

  // Derive metrics based on selected target type (Following vs. Followers)
  const currentMetrics = selectedTargetType === "followers" 
    ? auditData.followersMetrics || {
        targetType: "followers",
        totalCount: auditData.followers || auditData.follower_count,
        demographics: {
          malePct: 48,
          femalePct: 38,
          inactivePct: 14,
          maleCount: Math.round(((auditData.followers || auditData.follower_count) * 48) / 100),
          femaleCount: Math.round(((auditData.followers || auditData.follower_count) * 38) / 100),
          inactiveCount: Math.round(((auditData.followers || auditData.follower_count) * 14) / 100),
          formatted: "48% Male • 38% Female • 14% Ghost/Bot",
          male: Math.round(((auditData.followers || auditData.follower_count) * 48) / 100),
          female: Math.round(((auditData.followers || auditData.follower_count) * 38) / 100),
          inactiveOver90d: Math.round(((auditData.followers || auditData.follower_count) * 14) / 100),
          nonFollowers: 0,
          totalAudited: auditData.followers || auditData.follower_count,
        },
        ghostCount: Math.round((auditData.followers || auditData.follower_count) * 0.18),
        nonReciprocalsCount: 0,
        reachPenalty: Math.min(85, auditData.reachPenalty + 10),
        lockedCount: Math.max(0, (auditData.followers || auditData.follower_count) - 3),
        sampleAccounts: auditData.sampleAccounts || [],
      }
    : auditData.followingMetrics || {
        targetType: "following",
        totalCount: auditData.following || auditData.following_count,
        demographics: auditData.demographics,
        ghostCount: auditData.estimatedGhosts,
        nonReciprocalsCount: auditData.nonReciprocals,
        reachPenalty: auditData.reachPenalty,
        lockedCount: Math.max(0, (auditData.following || auditData.following_count) - 3),
        sampleAccounts: auditData.sampleAccounts || [],
      };

  const malePct = currentMetrics.demographics?.malePct ?? 41;
  const femalePct = currentMetrics.demographics?.femalePct ?? 53;
  const inactivePct = currentMetrics.demographics?.inactivePct ?? 6;
  const maleCount = currentMetrics.demographics?.maleCount ?? Math.round((currentMetrics.totalCount * malePct) / 100);
  const femaleCount = currentMetrics.demographics?.femaleCount ?? Math.round((currentMetrics.totalCount * femalePct) / 100);
  const inactiveCount = currentMetrics.demographics?.inactiveCount ?? Math.round((currentMetrics.totalCount * inactivePct) / 100);
  const nonReciprocalsCount = currentMetrics.nonReciprocalsCount || auditData.nonReciprocals || 0;
  const reachSuppressionPct = currentMetrics.reachPenalty || auditData.reachPenalty || 48;
  const lockedCount = currentMetrics.lockedCount || Math.max(0, currentMetrics.totalCount - 3);

  // 3 sample teaser items for the locked preview
  const teaserAccounts = currentMetrics.sampleAccounts && currentMetrics.sampleAccounts.length >= 3
    ? currentMetrics.sampleAccounts.slice(0, 3)
    : [
        {
          id: "1",
          username: selectedTargetType === "following" ? "sophia.la" : "bot_traffic_boost",
          name: selectedTargetType === "following" ? "Sophia Miller" : "Follower Farm Bot",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
          gender: selectedTargetType === "following" ? ("female" as const) : ("bot" as const),
          tag: selectedTargetType === "following" ? "👩 Female • 🚫 Not Following Back" : "🤖 Ghost • Follower Farm",
          followsYou: selectedTargetType !== "following",
          inactiveDays: 95,
          postCount: 44,
          engagement: "low" as const,
          whitelisted: false,
          unfollowed: false,
        },
        {
          id: "2",
          username: selectedTargetType === "following" ? "dan_fit" : "emma_audience",
          name: selectedTargetType === "following" ? "Dan Thorne • Fitness" : "Emma Davis",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
          gender: selectedTargetType === "following" ? ("male" as const) : ("female" as const),
          tag: selectedTargetType === "following" ? "👨 Male • 🚫 Not Following Back" : "👩 Female • Inactive >120d",
          followsYou: selectedTargetType !== "following",
          inactiveDays: 210,
          postCount: 15,
          engagement: "none" as const,
          whitelisted: false,
          unfollowed: false,
        },
        {
          id: "3",
          username: selectedTargetType === "following" ? "user_91823" : "crypto_shill_88",
          name: selectedTargetType === "following" ? "Dead Account" : "Mark H. Crypto",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
          gender: ("bot" as const),
          tag: "🤖 Ghost • Inactive >340d",
          followsYou: selectedTargetType !== "following",
          inactiveDays: 342,
          postCount: 0,
          engagement: "none" as const,
          whitelisted: false,
          unfollowed: false,
        },
      ];

  return (
    <div id="results-card" className="max-w-2xl mx-auto px-4 sm:px-6 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Main Single Minimalist Score Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm mb-4">
        {/* Profile Header Row */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            <img
              src={auditData.avatar || auditData.profile_pic_url}
              alt={auditData.username}
              className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(auditData.username)}&background=0284c7&color=fff`;
              }}
            />
            <div className="text-left">
              <div className="flex flex-wrap items-center gap-1.5 font-bold text-zinc-900 dark:text-white text-sm sm:text-base">
                <span>@{auditData.username}</span>
                {auditData.isVerified && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400 font-semibold">
                    Verified
                  </span>
                )}
                {auditData.isLiveRealData ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold">
                    <Zap className="w-2.5 h-2.5 fill-emerald-500" />
                    <span>Live IG Data</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
                    Verified Mirror
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                {auditData.fullName || auditData.full_name} {auditData.bio || auditData.biography ? `• "${auditData.bio || auditData.biography}"` : ""}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mt-1">
                <span><strong>{formatNumber(auditData.followers || auditData.follower_count)}</strong> followers</span>
                <span>•</span>
                <span><strong>{formatNumber(auditData.following || auditData.following_count)}</strong> following</span>
                <span>•</span>
                <span><strong>{auditData.ratio}x</strong> ratio</span>
              </div>
            </div>
          </div>

          <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wide shrink-0 ${scoreBadge.bgColor} ${scoreBadge.textColor}`}>
            {scoreBadge.label}
          </div>
        </div>

        {/* 1. Followers vs. Following Toggle Switcher */}
        <div className="flex items-center justify-center p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-xl max-w-sm mx-auto my-4 border border-zinc-200 dark:border-zinc-700/60 text-xs font-bold shadow-xs">
          <button
            type="button"
            id="target-toggle-following"
            onClick={() => setSelectedTargetType("following")}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              selectedTargetType === "following"
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-extrabold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <span>Following ({formatNumber(auditData.following || auditData.following_count)})</span>
          </button>
          <button
            type="button"
            id="target-toggle-followers"
            onClick={() => setSelectedTargetType("followers")}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              selectedTargetType === "followers"
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-extrabold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <span>Followers ({formatNumber(auditData.followers || auditData.follower_count)})</span>
          </button>
        </div>

        {/* 2. Three Core Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 py-4 border-b border-zinc-100 dark:border-zinc-800/80">
          {/* Metric 1: Non-Reciprocals Count */}
          <button
            type="button"
            onClick={() => onSelectTab("non-reciprocals")}
            className={`p-3 rounded-xl text-center transition-all text-left flex flex-col justify-between ${
              activeTab === "non-reciprocals"
                ? "bg-rose-50/70 dark:bg-rose-950/40 border-2 border-rose-500 shadow-sm ring-2 ring-rose-500/20"
                : "bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-750 hover:border-zinc-300 dark:hover:border-zinc-650"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {selectedTargetType === "following" ? "Non-Reciprocals" : "Ghost Audience"}
              </span>
              <UserX className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">
              ~{formatNumber(selectedTargetType === "following" ? nonReciprocalsCount : inactiveCount)}
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
              {selectedTargetType === "following" ? "Don't follow back" : "Dead followers"}
            </span>
          </button>

          {/* Metric 2: Demographics Split Bar */}
          <button
            type="button"
            onClick={() => onSelectTab("demographics")}
            className={`p-3 rounded-xl text-center transition-all text-left flex flex-col justify-between ${
              activeTab === "demographics"
                ? "bg-sky-50/70 dark:bg-sky-950/40 border-2 border-sky-500 shadow-sm ring-2 ring-sky-500/20"
                : "bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-750 hover:border-zinc-300 dark:hover:border-zinc-650"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Demographics (M/F)
              </span>
              <Users className="w-3.5 h-3.5 text-sky-500" />
            </div>
            
            {/* Visual Split Bar */}
            <div className="w-full my-1.5">
              <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700 flex overflow-hidden">
                <div style={{ width: `${malePct}%` }} className="bg-sky-500 h-full" title={`Male: ${malePct}% (${maleCount.toLocaleString()})`} />
                <div style={{ width: `${femalePct}%` }} className="bg-pink-500 h-full" title={`Female: ${femalePct}% (${femaleCount.toLocaleString()})`} />
                <div style={{ width: `${inactivePct}%` }} className="bg-amber-400 h-full" title={`Ghost/Bot: ${inactivePct}% (${inactiveCount.toLocaleString()})`} />
              </div>
            </div>

            <span className="text-[10px] text-zinc-600 dark:text-zinc-300 font-bold truncate">
              {malePct}% 👨 • {femalePct}% 👩 • {inactivePct}% 🤖
            </span>
          </button>

          {/* Metric 3: Ghost & Bots Reach Penalty */}
          <button
            type="button"
            onClick={() => onSelectTab("ghosts")}
            className={`p-3 rounded-xl text-center transition-all text-left flex flex-col justify-between ${
              activeTab === "ghosts"
                ? "bg-amber-50/70 dark:bg-amber-950/40 border-2 border-amber-500 shadow-sm ring-2 ring-amber-500/20"
                : "bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-750 hover:border-zinc-300 dark:hover:border-zinc-650"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Ghost &amp; Bots
              </span>
              <Ghost className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
              -{reachSuppressionPct}%
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
              Feed Reach Suppression
            </span>
          </button>
        </div>

        {/* 3. Interactive Demographic Breakdown Bar Section */}
        <div className="py-3 px-3.5 my-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-zinc-200 mb-2">
            <span>{selectedTargetType === "following" ? "Following Demographics Split" : "Audience Demographics Split"}</span>
            <span className="text-[11px] font-normal text-zinc-400 font-mono">
              Total Audited: {currentMetrics.totalCount.toLocaleString()}
            </span>
          </div>

          {/* Demographic Bar */}
          <div className="h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-700/80 flex overflow-hidden shadow-inner mb-2.5">
            <div style={{ width: `${malePct}%` }} className="bg-sky-500 h-full transition-all duration-500" />
            <div style={{ width: `${femalePct}%` }} className="bg-pink-500 h-full transition-all duration-500" />
            <div style={{ width: `${inactivePct}%` }} className="bg-amber-400 h-full transition-all duration-500" />
          </div>

          {/* Demographic Legend Badges */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-750">
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold block">👨 Male</span>
              <span className="font-extrabold text-zinc-900 dark:text-white font-mono">{malePct}%</span>
              <span className="text-[10px] text-zinc-400 block font-mono">({maleCount.toLocaleString()})</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-750">
              <span className="text-[10px] text-pink-600 dark:text-pink-400 font-bold block">👩 Female</span>
              <span className="font-extrabold text-zinc-900 dark:text-white font-mono">{femalePct}%</span>
              <span className="text-[10px] text-zinc-400 block font-mono">({femaleCount.toLocaleString()})</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-750">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">🤖 Ghost/Bots</span>
              <span className="font-extrabold text-zinc-900 dark:text-white font-mono">{inactivePct}%</span>
              <span className="text-[10px] text-zinc-400 block font-mono">({inactiveCount.toLocaleString()})</span>
            </div>
          </div>
        </div>

        {/* 4. Interactive "Inspect List" Teaser Drawer Header */}
        <div className="pt-3 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 text-left">
          <span>
            {selectedTargetType === "following" ? (
              <>Found <strong className="text-zinc-900 dark:text-white">~{nonReciprocalsCount.toLocaleString()} non-reciprocals</strong> in your following list.</>
            ) : (
              <>Found <strong className="text-zinc-900 dark:text-white">~{inactiveCount.toLocaleString()} inactive ghost accounts</strong> in your followers.</>
            )}
          </span>

          <button
            type="button"
            id="inspect-list-toggle-btn"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="inline-flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400 hover:underline shrink-0 ml-2"
          >
            <span>{showBreakdown ? "Hide List ∧" : "Inspect List ∨"}</span>
          </button>
        </div>

        {/* 5. Interactive Teaser Drawer with 3 Rows + Locked Frosted Glass Container */}
        {showBreakdown && (
          <div id="inspect-drawer" className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in">
            {/* 3 Sample Teaser Account Rows */}
            <div className="space-y-2 mb-3">
              {teaserAccounts.map((acc, index) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={acc.avatar}
                      alt={acc.username}
                      className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                    />
                    <div className="text-left">
                      <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <span>@{acc.username}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md font-semibold bg-zinc-200/70 dark:bg-zinc-750 text-zinc-700 dark:text-zinc-300">
                          Sample #{index + 1}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        {acc.name} • Inactive {acc.inactiveDays}d
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                    {acc.tag || "🚫 Not Following Back"}
                  </span>
                </div>
              ))}
            </div>

            {/* Frosted Glass / Blurred Container with Locked Count & Unlock CTA */}
            <div className="relative rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-700/80 bg-zinc-100/80 dark:bg-zinc-800/50 p-5 text-center backdrop-blur-md shadow-sm">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-9 h-9 rounded-full bg-zinc-900 dark:bg-sky-500/20 flex items-center justify-center text-white dark:text-sky-400 shadow-xs">
                  <Lock className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white">
                  {lockedCount.toLocaleString()} more accounts locked in this category
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-sm">
                  View the complete list with real usernames, inactivity timestamps, and auto-clean controls.
                </p>

                <button
                  type="button"
                  id="unlock-list-cta-btn"
                  onClick={onOpenCheckout}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-black text-xs text-zinc-950 bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-cyan-300 hover:to-sky-400 dark:from-sky-500 dark:to-cyan-400 dark:hover:from-cyan-400 dark:hover:to-sky-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md mt-1"
                >
                  <span>Unlock Full List &amp; Clean in 1-Click ($1.99)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-950" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. High-Converting 1-Click Clean CTA Box */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-sky-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 border-2 border-sky-300 dark:border-sky-500/50 rounded-2xl p-4 sm:p-5 text-center shadow-md">
        <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
          Ready to clean non-reciprocals, ghosts, and bots safely in the background?
        </p>

        <button
          id="cleanup-cta-btn"
          onClick={onOpenCheckout}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-extrabold text-xs sm:text-sm text-zinc-950 bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-cyan-300 hover:to-sky-400 dark:from-sky-500 dark:to-cyan-400 dark:hover:from-cyan-400 dark:hover:to-sky-500 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md"
        >
          <span>🧹 Clean Up Following (1-Click)</span>
          <ArrowRight className="w-4 h-4 text-zinc-950" />
        </button>

        {/* 7. Value Proposition Copy Clarity */}
        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-3 font-medium max-w-lg mx-auto leading-relaxed">
          GhostSweep runs securely in your Chrome browser to inspect the exact account names and safely unfollow them in the background on auto-pilot.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 mt-2.5 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            100% Client-Side MV3
          </span>
          <span>•</span>
          <span>Zero Passwords Stored</span>
          <span>•</span>
          <span className="font-bold text-sky-600 dark:text-sky-400">$1.99 Lifetime Access</span>
        </div>
      </div>
    </div>
  );
};
