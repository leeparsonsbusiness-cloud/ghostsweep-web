"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Ghost, 
  ShieldCheck, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Clock, 
  Users, 
  Filter, 
  Star, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  ExternalLink,
  ChevronRight,
  Shield,
  Search
} from "lucide-react";
import confetti from "canvas-confetti";

interface SampleAccount {
  id: string;
  username: string;
  name: string;
  avatar: string;
  gender: "male" | "female" | "other";
  followsYou: boolean;
  inactiveDays: number;
  postCount: number;
  engagement: "low" | "none" | "medium";
  whitelisted: boolean;
  unfollowed: boolean;
}

const INITIAL_ACCOUNTS: SampleAccount[] = [
  {
    id: "1",
    username: "crypto_apex_alpha",
    name: "Alex Vance • Crypto",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    gender: "male",
    followsYou: false,
    inactiveDays: 142,
    postCount: 12,
    engagement: "none",
    whitelisted: false,
    unfollowed: false,
  },
  {
    id: "2",
    username: "sophia.lifestyle.vibe",
    name: "Sophia Miller",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    gender: "female",
    followsYou: false,
    inactiveDays: 95,
    postCount: 44,
    engagement: "low",
    whitelisted: false,
    unfollowed: false,
  },
  {
    id: "3",
    username: "dropship_king_dan",
    name: "Dan • Ecom Master",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
    gender: "male",
    followsYou: false,
    inactiveDays: 210,
    postCount: 3,
    engagement: "none",
    whitelisted: false,
    unfollowed: false,
  },
  {
    id: "4",
    username: "emma_wanderlust_x",
    name: "Emma Davis",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
    gender: "female",
    followsYou: false,
    inactiveDays: 118,
    postCount: 29,
    engagement: "none",
    whitelisted: false,
    unfollowed: false,
  },
  {
    id: "5",
    username: "tech_growth_jay",
    name: "Jay Kumar",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    gender: "male",
    followsYou: true,
    inactiveDays: 12,
    postCount: 180,
    engagement: "medium",
    whitelisted: true,
    unfollowed: false,
  },
  {
    id: "6",
    username: "lucas_fit_daily",
    name: "Lucas Thorne",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    gender: "male",
    followsYou: false,
    inactiveDays: 88,
    postCount: 15,
    engagement: "low",
    whitelisted: false,
    unfollowed: false,
  },
  {
    id: "7",
    username: "mia_fashion_trends",
    name: "Mia Sterling",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    gender: "female",
    followsYou: false,
    inactiveDays: 165,
    postCount: 8,
    engagement: "none",
    whitelisted: false,
    unfollowed: false,
  },
  {
    id: "8",
    username: "nft_collector_mark",
    name: "Mark H.",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
    gender: "male",
    followsYou: false,
    inactiveDays: 310,
    postCount: 2,
    engagement: "none",
    whitelisted: false,
    unfollowed: false,
  },
  {
    id: "9",
    username: "chloe_daily_vlogs",
    name: "Chloe Bennett",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    gender: "female",
    followsYou: false,
    inactiveDays: 92,
    postCount: 31,
    engagement: "low",
    whitelisted: false,
    unfollowed: false,
  },
  {
    id: "10",
    username: "growth_hacker_eric",
    name: "Eric Vance",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
    gender: "male",
    followsYou: false,
    inactiveDays: 130,
    postCount: 19,
    engagement: "none",
    whitelisted: false,
    unfollowed: false,
  },
];

