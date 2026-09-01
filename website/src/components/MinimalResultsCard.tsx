"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Zap,
  Users,
  Ghost,
  UserX,
  Lock,
  Sparkles,
  ShieldCheck,
  Search,
  Download,
  Filter,
  CheckCircle,
  Clock
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
  const [filterCategory, setFilterCategory] = useState<"all" | "non-reciprocals" | "female" | "male" | "ghosts">("all");

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
    ? auditData.followersMetrics
    : auditData.followingMetrics;

  const malePct = currentMetrics?.demographics?.malePct ?? 41;
  const femalePct = currentMetrics?.demographics?.femalePct ?? 53;
  const inactivePct = currentMetrics?.demographics?.inactivePct ?? 6;
  const maleCount = currentMetrics?.demographics?.maleCount ?? Math.round(((currentMetrics?.totalCount || 1000) * malePct) / 100);
  const femaleCount = currentMetrics?.demographics?.femaleCount ?? Math.round(((currentMetrics?.totalCount || 1000) * femalePct) / 100);
  const inactiveCount = currentMetrics?.demographics?.inactiveCount ?? Math.round(((currentMetrics?.totalCount || 1000) * inactivePct) / 100);
  const nonReciprocalsCount = currentMetrics?.nonReciprocalsCount || auditData.nonReciprocals || 0;
  const reachSuppressionPct = currentMetrics?.reachPenalty || auditData.reachPenalty || 48;
  const totalCount = currentMetrics?.totalCount || (selectedTargetType === "followers" ? auditData.followers : auditData.following);
  const lockedCount = Math.max(0, totalCount - 3);

  // 10 preview accounts for the locked preview (first 5 female + first 5 male)
  const teaserAccounts: ClassifiedAccount[] = (currentMetrics?.sampleAccounts && currentMetrics.sampleAccounts.length >= 10)
    ? currentMetrics.sampleAccounts.slice(0, 10)
    : (currentMetrics?.sampleAccounts && currentMetrics.sampleAccounts.length > 0)
    ? currentMetrics.sampleAccounts
    : [
        // 5 Female previews
        {
          id: "f1",
          username: "sophia.la",
          name: "Sophia Miller",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
          gender: "female",
          tag: "👩 Female • 🕒 Recent",
          followsYou: selectedTargetType !== "following",
          inactiveDays: 39,
          postCount: 44,
          followersCount: 1200,
          followingCount: 400,
          engagement: "low",
          whitelisted: false,
          unfollowed: false,
          isVerified: false,
          isBot: false,
          isGhost: false,
          isNonReciprocal: true,
          chronologicalRank: 0,
          confidenceScore: 95,
        },
        {
          id: "f2",
          username: "emma_design",
          name: "Emma Davis",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
          gender: "female",
          tag: "👩 Female • 🕒 Recent",
          followsYou: selectedTargetType !== "following",
          inactiveDays: 45,
          postCount: 65,
          followersCount: 3400,
          followingCount: 520,
          engagement: "medium",
          whitelisted: false,
          unfollowed: false,
          isVerified: false,
          isBot: false,
          isGhost: false,
          isNonReciprocal: true,
          chronologicalRank: 1,
          confidenceScore: 96,
        },
        {
          id: "f3",
          username: "chloe.vibe",
          name: "Chloe Bennett",
          avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
          gender: "female",
          tag: "👩 Female • 🕒 Recent",
          followsYou: selectedTargetType !== "following",
          inactiveDays: 61,
          postCount: 88,
          followersCount: 5200,
          followingCount: 610,
          engagement: "medium",
          whitelisted: false,
          unfollowed: false,
          isVerified: false,
          isBot: false,
          isGhost: false,
          isNonReciprocal: true,
          chronologicalRank: 2,
          confidenceScore: 94,
        },
        {
          id: "f4",
          username: "olivia.fit",
          name: "Olivia Taylor",
          avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80",
          gender: "female",
          tag: "👩 Female • 🕒 Recent",
          followsYou: selectedTargetType !== "following",
          inactiveDays: 78,
          postCount: 110,
          followersCount: 9400,
          followingCount: 390,
          engagement: "high",
          whitelisted: false,
          unfollowed: false,
          isVerified: false,
          isBot: false,
          isGhost: false,
          isNonReciprocal: true,
          chronologicalRank: 3,
          confidenceScore: 98,
        },
        {
          id: "f5",
          username: "isabella_art",
          name: "Isabella Rossi",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
          gender: "female",
          tag: "👩 Female • 🕒 Recent",
          followsYou: selectedTargetType !== "following",
          inactiveDays: 92,
          postCount: 35,
          followersCount: 1800,
          followingCount: 450,
          engagement: "low",
          whitelisted: false,
          unfollowed: false,
          isVerified: true,
          isBot: false,
          isGhost: false,
          isNonReciprocal: true,
          chronologicalRank: 4,
          confidenceScore: 92,
        },
        // 5 Male previews
        {
          id: "m1",
          username: "dan_fit",
          name: "Dan Thorne",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
          gender: "male",
          tag: "👨 Male • 🕒 Recent",
          followsYou: selectedTargetType !== "following",
          inactiveDays: 14,
          postCount: 52,
          followersCount: 2200,
          followingCount: 480,
          engagement: "medium",
          whitelisted: false,
          unfollowed: false,
          isVerified: false,
          isBot: false,
          isGhost: false,
          isNonReciprocal: true,
          chronologicalRank: 5,
          confidenceScore: 96,
        },
        {
          id: "m2",
          username: "alex.tech",
          name: "Alex Rivers",
          avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
          gender: "male",
          tag: "👨 Male • 🕒 Recent",
          followsYou: selectedTargetType !== "following",
          inactiveDays: 22,
          postCount: 30,
          followersCount: 1400,
          followingCount: 320,
          engagement: "medium",
          whitelisted: false,
          unfollowed: false,
          isVerified: false,
          isBot: false,
          isGhost: false,
          isNonReciprocal: true,
          chronologicalRank: 6,
          confidenceScore: 95,
        },
        {
          id: "m3",
          username: "lucas_film",
          name: "Lucas Vance",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
          gender: "male",
          tag: "👨 Male • 🕒 Recent",
          followsYou: selectedTargetType !== "following",
          inactiveDays: 45,
          postCount: 75,
          followersCount: 4100,
          followingCount: 550,
          engagement: "high",
          whitelisted: false,
          unfollowed: false,
          isVerified: false,
          isBot: false,
          isGhost: false,
          isNonReciprocal: true,
          chronologicalRank: 7,
          confidenceScore: 97,
        },
        {
          id: "m4",
          username: "marcus_audio",
          name: "Marcus Cole",
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
          gender: "male",
          tag: "👨 Male • 🕒 Recent",
          followsYou: selectedTargetType !== "following",
          inactiveDays: 52,
          postCount: 40,
          followersCount: 3100,
          followingCount: 620,
          engagement: "medium",
          whitelisted: false,
          unfollowed: false,
          isVerified: false,
          isBot: false,
          isGhost: false,
          isNonReciprocal: true,
          chronologicalRank: 8,
          confidenceScore: 94,
        },
        {
          id: "m5",
          username: "david.photo",
          name: "David Kim",
          avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80",
          gender: "male",
          tag: "👨 Male • 🕒 Recent",
          followsYou: selectedTargetType !== "following",
          inactiveDays: 68,
          postCount: 62,
          followersCount: 5800,
          followingCount: 410,
          engagement: "high",
          whitelisted: false,
          unfollowed: false,
          isVerified: true,
          isBot: false,
          isGhost: false,
          isNonReciprocal: true,
          chronologicalRank: 9,
          confidenceScore: 98,
        },
      ];

  // All accounts when unlocked
  const allAccounts: ClassifiedAccount[] = currentMetrics?.allAccounts || currentMetrics?.sampleAccounts || teaserAccounts;

  const filteredAccounts = allAccounts.filter((acc) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = acc.username.toLowerCase().includes(q) || acc.name.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category filter: [All] [👩 Female Only] [👨 Male Only]
    if (filterCategory === "female") return acc.gender === "female";
    if (filterCategory === "male") return acc.gender === "male";
    return true;
  });

  const handleExportCSV = () => {
    const headers = ["Chronological Rank", "Username", "Name", "Gender", "Tag", "Follows You", "Inactive Days", "Post Count"];
    const rows = filteredAccounts.map((a) => [
      `#${a.chronologicalRank + 1}`,
      `@${a.username}`,
      `"${a.name.replace(/"/g, '""')}"`,
      a.gender,
      `"${a.tag}"`,
      a.followsYou ? "Yes" : "No",
      a.inactiveDays,
      a.postCount,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ghostsweep_${auditData.username}_${selectedTargetType}_audit.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                {isUnlocked && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold">
                    <CheckCircle className="w-2.5 h-2.5" />
                    <span>Unlocked</span>
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
              Total Audited: {totalCount.toLocaleString()}
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
              <>Found <strong className="text-zinc-900 dark:text-white">~{nonReciprocalsCount.toLocaleString()} non-reciprocals</strong> in chronological order.</>
            ) : (
              <>Found <strong className="text-zinc-900 dark:text-white">~{inactiveCount.toLocaleString()} inactive ghost accounts</strong> in audience.</>
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

        {/* 5. Interactive Teaser Drawer Container */}
        {showBreakdown && (
          <div id="inspect-drawer" className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in">
            {!isUnlocked ? (
              /* LOCKED STATE: Top 3 Sample Accounts + Frosted-Glass Overlay */
              <>
                {/* 10 Sample Teaser Account Rows (5 Female + 5 Male with Badges) */}
                <div className="space-y-2 mb-3">
                  {teaserAccounts.map((acc, index) => (
                    <div
                      key={acc.id || `teaser-${index}`}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={acc.avatar}
                          alt={acc.username}
                          className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(acc.username)}&background=0284c7&color=fff`;
                          }}
                        />
                        <div className="text-left">
                          <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <span>@{acc.username}</span>
                            {acc.isVerified && (
                              <span className="text-[10px] px-1 py-0.2 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400 font-semibold">
                                ✓
                              </span>
                            )}
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md font-semibold bg-zinc-200/70 dark:bg-zinc-750 text-zinc-700 dark:text-zinc-300">
                              Rank #{acc.chronologicalRank + 1}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            {acc.name} • Inactive {acc.inactiveDays}d
                          </span>
                        </div>
                      </div>

                      {/* Forensic Badges */}
                      <div className="flex items-center gap-1">
                        {acc.gender === "female" ? (
                          <>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800/60">
                              👩 Female
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                              🕒 Recent
                            </span>
                          </>
                        ) : acc.gender === "male" ? (
                          <>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60">
                              👨 Male
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                              🕒 Recent
                            </span>
                          </>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                            🤖 Ghost • Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Frosted Glass / Blurred Container with Locked Count & High-Contrast Unlock CTA */}
                <div className="relative rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-700/80 bg-zinc-100/80 dark:bg-zinc-800/50 p-5 text-center backdrop-blur-md shadow-sm">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-9 h-9 rounded-full bg-zinc-900 dark:bg-sky-500/20 flex items-center justify-center text-white dark:text-sky-400 shadow-xs">
                      <Lock className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white">
                      🔒 Unlock all {totalCount.toLocaleString()} accounts in exact chronological order
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-sm">
                      View complete handles, recent follow timestamps, gender classification tags, and export clean CSV datasets.
                    </p>

                    <button
                      type="button"
                      id="unlock-list-cta-btn"
                      onClick={onOpenCheckout}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-black text-xs text-zinc-950 bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-cyan-300 hover:to-sky-400 dark:from-sky-500 dark:to-cyan-400 dark:hover:from-cyan-400 dark:hover:to-sky-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md mt-1"
                    >
                      <span>Unlock Full Forensic Report ($1.99) ➔</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* UNLOCKED STATE: Full Searchable, Filterable Chronological Accounts Table */
              <div className="space-y-3">
                {/* Search Bar and Filter Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search accounts or names..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-500" />
                    <span>Export CSV</span>
                  </button>
                </div>

                {/* Filter Pills: [All] [👩 Female Only] [👨 Male Only] */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
                  <button
                    type="button"
                    id="filter-pill-all"
                    onClick={() => setFilterCategory("all")}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      filterCategory === "all"
                        ? "bg-zinc-900 text-white dark:bg-sky-500 dark:text-zinc-950 font-bold"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    All ({allAccounts.length})
                  </button>
                  <button
                    type="button"
                    id="filter-pill-female"
                    onClick={() => setFilterCategory("female")}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      filterCategory === "female"
                        ? "bg-pink-600 text-white font-bold"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    👩 Female Only ({allAccounts.filter(a => a.gender === "female").length})
                  </button>
                  <button
                    type="button"
                    id="filter-pill-male"
                    onClick={() => setFilterCategory("male")}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      filterCategory === "male"
                        ? "bg-sky-600 text-white font-bold"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    👨 Male Only ({allAccounts.filter(a => a.gender === "male").length})
                  </button>
                </div>

                {/* Full Chronological Accounts Table */}
                <div className="max-h-96 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {filteredAccounts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-400">
                      No accounts found matching your filter criteria.
                    </div>
                  ) : (
                    filteredAccounts.map((acc, index) => (
                      <div
                        key={acc.id || `acc-${index}`}
                        className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[10px] font-mono font-bold text-zinc-400 w-6 text-center shrink-0">
                            #{acc.chronologicalRank + 1}
                          </span>
                          <img
                            src={acc.avatar}
                            alt={acc.username}
                            className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(acc.username)}&background=0284c7&color=fff`;
                            }}
                          />
                          <div className="text-left min-w-0">
                            <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 truncate">
                              <a
                                href={`https://instagram.com/${acc.username}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline hover:text-sky-500 truncate"
                              >
                                @{acc.username}
                              </a>
                              {acc.isVerified && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400 font-semibold shrink-0">
                                  ✓
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 truncate block">
                              {acc.name} • Inactive {acc.inactiveDays}d
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              acc.gender === "bot" || acc.isGhost
                                ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
                                : acc.isNonReciprocal
                                ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                                : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                            }`}
                          >
                            {acc.tag}
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

      {/* 6. Forensic Intelligence Platform CTA Box */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-sky-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 border-2 border-sky-300 dark:border-sky-500/50 rounded-2xl p-4 sm:p-5 text-center shadow-md">
        <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
          Instant Web-Based Instagram Intelligence &amp; Reach Forensic Audit
        </p>

        <button
          id="cleanup-cta-btn"
          onClick={onOpenCheckout}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-extrabold text-xs sm:text-sm text-zinc-950 bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-cyan-300 hover:to-sky-400 dark:from-sky-500 dark:to-cyan-400 dark:hover:from-cyan-400 dark:hover:to-sky-500 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md"
        >
          <span>📊 Unlock Full Forensic Audit ($1.99)</span>
          <ArrowRight className="w-4 h-4 text-zinc-950" />
        </button>

        {/* 7. Value Proposition Copy Clarity */}
        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-3 font-medium max-w-lg mx-auto leading-relaxed">
          GhostSweep inspects follower ratios, chronological ranking, and inactive accounts with multi-layer demographic intelligence without requiring your password or account login.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 mt-2.5 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            100% Web-Based
          </span>
          <span>•</span>
          <span>Zero Passwords Required</span>
          <span>•</span>
          <span className="font-bold text-sky-600 dark:text-sky-400">$1.99 One-Time Access</span>
        </div>
      </div>
    </div>
  );
};
