"use client";

import React, { useState, useEffect } from "react";
import { MinimalHeader } from "@/components/MinimalHeader";
import { MinimalHero, AuditTabType } from "@/components/MinimalHero";
import { MinimalResultsCard } from "@/components/MinimalResultsCard";
import { MinimalFooter } from "@/components/MinimalFooter";
import { CheckoutModal } from "@/components/CheckoutModal";
import { AuthModal } from "@/components/AuthModal";
import { LegalModal, LegalModalType } from "@/components/LegalModal";
import { AuditResult } from "@/app/api/audit/route";

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);
  const [activeTab, setActiveTab] = useState<AuditTabType>("non-reciprocals");
  const [isLoading, setIsLoading] = useState(false);
  const [auditData, setAuditData] = useState<AuditResult | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [unlockedAudits, setUnlockedAudits] = useState<string[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string>("theleeparsons");

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("ghostsweep-theme");
    if (savedTheme) {
      setIsDark(savedTheme === "dark");
    } else {
      setIsDark(true); // Default to dark mode
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

  // Check user session & URL parameters on load
  useEffect(() => {
    const loadSessionAndParams = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const unlockedParam = urlParams.get("unlocked");
      const emailParam = urlParams.get("email");
      const usernameParam = urlParams.get("username");
      const authTokenParam = urlParams.get("auth_token");

      if (emailParam) {
        setUserEmail(emailParam);
        localStorage.setItem("gs_user_email", emailParam);
      } else {
        const savedEmail = localStorage.getItem("gs_user_email");
        if (savedEmail) setUserEmail(savedEmail);
      }

      // If returning from magic token
      if (authTokenParam) {
        try {
          const res = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: authTokenParam }),
          });
          const json = await res.json();
          if (json.success && json.email) {
            setUserEmail(json.email);
            setUnlockedAudits(json.unlockedAudits || []);
            localStorage.setItem("gs_user_email", json.email);
          }
        } catch (err) {
          console.error("Auth token verification error:", err);
        }
      } else {
        // Load user's unlocked audits
        const emailToQuery = emailParam || localStorage.getItem("gs_user_email");
        if (emailToQuery) {
          try {
            const res = await fetch(`/api/user/audits?email=${encodeURIComponent(emailToQuery)}`);
            const json = await res.json();
            if (json.success && Array.isArray(json.unlockedAudits)) {
              setUnlockedAudits(json.unlockedAudits);
            }
          } catch (err) {
            console.error("Failed to load user audits:", err);
          }
        }
      }

      // If returning from payment unlock
      if (unlockedParam === "true" && usernameParam) {
        const cleanTarget = usernameParam.replace(/^@/, "").toLowerCase();
        setUnlockedAudits((prev) => Array.from(new Set([...prev, cleanTarget])));
        handleAuditSubmit(cleanTarget);
      } else if (usernameParam) {
        handleAuditSubmit(usernameParam);
      }
    };

    loadSessionAndParams();
  }, []);

  // Handle live audit fetch via POST
  const handleAuditSubmit = async (username: string) => {
    const cleanUser = username.trim().replace(/^@/, "").toLowerCase();
    if (!cleanUser) return;

    setCurrentUsername(cleanUser);
    setIsLoading(true);
    setAuditError(null);

    try {
      const activeEmail = userEmail || (typeof window !== "undefined" ? localStorage.getItem("gs_user_email") : null);
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username: cleanUser,
          email: activeEmail || undefined 
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAuditData(json.data);
      } else {
        setAuditError(json.error || json.details || "Failed to audit account.");
      }
    } catch (err: any) {
      console.error("Failed to fetch audit data:", err);
      setAuditError(err.message || "Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const handleOpenAuth = () => {
    setIsAuthOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthOpen(false);
  };

  const handleLoginSuccess = (email: string, audits: string[]) => {
    setUserEmail(email);
    setUnlockedAudits(audits);
    localStorage.setItem("gs_user_email", email);
  };

  const handleSignOut = () => {
    setUserEmail(null);
    setUnlockedAudits([]);
    localStorage.removeItem("gs_user_email");
    localStorage.removeItem("gs_session_token");
    document.cookie = "gs_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  };

  const handleSuccessUnlock = (email: string, targetUsername: string) => {
    const cleanTarget = targetUsername.replace(/^@/, "").toLowerCase();
    setUserEmail(email);
    localStorage.setItem("gs_user_email", email);
    setUnlockedAudits((prev) => Array.from(new Set([...prev, cleanTarget])));
    if (auditData) {
      setAuditData({
        ...auditData,
        isUnlocked: true,
      });
    }
  };

  const handleOpenLegal = (type: "terms" | "privacy" | "refund" | "contact") => {
    setLegalModalType(type);
  };

  const handleCloseLegal = () => {
    setLegalModalType(null);
  };

  // Check if current target username is unlocked
  const isCurrentTargetUnlocked = Boolean(
    auditData?.isUnlocked || 
    (currentUsername && unlockedAudits.includes(currentUsername.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Ultra-Minimal Top Bar */}
      <MinimalHeader
        onOpenCheckout={handleOpenCheckout}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        userEmail={userEmail}
        unlockedCount={unlockedAudits.length}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. Hero & Central Search Bar */}
      <main className="flex-1 flex flex-col justify-start">
        <MinimalHero
          onAuditSubmit={handleAuditSubmit}
          isLoading={isLoading}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenCheckout={handleOpenCheckout}
        />

        {auditError && (
          <div className="max-w-xl mx-auto px-4 w-full mb-6 animate-in fade-in">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm text-center">
              <span className="font-bold">Audit Error: </span>
              <span>{auditError}</span>
            </div>
          </div>
        )}

        {/* 3. Dynamic Minimalist Results Card with 3 Core Metrics & Clean Up CTA */}
        {auditData && (
          <MinimalResultsCard
            auditData={auditData}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenCheckout={handleOpenCheckout}
            isUnlocked={isCurrentTargetUnlocked}
          />
        )}
      </main>

      {/* 4. Ultra-Minimalist Stripe-Compliant Footer */}
      <MinimalFooter onOpenLegal={handleOpenLegal} />

      {/* Modals */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        targetUsername={currentUsername}
        userEmail={userEmail || ""}
        onSuccessUnlock={handleSuccessUnlock}
        onOpenLegal={handleOpenLegal}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={handleCloseAuth}
        userEmail={userEmail}
        unlockedAudits={unlockedAudits}
        onSelectUnlockedAccount={(handle) => {
          handleAuditSubmit(handle);
        }}
        onLoginSuccess={handleLoginSuccess}
      />

      <LegalModal
        type={legalModalType}
        onClose={handleCloseLegal}
      />
    </div>
  );
}