export const ExtensionSandbox: React.FC = () => {
  const [accounts, setAccounts] = useState<SampleAccount[]>(INITIAL_ACCOUNTS);
  const [activeTab, setActiveTab] = useState<"all" | "male" | "female" | "inactive" | "non-followers">("non-followers");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(INITIAL_ACCOUNTS.filter(a => !a.followsYou && !a.whitelisted).map(a => a.id))
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Automation Simulation States
  const [isRunning, setIsRunning] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentActionText, setCurrentActionText] = useState("Ready to start 10-batch cycle");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [batchCompleted, setBatchCompleted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter accounts according to tab & search
  const filteredAccounts = accounts.filter(acc => {
    if (searchQuery.trim()) {
      const match = acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    acc.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }

    if (activeTab === "male") return acc.gender === "male";
    if (activeTab === "female") return acc.gender === "female";
    if (activeTab === "inactive") return acc.inactiveDays >= 90;
    if (activeTab === "non-followers") return !acc.followsYou;
    return true;
  });

  const toggleSelect = (id: string) => {
    if (isRunning) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (isRunning) return;
    const currentTabIds = filteredAccounts.filter(a => !a.whitelisted && !a.unfollowed).map(a => a.id);
    const allSelected = currentTabIds.every(id => selectedIds.has(id));

    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allSelected) {
        currentTabIds.forEach(id => next.delete(id));
      } else {
        currentTabIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const toggleWhitelist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAccounts(prev => prev.map(a => {
      if (a.id === id) {
        const nextWhitelisted = !a.whitelisted;
        if (nextWhitelisted) {
          setSelectedIds(s => {
            const copy = new Set(s);
            copy.delete(id);
            return copy;
          });
        }
        return { ...a, whitelisted: nextWhitelisted };
      }
      return a;
    }));
  };

  // Start Simulated Batch Unfollow
  const handleStartBatch = () => {
    if (isRunning) {
      setIsRunning(false);
      setCurrentActionText("Batch paused by user");
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const queue = filteredAccounts.filter(a => selectedIds.has(a.id) && !a.unfollowed && !a.whitelisted);
    if (queue.length === 0) {
      setCurrentActionText("No eligible accounts selected in this tab");
      return;
    }

    setIsRunning(true);
    setBatchCompleted(false);
    setCurrentProgress(0);

    let processed = 0;
    const targetCount = Math.min(queue.length, 10);

    const step = () => {
      if (processed >= targetCount) {
        setIsRunning(false);
        setBatchCompleted(true);
        setCurrentActionText(`✓ Batch complete! Safely unfollowed ${targetCount} accounts.`);
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 }
        });
        return;
      }

      const currentAcc = queue[processed];
      setCurrentActionText(`Simulating human scroll & unfollowing @${currentAcc.username}...`);

      // Unfollow account after small delay
      setTimeout(() => {
        setAccounts(prev => prev.map(a => a.id === currentAcc.id ? { ...a, unfollowed: true } : a));
        processed++;
        setCurrentProgress(processed);

        if (processed < targetCount) {
          let sec = 3;
          setCountdown(sec);
          const cdInterval = setInterval(() => {
            sec--;
            if (sec > 0) {
              setCountdown(sec);
              setCurrentActionText(`Safety Jitter Delay: Waiting ${sec}s for next action...`);
            } else {
              clearInterval(cdInterval);
              setCountdown(null);
              step();
            }
          }, 600);
        } else {
          step();
        }
      }, 700);
    };

    step();
  };

  const handleReset = () => {
    setIsRunning(false);
    setBatchCompleted(false);
    setCurrentProgress(0);
    setCountdown(null);
    setCurrentActionText("Ready to start 10-batch cycle");
    setAccounts(INITIAL_ACCOUNTS);
    setSelectedIds(new Set(INITIAL_ACCOUNTS.filter(a => !a.followsYou && !a.whitelisted).map(a => a.id)));
  };

  return (
    <section id="sandbox" className="py-20 bg-background relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-accent-sky/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-sky/10 border border-accent-sky/30 text-accent-sky text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Interactive Extension Sandbox
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Test GhostSweep Right in Your Browser
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Experience how the extension segments demographic groups, preserves your whitelisted 
            friends, and executes safe 10-account batch cycles with human-like delays.
          </p>
        </div>

        {/* Realistic Chrome Browser Mockup */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-border/80 bg-surface/90 shadow-2xl shadow-black/50 overflow-hidden backdrop-blur-xl">
          {/* Browser Header Bar */}
          <div className="bg-surface border-b border-border/80 px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            {/* URL Bar */}
            <div className="flex-1 max-w-md bg-card/80 border border-border/70 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300">https://</span>
              <span className="text-white">instagram.com</span>
              <span className="text-slate-500">/your_handle/following</span>
            </div>

            {/* GhostSweep Extension Icon pinned */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent-sky/10 border border-accent-sky/30 text-accent-sky text-xs font-bold shadow-glow-sm">
                <Ghost className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">GhostSweep v2.4</span>
              </div>
            </div>
          </div>

          {/* Extension Window Content */}
          <div className="p-4 sm:p-6 bg-card/40">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              {/* Account Status Pill */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-sky/20 to-accent-indigo/20 border border-accent-sky/40 flex items-center justify-center text-accent-sky">
                  <Ghost className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">GhostSweep Engine</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Client Session Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">42 Following Accounts Audited</p>
                </div>
              </div>

              {/* Safety Cooldown Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface/80 border border-border text-xs text-slate-300">
                <Clock className="w-3.5 h-3.5 text-accent-sky" />
                <span>Rate Engine: <strong className="text-white">10 / batch (15s safe delay)</strong></span>
              </div>
            </div>

            {/* Demographic Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 my-4">
              <button
                onClick={() => setActiveTab("non-followers")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "non-followers"
                    ? "bg-accent-sky text-slate-950 shadow-glow-sm"
                    : "bg-surface/80 hover:bg-surface text-slate-300 border border-border"
                }`}
              >
                🚫 Non-Followers ({accounts.filter(a => !a.followsYou).length})
              </button>

              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "all"
                    ? "bg-accent-sky text-slate-950 shadow-glow-sm"
                    : "bg-surface/80 hover:bg-surface text-slate-300 border border-border"
                }`}
              >
                All Accounts ({accounts.length})
              </button>

              <button
                onClick={() => setActiveTab("male")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "male"
                    ? "bg-accent-sky text-slate-950 shadow-glow-sm"
                    : "bg-surface/80 hover:bg-surface text-slate-300 border border-border"
                }`}
              >
                👨 Male Demographics ({accounts.filter(a => a.gender === "male").length})
              </button>

              <button
                onClick={() => setActiveTab("female")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "female"
                    ? "bg-accent-sky text-slate-950 shadow-glow-sm"
                    : "bg-surface/80 hover:bg-surface text-slate-300 border border-border"
                }`}
              >
                👩 Female Demographics ({accounts.filter(a => a.gender === "female").length})
              </button>

              <button
                onClick={() => setActiveTab("inactive")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "inactive"
                    ? "bg-accent-sky text-slate-950 shadow-glow-sm"
                    : "bg-surface/80 hover:bg-surface text-slate-300 border border-border"
                }`}
              >
                👻 Inactive &gt;90 Days ({accounts.filter(a => a.inactiveDays >= 90).length})
              </button>
            </div>

            {/* List Action Bar */}
            <div className="flex items-center justify-between py-2 px-3 bg-surface/50 rounded-xl border border-border mb-3 text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSelectAll}
                  disabled={isRunning}
                  className="font-bold text-accent-sky hover:underline"
                >
                  Select / Deselect Tab Accounts
                </button>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">
                  <strong className="text-white">{selectedIds.size}</strong> selected for unfollow
                </span>
              </div>

              <div className="text-slate-400 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-accent-gold" />
                <span className="hidden sm:inline">Click star to Whitelist</span>
              </div>
            </div>

            {/* Follower List (Scrollable) */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {filteredAccounts.map((account) => {
                const isSelected = selectedIds.has(account.id);
                return (
                  <div
                    key={account.id}
                    onClick={() => toggleSelect(account.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      account.unfollowed
                        ? "bg-slate-950/40 border-border/40 opacity-50"
                        : isSelected
                        ? "bg-surface border-accent-sky/40 shadow-sm"
                        : "bg-surface/60 border-border hover:border-slate-600"
                    }`}
                  >
                    {/* Left: Checkbox + Avatar + Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected && !account.unfollowed && !account.whitelisted}
                        disabled={account.unfollowed || account.whitelisted || isRunning}
                        onChange={() => {}}
                        className="w-4 h-4 rounded bg-card border-border text-accent-sky focus:ring-0 cursor-pointer accent-accent-sky"
                      />

                      <img
                        src={account.avatar}
                        alt={account.username}
                        className="w-9 h-9 rounded-full object-cover border border-border shrink-0"
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs sm:text-sm font-bold truncate ${account.unfollowed ? "line-through text-slate-500" : "text-white"}`}>
                            @{account.username}
                          </span>
                          {account.gender === "male" && <span className="text-xs">👨</span>}
                          {account.gender === "female" && <span className="text-xs">👩</span>}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
                          <span>{account.name}</span>
                          <span>•</span>
                          <span className={account.inactiveDays > 90 ? "text-amber-400" : "text-slate-400"}>
                            Inactive {account.inactiveDays}d
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Badges & Whitelist Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      {account.unfollowed ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          Unfollowed ✓
                        </span>
                      ) : account.whitelisted ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-gold/10 text-accent-gold border border-accent-gold/30 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-accent-gold" />
                          Whitelisted
                        </span>
                      ) : (
                        <>
                          {!account.followsYou && (
                            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              Doesn&apos;t follow back
                            </span>
                          )}
                          <button
                            onClick={(e) => toggleWhitelist(account.id, e)}
                            title="Whitelist account"
                            className="p-1.5 rounded-lg hover:bg-card border border-transparent hover:border-border text-slate-400 hover:text-accent-gold transition-colors"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Execution Bar */}
            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
              {/* Progress & Live Action Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-400">Status:</span>
                  <span className="font-bold text-accent-sky font-mono animate-pulse">
                    {currentActionText}
                  </span>
                </div>

                <div className="text-slate-400 font-mono">
                  Batch: <strong className="text-white">{currentProgress}</strong> / 10 accounts
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-gradient-to-r from-accent-sky via-cyan-300 to-accent-indigo transition-all duration-300"
                  style={{ width: `${(currentProgress / 10) * 100}%` }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-surface hover:bg-card border border-border transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartBatch}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-glow-sm ${
                      isRunning
                        ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                        : "bg-gradient-to-r from-accent-sky via-cyan-300 to-accent-sky text-slate-950 hover:from-cyan-300 hover:to-accent-sky hover:scale-105"
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pause Simulation</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>Start 10-Batch Unfollow</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
