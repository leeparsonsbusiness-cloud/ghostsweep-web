"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Is my Instagram account completely safe from action blocks or bans?",
      answer:
        "Yes. Traditional bot tools trigger bans because they log into your account from strange cloud IP addresses. GhostSweep is a native Chrome extension that runs directly inside your existing browser tab with smart 10-account staged batches and human-like jitter delays (12–25 seconds). It never exceeds Instagram's heuristic thresholds.",
    },
    {
      question: "Do I ever need to share my Instagram password?",
      answer:
        "Never. GhostSweep runs 100% client-side in your active Chrome session. We do not have servers that store passwords, cookies, or personal data. Your credentials stay strictly between your browser and Instagram.",
    },
    {
      question: "How does the 14-Day Money-Back Guarantee work?",
      answer:
        "We offer a no-questions-asked 14-day refund guarantee. If GhostSweep doesn't save you hours of manual clicking or boost your engagement standing, simply reach out to support@ghostsweep.info with your purchase email for an immediate refund.",
    },
    {
      question: "How does demographic & inactive account detection work?",
      answer:
        "GhostSweep reads the publicly loaded following data in your active browser tab. It evaluates profile metadata, last post timestamps, and bio name heuristics to accurately group profiles into Male, Female, Inactive (>90d), and Non-Reciprocal categories.",
    },
    {
      question: "Can I protect my real friends and favorite creators from being unfollowed?",
      answer:
        "Yes! GhostSweep includes a 1-click Whitelist feature. Star any profile to lock them out of all batch unfollow queues permanently.",
    },
    {
      question: "Why is GhostSweep only $1.99 one-time instead of a monthly subscription?",
      answer:
        "Because GhostSweep leverages your local browser power instead of running expensive centralized proxy servers. We pass those massive infrastructure savings directly to you.",
    },
    {
      question: "Which browsers are supported?",
      answer:
        "GhostSweep is built on the modern Google Chrome Manifest V3 standard and is fully compatible with Chrome, Brave, Microsoft Edge, Opera, and Arc on macOS, Windows, and Linux.",
    },
  ];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-surface/30 border-b border-border relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-sky/10 border border-accent-sky/30 text-accent-sky text-xs font-semibold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Everything You Need to Know
          </h2>
          <p className="text-slate-400 text-base">
            Have questions about safety, rates, or installation? We’ve got answers.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-card border border-border overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-base sm:text-lg font-bold text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-accent-sky shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm sm:text-base text-slate-300 leading-relaxed border-t border-border/40 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
