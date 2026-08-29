"use client";

import React, { useState, useEffect } from "react";
import { MinimalHeader } from "@/components/MinimalHeader";
import { MinimalHero, AuditTabType } from "@/components/MinimalHero";
import { MinimalResultsCard } from "@/components/MinimalResultsCard";
import { MinimalFooter } from "@/components/MinimalFooter";
import { CheckoutModal } from "@/components/CheckoutModal";
import { LegalModal, LegalModalType } from "@/components/LegalModal";
import { AuditResult } from "@/app/api/audit/route";

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);
  const [activeTab, setActiveTab] = useState<AuditTabType>("non-reciprocals");
  const [isLoading, setIsLoading] = useState(false);
  const [auditData, setAuditData] = useState<AuditResult | null>(null);

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

  // Handle live audit fetch via POST
  const handleAuditSubmit = async (username: string) => {
    const cleanUser = username.trim().replace(/^@/, "");
    if (!cleanUser) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: cleanUser }),
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

  // Perform initial default audit on load for instant preview
  useEffect(() => {
    handleAuditSubmit("alex.creator");
  }, []);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const handleOpenLegal = (type: "terms" | "privacy" | "refund" | "contact") => {
    setLegalModalType(type);
  };

  const handleCloseLegal = () => {
    setLegalModalType(null);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Ultra-Minimal Top Bar */}
      <MinimalHeader
        onOpenCheckout={handleOpenCheckout}
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

        {/* 3. Dynamic Minimalist Results Card with 3 Core Metrics & Clean Up CTA */}
        {auditData && (
          <MinimalResultsCard
            auditData={auditData}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenCheckout={handleOpenCheckout}
          />
        )}
      </main>

      {/* 4. Ultra-Minimalist Stripe-Compliant Footer */}
      <MinimalFooter onOpenLegal={handleOpenLegal} />

      {/* Modals */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        onOpenLegal={handleOpenLegal}
      />

      <LegalModal
        type={legalModalType}
        onClose={handleCloseLegal}
      />
    </div>
  );
}
