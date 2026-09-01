"use client";

import React, { useState } from "react";
import { 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Zap,
  Users,
  Lock,
  Sparkles,
  ShieldCheck,
  Search,
  Download,
  CheckCircle,
  Clock,
  UserCheck,
  Eye,
  UserPlus
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { AuditResult, TargetType } from "@/app/api/audit/route";
import { AuditTabType } from "@/components/MinimalHero";
import { ClassifiedAccount } from "@/lib/classifier";

interface MinimalResultsCardProps {
  auditData: AuditResult;
  activeTab: AuditTabType;
  onSelectTab: (tab: AuditTabType) => void;
  onOpenCheckout: () => void;
  isUnlocked?: boolean;
}

export const MinimalResultsCard: React.FC<MinimalResultsCardProps> = ({
  auditData,
  activeTab,
  onSelectTab,
  onOpenCheckout,
  isUnlocked = false,
}) => {
  const [selectedTargetType, setSelectedTargetType] = useState<TargetType>("following");
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "female" | "male">("all");

  const getScoreBadge = (score: number) => {
    if (score >= 75) {
      return {
        label: "ACTIVE FOLLOWER PATTERN",
        textColor: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60",
      };
    }
    if (score >= 50) {
      return {
        label: "HIGH ACTIVITY RATIO",
        textColor: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60",
      };
    }
    return {
      label: "HEAVY RECENT ACTIVITY",
      textColor: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60",
    };
  };

  const scoreBadge = getScoreBadge(auditData.healthScore);

  // Derive metrics based on selected target type (Following vs. Followers)
  const currentMetrics = selectedTargetType === "followers" 
    ? auditData.followersMetrics 
    : auditData.followingMetrics;

  const malePct = currentMetrics?.demographics?.malePct ?? 44;
  const femalePct = currentMetrics?.demographics?.femalePct ?? 50;
  const maleCount = currentMetrics?.demographics?.maleCount ?? Math.round(((currentMetrics?.totalCount || 1000) * malePct) / 100);
  const femaleCount = currentMetrics?.demographics?.femaleCount ?? Math.round(((currentMetrics?.totalCount || 1000) * femalePct) / 100);
  const totalCount = currentMetrics?.totalCount || (selectedTargetType === "followers" ? auditData.followers : auditData.following);

  // Base pool of accounts
  const allAccounts: ClassifiedAccount[] = currentMetrics?.allAccounts || currentMetrics?.sampleAccounts || [];

  // Filtered pool for Unlocked table
  const filteredAccounts = allAccounts.filter((acc) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = acc.username.toLowerCase().includes(q) || acc.name.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (genderFilter === "female") return acc.gender === "female";
    if (genderFilter === "male") return acc.gender === "male";
    return true;
  });

  // Top 5 preview accounts for the Free state
  const previewAccounts = React.useMemo(() => {
    return (currentMetrics?.sampleAccounts || allAccounts).slice(0, 5);
  }, [currentMetrics?.sampleAccounts, allAccounts]);

  const handleExportCSV = () => {
    const headers = ["Chronological Rank", "Username", "Name", "Gender", "Recent Timestamp", "Reciprocity", "Post Count", "Followers"];
    const rows = filteredAccounts.map((a) => [
      `#${a.chronologicalRank + 1}`,
      `@${a.username}`,
      `"${a.name.replace(/"/g, '""')}"`,
      a.gender === "female" ? "Girl" : a.gender === "male" ? "Guy" : "Bot",
      `"${a.timestampLabel}"`,
      `"${a.reciprocityLabel}"`,
      a.postCount,
      a.followersCount,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ghostsweep_${auditData.username}_${selectedTargetType}_activity.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="results-card" className="max-w-2xl mx-auto px-4 sm:px-6 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Main Forensic Results Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm mb-4">
        {/* 1. Target Profile Header Row */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={auditData.avatar || auditData.profile_pic_url}
              alt={auditData.username}
              className="w-12 h-12 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(auditData.username)}&background=0284c7&color=fff`;
              }}
            />
            <div className="text-left min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 font-bold text-zinc-900 dark:text-white text-sm sm:text-base">
                <span className="truncate">@{auditData.username}</span>
                {auditData.isVerified && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400 font-semibold">
                    ✓
                  </span>
                )}
                {isUnlocked && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold">
                    <CheckCircle className="w-2.5 h-2.5" />
                    <span>Unlocked</span>
                  </span>
                )}
                {auditData.isLiveRealData && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold">
                    <Zap className="w-2.5 h-2.5 fill-emerald-500" />
                    <span>Live Scan</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
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

        {/* 2. Demographic Ratio Breakdown (Paid Tier Unlocked) */}
        {isUnlocked && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 animate-in fade-in">
            {/* Girls Followed */}
            <div className="p-3 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200/60 dark:border-pink-900/40 text-left">
              <div className="flex items-center justify-between text-xs text-pink-600 dark:text-pink-400 font-semibold mb-1">
                <span>👩 Girls Followed</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-100 dark:bg-pink-900/60 font-bold">
                  {femalePct}%
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-mono">
                ~{femaleCount.toLocaleString()}
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Female accounts &amp; models
              </p>
            </div>

            {/* Guys Followed */}
            <div className="p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40 text-left">
              <div className="flex items-center justify-between text-xs text-sky-600 dark:text-sky-400 font-semibold mb-1">
                <span>👨 Guys Followed</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900/60 font-bold">
                  {malePct}%
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-mono">
                ~{maleCount.toLocaleString()}
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Male accounts &amp; creators
              </p>
            </div>
          </div>
        )}

        {/* 3. Auditing Switcher Tab Bar: [ 👀 Recent Follows (5) ] | [ 👥 Recent Followers (5) ] */}
        <div className="flex items-center justify-center p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-xl max-w-md mx-auto my-4 border border-zinc-200 dark:border-zinc-700/60 text-xs font-bold shadow-xs">
          <button
            type="button"
            id="target-toggle-following"
            onClick={() => {
              setSelectedTargetType("following");
              setGenderFilter("all");
            }}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              selectedTargetType === "following"
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-extrabold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>
              Recent Follows {isUnlocked ? `(${formatNumber(auditData.following || auditData.following_count)})` : "(5)"}
            </span>
          </button>
          <button
            type="button"
            id="target-toggle-followers"
            onClick={() => {
              setSelectedTargetType("followers");
              setGenderFilter("all");
            }}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              selectedTargetType === "followers"
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-extrabold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-pink-400" />
            <span>
              Recent Followers {isUnlocked ? `(${formatNumber(auditData.followers || auditData.follower_count)})` : "(5)"}
            </span>
          </button>
        </div>

        {/* 4. Filter Bar with Gated Gender Tabs: [ 🌐 All ] [ 👩 Girls Only 🔒 ] [ 👨 Guys Only 🔒 ] */}
        <div className="flex items-center justify-between gap-2 mb-3 pt-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            {/* All Filter Pill */}
            <button
              type="button"
              id="filter-pill-all"
              onClick={() => setGenderFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                genderFilter === "all"
                  ? "bg-zinc-900 text-white dark:bg-sky-500 dark:text-zinc-950 font-black shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <span>🌐 All {isUnlocked ? `(${allAccounts.length})` : ""}</span>
            </button>

            {/* Girls Only Filter Pill (Gated on Free Tier) */}
            <button
              type="button"
              id="filter-pill-female"
              onClick={() => {
                if (!isUnlocked) {
                  onOpenCheckout();
                } else {
                  setGenderFilter("female");
                }
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isUnlocked && genderFilter === "female"
                  ? "bg-pink-600 text-white font-black shadow-xs"
                  : isUnlocked
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:border-pink-500/40 border border-transparent hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
              }`}
            >
              <span>👩 Girls Only</span>
              {!isUnlocked ? (
                <Lock className="w-3 h-3 text-pink-400" />
              ) : (
                <span>({allAccounts.filter((a) => a.gender === "female").length})</span>
              )}
            </button>

            {/* Guys Only Filter Pill (Gated on Free Tier) */}
            <button
              type="button"
              id="filter-pill-male"
              onClick={() => {
                if (!isUnlocked) {
                  onOpenCheckout();
                } else {
                  setGenderFilter("male");
                }
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isUnlocked && genderFilter === "male"
                  ? "bg-sky-600 text-white font-black shadow-xs"
                  : isUnlocked
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:border-sky-500/40 border border-transparent hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
              }`}
            >
              <span>👨 Guys Only</span>
              {!isUnlocked ? (
                <Lock className="w-3 h-3 text-sky-400" />
              ) : (
                <span>({allAccounts.filter((a) => a.gender === "male").length})</span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowBreakdown((prev) => !prev)}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>{showBreakdown ? "Hide List" : "Inspect List"}</span>
            {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 5. Account Activity List & Paywall */}
        {showBreakdown && (
          <div id="inspect-drawer" className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in">
            {!isUnlocked ? (
              /* FREE STATE: Exactly 5 Activity Previews in Strict Chronological Order + Frosted Paywall */
              <>
                {/* 5 Activity Preview Rows */}
                <div className="space-y-2 mb-4">
                  {previewAccounts.map((acc, index) => (
                    <div
                      key={acc.id || `preview-${index}`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={acc.avatar}
                          alt={acc.username}
                          className="w-9 h-9 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(acc.username)}&background=0284c7&color=fff`;
                          }}
                        />
                        <div className="text-left min-w-0">
                          <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 truncate">
                            <span className="truncate">@{acc.username}</span>
                            {acc.isVerified && (
                              <span className="text-[10px] px-1 py-0.2 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400 font-semibold">
                                ✓
                              </span>
                            )}
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md font-semibold bg-zinc-200/70 dark:bg-zinc-750 text-zinc-700 dark:text-zinc-300 shrink-0 font-mono">
                              #{index + 1}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400 truncate block">
                            {acc.name}
                          </span>
                        </div>
                      </div>

                      {/* Badges: Gender Tag + Relative Timestamp + Reciprocity */}
                      <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                        {/* Gender Tag */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          acc.gender === "female"
                            ? "bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800/60"
                            : "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/60"
                        }`}>
                          {acc.genderLabel || (acc.gender === "female" ? "👩 Girl" : "👨 Guy")}
                        </span>

                        {/* Relative Timestamp Estimate */}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-sky-400" />
                          <span>{acc.timestampLabel || (index === 0 ? "🕒 ~2h ago" : index === 1 ? "🕒 ~4h ago - Last Night" : index === 2 ? "🕒 ~8h ago - Last Night" : index === 3 ? "🕒 ~12h ago - Last Night" : "🕒 ~1d ago")}</span>
                        </span>

                        {/* Reciprocity Tag */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          acc.followsYou
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                            : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                        }`}>
                          {acc.reciprocityLabel || (acc.followsYou ? "🔄 Mutual" : "🚫 Doesn't Follow Back")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Frosted Blurred Paywall Container directly underneath the 5 items */}
                <div className="relative rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-700/80 bg-zinc-100/90 dark:bg-zinc-800/60 p-6 text-center backdrop-blur-md shadow-md mt-2">
                  <div className="flex flex-col items-center justify-center space-y-2.5">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-sky-500/20 flex items-center justify-center text-white dark:text-sky-400 shadow-sm">
                      <Lock className="w-5 h-5 text-sky-400" />
                    </div>
                    <div className="text-sm sm:text-base font-black text-zinc-900 dark:text-white">
                      Unlock full chronological follow history &amp; gender filters for $1.99
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-md">
                      See all {totalCount.toLocaleString()} follows from newest to oldest, filter every follow by Girls/Guys, and full CSV export.
                    </p>

                    <button
                      type="button"
                      id="unlock-list-cta-btn"
                      onClick={onOpenCheckout}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-black text-xs sm:text-sm text-zinc-950 bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 hover:from-cyan-300 hover:to-sky-400 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg mt-2 cursor-pointer"
                    >
                      <span>Unlock Full Activity History ($1.99) ➔</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* PAID UNLOCKED STATE: Full Searchable & Filterable Table (500 Accounts) */
              <div className="space-y-3">
                {/* Search Bar & Export Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search handles, names, or keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-500" />
                    <span>Download Report / CSV</span>
                  </button>
                </div>

                {/* Full Chronological Activity List */}
                <div className="max-h-96 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {filteredAccounts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-400">
                      No accounts found matching your filter criteria.
                    </div>
                  ) : (
                    filteredAccounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-xs transition-colors gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[10px] font-mono font-bold text-zinc-400 w-6 text-center shrink-0">
                            #{acc.chronologicalRank + 1}
                          </span>
                          <img
                            src={acc.avatar}
                            alt={acc.username}
                            className="w-8 h-8 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(acc.username)}&background=0284c7&color=fff`;
                            }}
                          />
                          <div className="text-left min-w-0">
                            <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 truncate">
                              <span className="truncate">@{acc.username}</span>
                              {acc.isVerified && (
                                <span className="text-[10px] px-1 py-0.2 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400 font-semibold">
                                  ✓
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 truncate block">
                              {acc.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            acc.gender === "female"
                              ? "bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800/60"
                              : "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/60"
                          }`}>
                            {acc.genderLabel || (acc.gender === "female" ? "👩 Girl" : "👨 Guy")}
                          </span>

                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-sky-400" />
                            <span>{acc.timestampLabel}</span>
                          </span>

                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            acc.followsYou
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                              : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                          }`}>
                            {acc.reciprocityLabel}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trust & Instant Access Banner */}
      {!isUnlocked && (
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-500 font-medium my-2">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Anonymous Search</span>
          </span>
          <span>•</span>
          <span>Zero Passwords Required</span>
          <span>•</span>
          <span className="text-sky-400 font-semibold">$1.99 One-Time Access</span>
        </div>
      )}
    </div>
  );
};
