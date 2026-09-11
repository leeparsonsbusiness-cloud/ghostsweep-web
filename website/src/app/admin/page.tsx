"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  TrendingUp, 
  Search, 
  Lock, 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  Monitor, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  Eye,
  Activity,
  ArrowRight
} from "lucide-react";

interface AnalyticsStats {
  timeframe: "today" | "7d" | "all";
  liveViewers: number;
  summary: {
    totalVisitors: number;
    totalPageViews: number;
    totalSearches: number;
    paywallViews: number;
    checkoutClicks: number;
    totalPurchases: number;
    totalRevenue: number;
    revenueStandard: number;
    revenueUnlimited: number;
    standardCount: number;
    unlimitedCount: number;
    overallConversionRate: string;
  };
  funnel: {
    step: number;
    name: string;
    count: number;
    rate: string;
    subtext: string;
  }[];
  topTargets: { username: string; count: number }[];
  trafficSources: { source: string; count: number }[];
  deviceBreakdown: {
    mobile: string;
    desktop: string;
    tablet: string;
  };
  recentFeed: {
    id: string;
    type: string;
    description: string;
    target?: string;
    device?: string;
    referrer?: string;
    time: string;
    amount?: number;
  }[];
}

export default function AdminAnalyticsPage() {
  const [passkey, setPasskey] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"today" | "7d" | "all">("today");
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  // Check saved passkey on mount
  useEffect(() => {
    const saved = localStorage.getItem("gs_admin_passkey");
    const userEmail = localStorage.getItem("gs_user_email");
    if (saved === "332844" || saved === "dev" || userEmail === "leeparsonsbusiness@gmail.com") {
      setPasskey(saved || "332844");
      setIsAuthenticated(true);
      fetchStats(saved || "332844", timeframe);
    }
  }, []);

  // Polling for live viewers & real-time stats every 15s
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      fetchStats(passkey, timeframe, true);
    }, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, passkey, timeframe]);

  const fetchStats = async (key: string, tf: "today" | "7d" | "all", isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics/stats?timeframe=${tf}&passkey=${encodeURIComponent(key)}`);
      const json = await res.json();
      if (json.success) {
        setStats(json);
        setIsAuthenticated(true);
        setAuthError(null);
        setLastRefreshed(new Date().toLocaleTimeString());
        localStorage.setItem("gs_admin_passkey", key);
      } else {
        setAuthError(json.error || "Invalid passcode.");
      }
    } catch (err: any) {
      setAuthError("Failed to connect to analytics server.");
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStats(passkey, timeframe);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mx-auto mb-5">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-center text-white mb-2">GhostSweeper Executive Admin</h1>
          <p className="text-xs text-slate-400 text-center mb-6">
            Private dashboard for live viewer counts, conversion funnels, and revenue metrics.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Admin Passkey / PIN
              </label>
              <input
                type="password"
                placeholder="Enter 6-digit access PIN"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg text-center">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !passkey}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
            >
              {isLoading ? "Verifying Access..." : "Unlock Analytics Dashboard"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-400">
              ← Return to GhostSweeper
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const s = stats?.summary;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500/20 pb-24">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-white font-black tracking-tight text-lg">
            <span className="text-sky-400">ghostsweep</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase font-mono">
              Admin Pulse
            </span>
          </Link>
        </div>

        {/* Live Active Viewers Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-inner">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>{stats?.liveViewers || 1} Active Viewers Right Now</span>
          </div>

          {/* Timeframe selector */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            {(["today", "7d", "all"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  setTimeframe(tf);
                  fetchStats(passkey, tf);
                }}
                className={`px-3 py-1 rounded-md font-medium capitalize transition-colors ${
                  timeframe === tf ? "bg-sky-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                {tf === "today" ? "Today" : tf === "7d" ? "Past 7 Days" : "All Time"}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchStats(passkey, timeframe)}
            disabled={isLoading}
            title="Refresh statistics"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-sky-400" : ""}`} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Live Viewers */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Live Viewers</span>
              <Eye className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{stats?.liveViewers || 1}</div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Real-time browsing
            </div>
          </div>

          {/* Total Visitors */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Unique Visitors</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{s?.totalVisitors || 0}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">{s?.totalPageViews || 0} page views</div>
          </div>

          {/* Searches */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Searches</span>
              <Search className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{s?.totalSearches || 0}</div>
            <div className="text-[11px] text-indigo-400 font-medium mt-1">
              {stats?.funnel[1]?.rate || "0%"} search rate
            </div>
          </div>

          {/* Paywall Views */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Paywall Views</span>
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{s?.paywallViews || 0}</div>
            <div className="text-[11px] text-amber-400 font-medium mt-1">
              {s?.checkoutClicks || 0} checkout clicks
            </div>
          </div>

          {/* Paid Conversions */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Conversions</span>
              <CreditCard className="w-4 h-4 text-fuchsia-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{s?.totalPurchases || 0}</div>
            <div className="text-[11px] text-fuchsia-400 font-medium mt-1">
              {s?.overallConversionRate || "0%"} conv. rate
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors bg-gradient-to-br from-slate-900/80 to-emerald-950/20">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Gross Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">${s?.totalRevenue?.toFixed(2) || "0.00"}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              ${s?.revenueStandard} ($3.99) • ${s?.revenueUnlimited} ($9.99)
            </div>
          </div>
        </div>

        {/* End-to-End Conversion Funnel */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-sky-400" />
                Conversion Funnel Performance
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Visualizing user flow from initial landing to paid \$3.99 / \$9.99 transactions.
              </p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono font-bold">
              Overall: {s?.overallConversionRate}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {stats?.funnel.map((step, idx) => {
              const maxCount = stats.funnel[0]?.count || 1;
              const barHeightPct = Math.max(15, Math.round((step.count / maxCount) * 100));
              return (
                <div key={step.step} className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>Step {step.step}</span>
                      <span className="font-bold text-sky-400">{step.rate}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-200 line-clamp-1">{step.name}</div>
                    <div className="text-2xl font-black text-white my-2">{step.count}</div>
                  </div>

                  <div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-800/60 h-2 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 4
                            ? "bg-emerald-400"
                            : idx === 3
                            ? "bg-fuchsia-400"
                            : idx === 2
                            ? "bg-amber-400"
                            : idx === 1
                            ? "bg-indigo-400"
                            : "bg-sky-400"
                        }`}
                        style={{ width: `${barHeightPct}%` }}
                      ></div>
                    </div>
                    <div className="text-[11px] text-slate-500">{step.subtext}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intelligence Split: Top Targets, Referrers, Devices */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 10 Searched Targets */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-sky-400" />
              Top Searched Profiles
            </h3>

            {stats?.topTargets && stats.topTargets.length > 0 ? (
              <div className="divide-y divide-slate-800/60 space-y-2 flex-1">
                {stats.topTargets.map((item, idx) => (
                  <div key={item.username} className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500 w-4">{idx + 1}.</span>
                      <span className="text-xs font-semibold text-white">@{item.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                        {item.count} searches
                      </span>
                      <Link
                        href={`/?target=${item.username}`}
                        target="_blank"
                        className="text-slate-500 hover:text-sky-400 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500 py-8">
                No profiles searched in this period yet.
              </div>
            )}
          </div>

          {/* Traffic Sources */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-indigo-400" />
              Traffic Sources & Referrers
            </h3>

            <div className="space-y-3 flex-1">
              {stats?.trafficSources.map((item) => (
                <div key={item.source} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">{item.source}</span>
                    <span className="text-slate-400 font-mono">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(5, (item.count / (stats.summary.totalPageViews || 1)) * 100))}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Smartphone className="w-4 h-4 text-fuchsia-400" />
                Device Breakdown
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Most viral Instagram forensics traffic arrives via mobile (TikTok/IG bio links).
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-center">
                  <Smartphone className="w-6 h-6 text-fuchsia-400 mx-auto mb-2" />
                  <div className="text-2xl font-black text-white">{stats?.deviceBreakdown.mobile || "0%"}</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">Mobile Traffic</div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-center">
                  <Monitor className="w-6 h-6 text-sky-400 mx-auto mb-2" />
                  <div className="text-2xl font-black text-white">{stats?.deviceBreakdown.desktop || "0%"}</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">Desktop Traffic</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-500">
                Tablet: {stats?.deviceBreakdown.tablet || "0%"}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Live Activity Audit Feed */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Live Activity Stream
            </h3>
            <span className="text-[11px] text-slate-500">
              Updated {lastRefreshed || "just now"} (auto-refreshes every 15s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Event</th>
                  <th className="pb-3 font-semibold">Target / Details</th>
                  <th className="pb-3 font-semibold">Device</th>
                  <th className="pb-3 font-semibold">Source</th>
                  <th className="pb-3 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {stats?.recentFeed && stats.recentFeed.length > 0 ? (
                  stats.recentFeed.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-2.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                            ev.type === "PURCHASE_COMPLETED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : ev.type === "CHECKOUT_CLICKED"
                              ? "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30"
                              : ev.type === "PAYWALL_VIEWED"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : ev.type === "SEARCH_INITIATED"
                              ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {ev.type}
                        </span>
                      </td>
                      <td className="py-2.5 font-medium text-slate-200">
                        {ev.description}
                        {ev.amount ? ` ($${ev.amount})` : ""}
                      </td>
                      <td className="py-2.5 text-slate-400 capitalize">{ev.device || "mobile"}</td>
                      <td className="py-2.5 text-slate-400">{ev.referrer || "Direct"}</td>
                      <td className="py-2.5 text-slate-500 text-right font-mono">
                        {new Date(ev.time).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      Waiting for incoming traffic events...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
