"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  X, 
  Mail, 
  Lock, 
  ArrowRight, 
  Check, 
  Sparkles, 
  UserCheck, 
  AlertCircle,
  KeyRound,
  UserPlus,
  LogIn,
  History,
  Search,
  ShieldCheck,
  Crown,
  LogOut,
  Ban
} from "lucide-react";
import { AuditHistoryEntry, isVipEmail } from "@/lib/types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  unlockedAudits: string[];
  onSelectUnlockedAccount: (username: string) => void;
  onLoginSuccess: (email: string, unlockedAudits: string[]) => void;
  onSignOut?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  unlockedAudits,
  onSelectUnlockedAccount,
  onLoginSuccess,
  onSignOut,
}) => {
  const [modalTab, setModalTab] = useState<"history" | "account">("history");
  const [activeAuthTab, setActiveAuthTab] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState(userEmail || "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyList, setHistoryList] = useState<AuditHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showNahShortyPopup, setShowNahShortyPopup] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (!isOpen) {
      setShowNahShortyPopup(false);
      setErrorMessage("");
      setSuccessMessage("");
      return;
    }

    if (userEmail) {
      setEmail(userEmail);
      setModalTab("history");
    } else {
      setEmail("");
      setPassword("");
    }
  }, [isOpen, userEmail]);

  // Load audit history strictly when user is logged in
  useEffect(() => {
    if (!isOpen || !userEmail) {
      setHistoryList([]);
      return;
    }

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const res = await fetch(`/api/user/history?email=${encodeURIComponent(userEmail)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          setHistoryList(data.history);
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [isOpen, userEmail, unlockedAudits]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawEmail = (formData.get("email") as string) || email;
    const rawPass = (formData.get("password") as string) || password;
    const cleanEmail = rawEmail.trim().toLowerCase();

    // Check for blocked email (jyacinda@gmail.com)
    if (cleanEmail === "jyacinda@gmail.com" || cleanEmail.includes("jyacinda")) {
      setShowNahShortyPopup(true);
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    const endpoint = activeAuthTab === "register" ? "/api/auth/register" : "/api/auth/login";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: password.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.blocked || data.error === "Nah shorty.") {
        setShowNahShortyPopup(true);
        return;
      }

      if (data.success) {
        if (data.token) {
          localStorage.setItem("gs_session_token", data.token);
        }
        setSuccessMessage(data.message || "Successfully authenticated!");
        onLoginSuccess(cleanEmail, data.unlockedAudits || []);
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setErrorMessage(data.error || "Authentication failed. Please check your details.");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMessage("Network error during sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAccount = (uname: string) => {
    onSelectUnlockedAccount(uname);
    onClose();
  };

  const isVip = isVipEmail(userEmail);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl overflow-hidden transition-colors">
        
        {/* POPUP: "Nah shorty." Block Modal Overlay */}
        {showNahShortyPopup && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mb-4 text-rose-500 animate-bounce">
              <Ban className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-rose-400 tracking-tight mb-2">
              Nah shorty.
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs mb-6">
              Account registration and sign in is not permitted for this email address.
            </p>
            <button
              type="button"
              id="nah-shorty-dismiss-btn"
              onClick={() => {
                setShowNahShortyPopup(false);
                setEmail("");
                setPassword("");
              }}
              className="py-2.5 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all hover:scale-105 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative w-9 h-9 shrink-0">
            <Image
              src="/logo.png"
              alt="GhostSweep Logo"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span>{userEmail ? "Member Activity Vault" : "Sign In to GhostSweep"}</span>
              {isVip && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" /> VIP
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {userEmail ? `Signed in as ${userEmail}` : "Access your unlocked reports & search history"}
            </p>
          </div>
        </div>

        {/* CASE A: USER IS LOGGED IN -> Show History & Account Tabs */}
        {userEmail ? (
          <div>
            {/* Primary Navigation Tabs */}
            <div className="flex p-1 mb-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-750">
              <button
                type="button"
                onClick={() => setModalTab("history")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  modalTab === "history"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                <History className="w-3.5 h-3.5 text-sky-500" />
                <span>Search History ({historyList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("account")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  modalTab === "account"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-sky-500" />
                <span>Account &amp; Plan</span>
              </button>
            </div>

            {/* TAB 1: SEARCH & AUDIT HISTORY */}
            {modalTab === "history" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pb-1 border-b border-zinc-200 dark:border-zinc-800">
                  <span>Recently Audited Accounts</span>
                  <span className="text-[11px] font-mono">1-Click Instant Report</span>
                </div>

                {isLoadingHistory ? (
                  <div className="py-8 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    <span>Loading your search history...</span>
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="py-8 text-center rounded-xl bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 p-4">
                    <Search className="w-6 h-6 text-zinc-400 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No Audits in History Yet</p>
                    <p className="text-[11px] text-zinc-400 mt-1">Search any Instagram handle on the homepage to start building your history vault.</p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {historyList.map((item) => (
                      <div
                        key={item.id || item.username}
                        onClick={() => handleSelectAccount(item.username)}
                        className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-transparent hover:border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={item.avatar}
                            alt={item.username}
                            className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.username)}&background=0284c7&color=fff`;
                            }}
                          />
                          <div className="text-left min-w-0">
                            <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5 truncate">
                              <span>@{item.username}</span>
                              {(isVip || item.isUnlocked) && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                                  Unlocked 🔓
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • {item.targetType}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-semibold text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ACCOUNT & PLAN */}
            {modalTab === "account" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-750">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-700">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Account Email</span>
                    <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white truncate max-w-[200px]">{userEmail}</span>
                  </div>

                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-700">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Current Plan</span>
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                      {isVip ? (
                        <span className="text-amber-300 font-black flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5" /> VIP Founder Unlimited ($0/mo)
                        </span>
                      ) : (
                        <span>Standard Active ($3.99/mo)</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Unlocked Reports</span>
                    <span className="text-xs font-bold text-emerald-500 font-mono">
                      {isVip ? "Unlimited All Profiles 👑" : `${unlockedAudits.length} Accounts`}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-xs text-sky-700 dark:text-sky-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>Your account credentials and reports are securely saved.</span>
                </div>

                {onSignOut && (
                  <button
                    type="button"
                    onClick={() => {
                      onSignOut();
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Account</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* CASE B: USER IS NOT LOGGED IN -> Show Clean Sign In / Create Account Directly (Zero History) */
          <div>
            <div className="flex p-1 mb-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setActiveAuthTab("signin")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeAuthTab === "signin"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-sky-400" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAuthTab("register")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeAuthTab === "register"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 text-sky-400" />
                <span>Create Account</span>
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    id="auth-email-input"
                    name="email"
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Password or Instant Access PIN
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    id="auth-password-input"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={isLoading}
                onClick={(e) => {
                  const inputVal = (document.getElementById("auth-email-input") as HTMLInputElement)?.value || email;
                  if (inputVal && inputVal.toLowerCase().includes("jyacinda")) {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowNahShortyPopup(true);
                  }
                }}
                className="w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm text-zinc-950 bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 hover:from-cyan-300 hover:to-sky-400 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <>
                    <span>{activeAuthTab === "register" ? "Create Account & Sign In ➔" : "Sign In to Vault ➔"}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
