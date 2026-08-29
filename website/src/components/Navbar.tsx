"use client";

import React, { useState, useEffect } from "react";
import { Ghost, ShieldCheck, Sparkles, Menu, X, ArrowRight, Chrome, Search, Layers, Users, Zap } from "lucide-react";

interface NavbarProps {
  onOpenCheckout: () => void;
  onOpenLegal: (type: "terms" | "privacy" | "refund" | "contact") => void;
  activeTool: string;
  onSelectTool: (toolId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCheckout,
  onOpenLegal,
  activeTool,
  onSelectTool,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tools = [
    { id: "audit", name: "Audit & Health Score", icon: Search },
    { id: "ghosts", name: "Ghost Cleaner", icon: Ghost },
    { id: "demographics", name: "Demographics", icon: Users },
    { id: "extension", name: "Extension Sandbox", icon: Layers },
    { id: "pricing", name: "Pricing", icon: Zap },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface/90 backdrop-blur-2xl border-b border-border/80 shadow-2xl shadow-black/40 py-2.5"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo (tik.ninja style minimalist brand) */}
          <a
            href="#"
            className="flex items-center gap-2.5 group focus:outline-none shrink-0"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-accent-sky/20 to-accent-indigo/30 border border-accent-sky/40 text-accent-sky shadow-glow-sm group-hover:scale-105 transition-transform duration-200">
              <Ghost className="w-5 h-5 transition-transform group-hover:rotate-12 duration-300" />
              <div className="absolute inset-0 rounded-xl bg-accent-sky/20 blur-md -z-10 group-hover:opacity-100 opacity-60 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white">
                  Ghost<span className="text-accent-sky">Sweep</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-accent-sky/15 text-accent-sky border border-accent-sky/30">
                  MV3
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Instagram Cleaner & Audit
              </span>
            </div>
          </a>

          {/* Center Navigation Tool Pills (like tik.ninja's top tool switcher) */}
          <nav className="hidden md:flex items-center gap-1 bg-surface/80 border border-border/80 rounded-full p-1 backdrop-blur-xl shadow-inner">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    onSelectTool(tool.id);
                    const el = document.getElementById(tool.id);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-accent-sky text-slate-950 shadow-glow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-950" : "text-accent-sky"}`} />
                  <span>{tool.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action CTA */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="navbar-cta-btn"
              onClick={onOpenCheckout}
              className="relative inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-accent-sky via-cyan-300 to-accent-sky hover:from-cyan-300 hover:to-accent-sky transition-all duration-200 shadow-glow-sky hover:shadow-glow-sky hover:scale-[1.02] active:scale-[0.98]"
            >
              <Chrome className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Chrome Extension</span>
              <span className="sm:hidden">Extension</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-950/20 text-slate-950 font-black text-[10px]">
                $1.99
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-surface border border-border text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 pb-2 border-t border-border/80 bg-surface/95 backdrop-blur-2xl rounded-2xl p-3 shadow-2xl animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-1.5">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSelectTool(tool.id);
                      const el = document.getElementById(tool.id);
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left"
                  >
                    <Icon className="w-4 h-4 text-accent-sky" />
                    <span>{tool.name}</span>
                  </button>
                );
              })}

              <div className="pt-3 mt-2 border-t border-border flex items-center justify-between text-xs text-slate-400 px-2">
                <button onClick={() => { setMobileMenuOpen(false); onOpenLegal("privacy"); }} className="hover:text-accent-sky">Privacy</button>
                <button onClick={() => { setMobileMenuOpen(false); onOpenLegal("terms"); }} className="hover:text-accent-sky">Terms</button>
                <button onClick={() => { setMobileMenuOpen(false); onOpenLegal("refund"); }} className="hover:text-accent-sky">Refunds</button>
                <button onClick={() => { setMobileMenuOpen(false); onOpenLegal("contact"); }} className="hover:text-accent-sky">Contact</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
