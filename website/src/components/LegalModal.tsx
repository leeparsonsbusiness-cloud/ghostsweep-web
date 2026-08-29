"use client";

import React from "react";
import { X, Shield, FileText, RefreshCw, Mail } from "lucide-react";

export type LegalModalType = "terms" | "privacy" | "refund" | "contact" | null;

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const contentMap = {
    terms: {
      title: "Terms of Service",
      icon: FileText,
      body: (
        <div className="space-y-3.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
          <p><strong>Last updated: August 2026</strong></p>
          <p>
            Welcome to GhostSweep (&quot;ghostsweep.info&quot;). By accessing our website, tools, and Chrome Extension, you agree to these Terms of Service.
          </p>
          <h4 className="text-zinc-900 dark:text-white font-bold text-xs">1. Independent Utility</h4>
          <p>
            GhostSweep is an independent browser utility engineered to assist users in auditing their publicly accessible social media followings and managing their account lists safely. GhostSweep is not affiliated with, endorsed by, or partnered with Instagram, Meta Platforms, Inc., TikTok, or ByteDance Ltd.
          </p>
          <h4 className="text-zinc-900 dark:text-white font-bold text-xs">2. License &amp; Usage</h4>
          <p>
            Purchases grant a single-user, non-transferable, lifetime license to use the GhostSweep Chrome extension. You agree not to reverse engineer, redistribute, or resell the software.
          </p>
          <h4 className="text-zinc-900 dark:text-white font-bold text-xs">3. Client-Side Operations &amp; User Discretion</h4>
          <p>
            GhostSweep executes all automation directly within your browser&apos;s active tab with randomized human delays. You are responsible for adhering to applicable third-party platform community guidelines.
          </p>
        </div>
      ),
    },
    privacy: {
      title: "Privacy Policy",
      icon: Shield,
      body: (
        <div className="space-y-3.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
          <p><strong>Last updated: August 2026</strong></p>
          <p>
            At GhostSweep, privacy is our fundamental principle. GhostSweep was engineered as a 100% client-side Google Chrome extension.
          </p>
          <h4 className="text-zinc-900 dark:text-white font-bold text-xs">1. Zero Password Storage</h4>
          <p>
            GhostSweep executes solely within your active browser tab. We never prompt you for, see, or transmit your Instagram password, cookies, or account session tokens to any external server.
          </p>
          <h4 className="text-zinc-900 dark:text-white font-bold text-xs">2. No Analytics Tracking of Your Profiles</h4>
          <p>
            We do not track or store the usernames of accounts you follow, audit, or unfollow. All calculations (health scores, demographic filters, whitelist preferences) are stored locally in your browser&apos;s localStorage.
          </p>
          <h4 className="text-zinc-900 dark:text-white font-bold text-xs">3. Payment Information</h4>
          <p>
            Payment processing is handled directly by Stripe. GhostSweep does not store or process credit card numbers on our servers.
          </p>
        </div>
      ),
    },
    refund: {
      title: "14-Day Money-Back Guarantee",
      icon: RefreshCw,
      body: (
        <div className="space-y-3.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
          <p><strong>100% Satisfaction Guarantee</strong></p>
          <p>
            We stand behind the quality and safety of GhostSweep. If you are not completely satisfied with GhostSweep for any reason within 14 days of your purchase, we will issue a full 100% refund.
          </p>
          <h4 className="text-zinc-900 dark:text-white font-bold text-xs">How to Request a Refund</h4>
          <p>
            Simply email <strong>support@ghostsweep.info</strong> with your purchase email or license key, and our support team will process your refund within 24 hours.
          </p>
        </div>
      ),
    },
    contact: {
      title: "Contact & Support",
      icon: Mail,
      body: (
        <div className="space-y-3.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
          <p>
            Have a question, feedback, or need technical assistance with the GhostSweep Chrome extension?
          </p>
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
            <span className="text-[10px] text-zinc-400 uppercase font-bold">Email Support</span>
            <div className="text-sm font-bold text-sky-600 dark:text-sky-400 mt-0.5">
              support@ghostsweep.info
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Average response time: &lt; 2 hours</p>
          </div>
        </div>
      ),
    },
  };

  const activeContent = contentMap[type];
  const Icon = activeContent.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-4">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-base">
            <Icon className="w-4 h-4 text-sky-500" />
            <span>{activeContent.title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {activeContent.body}

        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
