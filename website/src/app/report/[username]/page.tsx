"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MinimalHeader } from "@/components/MinimalHeader";
import { MinimalHero, AuditTabType } from "@/components/MinimalHero";
import { MinimalResultsCard } from "@/components/MinimalResultsCard";
import { MinimalFooter } from "@/components/MinimalFooter";
import { CheckoutModal } from "@/components/CheckoutModal";
import { AuthModal } from "@/components/AuthModal";
import { LegalModal, LegalModalType } from "@/components/LegalModal";
import { AuditResult } from "@/app/api/audit/route";

export default function ReportPage() {
  const params = useParams();
  const rawParamUser = Array.isArray(params?.username) ? params.username[0] : params?.username;
  const targetUser = typeof rawParamUser === "string" ? decodeURIComponent(rawParamUser).replace(/^@/, "").toLowerCase() : "alex.creator";

  const [isDark, setIsDark] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);
  const [activeTab, setActiveTab] = useState<AuditTabType>("non-reciprocals");
  const [isLoading, setIsLoading] = useState(false);
  const [auditData, setAuditData] = useState<AuditResult | null>(null);
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

      if (emailParam) {
        setUserEmail(emailParam);
        localStorage.setItem("gs_user_email", emailParam);
      } else {
        const savedEmail = localStorage.getItem("gs_user_email");
        if (savedEmail) setUserEmail(savedEmail);
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

      if (unlockedParam === "true") {
        setUnlockedAudits((prev) => Array.from(new Set([...prev, targetUser])));
      }

      handleAuditSubmit(targetUser);
    };

    loadSessionAndAudit();
  }, [targetUser]);

  const handleAuditSubmit = async (username: string) => {
    const cleanUser = username.trim().replace(/^@/, "").toLowerCase();
    if (!cleanUser) return;

    setCurrentUsername(cleanUser);
    setIsLoading(true);

    try {
      const activeEmail = userEmail || (typeof window !== "undefined" ? localStorage.getItem("gs_user_email") : null);
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
      }
    } catch (err) {
      console.error("Failed to fetch audit data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTheme = () => setIsDark((prev) => !prev);
  const handleOpenCheckout = () => setIsCheckoutOpen(true);
  const handleCloseCheckout = () => setIsCheckoutOpen(false);
  const handleOpenAuth = () => setIsAuthOpen(true);
  const handleCloseAuth = () => setIsAuthOpen(false);

  const handleLoginSuccess = (email: string, audits: string[]) => {
    setUserEmail(email);
    setUnlockedAudits(audits);
    localStorage.setItem("gs_user_email", email);
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

  const isCurrentAuditUnlocked = Boolean(
    auditData?.isUnlocked || 
    (currentUsername && unlockedAudits.includes(currentUsername.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200 selection:bg-sky-500 selection:text-white">
      <MinimalHeader 
        isDark={isDark} 
        onToggleTheme={handleToggleTheme}
        onOpenAuth={handleOpenAuth}
        userEmail={userEmail}
        unlockedCount={unlockedAudits.length}
      />

      <div className="flex-1">
        <MinimalHero 
          onAuditSubmit={handleAuditSubmit} 
          isLoading={isLoading}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenCheckout={handleOpenCheckout}
        />

        {auditData && (
          <MinimalResultsCard 
            auditData={auditData}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenCheckout={handleOpenCheckout}
            isUnlocked={isCurrentAuditUnlocked}
          />
        )}
      </div>

      <MinimalFooter onOpenLegal={(type) => setLegalModalType(type)} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        targetUsername={currentUsername || "alex.creator"}
        userEmail={userEmail || ""}
        onSuccessUnlock={handleSuccessUnlock}
        onOpenLegal={(type) => setLegalModalType(type)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={handleCloseAuth}
        userEmail={userEmail}
        unlockedAudits={unlockedAudits}
        onSelectUnlockedAccount={(username) => {
          handleAuditSubmit(username);
          handleCloseAuth();
        }}
        onLoginSuccess={handleLoginSuccess}
      />

      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </main>
  );
}
