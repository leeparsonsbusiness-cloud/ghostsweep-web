"use client";

import React, { useState } from "react";
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
  LogIn
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState(userEmail || "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

    const endpoint = activeTab === "register" ? "/api/auth/register" : "/api/auth/login";

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
        setSuccessMessage(data.message || "Successfully authenticated!");
        onLoginSuccess(email.trim(), data.unlockedAudits || []);
        setTimeout(() => {
          onClose();
        }, 1200);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl overflow-hidden transition-colors">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Member Activity Vault
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Access your unlocked Instagram forensic audits &amp; reports
            </p>
          </div>
        </div>

        {/* List of previously unlocked accounts if authenticated */}
        {userEmail && unlockedAudits.length > 0 && (
          <div className="mb-5 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-750 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                Unlocked Reports ({unlockedAudits.length})
              </span>
              <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[150px]">
                {userEmail}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {unlockedAudits.map((acc) => (
                <button
                  key={acc}
                  onClick={() => onSelectUnlockedAccount(acc)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-700 text-sky-600 dark:text-sky-400 border border-zinc-200 dark:border-zinc-600 hover:border-sky-500 transition-all flex items-center gap-1"
                >
                  <span>@{acc}</span>
                  <Sparkles className="w-3 h-3 text-sky-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sign In vs Register Tabs */}
        <div className="flex p-1 mb-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => {
              setActiveTab("signin");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "signin"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "register"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 text-left">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Account Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input
                id="auth-email-input"
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
              <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input
                id="auth-password-input"
                type="password"
                placeholder={activeTab === "register" ? "Create a password or 4-digit PIN" : "Enter your password or PIN"}
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
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-zinc-950 bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-cyan-300 hover:to-sky-400 dark:from-sky-500 dark:to-cyan-400 dark:hover:from-cyan-400 dark:hover:to-sky-500 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{activeTab === "register" ? "Create Account & Access Vault" : "Sign In to Vault"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-[10px] text-zinc-400 text-center">
          Encrypted credentials with immediate instant access to your unlocked reports.
        </p>
      </div>
    </div>
  );
};
