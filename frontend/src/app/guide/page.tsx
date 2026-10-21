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
      title: "Store Your Company Promises & Rules",
      simpleTitle: "Step 1: The Rule Book & Memory Vault",
      href: "/rulebook",
      actionText: "Check the Rulebook 📜",
      image: "/seal.jpg",
      description:
        "Just like a school has friendly playground rules, your company has brand rules! For example: 'Always use our real product name' and 'Never claim 100% uptime without proof'.",
      childFriendlyTip: "🦉 Archie's Tip: If you quote a number (like 'we have 1,000 customers'), we check that it's verified so you never tell a fib!",
      bullets: [
        "Rulebook Studio: Paste your official rules, and our owl turns them into testable checks.",
        "Fact Vault: Keeps track of true numbers with an alarm clock so old numbers don't mislead people."
      ]
    },
    {
      number: "2",
      emoji: "✍️",
      title: "Write Your Story or Marketing Post",
      simpleTitle: "Step 2: Tell Your Story",
      href: "/review",
      actionText: "Try Writing Copy ✍️",
      image: "/team.jpg",
      description:
        "Type or paste your blog post, ad, or newsletter. You can also upload a document file! You don't need any special skills—just write naturally.",
      childFriendlyTip: "🦉 Archie's Tip: Don't worry about making mistakes! The Promise Checker reads it in 2 seconds and catches slips gently.",
      bullets: [
        "Creative Intent Lock: We never delete your punchy call to action or main message.",
        "Private & Safe: Your writing stays right inside this computer—never sent to public AI clouds."
      ]
    },
    {
      number: "3",
      emoji: "🪄",
      title: "See the Friendly Traffic Light & 1-Click Fixes",
      simpleTitle: "Step 3: Magic 1-Click Fix",
      href: "/findings",
      actionText: "See Magic Fixes 🪄",
      description:
        "Instead of confusing computer codes, you get a simple traffic light: Green means perfect! Yellow gives you a friendly tip. Red tells you what to adjust before showing it to the world.",
      childFriendlyTip: "🦉 Archie's Tip: See a red flag? Just click '⚡ 1-Click Magic Fix' and we swap the word for you instantly!",
      bullets: [
        "No Citation, No Flag: We never make up fake rules. Every flag quotes your company rulebook.",
        "Tracked Changes: You can see the green and red highlights showing exactly what was fixed."
      ]
    },
    {
      number: "4",
      emoji: "🏅",
      title: "Get Your Official Digital Gold Seal",
      simpleTitle: "Step 4: The Golden Seal of Approval",
      href: "/approvals",
      actionText: "View Approvals Queue 🏅",
      image: "/seal.jpg",
      description:
        "A real human brand lead looks over the finished story and awards an official Digital Certificate with a golden wax seal. Once stamped, nobody can secretly tamper with your story!",
      childFriendlyTip: "🦉 Archie's Tip: Think of this like a shiny sticker on your best homework that proves it was inspected and passed with flying colors!",
      bullets: [
        "Cryptographic Receipt: A mathematical fingerprint proves this exact text was approved.",
        "Tamper-Proof History: An unbroken chain of stamps that even administrators cannot erase."
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
      {/* Friendly Hero Banner with Mascot & Team */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#FFF0E2] via-white to-[#FFF9F3] border border-[#F1E1D4] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#C87539] text-white shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Super Simple Guide for Everyone</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#382A20] tracking-tight">
            How to Use CANON (Easy as 1, 2, 3!)
          </h1>
          <p className="text-sm text-[#8A7567] leading-relaxed">
            Welcome! Whether you are 9 or 90, CANON is here to help you write awesome, honest, and brand-safe marketing copy without any technical headaches.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/login?tab=register"
              className="px-5 py-2.5 rounded-2xl bg-[#027A48] hover:bg-[#026038] text-white text-xs font-black transition-all shadow-sm"
            >
              ✨ Create Free Account
            </Link>
            <Link
              href="/review"
              className="px-5 py-2.5 rounded-2xl bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-extrabold transition-all shadow-sm"
            >
              Try It in Review Studio →
            </Link>
            <Link
              href="/login"
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-[#FFF9F3] text-[#382A20] text-xs font-bold border border-[#F1E1D4] transition-all shadow-2xs"
            >
              Sign In / Switch
            </Link>
          </div>
        </div>

        <div className="w-44 h-44 rounded-3xl overflow-hidden shadow-lg border-4 border-white shrink-0 relative bg-white">
          <img
            src="/mascot.jpg"
            alt="Archie the Brand Owl"
            className="w-full h-full object-cover"
          />
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

                {/* Archie's Friendly Tip Box */}
                <div className="p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#F1E1D4] text-xs font-bold text-[#C87539]">
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
