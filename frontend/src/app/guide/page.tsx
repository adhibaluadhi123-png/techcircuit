"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  FileCheck2,
  Database,
  CheckSquare,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Check,
  ChevronDown,
  ChevronUp,
  Play,
  Layers,
  HelpCircle,
  Award,
  Lock,
  Cpu
} from "lucide-react";

export default function HowToUsePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const STEPS = [
    {
      number: "01",
      title: "Establish Your Brand Constitution (Rules & Facts)",
      subtitle: "The Foundation",
      icon: BookOpen,
      href: "/rulebook",
      actionText: "Explore Rulebook Studio →",
      description:
        "Every company has brand guidelines—usually trapped in unread 50-page PDFs. CANON liberates them into active, testable rules backed by exact word-for-word citations.",
      bullets: [
        "Interactive Guideline Compiler: Paste any policy paragraph and the system extracts rules with pass/fail test pairs.",
        "Fact Vault with Expiry Tracking: Store approved claims (e.g. '99.98% SLA' or '42,500 customers') with certified owners and evidence expiration dates.",
        "Unit Testing: Test rules in 1 click to verify they pass compliant copy and catch violations."
      ]
    },
    {
      number: "02",
      title: "Submit Real Marketing Copy for Live Review",
      subtitle: "Creator Workflow",
      icon: FileCheck2,
      href: "/review",
      actionText: "Launch Review Studio →",
      description:
        "Copywriters, marketers, and interns submit drafted press releases, product updates, or ad copy. CANON evaluates it against the active brand rules in seconds.",
      bullets: [
        "Upload or Paste: Submit .txt, .docx, or paste copy directly into the editor.",
        "Creator Intent Lock: The system identifies your Call to Action (CTA) and core message, locking them so AI suggestions cannot destroy your creative intent.",
        "Local Model Inference: Fast evaluation running on your local machine—zero cloud data leaks."
      ]
    },
    {
      number: "03",
      title: "Inspect Plain-English Findings & Apply 1-Click Fixes",
      subtitle: "Review & Surgical Correction",
      icon: Sparkles,
      href: "/findings",
      actionText: "View Review Findings →",
      description:
        "Forget cryptic compliance jargon. CANON presents clear, human explanations with 1-click surgical replacements that update only the offending words.",
      bullets: [
        "No Citation, No Blocking Flag: If the AI cannot quote the exact brand guideline rule, the finding is demoted to a non-blocking advisory tip.",
        "Simple vs Compliance View: Switch between writer-friendly cards and compliance officer audit proofs.",
        "Tracked-Changes Diff: See exactly what changed before you accept."
      ]
    },
    {
      number: "04",
      title: "Human Approver Sign-Off & Official Certificate",
      subtitle: "Cryptographic Attestation",
      icon: CheckSquare,
      href: "/approvals",
      actionText: "Go to Approval Queue →",
      description:
        "AI never publishes alone. Authorized Brand Managers review the final copy, grant legitimate campaign exceptions, and issue a signed digital certificate.",
      bullets: [
        "1-Click Digital Sign-Off: Approvers verify that zero blocking violations remain.",
        "Official Brand Certificate: Generates a cryptographic receipt binding the exact text SHA-256 hash and rulebook version.",
        "Tamper-Proof Ledger: Every decision is locked into an unbroken sequential hash chain."
      ]
    }
  ];

  const FAQS = [
    {
      q: "Can the AI rewrite or ruin my original marketing copy?",
      a: "No! CANON features a strict 'Creator Intent Lock'. It first extracts your Call to Action (CTA), core target audience, and key certified facts. Any suggested fix is restricted to minimal, surgical replacements (e.g., swapping a deprecated product title or fixing an uncertified number) without altering your voice or tone."
    },
    {
      q: "What does 'No Citation, No Blocking Flag' mean?",
      a: "This is CANON's core invariant. In conventional AI checkers, models hallucinate subjective rules and block publications. In CANON, an AI cannot create a blocking issue unless it can prove an exact, verbatim quotation in your active, human-approved brand rulebook."
    },
    {
      q: "Are our confidential product drafts sent to OpenAI or third-party servers?",
      a: "Never. CANON runs entirely on-premises using open-weight local models (Ollama with Qwen2.5). Unannounced features, pre-release pricing, and trade secrets never leave your local infrastructure."
    },
    {
      q: "What is the Fact Vault and why do claims have expiration dates?",
      a: "Statistics change over time. Quoting an outdated metric (like last year's customer count or old benchmark speeds) exposes companies to false advertising liabilities. CANON tracks validity dates and gently alerts writers when a certified benchmark has expired."
    },
    {
      q: "What happens if a rule is repeatedly overridden for special campaigns?",
      a: "CANON's Governance Loop automatically detects when creators frequently request exceptions for a rule. Instead of penalizing the team, CANON drafts a proposed rule amendment for the Brand Manager to inspect and accept in 1 click."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-4">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF0E2] text-[#C87539] border border-[#F5A66B]/30 uppercase tracking-wide">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>User Guide & Platform Walkthrough</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#382A20]">
          How to Use CANON in 4 Simple Steps
        </h1>
        <p className="text-sm text-[#8A7567] leading-relaxed">
          Everything you need to know to create, verify, and approve brand-compliant marketing copy with zero technical knowledge.
        </p>
      </div>

      {/* 4 Interactive Walkthrough Steps */}
      <div className="grid grid-cols-1 gap-6">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="editorial-card p-7 bg-white border border-[#F1E1D4] shadow-xs hover:shadow-md transition-all space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1E1D4]">
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl bg-[#FFF0E2] text-[#C87539] font-bold text-lg flex items-center justify-center shrink-0 border border-[#F5A66B]/30 shadow-2xs font-mono">
                    {step.number}
                  </span>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#C87539]">
                      {step.subtitle}
                    </span>
                    <h2 className="text-lg font-bold text-[#382A20]">
                      {step.title}
                    </h2>
                  </div>
                </div>

                <Link
                  href={step.href}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FFF9F3] text-[#C87539] text-xs font-bold border border-[#F1E1D4] transition-all shadow-2xs shrink-0 self-start sm:self-auto"
                >
                  <span>{step.actionText}</span>
                </Link>
              </div>

              <p className="text-xs leading-relaxed text-[#8A7567] font-medium">
                {step.description}
              </p>

              {/* Highlights */}
              <div className="space-y-2 pt-1">
                {step.bullets.map((b, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#382A20]">
                    <div className="w-4 h-4 rounded-full bg-[#EDFDF5] text-[#027A48] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Playbook Card */}
      <div className="editorial-card p-7 bg-gradient-to-br from-[#FFF9F3] via-white to-[#FFF0E2] border border-[#F1E1D4] shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-[#F1E1D4]">
          <Layers className="w-5 h-5 text-[#C87539]" />
          <h2 className="text-base font-bold text-[#382A20]">
            Which Role Are You Playing?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white border border-[#F1E1D4] space-y-2">
            <span className="font-bold text-[#C87539] uppercase text-[11px] block">
              ✍️ Content Creator
            </span>
            <p className="text-[#8A7567] leading-relaxed">
              Use <strong>Content Review</strong> to paste your drafted copy, inspect highlighted findings, and apply 1-click fixes before submitting for final review.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#F1E1D4] space-y-2">
            <span className="font-bold text-[#027A48] uppercase text-[11px] block">
              🛡️ Brand Manager
            </span>
            <p className="text-[#8A7567] leading-relaxed">
              Use <strong>Rulebook Studio</strong> to compile guidelines, <strong>Fact Vault</strong> to certify metrics, and <strong>Governance Insights</strong> to approve rule amendments.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#F1E1D4] space-y-2">
            <span className="font-bold text-[#382A20] uppercase text-[11px] block">
              👔 Authorized Approver
            </span>
            <p className="text-[#8A7567] leading-relaxed">
              Use <strong>Approval Queue</strong> to review pending submissions, grant campaign exceptions, and issue cryptographic certificates of compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="editorial-card p-7 bg-white border border-[#F1E1D4] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#F1E1D4]">
          <HelpCircle className="w-5 h-5 text-[#C87539]" />
          <h2 className="text-base font-bold text-[#382A20]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3 pt-2">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] text-xs transition-all"
              >
                <div
                  className="flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  <h3 className="font-bold text-[#382A20] text-sm pr-4">
                    {faq.q}
                  </h3>
                  <button className="text-[#8A7567] hover:text-[#382A20] shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isOpen && (
                  <p className="mt-3 pt-3 border-t border-[#F1E1D4] text-[#8A7567] leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="p-8 rounded-2xl bg-[#382A20] text-white text-center space-y-4 shadow-md">
        <h2 className="text-2xl font-bold">Ready to Test CANON with Real Content?</h2>
        <p className="text-xs text-[#F1E1D4] max-w-lg mx-auto leading-relaxed">
          Head directly into the Content Review Studio to paste your real marketing draft or test our sample enterprise policies.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/review"
            className="px-6 py-3 rounded-xl bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-bold transition-all shadow-sm"
          >
            Start Content Review Now →
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20"
          >
            Manage User Roles & Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
