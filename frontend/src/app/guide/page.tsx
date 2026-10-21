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
  Smile,
  Wand2,
  HeartHandshake,
  Clock,
  Compass
} from "lucide-react";

export default function HowToUsePage() {
  const [openFaqs, setOpenFaqs] = useState<number[]>([0]); // First FAQ open by default

  const toggleFaq = (idx: number) => {
    setOpenFaqs((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const toggleAll = () => {
    if (openFaqs.length === FAQS.length) {
      setOpenFaqs([]);
    } else {
      setOpenFaqs(FAQS.map((_, idx) => idx));
    }
  };

  const STEPS = [
    {
      number: "1",
      emoji: "📜",
      title: "Define Guidelines & Verified Claims",
      simpleTitle: "Step 1: Policy Rulebook & Fact Vault",
      href: "/rulebook",
      actionText: "Inspect Rulebook",
      image: "/seal.jpg",
      description:
        "Compile brand guidelines, product nomenclature constraints, and verified numerical facts into machine-readable deterministic evaluation rules.",
      childFriendlyTip: "Compliance Protocol: Every numerical statement (customer counts, SLA uptime, revenue) is checked against active Fact Vault TTL timestamps.",
      bullets: [
        "Rulebook Studio: Compiles plain text guidelines into deterministic regex and semantic vector constraints.",
        "Fact Vault: Enforces time-to-live expiration on figures so stale numbers never enter published marketing materials."
      ]
    },
    {
      number: "2",
      emoji: "✍️",
      title: "Author Content with Creative Freedom",
      simpleTitle: "Step 2: Content Creation & Submission",
      href: "/review",
      actionText: "Open Review Studio",
      image: "/team.jpg",
      description:
        "Draft marketing copy, press releases, or documentation. Content can be authored directly or uploaded as Markdown, text, or document files.",
      childFriendlyTip: "Intent Lock Protocol: Preserves writer voice, headline structure, and CTA impact without generic LLM re-writing.",
      bullets: [
        "Creative Intent Lock: Surgically isolates only offending tokens without flattening style or voice.",
        "Air-Gapped Local Inference: Processing runs 100% locally with zero external cloud transmission."
      ]
    },
    {
      number: "3",
      emoji: "🔍",
      title: "Evaluate Risk Tiers & Apply Surgical Fixes",
      simpleTitle: "Step 3: Deterministic Review & Diffing",
      href: "/findings",
      actionText: "View Review Findings",
      description:
        "Instantly evaluate drafts across three transparent risk tiers. Green indicates passing compliance, Yellow signals stylistic advisory, and Red flags strict policy breaches.",
      childFriendlyTip: "No Citation Guarantee: Blocking flags are mathematically forbidden unless paired with an exact brand rulebook quote.",
      bullets: [
        "Citation Transparency: Every flagged violation displays the exact paragraph and page from your official guide.",
        "Tracked Changes: Inspect clear side-by-side diffs showing original claims vs. verified replacements."
      ]
    },
    {
      number: "4",
      emoji: "📜",
      title: "Cryptographic Seal & Immutable Audit Trail",
      simpleTitle: "Step 4: Sign-off & HMAC Chaining",
      href: "/approvals",
      actionText: "Approvals Queue",
      image: "/seal.jpg",
      description:
        "Authorized reviewers inspect passing drafts and issue an official cryptographic approval receipt containing an HMAC-SHA256 signature.",
      childFriendlyTip: "Audit Trail Integrity: Receipts record reviewer identity, content checksum, and active rulebook revision in a tamper-proof chain.",
      bullets: [
        "Cryptographic Receipt: Verifiable proof of compliance for executive and legal audits.",
        "Immutable Audit Chain: Prevents unauthorized post-approval tampering across all published assets."
      ]
    }
  ];

  const FAQS = [
    {
      q: "Can the AI rewrite or ruin my original story or post?",
      a: "No! Absolutely not. We have a feature called 'Creative Intent Lock'. That means CANON only fixes specific forbidden words or expired numbers. It never rewrites your paragraphs, your jokes, or your main message."
    },
    {
      q: "What does 'No Citation, No Blocking Flag' mean?",
      a: "It means the computer cannot be mean or bossy! An AI cannot block your publication unless it can show the exact, word-for-word sentence in your company's official brand book. No made-up rules allowed!"
    },
    {
      q: "Is our private writing sent to ChatGPT or outside internet clouds?",
      a: "Never! CANON runs on local open-source models right on your machine. Your secret product ideas, launch dates, and pricing drafts never touch the public internet."
    },
    {
      q: "Why do facts have an expiration date?",
      a: "Because numbers change as companies grow! If you bragged about having '500 customers' in 2024, but it's now 2026, quoting old numbers can get the company in trouble. CANON tracks dates so your numbers are always honest."
    },
    {
      q: "What happens if a rule is too strict for our holiday campaign?",
      a: "A brand manager can grant an approved 'Exception' in 1 click! And if people keep asking for the same exception, CANON automatically suggests updating the rulebook itself so everyone has an easier time."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4">
      {/* Executive Operations Banner */}
      <div className="p-8 rounded-3xl bg-white border border-[#F1E1D4] shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Platform Operations Handbook</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] tracking-tight">
            Operating Guide & Governance Protocols
          </h1>
          <p className="text-sm text-[#64748B] leading-relaxed">
            End-to-end operational manual for creators, compliance reviewers, and brand managers using CANON to enforce deterministic brand safety.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/review"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              Open Review Studio →
            </Link>
            <Link
              href="/rulebook"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#1E1B4B] text-xs font-bold border border-[#F1E1D4] transition-all shadow-2xs"
            >
              Policy Rulebook
            </Link>
          </div>
        </div>

        <div className="w-full md:w-64 p-5 rounded-2xl bg-slate-900 text-slate-300 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="text-emerald-400 font-bold font-sans text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Governance Verification
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Policy Citation:</span>
              <span className="text-white">Required</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Fact TTL:</span>
              <span className="text-emerald-400">Enforced</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Intent Lock:</span>
              <span className="text-white">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">HMAC-SHA256:</span>
              <span className="text-emerald-400">Chained</span>
            </div>
          </div>
        </div>
      </div>

      {/* The 3-Color Traffic Light Metaphor */}
      <div className="p-6 rounded-3xl bg-white border border-[#F1E1D4] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🚦</span>
          <div>
            <h2 className="text-base font-extrabold text-[#382A20]">
              The 3-Color Brand Traffic Light
            </h2>
            <p className="text-xs text-[#8A7567]">How to understand review results at a single glance:</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-[#EDFDF5] border border-[#A6F4C5] space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-black text-[#027A48]">
              <span className="w-3.5 h-3.5 rounded-full bg-[#027A48] inline-block animate-ping"></span>
              <span>🟢 GREEN: Perfect!</span>
            </div>
            <p className="text-xs text-[#027A48] leading-relaxed">
              Your writing matches every brand rule and quotes honest facts. Ready to show the world!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#F5A66B]/40 space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-black text-[#C87539]">
              <span className="w-3.5 h-3.5 rounded-full bg-[#F5A66B] inline-block"></span>
              <span>🟡 YELLOW: Friendly Tip</span>
            </div>
            <p className="text-xs text-[#C87539] leading-relaxed">
              A gentle recommendation. Your deadline is NOT blocked—just a helpful idea to make it shine!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FEEBEA] border border-[#FECDCA] space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-black text-[#B42318]">
              <span className="w-3.5 h-3.5 rounded-full bg-[#B42318] inline-block"></span>
              <span>🔴 RED: Fix This First</span>
            </div>
            <p className="text-xs text-[#B42318] leading-relaxed">
              Contains a forbidden name or uncertified stat. Just click "⚡ 1-Click Magic Fix" to solve it!
            </p>
          </div>
        </div>
      </div>

      {/* 4 Super Simple Steps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#382A20] uppercase tracking-wider flex items-center gap-2">
            <span>✨ The 4 Simple Steps of CANON</span>
          </h2>
          <span className="text-xs text-[#8A7567]">Takes less than 1 minute</span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {STEPS.map((step) => {
            return (
              <div
                key={step.number}
                className="editorial-card p-7 bg-white border border-[#F1E1D4] shadow-xs hover:shadow-md transition-all space-y-4 rounded-3xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1E1D4]">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{step.emoji}</span>
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#C87539]">
                        {step.simpleTitle}
                      </span>
                      <h3 className="text-lg font-black text-[#382A20]">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  <Link
                    href={step.href}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FFF0E2] hover:bg-[#F5A66B]/20 text-[#C87539] text-xs font-black transition-all shadow-2xs shrink-0 self-start sm:self-auto"
                  >
                    <span>{step.actionText}</span>
                  </Link>
                </div>

                <p className="text-xs leading-relaxed text-[#8A7567] font-medium">
                  {step.description}
                </p>

                {/* Operator Compliance Guidance */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  {step.childFriendlyTip}
                </div>

                {/* Bullets */}
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
      </div>

      {/* Cheerful Team Image Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#F1E1D4] shadow-xs overflow-hidden flex flex-col md:flex-row items-center gap-6">
        <div className="w-full md:w-1/2 h-56 rounded-2xl overflow-hidden shadow-sm relative">
          <img
            src="/team.jpg"
            alt="Happy Creative Team"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-1/2 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EDFDF5] text-[#027A48]">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Built for Teams to Smile</span>
          </div>
          <h2 className="text-xl font-black text-[#382A20]">
            No More Arguing Over Style Guidelines!
          </h2>
          <p className="text-xs text-[#8A7567] leading-relaxed">
            Writers get fast, friendly advice without waiting days for a compliance audit. Brand leaders get complete peace of mind that every published post has honest proof. Everyone wins!
          </p>
          <div className="pt-1">
            <Link
              href="/review"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-black shadow-xs transition-all"
            >
              <span>Test with Real Copy Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (Fixed Accordion!) */}
      <div className="editorial-card p-7 bg-white border border-[#F1E1D4] shadow-xs space-y-4 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F1E1D4]">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-[#C87539]" />
            <h2 className="text-base font-black text-[#382A20]">
              Frequently Asked Questions (Click Any Question to Open!)
            </h2>
          </div>
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs text-[#C87539] font-bold hover:underline self-start sm:self-auto"
          >
            {openFaqs.length === FAQS.length ? "Collapse All Questions" : "Expand All Questions"}
          </button>
        </div>

        <div className="space-y-3 pt-2">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqs.includes(idx);
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#F1E1D4] bg-[#FFF9F3]/60 transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-[#FFF0E2]/60 transition-colors cursor-pointer select-none"
                >
                  <span className="font-extrabold text-[#382A20] text-sm">
                    {faq.q}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-white border border-[#F1E1D4] flex items-center justify-center text-[#C87539] shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="p-4 pt-1 border-t border-[#F1E1D4] bg-white text-xs text-[#382A20] leading-relaxed font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
