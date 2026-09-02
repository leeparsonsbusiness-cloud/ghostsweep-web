"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MinimalHeader } from "@/components/MinimalHeader";
import { MinimalHero, AuditTabType } from "@/components/MinimalHero";
import { MinimalResultsCard } from "@/components/MinimalResultsCard";
import { MinimalFooter } from "@/components/MinimalFooter";
import { CheckoutModal } from "@/components/CheckoutModal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { AuthModal } from "@/components/AuthModal";
import { LegalModal, LegalModalType } from "@/components/LegalModal";
import { AuditResult } from "@/app/api/audit/route";
import { trackSearchEvent, trackInitiateCheckout, trackPurchase } from "@/lib/analytics";

export default function ReportPage() {
  const params = useParams();
  const rawParamUser = Array.isArray(params?.username) ? params.username[0] : params?.username;
  const targetUser = typeof rawParamUser === "string" ? decodeURIComponent(rawParamUser).replace(/^@/, "").toLowerCase() : "theleeparsons";

  const [isDark, setIsDark] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);
  const [activeTab, setActiveTab] = useState<AuditTabType>("non-reciprocals");
  const [isLoading, setIsLoading] = useState(false);
  const [auditData, setAuditData] = useState<AuditResult | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [unlockedAudits, setUnlockedAudits] = useState<string[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string>(targetUser);

  useEffect(() => {
    const savedTheme = localStorage.getItem("ghostsweep-theme");
    if (savedTheme) {
      setIsDark(savedTheme === "dark");
    } else {
      setIsDark(true);
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

  useEffect(() => {
    const loadSessionAndAudit = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const unlockedParam = urlParams.get("unlocked");
      const emailParam = urlParams.get("email");
      const planParam = urlParams.get("plan") as "standard" | "unlimited" | null;

      if (emailParam) {
        setUserEmail(emailParam);
        localStorage.setItem("gs_user_email", emailParam);
      } else {
        const savedEmail = localStorage.getItem("gs_user_email");
        if (savedEmail) setUserEmail(savedEmail);
      }

      if (unlockedParam === "true") {
        setUnlockedAudits((prev) => Array.from(new Set([...prev, targetUser])));
        trackPurchase(planParam || "standard", planParam === "unlimited" ? 9.99 : 3.99, targetUser);
      }

      const activeEmail = emailParam || localStorage.getItem("gs_user_email");
      if (activeEmail) {
        try {
          const res = await fetch(`/api/user/audits?email=${encodeURIComponent(activeEmail)}`);
          const json = await res.json();
          if (json.success && Array.isArray(json.unlockedAudits)) {
            setUnlockedAudits(json.unlockedAudits);
          }
        } catch (err) {
          console.error("Failed to load user audits:", err);
        }
      }

      handleAuditSubmit(targetUser);
    };

    loadSessionAndAudit();
  }, [targetUser]);

  const handleAuditSubmit = async (username: string) => {
    const cleanUser = username.trim().replace(/^@/, "").toLowerCase();
    if (!cleanUser) return;

    trackSearchEvent(cleanUser);

    const activeEmail = userEmail || (typeof window !== "undefined" ? localStorage.getItem("gs_user_email") : null);
    if (!activeEmail) {
      const guestSearches = JSON.parse(localStorage.getItem("gs_guest_searches") || "[]");
      if (!guestSearches.includes(cleanUser) && guestSearches.length >= 5) {
        handleOpenCheckout();
        return;
      }
    }

    setCurrentUsername(cleanUser);
    setIsLoading(true);
    setAuditError(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: cleanUser,
          email: activeEmail || undefined 
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAuditData(json.data);

        if (activeEmail) {
          fetch("/api/user/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: activeEmail,
              username: cleanUser,
              name: json.data.fullName || cleanUser,
              avatar: json.data.avatar,
              targetType: json.data.targetType || "following",
            }),
          }).catch(() => {});
        } else {
          const guestSearches: string[] = JSON.parse(localStorage.getItem("gs_guest_searches") || "[]");
          if (!guestSearches.includes(cleanUser)) {
            guestSearches.push(cleanUser);
            localStorage.setItem("gs_guest_searches", JSON.stringify(guestSearches));
          }
        }
      } else {
        if (json.error === "MONTHLY_LIMIT_REACHED") {
          handleOpenUpgrade();
        } else if (json.error === "FREE_LIMIT_REACHED") {
          handleOpenCheckout();
        } else {
          setAuditError(json.error || json.details || "Failed to audit account.");
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch audit data:", err);
      setAuditError(err.message || "Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTheme = () => setIsDark((prev) => !prev);
  const handleOpenCheckout = () => {
    trackInitiateCheckout("standard", 3.99);
    setIsCheckoutOpen(true);
  };
  const handleCloseCheckout = () => setIsCheckoutOpen(false);
  const handleOpenUpgrade = () => {
    trackInitiateCheckout("unlimited", 9.99);
    setIsUpgradeOpen(true);
  };
  const handleOpenAuth = () => setIsAuthOpen(true);
  const handleCloseAuth = () => setIsAuthOpen(false);

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
    trackPurchase("standard", 3.99, cleanTarget);
    if (auditData) {
      setAuditData({
        ...auditData,
        isUnlocked: true,
      });
    }
  };

  const handleSuccessUpgrade = (email: string) => {
    setUserEmail(email);
    localStorage.setItem("gs_user_email", email);
    trackPurchase("unlimited", 9.99, currentUsername);
    if (currentUsername) {
      handleAuditSubmit(currentUsername);
    }
  };

  const handleOpenLegal = (type: "terms" | "privacy" | "refund" | "contact") => {
    setLegalModalType(type);
  };

  const handleCloseLegal = () => setLegalModalType(null);

  const isCurrentTargetUnlocked = Boolean(
    auditData?.isUnlocked || 
    (currentUsername && unlockedAudits.includes(currentUsername.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <MinimalHeader
        onOpenCheckout={handleOpenCheckout}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        userEmail={userEmail}
        unlockedCount={unlockedAudits.length}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

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

      <MinimalFooter onOpenLegal={handleOpenLegal} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        targetUsername={currentUsername}
        userEmail={userEmail || ""}
        onSuccessUnlock={handleSuccessUnlock}
        onOpenLegal={handleOpenLegal}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        userEmail={userEmail || ""}
        targetUsername={currentUsername}
        onSuccessUpgrade={handleSuccessUpgrade}
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
