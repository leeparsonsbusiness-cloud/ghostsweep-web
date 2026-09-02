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
  ExternalLink,
  ShieldCheck,
  Zap
} from "lucide-react";
import { AuditHistoryEntry } from "@/lib/db";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  unlockedAudits: string[];
  onSelectUnlockedAccount: (username: string) => void;
  onLoginSuccess: (email: string, unlockedAudits: string[]) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  unlockedAudits,
  onSelectUnlockedAccount,
  onLoginSuccess,
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

  // Load audit history whenever modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const activeEmail = userEmail || localStorage.getItem("gs_user_email");
        const res = await fetch(`/api/user/history${activeEmail ? `?email=${encodeURIComponent(activeEmail)}` : ""}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          setHistoryList(data.history);
        } else {
          // Fallback to local storage recent searches if guest
          const localSearches: string[] = JSON.parse(localStorage.getItem("gs_guest_searches") || "[]");
          const localEntries: AuditHistoryEntry[] = localSearches.map((uname, idx) => ({
            id: `local_${idx}`,
            username: uname,
            name: uname,
            avatar: `/api/proxy-image?url=https%3A%2F%2Fui-avatars.com%2Fapi%2F%3Fname%3D${encodeURIComponent(uname)}%26background%3D0284c7%26color%3Dfff`,
            isUnlocked: unlockedAudits.includes(uname.toLowerCase()),
            timestamp: new Date().toISOString(),
            targetType: "following",
          }));
          setHistoryList(localEntries);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
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
          email: email.trim(),
          password: password.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.token) {
          localStorage.setItem("gs_session_token", data.token);
        }
        setSuccessMessage(data.message || "Successfully authenticated!");
        onLoginSuccess(email.trim(), data.unlockedAudits || []);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl overflow-hidden transition-colors">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
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
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Forensic Activity Center
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {userEmail ? `Logged in as ${userEmail}` : "Track search history & manage unlocked reports"}
            </p>
          </div>
        </div>

        {/* Primary Navigation Tabs: History vs Account */}
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
            <span>{userEmail ? "Account & Plan" : "Sign In / Register"}</span>
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
                    className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all cursor-pointer"
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
                          {item.isUnlocked && (
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

        {/* TAB 2: ACCOUNT & SIGN IN */}
        {modalTab === "account" && (
          <div>
            {userEmail ? (
              /* Already Logged In Details */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-750">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-700">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Account Email</span>
                    <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">{userEmail}</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Unlocked Reports</span>
                    <span className="text-xs font-bold text-emerald-500 font-mono">{unlockedAudits.length} Accounts</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-xs text-sky-700 dark:text-sky-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>Your unlocked audits and account limits are active and saved.</span>
                </div>
              </div>
            ) : (
              /* Sign In / Register Form */
              <div>
                <div className="flex p-1 mb-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setActiveAuthTab("signin")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeAuthTab === "signin"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveAuthTab("register")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeAuthTab === "register"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
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
                    type="submit"
                    disabled={isLoading}
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
        )}
      </div>
    </div>
  );
};
