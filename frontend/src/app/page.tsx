"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Database,
  ArrowRight,
  Sparkles,
  Check,
  Palette,
  CheckSquare,
  X,
  Layers
} from "lucide-react";

import { AnimatedGrid } from "@/components/animations/AnimatedGrid";
import { BlurText } from "@/components/animations/BlurText";
import { ShinyText } from "@/components/animations/ShinyText";
import { RotatingText } from "@/components/animations/RotatingText";
import { SpotlightCard } from "@/components/animations/SpotlightCard";
import { BorderBeam } from "@/components/animations/BorderBeam";
import { TiltedCard } from "@/components/animations/TiltedCard";
import { MagnetButton } from "@/components/animations/MagnetButton";

export default function HomePage() {
  const [openFaqs, setOpenFaqs] = useState<number[]>([0]);
  const [activeUser, setActiveUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [demoTab, setDemoTab] = useState<"draft" | "issues" | "fixed">("issues");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("canon_user_id");
      const name = localStorage.getItem("canon_user_name");
      const role = localStorage.getItem("canon_user_role");
      if (id && name) {
        setActiveUser({ id, name, role: role || "CREATOR" });
      }
    }
  }, []);

  const toggleFaq = (idx: number) => {
    setOpenFaqs((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const FAQS = [
    {
      q: "What is CANON and who is it for?",
      a: "CANON is an easy-to-use brand guideline and content checker. It helps marketing teams, writers, designers, and managers ensure that articles, ads, press releases, and graphics match company standards before going live."
    },
    {
      q: "How is CANON different from standard spellcheck tools?",
      a: "Standard spellcheckers only check grammar and typos. CANON checks your actual company rules—such as approved product names, correct trademark symbols (®/™), verified numbers (customer counts, uptime stats), and official logo usage."
    },
    {
      q: "Will CANON rewrite my whole paragraph or alter my writing style?",
      a: "No! Unlike generic AI tools that rewrite everything and ruin your voice, CANON only fixes the specific word, number, or phrase that violates a rule. Your creative tone and headline style stay completely untouched."
    },
    {
      q: "Can I check images and logos as well as written copy?",
      a: "Yes. You can upload graphics, banners, and logos. CANON automatically checks logo spacing (clearspace padding), aspect ratio distortion, and text contrast to ensure your visuals meet brand standards."
    },
    {
      q: "Is our company data kept safe and private?",
      a: "Yes. CANON is engineered to run securely without sending your confidential announcements, upcoming pricing, or sensitive drafts to third-party public clouds."
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#FFFBF7] text-[#201815] flex flex-col font-sans overflow-hidden">
      {/* Background Ambience */}
      <AnimatedGrid />

      {/* ── 1. Clean Navigation Bar ── */}
      <header className="sticky top-0 z-50 bg-[#FFFBF7]/85 backdrop-blur-xl border-b border-[#F4E2D3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF8A3D] via-[#FF7A1A] to-[#E06008] flex items-center justify-center text-white shadow-md shadow-[#FF8A3D]/25 group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
              <div className="absolute -inset-0.5 rounded-2xl bg-[#FF8A3D] opacity-30 blur-xs -z-10 group-hover:opacity-60 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-[#201815]">
                  CANON
                </span>
                <span className="text-[10px] bg-[#FFF2E7] text-[#D95D0D] font-extrabold px-2 py-0.5 rounded-full border border-[#FDBA74]">
                  BRAND GUARD
                </span>
              </div>
              <p className="text-[10px] font-semibold text-[#7C6A5E] tracking-wide">
                Brand & Content Checker
              </p>
            </div>
          </Link>

          {/* Clean Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#7C6A5E]">
            <a href="#how-it-works" className="hover:text-[#D95D0D] transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-[#D95D0D] transition-colors">
              Features
            </a>
            <a href="#why-canon" className="hover:text-[#D95D0D] transition-colors">
              Why CANON
            </a>
            <a href="#faq" className="hover:text-[#D95D0D] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {activeUser ? (
              <>
                <MagnetButton strength={0.2}>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] hover:from-[#FF9952] hover:to-[#E8630D] text-white text-xs font-extrabold transition-all shadow-sm shadow-[#FF8A3D]/30 flex items-center gap-1.5"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </MagnetButton>
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFF5EC] text-[#7C6A5E] hover:text-[#201815] text-xs font-bold border border-[#F4E2D3] transition-all shadow-xs"
                >
                  Switch User
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#FFF5EC] text-[#201815] text-xs font-bold border border-[#F4E2D3] transition-all shadow-xs"
                >
                  Sign In
                </Link>
                <MagnetButton strength={0.25}>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] hover:from-[#FF9952] hover:to-[#E8630D] text-white text-xs font-extrabold transition-all shadow-sm shadow-[#FF8A3D]/30 flex items-center gap-1.5"
                  >
                    <span>Try Workspace Free</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </Link>
                </MagnetButton>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. Hero Section ── */}
      <section className="relative py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Column: Clear Value Proposition */}
          <div className="max-w-xl space-y-6 text-center lg:text-left">
            {/* Friendly Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#FDBA74] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#FF8A3D] animate-pulse" />
              <ShinyText
                text="Automated Brand Guidelines & Fact Checker"
                className="text-xs font-bold text-[#D95D0D]"
                speed={3.5}
              />
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl font-black text-[#201815] tracking-tight leading-[1.18]">
              <BlurText
                text="Never publish an off-brand mistake again."
                delay={40}
                animateBy="words"
                direction="bottom"
                className="text-[#201815]"
              />
            </h1>

            {/* Rotating Description */}
            <div className="text-base sm:text-lg text-[#7C6A5E] leading-relaxed">
              <span>CANON automatically checks your marketing drafts for </span>
              <RotatingText
                words={[
                  "Forbidden Words",
                  "Outdated Numbers",
                  "Incorrect Logos",
                  "Missing Trademarks",
                  "Unverified Claims"
                ]}
                interval={2600}
                highlightClassName="font-extrabold text-[#D95D0D] bg-[#FFF2E7] px-2 py-0.5 rounded-lg border border-[#FDBA74]/50"
              />
              <p className="mt-3 text-sm text-[#7C6A5E]">
                Check articles, press releases, product sheets, and logos against your company’s approved guidelines in seconds.
              </p>
            </div>

            {/* Direct Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <MagnetButton strength={0.25}>
                <Link
                  href="/dashboard"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] hover:from-[#FF9952] hover:to-[#E8630D] text-white text-sm font-extrabold transition-all shadow-md shadow-[#FF8A3D]/30 flex items-center gap-2"
                >
                  <span>Open Workspace Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagnetButton>

              <Link
                href="/review"
                className="px-5 py-3.5 rounded-2xl bg-white hover:bg-[#FFF5EC] text-[#D95D0D] text-sm font-extrabold border border-[#FDBA74] transition-all shadow-xs flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#FF8A3D]" />
                <span>Try Live Review</span>
              </Link>
            </div>

            {/* 3 Clear Guarantees */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-[#7C6A5E] font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#EDFDF5] text-[#027A48] flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>Fast feedback under 1 second</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#FFF2E7] text-[#D95D0D] flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>Only fixes mistakes (keeps your voice)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#FFF2E7] text-[#D95D0D] flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>100% private & secure</span>
              </span>
            </div>
          </div>

          {/* Right Column: Visual Before & After Demo Card */}
          <div className="w-full lg:w-[490px]">
            <TiltedCard maxTilt={5} scale={1.01} className="w-full">
              <div className="relative rounded-3xl bg-white/95 backdrop-blur-2xl border border-[#F4E2D3] shadow-xl shadow-[#FF8A3D]/10 overflow-hidden text-left">
                <BorderBeam duration={7} size={220} colorFrom="#FF8A3D" colorTo="#FFAE74" borderWidth={2} />

                {/* Card Header */}
                <div className="px-5 py-3.5 bg-gradient-to-r from-[#FFF5EC] to-white border-b border-[#F4E2D3] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A3D]" />
                    <span className="text-xs font-extrabold text-[#201815]">
                      Interactive Demo: Content Check
                    </span>
                  </div>
                  <span className="text-[10px] text-[#027A48] bg-[#EDFDF5] font-black px-2.5 py-0.5 rounded-full border border-[#A6F4C5]">
                    READY IN 0.3s
                  </span>
                </div>

                {/* Interactive Demo Tabs */}
                <div className="px-5 pt-3 pb-2 bg-white flex items-center gap-2 border-b border-[#FDF0E5] text-xs font-bold">
                  <button
                    onClick={() => setDemoTab("draft")}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      demoTab === "draft"
                        ? "bg-[#FFF2E7] text-[#D95D0D] shadow-xs"
                        : "text-[#7C6A5E] hover:bg-[#FFF5EC]"
                    }`}
                  >
                    1. Original Draft
                  </button>
                  <button
                    onClick={() => setDemoTab("issues")}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      demoTab === "issues"
                        ? "bg-[#FFF2E7] text-[#D95D0D] shadow-xs"
                        : "text-[#7C6A5E] hover:bg-[#FFF5EC]"
                    }`}
                  >
                    2. Issues Detected (3)
                  </button>
                  <button
                    onClick={() => setDemoTab("fixed")}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      demoTab === "fixed"
                        ? "bg-[#EDFDF5] text-[#027A48] shadow-xs"
                        : "text-[#7C6A5E] hover:bg-[#FFF5EC]"
                    }`}
                  >
                    3. One-Click Fix
                  </button>
                </div>

                {/* Demo Card Content */}
                <div className="p-5 space-y-4">
                  {demoTab === "draft" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-[#7C6A5E] font-semibold">
                        <span>Marketing announcement submitted for review:</span>
                        <span className="text-xs text-[#D95D0D] font-bold">Unchecked</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#FFFBF7] border border-[#F4E2D3] text-xs text-[#201815] leading-relaxed">
                        &ldquo;Our platform delivers <span className="bg-[#FFF0F0] text-[#B42318] px-1.5 py-0.5 rounded font-bold border border-[#FECDCA]">100% unbreakable uptime</span> with over <span className="bg-[#FFF5EC] text-[#D95D0D] px-1.5 py-0.5 rounded font-bold border border-[#FDBA74]">50,000 active clients</span> on our <span className="bg-[#FFF0F0] text-[#B42318] px-1.5 py-0.5 rounded font-bold border border-[#FECDCA]">Legacy Suite</span>.&rdquo;
                      </div>
                      <p className="text-[11px] text-[#A49184]">
                        Click on &ldquo;Issues Detected&rdquo; above to see what CANON found.
                      </p>
                    </div>
                  )}

                  {demoTab === "issues" && (
                    <div className="space-y-2.5">
                      <div className="text-xs text-[#7C6A5E] font-semibold">
                        CANON checked company guidelines and flagged 3 issues:
                      </div>

                      <div className="p-3 rounded-xl bg-[#FFF0F0] border border-[#FECDCA] flex items-start gap-2.5">
                        <span className="text-[10px] font-black bg-[#B42318] text-white px-2 py-0.5 rounded shrink-0">RULE</span>
                        <div>
                          <div className="text-xs font-bold text-[#B42318]">No Absolute Availability Guarantees</div>
                          <div className="text-[11px] text-[#7C6A5E] mt-0.5">Brand guide prohibits claiming &ldquo;100% uptime&rdquo;. Official verified SLA is <strong>99.98%</strong>.</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FFF5EC] border border-[#FDBA74] flex items-start gap-2.5">
                        <span className="text-[10px] font-black bg-[#D95D0D] text-white px-2 py-0.5 rounded shrink-0">EXPIRED FACT</span>
                        <div>
                          <div className="text-xs font-bold text-[#D95D0D]">Outdated Customer Metric</div>
                          <div className="text-[11px] text-[#7C6A5E] mt-0.5">&ldquo;50,000 clients&rdquo; is unverified. Approved audited count is <strong>42,000</strong>.</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FFF0F0] border border-[#FECDCA] flex items-start gap-2.5">
                        <span className="text-[10px] font-black bg-[#B42318] text-white px-2 py-0.5 rounded shrink-0">NAME</span>
                        <div>
                          <div className="text-xs font-bold text-[#B42318]">Deprecated Product Name</div>
                          <div className="text-[11px] text-[#7C6A5E] mt-0.5">&ldquo;Legacy Suite&rdquo; was retired. The approved name is <strong>Cloud Platform™</strong>.</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {demoTab === "fixed" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-[#027A48] font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#027A48]" />
                          <span>All 3 Issues Fixed Automatically</span>
                        </span>
                        <span className="text-[10px] bg-[#EDFDF5] px-2 py-0.5 rounded-full border border-[#A6F4C5]">
                          Approved
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#EDFDF5] border border-[#A6F4C5] text-xs text-[#027A48] leading-relaxed font-medium">
                        &ldquo;Our platform delivers <span className="font-extrabold underline decoration-2">99.98% uptime</span> with over <span className="font-extrabold underline decoration-2">42,000 active clients</span> on our <span className="font-extrabold underline decoration-2">Cloud Platform™</span>.&rdquo;
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#FFF9F3] border border-[#FDBA74] text-[11px] text-[#7C6A5E]">
                        Notice how only the incorrect words were fixed, keeping the author&rsquo;s natural sentence structure intact!
                      </div>
                    </div>
                  )}

                  {/* Card Bottom Bar */}
                  <div className="pt-3 border-t border-[#F4E2D3] flex items-center justify-between text-xs text-[#7C6A5E]">
                    <span className="font-semibold">Review time: 28 milliseconds</span>
                    <Link
                      href="/review"
                      className="font-extrabold text-[#D95D0D] hover:underline flex items-center gap-1"
                    >
                      <span>Try with your own text</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </TiltedCard>
          </div>
        </div>
      </section>

      {/* ── 3. How It Works: 3 Simple Steps ── */}
      <section id="how-it-works" className="py-20 bg-white/70 backdrop-blur-md border-y border-[#F4E2D3] px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF2E7] text-[#D95D0D] text-xs font-extrabold border border-[#FDBA74]">
              <Layers className="w-3.5 h-3.5 text-[#FF8A3D]" />
              <span>HOW IT WORKS</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#201815]">
              Publish Clean Content in 3 Simple Steps
            </h2>
            <p className="text-sm text-[#7C6A5E]">
              From draft to verified approval without back-and-forth email delays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <SpotlightCard className="p-7 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF8A3D] to-[#FFAE74] text-white flex items-center justify-center font-black text-lg shadow-sm shadow-[#FF8A3D]/30">
                1
              </div>
              <h3 className="text-base font-extrabold text-[#201815]">
                Set Your Brand Guidelines & Facts
              </h3>
              <p className="text-xs text-[#7C6A5E] leading-relaxed">
                Add your official brand guidelines, approved product names, official logos, and verified business metrics (like customer counts or revenue numbers) to your company library.
              </p>
              <div className="pt-2 text-xs font-bold text-[#D95D0D] flex items-center gap-1">
                <span>Centralized & Always Updated</span>
              </div>
            </SpotlightCard>

            {/* Step 2 */}
            <SpotlightCard className="p-7 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF8A3D] to-[#FFAE74] text-white flex items-center justify-center font-black text-lg shadow-sm shadow-[#FF8A3D]/30">
                2
              </div>
              <h3 className="text-base font-extrabold text-[#201815]">
                Paste or Upload Your Draft
              </h3>
              <p className="text-xs text-[#7C6A5E] leading-relaxed">
                Paste draft articles, press releases, social media copy, or upload images. CANON scans everything in real-time, checking words, trademarks, stats, and visual logo padding.
              </p>
              <div className="pt-2 text-xs font-bold text-[#D95D0D] flex items-center gap-1">
                <span>Instant Feedback in Under a Second</span>
              </div>
            </SpotlightCard>

            {/* Step 3 */}
            <SpotlightCard className="p-7 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#027A48] to-[#12B76A] text-white flex items-center justify-center font-black text-lg shadow-sm shadow-[#027A48]/30">
                3
              </div>
              <h3 className="text-base font-extrabold text-[#201815]">
                Fix in 1 Click & Sign Off
              </h3>
              <p className="text-xs text-[#7C6A5E] leading-relaxed">
                Review highlighted suggestions with plain-language explanations. Accept approved fixes with one click, or send to your team lead for formal sign-off before publishing.
              </p>
              <div className="pt-2 text-xs font-bold text-[#027A48] flex items-center gap-1">
                <span>Full Team Approval History</span>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ── 4. Key Features ── */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF2E7] text-[#D95D0D] text-xs font-extrabold border border-[#FDBA74]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF8A3D]" />
              <span>CORE CAPABILITIES</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#201815]">
              Everything You Need to Guard Your Brand
            </h2>
            <p className="text-sm text-[#7C6A5E]">
              Designed to help creators write freely while keeping company communications accurate and consistent.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SpotlightCard className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF2E7] text-[#D95D0D] flex items-center justify-center border border-[#FDBA74]">
                <BookOpen className="w-5 h-5 text-[#FF8A3D]" />
              </div>
              <h3 className="text-sm font-bold text-[#201815]">Brand & Style Rules</h3>
              <p className="text-xs text-[#7C6A5E] leading-relaxed">
                Automatically detects retired product names, unapproved slogans, missing trademark symbols (®/™), and prohibited terms.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF2E7] text-[#D95D0D] flex items-center justify-center border border-[#FDBA74]">
                <Database className="w-5 h-5 text-[#FF8A3D]" />
              </div>
              <h3 className="text-sm font-bold text-[#201815]">Verified Fact Checking</h3>
              <p className="text-xs text-[#7C6A5E] leading-relaxed">
                Matches numbers, statistics, and claims against your verified company data. Flags outdated figures before you quote them.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF2E7] text-[#D95D0D] flex items-center justify-center border border-[#FDBA74]">
                <Palette className="w-5 h-5 text-[#FF8A3D]" />
              </div>
              <h3 className="text-sm font-bold text-[#201815]">Logo & Visual Checks</h3>
              <p className="text-xs text-[#7C6A5E] leading-relaxed">
                Inspects graphics and banners for correct logo aspect ratios, minimum padding clearspace, and high-contrast accessibility.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF2E7] text-[#D95D0D] flex items-center justify-center border border-[#FDBA74]">
                <CheckSquare className="w-5 h-5 text-[#FF8A3D]" />
              </div>
              <h3 className="text-sm font-bold text-[#201815]">Approvals & Sign-off</h3>
              <p className="text-xs text-[#7C6A5E] leading-relaxed">
                Clear review workflow that allows managers to approve content with a verified timestamp and immutable record.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ── 5. Why CANON vs Standard Spellcheckers ── */}
      <section id="why-canon" className="py-20 bg-white/70 backdrop-blur-md border-y border-[#F4E2D3] px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF2E7] text-[#D95D0D] text-xs font-extrabold border border-[#FDBA74]">
              <span>COMPARISON</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#201815]">
              Why Generic Spellcheckers Aren’t Enough
            </h2>
            <p className="text-sm text-[#7C6A5E]">
              Spellcheckers check whether words are in the English dictionary. CANON checks whether they are true and compliant with your brand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Standard Tools */}
            <div className="p-7 rounded-3xl bg-white border border-[#F4E2D3] space-y-5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F0] text-[#B42318] flex items-center justify-center font-bold">
                  ✕
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#201815]">Standard Grammar Checkers</h3>
                  <p className="text-xs text-[#7C6A5E]">Grammarly, Word, Basic Spellcheck</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  "Only check grammar, typos, and commas",
                  "Don't know your company's approved product names",
                  "Can't tell if statistics (e.g. 100% uptime) are false or expired",
                  "Cannot inspect logos, clearspace padding, or banners",
                  "Randomly rewrite paragraphs and alter your creative voice",
                  "Send your private drafts to external public cloud APIs",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#7C6A5E]">
                    <X className="w-4 h-4 text-[#B42318] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CANON */}
            <div className="p-7 rounded-3xl bg-gradient-to-br from-[#FFF5EC] to-white border border-[#FDBA74] space-y-5 shadow-md shadow-[#FF8A3D]/10 relative overflow-hidden">
              <BorderBeam duration={9} size={200} colorFrom="#FF8A3D" colorTo="#FFAE74" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8A3D] to-[#FF721B] text-white flex items-center justify-center font-bold shadow-sm shadow-[#FF8A3D]/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#201815]">CANON Brand Guard</h3>
                  <p className="text-xs text-[#D95D0D] font-bold">Built for Company Brand Guidelines</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  "Enforces your company's actual brand book and terminology",
                  "Verifies statistics, dates, and numbers against verified facts",
                  "Checks logo aspect ratios, spacing padding, and image contrast",
                  "Surgically fixes only the wrong words—preserving your creative voice",
                  "Requires a clear cited rule for every suggestion (zero random guessing)",
                  "Runs securely and privately with zero cloud data leaks",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#201815] font-semibold">
                    <Check className="w-4 h-4 text-[#027A48] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FAQ Section ── */}
      <section id="faq" className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF2E7] text-[#D95D0D] text-xs font-extrabold border border-[#FDBA74]">
              <span>HELP & ANSWERS</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#201815]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#7C6A5E]">
              Quick answers about how CANON works and how your team can use it.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqs.includes(idx);
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? "border-[#FDBA74] bg-white shadow-md shadow-[#FF8A3D]/5"
                      : "border-[#F4E2D3] bg-white/80 hover:border-[#FFAE74]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <span className="font-bold text-[#201815] text-sm">
                      {faq.q}
                    </span>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isOpen ? "bg-[#FFF2E7] text-[#D95D0D]" : "bg-[#FFF5EC] text-[#7C6A5E]"
                    }`}>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="p-5 pt-1 border-t border-[#FDF0E5] text-xs text-[#7C6A5E] leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 7. Call To Action Banner ── */}
      <section className="py-20 px-4 sm:px-6 bg-white/80 border-t border-[#F4E2D3]">
        <div className="relative max-w-4xl mx-auto p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-[#FFF5EC] via-[#FFFBF7] to-[#FFEAD9] border border-[#FDBA74] text-center space-y-6 shadow-xl shadow-[#FF8A3D]/10 overflow-hidden">
          <BorderBeam duration={8} size={250} colorFrom="#FF8A3D" colorTo="#FFAE74" borderWidth={2} />

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF8A3D] to-[#FF721B] text-white flex items-center justify-center mx-auto shadow-md shadow-[#FF8A3D]/30">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-[#201815] tracking-tight">
              Start Publishing with Complete Confidence
            </h2>
            <p className="text-xs sm:text-sm text-[#7C6A5E] max-w-lg mx-auto leading-relaxed">
              Join marketing teams, copywriters, and brand managers who use CANON to eliminate brand mistakes and speed up content sign-offs.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <MagnetButton strength={0.25}>
              <Link
                href="/dashboard"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] hover:from-[#FF9952] hover:to-[#E8630D] text-white text-sm font-extrabold transition-all shadow-md shadow-[#FF8A3D]/30 flex items-center gap-2"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </MagnetButton>

            <Link
              href="/review"
              className="px-5 py-3.5 rounded-2xl bg-white hover:bg-[#FFF5EC] text-[#201815] text-sm font-bold border border-[#F4E2D3] transition-all shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#FF8A3D]" />
              <span>Try Live Review Studio</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. Public Footer ── */}
      <footer className="mt-auto py-8 bg-[#201815] text-[#A49184] text-xs px-4 sm:px-6 border-t border-[#382A20]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#FF8A3D] flex items-center justify-center text-white font-black text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-white">CANON — Brand & Content Checker</span>
          </div>

          <div className="flex items-center gap-4 text-[#A49184]">
            <Link href="/dashboard" className="hover:text-white transition-colors">Workspace</Link>
            <span>•</span>
            <Link href="/review" className="hover:text-white transition-colors">Review Studio</Link>
            <span>•</span>
            <Link href="/guide" className="hover:text-white transition-colors">User Guide</Link>
            <span>•</span>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
