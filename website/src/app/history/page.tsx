"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MinimalHeader } from "@/components/MinimalHeader";
import { MinimalFooter } from "@/components/MinimalFooter";
import { AuthModal } from "@/components/AuthModal";
import { CheckoutModal } from "@/components/CheckoutModal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { LegalModal, LegalModalType } from "@/components/LegalModal";
import { 
  Clock, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Lock, 
  CheckCircle,
  ArrowRight,
  User,
  AlertCircle,
  CreditCard
} from "lucide-react";
import { AuditHistoryEntry, UserPlan } from "@/lib/types";

export default function HistoryPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [unlockedAudits, setUnlockedAudits] = useState<string[]>([]);
  const [historyItems, setHistoryItems] = useState<AuditHistoryEntry[]>([]);
  const [userPlan, setUserPlan] = useState<UserPlan>("free");
  const [searchesUsed, setSearchesUsed] = useState<number>(0);
  const [searchLimit, setSearchLimit] = useState<number>(1);
  const [resetsAt, setResetsAt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>("theleeparsons");

  useEffect(() => {
    const savedTheme = localStorage.getItem("ghostsweep-theme");
    if (savedTheme) {
      setIsDark(savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ghostsweep-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ghostsweep-theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    loadUserHistory();
  }, []);

  const loadUserHistory = async () => {
    setIsLoading(true);
    const savedEmail = localStorage.getItem("gs_user_email");
    setUserEmail(savedEmail);

    if (savedEmail) {
      try {
        const [histRes, auditRes] = await Promise.all([
          fetch(`/api/user/history?email=${encodeURIComponent(savedEmail)}`),
          fetch(`/api/user/audits?email=${encodeURIComponent(savedEmail)}`),
        ]);

        const histData = await histRes.json();
        const auditData = await auditRes.json();

        if (histData.success && Array.isArray(histData.history)) {
          setHistoryItems(histData.history);
        }

        if (auditData.success) {
          setUnlockedAudits(auditData.unlockedAudits || []);
          setUserPlan(auditData.plan || "free");
          setSearchesUsed(auditData.searchesUsed ?? 0);
          setSearchLimit(auditData.searchLimit ?? (auditData.plan === "standard" ? 10 : auditData.plan === "unlimited" ? 30 : 1));
          if (auditData.resetsAt) setResetsAt(auditData.resetsAt);
        }
      } catch (err) {
        console.error("Failed to load user history:", err);
      }
    } else {
      // Guest local history fallback
      const guestSearches: string[] = JSON.parse(localStorage.getItem("gs_guest_searches") || "[]");
      const fallbackList: AuditHistoryEntry[] = guestSearches.map((username, idx) => ({
        id: `local_${idx}_${username}`,
        username,
        name: username,
        avatar: `/api/proxy-image?url=https%3A%2F%2Fui-avatars.com%2Fapi%2F%3Fname%3D${encodeURIComponent(username)}%26background%3D0284c7%26color%3Dfff`,
        isUnlocked: false,
        timestamp: new Date().toISOString(),
        targetType: "following",
      }));
      setHistoryItems(fallbackList);
      setSearchesUsed(guestSearches.length);
      setSearchLimit(1);
    }
    setIsLoading(false);
  };

  const handleSignOut = () => {
    setUserEmail(null);
    setUnlockedAudits([]);
    localStorage.removeItem("gs_user_email");
    localStorage.removeItem("gs_session_token");
    document.cookie = "gs_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    loadUserHistory();
  };

  const handleViewReport = (username: string, forceRefresh: boolean = false) => {
    const url = `/?username=${encodeURIComponent(username)}${forceRefresh ? "&forceRefresh=true" : ""}`;
    router.push(url);
  };

  const handleUnlockTarget = (username: string) => {
    setSelectedTarget(username);
    setIsCheckoutOpen(true);
  };

  const handleUpgradeClick = () => {
    setIsUpgradeOpen(true);
  };

  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const handleManageSubscription = async () => {
    if (!userEmail) return;
    setIsPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const json = await res.json();
      if (json.success && json.url) {
        window.location.href = json.url;
      } else if (json.cancelUrl) {
        if (confirm("Would you like to cancel your GhostSweep Pro recurring subscription? You will retain access until the end of your billing cycle.")) {
          const cancelRes = await fetch("/api/stripe/cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail }),
          });
          const cancelJson = await cancelRes.json();
          alert(cancelJson.message || "Subscription cancelled.");
          loadUserHistory();
        }
      } else {
        alert(json.error || "Unable to open billing portal.");
      }
    } catch (err: any) {
      alert("Billing portal error: " + err.message);
    } finally {
      setIsPortalLoading(false);
    }
  };

  const isWeeklyLimitReached = userPlan === "standard" && searchesUsed >= 10;
  const isFreeLimitReached = userPlan === "free" && searchesUsed >= 1;

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <MinimalHeader
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        userEmail={userEmail}
        unlockedCount={unlockedAudits.length}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 text-xs font-bold mb-2">
              <Clock className="w-3 h-3" />
              <span>Private Audit History</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              My Search History &amp; Saved Audits
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              All Instagram profiles investigated are securely stored under your account with 1-click re-scanning.
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-zinc-950 bg-sky-400 hover:bg-sky-300 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search New Account</span>
          </button>
        </div>

        {/* Plan & Search Usage Banner */}
        <div className="my-6 p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Current Plan:</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-md uppercase font-mono ${
                userPlan === "unlimited"
                  ? "bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-800"
                  : userPlan === "standard"
                  ? "bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 border border-sky-300 dark:border-sky-800"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              }`}>
                {userPlan === "unlimited" ? "GhostSweep Pro ($9.99/mo)" : userPlan === "standard" ? "Standard Plan ($3.99 One-Time)" : "Free Guest"}
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
              Weekly Searches: <strong>{searchesUsed} / {searchLimit === 999999 ? "∞" : searchLimit} used</strong>
              {userPlan === "standard" && " (10 searches/week included)"}
              {userPlan === "unlimited" && " (30 searches/week included)"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {userPlan === "unlimited" && (
              <button
                onClick={handleManageSubscription}
                disabled={isPortalLoading}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isPortalLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CreditCard className="w-3.5 h-3.5" />
                )}
                <span>Manage / Cancel Subscription</span>
              </button>
            )}

            {isWeeklyLimitReached && (
              <button
                onClick={handleUpgradeClick}
                className="px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 hover:from-purple-500 hover:to-amber-400 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Upgrade to Pro ($9.99/mo)</span>
              </button>
            )}

            {!userEmail && (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition-colors cursor-pointer"
              >
                Sign In to Save Permanently
              </button>
            )}
          </div>
        </div>

        {/* Audit List */}
        {isLoading ? (
          <div className="py-16 text-center text-xs text-zinc-400">
            <span className="inline-block w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading your saved audits...</p>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="py-16 text-center p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800">
            <Clock className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
              No audits saved yet
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-4">
              Enter any public Instagram handle on the homepage to start tracking their recent follows and mutual connections.
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-zinc-950 bg-sky-400 hover:bg-sky-300 transition-all cursor-pointer"
            >
              <span>Search an Account ➔</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {historyItems.map((item) => {
              const isUnlocked = item.isUnlocked || unlockedAudits.includes(item.username.toLowerCase());

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.avatar}
                      alt={item.username}
                      className="w-10 h-10 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.username)}&background=0284c7&color=fff`;
                      }}
                    />
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white text-sm">
                        <span className="truncate">@{item.username}</span>
                        {isUnlocked ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold">
                            <CheckCircle className="w-2.5 h-2.5" />
                            <span>Unlocked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-semibold">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Preview</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                        {item.name || item.username} &bull; Audited on {new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {!isUnlocked && (
                      <button
                        onClick={() => handleUnlockTarget(item.username)}
                        className="px-3 py-1.5 rounded-lg font-bold text-xs text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition-colors cursor-pointer"
                      >
                        Unlock ($3.99)
                      </button>
                    )}

                    <button
                      onClick={() => handleViewReport(item.username, false)}
                      className="px-3 py-1.5 rounded-lg font-bold text-xs text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3 text-sky-400" />
                      <span>View Report</span>
                    </button>

                    <button
                      onClick={() => handleViewReport(item.username, true)}
                      title="Run a fresh real-time scrape"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <MinimalFooter onOpenLegal={(type) => setLegalModalType(type)} />

      {/* Modals */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        targetUsername={selectedTarget}
        userEmail={userEmail || ""}
        onSuccessUnlock={() => {
          setIsCheckoutOpen(false);
          loadUserHistory();
        }}
        onOpenLegal={(type) => setLegalModalType(type)}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        userEmail={userEmail || ""}
        targetUsername={selectedTarget}
        onSuccessUpgrade={() => {
          setIsUpgradeOpen(false);
          loadUserHistory();
        }}
        onOpenLegal={(type) => setLegalModalType(type)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        userEmail={userEmail}
        unlockedAudits={unlockedAudits}
        onSelectUnlockedAccount={(handle) => {
          setIsAuthOpen(false);
          handleViewReport(handle);
        }}
        onLoginSuccess={(email, audits) => {
          setIsAuthOpen(false);
          setUserEmail(email);
          setUnlockedAudits(audits);
          loadUserHistory();
        }}
        onSignOut={handleSignOut}
      />

      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}
