"use client";

import React from "react";
import { Ghost, ShieldCheck, Mail, Heart, Chrome } from "lucide-react";
import { LegalModalType } from "./LegalModal";

interface FooterProps {
  onOpenLegal: (type: "terms" | "privacy" | "refund" | "contact") => void;
  onOpenCheckout: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onOpenCheckout }) => {
  return (
    <footer className="bg-surface/80 border-t border-border pt-16 pb-12 relative text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-border/80">
          {/* Brand Col (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-accent-sky/20 to-accent-indigo/20 border border-accent-sky/40 text-accent-sky shadow-glow-sm">
                <Ghost className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Ghost<span className="text-accent-sky">Sweep</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              The high-performance, 100% client-side Google Chrome extension to audit non-reciprocal accounts, filter demographics, and safely unfollow ghost profiles.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onOpenCheckout}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-card hover:bg-slate-800 border border-border text-xs font-bold text-white transition-colors"
              >
                <Chrome className="w-3.5 h-3.5 text-accent-sky" />
                <span>Get Extension ($1.99)</span>
              </button>
              <button
                onClick={() => onOpenLegal("contact")}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-card hover:bg-slate-800 border border-border text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-accent-sky" />
                <span>support@ghostsweep.info</span>
              </button>
            </div>
          </div>

          {/* Quick Links (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#analyzer" className="hover:text-accent-sky transition-colors">
                  Health Analyzer
                </a>
              </li>
              <li>
                <a href="#sandbox" className="hover:text-accent-sky transition-colors">
                  Extension Sandbox
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-accent-sky transition-colors">
                  Engine Architecture
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-accent-sky transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-accent-sky transition-colors">
                  Pricing ($1.99)
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Policies (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Trust & Compliance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenLegal("privacy")}
                  className="hover:text-accent-sky transition-colors text-left"
                >
                  Privacy Policy (Zero Password)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal("terms")}
                  className="hover:text-accent-sky transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal("refund")}
                  className="hover:text-accent-sky transition-colors text-left text-emerald-400 font-semibold"
                >
                  14-Day Money-Back Guarantee
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal("contact")}
                  className="hover:text-accent-sky transition-colors text-left"
                >
                  Support & Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Security Summary (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Security
            </h4>
            <div className="p-3 rounded-xl bg-card border border-border text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Manifest V3</span>
              </div>
              <p className="leading-tight">
                Runs 100% locally. Zero remote credentials stored.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center md:text-left max-w-2xl leading-relaxed text-[11px]">
            <strong>Disclaimer:</strong> GhostSweep is an independent utility software and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Instagram, Meta Platforms, Inc., or any of their subsidiaries.
          </p>
          <div className="text-center md:text-right shrink-0 text-[11px]">
            © {new Date().getFullYear()} GhostSweep (ghostsweep.info). All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
