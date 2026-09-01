"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  X, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Check, 
  Sparkles, 
  ArrowRight,
  AlertCircle
} from "lucide-react";
import confetti from "canvas-confetti";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUsername: string;
  userEmail: string;
  onSuccessUnlock: (email: string, targetUsername: string) => void;
  onOpenLegal: (type: "terms" | "privacy" | "refund") => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  isOpen, 
  onClose, 
  targetUsername,
  userEmail,
  onSuccessUnlock,
  onOpenLegal 
}) => {
  const [email, setEmail] = useState(userEmail || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
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
          target_username: targetUsername || "alex.creator"
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.url) {
          // Redirect to Stripe Checkout Session
          window.location.href = data.url;
          return;
        }

        // Instant Unlock
        setIsSuccess(true);
        onSuccessUnlock(email.trim(), targetUsername);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 }
        });
      } else {
        setErrorMessage(data.error || "Payment processing failed. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setErrorMessage("Network error during checkout. Please try again.");
    } finally {
      setIsProcessing(false);
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

        {!isSuccess ? (
          <div>
            {/* Header */}
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
                  Unlock Full Activity History
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Instant chronological follow forensics &amp; timestamps for @{targetUsername || "alex.creator"}
                </p>
              </div>
            </div>

            {/* Order Summary Box */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 mb-5">
              <div className="flex items-center justify-between text-xs pb-2.5 border-b border-zinc-200 dark:border-zinc-750">
                <span className="text-zinc-600 dark:text-zinc-300 font-medium">Complete Chronological Follow History</span>
                <span className="text-zinc-900 dark:text-white font-bold font-mono text-sm">$1.99</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-2 text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Instant Web Access
                </span>
                <span>One-Time Payment</span>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handlePay} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Report Delivery &amp; Access Email
                </label>
                <input
                  id="checkout-email-input"
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors placeholder:text-zinc-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Payment Method (Stripe 256-bit SSL)
                </label>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-sky-500" />
                    <span>Card / Apple Pay / Google Pay</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Lock className="w-3 h-3" />
                    <span>Secure Stripe</span>
                  </div>
                </div>
              </div>

              <button
                id="checkout-submit-btn"
                type="submit"
                disabled={isProcessing}
                className="w-full mt-2 py-3 px-4 rounded-xl font-black text-xs sm:text-sm text-zinc-950 bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 hover:from-cyan-300 hover:to-sky-400 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    Processing Payment &amp; Unlocking...
                  </span>
                ) : (
                  <>
                    <span>Unlock Full Activity History ($1.99) ➔</span>
                  </>
                )}
              </button>
            </form>

            <p className="text-[11px] text-center text-zinc-400 dark:text-zinc-500 mt-3.5 leading-relaxed">
              By clicking Pay, you agree to our{" "}
              <button
                type="button"
                onClick={() => onOpenLegal("terms")}
                className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Terms
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => onOpenLegal("privacy")}
                className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Privacy Policy
              </button>.
            </p>
          </div>
        ) : (
          /* Success Screen */
          <div className="text-center py-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-500 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
              Audit Unlocked!
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Full forensic intelligence access for <strong className="text-zinc-900 dark:text-white">@{targetUsername}</strong> is now unlocked.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-zinc-950 bg-sky-400 hover:bg-sky-300 dark:bg-sky-500 dark:hover:bg-sky-400 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>View Unlocked Accounts Table</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
