"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  X, 
  Zap, 
  Infinity as InfinityIcon, 
  Check, 
  Sparkles, 
  ArrowRight,
  AlertCircle,
  CreditCard,
  Lock
} from "lucide-react";
import confetti from "canvas-confetti";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  targetUsername?: string;
  onSuccessUpgrade: (email: string) => void;
  onOpenLegal: (type: "terms" | "privacy" | "refund") => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  targetUsername,
  onSuccessUpgrade,
  onOpenLegal,
}) => {
  const [email, setEmail] = useState(userEmail || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setErrorMessage("");
    setIsProcessing(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          plan: "unlimited",
          target_username: targetUsername || "theleeparsons",
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.url) {
          window.location.href = data.url;
          return;
        }

        onSuccessUpgrade(email.trim());
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
        onClose();
      } else {
        setErrorMessage(data.error || "Failed to initiate upgrade. Please try again.");
      }
    } catch (err) {
      console.error("Upgrade error:", err);
      setErrorMessage("Network error during upgrade checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl overflow-hidden transition-colors">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shrink-0">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span>Monthly Limit Reached</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 font-bold border border-amber-300 dark:border-amber-800 font-mono">
                10/10
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Upgrade for unlimited monthly Instagram forensic audits
            </p>
          </div>
        </div>

        {/* Feature List Box */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800/60 dark:to-zinc-850/80 border border-zinc-200 dark:border-zinc-750 mb-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-700 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
              <InfinityIcon className="w-4 h-4 text-sky-500" />
              <span>Unlimited Plan</span>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-zinc-900 dark:text-white font-mono">$9.99</span>
              <span className="text-[10px] text-zinc-400 font-normal"> / month</span>
            </div>
          </div>

          <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-100">Unlimited Monthly Account Audits</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Complete chronological follow history (up to 500 accounts)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Full Girl &amp; Guy demographic ratio filters</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Instant one-click CSV report downloads</span>
            </li>
          </ul>
        </div>

        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleUpgrade} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
              Account Email
            </label>
            <input
              type="email"
              required
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors placeholder:text-zinc-400"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm text-zinc-950 bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 hover:from-amber-300 hover:to-purple-300 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                Connecting to Stripe...
              </span>
            ) : (
              <>
                <span>Upgrade to Unlimited ($9.99/mo) ➔</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-zinc-400 dark:text-zinc-500 mt-3 leading-relaxed">
          Cancel anytime with 1 click. Covered by our 100% money-back guarantee.
        </p>
      </div>
    </div>
  );
};
