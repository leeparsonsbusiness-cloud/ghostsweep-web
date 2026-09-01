"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  X, 
  Mail, 
  ArrowRight, 
  Check, 
  Lock, 
  Sparkles, 
  UserCheck, 
  AlertCircle,
  ExternalLink
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
  const [email, setEmail] = useState(userEmail || "");
  const [isSending, setIsSending] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [magicUrl, setMagicUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setErrorMessage("");
    setIsSending(true);

    try {
      // 1. Request magic link
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setMagicSent(true);
        if (data.magicUrl) setMagicUrl(data.magicUrl);

        // Also verify directly for immediate local access
        const verifyRes = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), token: data.token }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          onLoginSuccess(verifyData.email, verifyData.unlockedAudits || []);
        }
      } else {
        setErrorMessage(data.error || "Failed to generate sign-in link.");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMessage("Network error during sign-in. Please try again.");
    } finally {
      setIsSending(false);
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
              Member Access &amp; Audits
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Sign in to view your previously unlocked profile reports
            </p>
          </div>
        </div>

        {/* List of previously unlocked accounts if authenticated */}
        {userEmail && unlockedAudits.length > 0 && (
          <div className="mb-5 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-750 text-left">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              <span>Unlocked Reports ({unlockedAudits.length})</span>
              <span className="text-emerald-500 flex items-center gap-1 font-semibold normal-case">
                <UserCheck className="w-3.5 h-3.5" />
                Active
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {unlockedAudits.map((acc) => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => {
                    onSelectUnlockedAccount(acc);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sky-600 dark:text-sky-400 hover:border-sky-500 transition-all hover:scale-[1.02]"
                >
                  <span>@{acc}</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!magicSent ? (
          <form onSubmit={handleSendMagicLink} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Account Email Address
              </label>
              <div className="relative">
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors placeholder:text-zinc-400"
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isSending}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-zinc-900 hover:bg-black dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-zinc-950 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isSending ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Verifying Account...
                </span>
              ) : (
                <>
                  <span>Sign In with Magic Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-500 flex items-center justify-center mx-auto mb-2.5">
              <Check className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Authenticated &amp; Synced!
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Signed in as <strong className="text-zinc-900 dark:text-white">{email}</strong>.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition-colors"
            >
              Done / Return to Auditor
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
