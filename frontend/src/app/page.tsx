"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Database,
  ArrowRight,
  Sparkles,
  FileCheck2,
  AlertCircle,
  Cpu,
  BarChart3,
  Check,
  Shield,
  Zap,
  Terminal,
  FileCode,
  Layers,
  Fingerprint,
  RefreshCw,
  Eye,
  Sliders,
  Play,
  X,
  GitBranch,
  FlaskConical,
  Microscope,
  Binary,
  Globe,
  Key,
  Timer,
  Braces,
  BadgeCheck,
  TrendingUp,
  PackageOpen,
  Wand2
} from "lucide-react";

import { AnimatedGrid } from "@/components/animations/AnimatedGrid";
import { BlurText } from "@/components/animations/BlurText";
import { ShinyText } from "@/components/animations/ShinyText";
import { RotatingText } from "@/components/animations/RotatingText";
import { SpotlightCard } from "@/components/animations/SpotlightCard";
import { BorderBeam } from "@/components/animations/BorderBeam";
import { TiltedCard } from "@/components/animations/TiltedCard";
import { MagnetButton } from "@/components/animations/MagnetButton";

export default function IntroPage() {
  const [openFaqs, setOpenFaqs] = useState<number[]>([0]);
  const [activeUser, setActiveUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [demoTab, setDemoTab] = useState<"claim" | "audit" | "remedy" | "seal">("audit");

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
      q: "What is CANON?",
      a: "CANON is an open-source Brand Governance Compiler. It continuously evaluates content against brand guidelines, fact repositories, and tone requirements before publication—replacing subjective, delayed reviews with deterministic verification."
    },
    {
      q: "How does the 'No Citation, No Blocking Flag' guarantee work?",
      a: "Every critical blocking issue raised by CANON must reference an exact, verifiable citation from your approved brand rulebook. If an issue cannot be directly mapped to an approved rule or expired fact, the system cannot block publication."
    },
    {
      q: "What is Intent-Preserving Surgical Remediation?",
      a: "Unlike generic LLM re-writers that regenerate entire paragraphs and alter voice, CANON applies surgical token replacement. It substitutes unauthorized product names or outdated figures while keeping your original creative tone intact."
    },
    {
      q: "Is content kept private and secure?",
      a: "Yes. CANON is engineered for local-first deployment using open-weight models (such as Qwen 2.5) running on your own infrastructure. Drafts, upcoming announcements, and unreleased financial metrics never leave your firewall."
    },
    {
      q: "How are approvals cryptographically verified?",
      a: "Each approved publication receives an immutable HMAC-SHA256 audit receipt containing the content hash, approver signature, active rulebook revision, and timestamp, forming a tamper-proof chain of custody."
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#FFFBF7] text-[#201815] flex flex-col font-sans overflow-hidden">
      {/* React Bits: Luxury Ambient Pale Orange Dot Grid & Orbs */}
      <AnimatedGrid />

      {/* 1. Header / Navigation in Pale Orange & White Theme */}
      <header className="sticky top-0 z-50 bg-[#FFFBF7]/80 backdrop-blur-xl border-b border-[#F4E2D3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Logo & Platform Name */}
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
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[10px] font-semibold text-[#7C6A5E] tracking-wide">
                Brand Governance Compiler
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#7C6A5E]">
            <a href="#pipeline" className="hover:text-[#D95D0D] transition-colors">
              Architecture
            </a>
            <a href="#risk-levels" className="hover:text-[#D95D0D] transition-colors">
              Risk Tiers
            </a>
            <a href="#capabilities" className="hover:text-[#D95D0D] transition-colors">
              Capabilities
            </a>
            <a href="#unique" className="relative hover:text-[#D95D0D] transition-colors flex items-center gap-1">
              <span>What&#39;s Unique</span>
              <span className="absolute -top-2.5 -right-8 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF8A3D] to-[#FF5F0F] text-white shadow-sm animate-pulse-subtle">
                NEW
              </span>
            </a>
            <a href="#faq" className="hover:text-[#D95D0D] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTAs with MagnetButton */}
          <div className="flex items-center gap-3">
            {activeUser ? (
              <>
                <MagnetButton strength={0.2}>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] hover:from-[#FF9952] hover:to-[#E8630D] text-white text-xs font-extrabold transition-all shadow-sm shadow-[#FF8A3D]/30 flex items-center gap-1.5"
                  >
                    <span>Workspace ({activeUser.name.split(" ")[0]})</span>
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
                  href="/login?tab=login"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#FFF5EC] text-[#201815] text-xs font-bold border border-[#F4E2D3] transition-all shadow-xs"
                >
                  Sign In
                </Link>
                <MagnetButton strength={0.25}>
                  <Link
                    href="/login?tab=register"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] hover:from-[#FF9952] hover:to-[#E8630D] text-white text-xs font-extrabold transition-all shadow-sm shadow-[#FF8A3D]/30 flex items-center gap-1.5"
                  >
                    <span>Initialize Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </Link>
                </MagnetButton>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Visual Journey Breadcrumb / Step Indicator */}
      <div className="bg-[#FFF5EC]/60 backdrop-blur-xs border-b border-[#F4E2D3] py-2 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-center sm:justify-between text-xs font-bold text-[#7C6A5E] overflow-x-auto gap-3">
          <div className="flex items-center gap-2 shrink-0 bg-white text-[#D95D0D] px-3 py-1 rounded-xl border border-[#FDBA74] shadow-xs font-extrabold">
            <span className="w-4 h-4 rounded-full bg-[#FF8A3D] text-white flex items-center justify-center text-[10px] font-black orange-dot-glow">
              1
            </span>
            <span>1. Product Overview (Current)</span>
          </div>
          <span className="text-[#FDBA74] shrink-0">➔</span>
          <Link
            href="/login"
            className="flex items-center gap-2 shrink-0 text-[#7C6A5E] hover:text-[#D95D0D] transition-colors"
          >
            <span className="w-4 h-4 rounded-full bg-white border border-[#F4E2D3] text-[#7C6A5E] flex items-center justify-center text-[10px] font-black">
              2
            </span>
            <span>2. Authentication & Role Selection</span>
          </Link>
          <span className="text-[#FDBA74] shrink-0">➔</span>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 shrink-0 text-[#7C6A5E] hover:text-[#D95D0D] transition-colors"
          >
            <span className="w-4 h-4 rounded-full bg-white border border-[#F4E2D3] text-[#7C6A5E] flex items-center justify-center text-[10px] font-black">
              3
            </span>
            <span>3. Governance Workspace & Review Studio</span>
          </Link>
        </div>
      </div>

      {/* 2. Hero Section with React Bits Components */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Hero Left: Value Proposition */}
          <div className="max-w-xl space-y-6 text-center lg:text-left">
            {/* Shimmering Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#FDBA74] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#FF8A3D] orange-dot-glow animate-pulse" />
              <ShinyText
                text="Deterministic Brand Guardrails & Local Inference"
                className="text-xs font-bold text-[#D95D0D]"
                speed={3.5}
              />
            </div>

            {/* Main Headline with BlurText */}
            <h1 className="text-3xl sm:text-5xl font-black text-[#201815] tracking-tight leading-[1.15]">
              <BlurText
                text="Deterministic Brand Governance for Products, Logos & Trademarks"
                delay={40}
                animateBy="words"
                direction="bottom"
                className="text-[#201815]"
              />
            </h1>

            {/* Dynamic Rotating Subtitle */}
            <div className="text-base sm:text-lg text-[#7C6A5E] leading-relaxed">
              <span>CANON guarantees </span>
              <RotatingText
                words={[
                  "Authorized Product Names",
                  "Strict Logo Clearspace",
                  "Registered Trademark Symbols",
                  "Certified Product Specs",
                  "Cryptographic Brand Seals"
                ]}
                interval={2600}
                highlightClassName="font-extrabold text-[#D95D0D] bg-[#FFF2E7] px-2 py-0.5 rounded-lg border border-[#FDBA74]/50"
              />
              <p className="mt-2 text-sm text-[#7C6A5E]">
                Compile product brand guidelines, logo clearspace formulas, trademark rules, and certified engineering specs into sub-30ms deterministic safeguards before any packaging, hardware spec, or collateral goes live.
              </p>
            </div>

            {/* CTAs with MagnetButton */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              {activeUser ? (
                <MagnetButton strength={0.25}>
                  <Link
                    href="/dashboard"
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] hover:from-[#FF9952] hover:to-[#E8630D] text-white text-sm font-extrabold transition-all shadow-md shadow-[#FF8A3D]/30 flex items-center gap-2"
                  >
                    <span>Enter Governance Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </MagnetButton>
              ) : (
                <MagnetButton strength={0.25}>
                  <Link
                    href="/login?tab=register"
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] hover:from-[#FF9952] hover:to-[#E8630D] text-white text-sm font-extrabold transition-all shadow-md shadow-[#FF8A3D]/30 flex items-center gap-2"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </MagnetButton>
              )}

              <Link
                href="/login"
                className="px-5 py-3.5 rounded-2xl bg-white hover:bg-[#FFF5EC] text-[#201815] text-sm font-bold border border-[#F4E2D3] transition-all shadow-xs"
              >
                Sign In
              </Link>

              <Link
                href="/review"
                className="px-5 py-3.5 rounded-2xl bg-[#FFF5EC] hover:bg-[#FFEAD9] text-[#D95D0D] text-xs font-extrabold border border-[#FDBA74] transition-all shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF8A3D]" />
                <span>Live Review Studio</span>
              </Link>
            </div>

            {/* Enterprise Guarantees with pale orange check badges */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-[#7C6A5E] font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#EDFDF5] text-[#027A48] flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>Zero Cloud Leakage (Local Weights)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#FFF2E7] text-[#D95D0D] flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>No Citation, No Blocking Flag</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#FFF2E7] text-[#D95D0D] flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>HMAC-SHA256 Audit Trail</span>
              </span>
            </div>
          </div>

          {/* Hero Right: 3D Tilted Card + BorderBeam Live Compliance Engine */}
          <div className="w-full lg:w-[500px]">
            <TiltedCard maxTilt={6} scale={1.01} className="w-full">
              <div className="relative rounded-3xl bg-white/95 backdrop-blur-2xl border border-[#F4E2D3] shadow-xl shadow-[#FF8A3D]/10 overflow-hidden text-left">
                {/* React Bits: Rotating Border Beam on Card Perimeter */}
                <BorderBeam duration={7} size={220} colorFrom="#FF8A3D" colorTo="#FFAE74" borderWidth={2} />

                {/* Card Topbar */}
                <div className="px-5 py-3.5 bg-gradient-to-r from-[#FFF5EC] to-white border-b border-[#F4E2D3] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF8A3D]/80" />
                    <div className="w-3 h-3 rounded-full bg-[#FFAE74]/70" />
                    <div className="w-3 h-3 rounded-full bg-[#FED7AA]/60" />
                    <span className="text-xs font-bold text-[#201815] ml-2 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-[#FF8A3D]" />
                      <span>CANON Compiler Engine</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-[#027A48] bg-[#EDFDF5] font-black px-2.5 py-0.5 rounded-full border border-[#A6F4C5] shadow-2xs">
                    PASSING 98.4%
                  </span>
                </div>

                {/* Interactive Demo Selector Tabs */}
                <div className="px-5 pt-3.5 pb-2 bg-white flex items-center gap-1.5 border-b border-[#FDF0E5] text-[11px] font-bold">
                  <button
                    onClick={() => setDemoTab("claim")}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      demoTab === "claim" ? "bg-[#FFF2E7] text-[#D95D0D]" : "text-[#7C6A5E] hover:bg-[#FFF5EC]"
                    }`}
                  >
                    1. Draft Claim
                  </button>
                  <button
                    onClick={() => setDemoTab("audit")}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      demoTab === "audit" ? "bg-[#FFF2E7] text-[#D95D0D]" : "text-[#7C6A5E] hover:bg-[#FFF5EC]"
                    }`}
                  >
                    2. Deterministic Audit
                  </button>
                  <button
                    onClick={() => setDemoTab("remedy")}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      demoTab === "remedy" ? "bg-[#FFF2E7] text-[#D95D0D]" : "text-[#7C6A5E] hover:bg-[#FFF5EC]"
                    }`}
                  >
                    3. Surgical Fix
                  </button>
                  <button
                    onClick={() => setDemoTab("seal")}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      demoTab === "seal" ? "bg-[#FFF2E7] text-[#D95D0D]" : "text-[#7C6A5E] hover:bg-[#FFF5EC]"
                    }`}
                  >
                    4. Cryptographic Seal
                  </button>
                </div>

                {/* Card Content Area */}
                <div className="p-5 space-y-4 text-xs font-mono">
                  {/* Step 1 Content */}
                  <div>
                    <span className="text-[#A49184] font-sans font-semibold">// 1. Raw Unchecked Marketing Draft</span>
                    <p className="mt-1 font-sans text-xs bg-[#FFFBF7] p-3 rounded-xl border border-[#F4E2D3] text-[#201815] leading-relaxed">
                      &ldquo;ApexDynamics delivers <span className="bg-[#FFF0F0] text-[#B42318] px-1.5 py-0.5 rounded font-bold border border-[#FECDCA]">100% unbreakable uptime</span> with over <span className="bg-[#FFF5EC] text-[#D95D0D] px-1.5 py-0.5 rounded font-bold border border-[#FDBA74]">50,000 active clients</span>.&rdquo;
                    </p>
                  </div>

                  {/* Step 2 Content: Deterministic Flagging */}
                  <div className="space-y-2">
                    <span className="text-[#A49184] font-sans font-semibold">// 2. Exact Rulebook & Fact Verification</span>
                    <div className="space-y-1.5 font-sans">
                      <div className="p-2.5 rounded-xl bg-[#FFF0F0] border border-[#FECDCA] flex items-start gap-2.5">
                        <span className="text-[10px] font-black bg-[#B42318] text-white px-1.5 py-0.5 rounded shrink-0">BLOCK</span>
                        <div>
                          <div className="text-xs font-bold text-[#B42318]">Absolute Availability Claim Prohibited</div>
                          <div className="text-[11px] text-[#7C6A5E] mt-0.5">Citation: Brand Rulebook Sec 4.2 (&ldquo;Never guarantee 100% uptime; state verified SLA of 99.99%&rdquo;)</div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#FFF5EC] border border-[#FDBA74] flex items-start gap-2.5">
                        <span className="text-[10px] font-black bg-[#D95D0D] text-white px-1.5 py-0.5 rounded shrink-0">EXPIRED</span>
                        <div>
                          <div className="text-xs font-bold text-[#D95D0D]">Fact Vault TTL Stale: Client Count</div>
                          <div className="text-[11px] text-[#7C6A5E] mt-0.5">Verified Truth: 42,000 clients (Q3 Audited Metric)</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 Content: Surgical Fix */}
                  <div>
                    <span className="text-[#A49184] font-sans font-semibold">// 3. Surgical Token Replacement (Intent Preserved)</span>
                    <div className="mt-1 p-3 rounded-xl bg-[#EDFDF5] border border-[#A6F4C5] font-sans text-xs text-[#027A48] font-medium leading-relaxed">
                      &ldquo;ApexDynamics delivers <span className="font-extrabold underline decoration-2">99.99% uptime</span> with over <span className="font-extrabold underline decoration-2">42,000 active clients</span>.&rdquo;
                    </div>
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-3 border-t border-[#F4E2D3] flex items-center justify-between text-[11px] font-sans text-[#7C6A5E]">
                    <span className="flex items-center gap-1.5">
                      <Fingerprint className="w-3.5 h-3.5 text-[#FF8A3D]" />
                      <span>HMAC Seal: <code className="text-[#D95D0D] font-mono font-bold">c8f94...e312a</code></span>
                    </span>
                    <span className="flex items-center gap-1 text-[#027A48] font-bold">
                      <Zap className="w-3 h-3 text-[#FF8A3D]" />
                      <span>28ms Local Latency</span>
                    </span>
                  </div>
                </div>
              </div>
            </TiltedCard>
          </div>
        </div>
      </section>

      {/* 3. Section: 3-Stage Pipeline Architecture with Spotlight Cards */}
      <section id="pipeline" className="py-20 bg-white/70 backdrop-blur-md border-y border-[#F4E2D3] px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF2E7] text-[#D95D0D] text-xs font-extrabold border border-[#FDBA74]">
              <Layers className="w-3.5 h-3.5 text-[#FF8A3D]" />
              <span>DETERMINISTIC COMPILER PIPELINE</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#201815]">
              How the Brand Governance Compiler Operates
            </h2>
            <p className="text-sm text-[#7C6A5E]">
              Three deterministic stages engineered to guarantee zero false blocking flags and 100% citation transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stage 1 SpotlightCard */}
            <SpotlightCard className="p-7 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF8A3D] to-[#FFAE74] text-white flex items-center justify-center font-black text-base shadow-sm shadow-[#FF8A3D]/30">
                01
              </div>
              <h3 className="text-base font-extrabold text-[#201815]">
                Rulebook & Fact Compilation
              </h3>
              <p className="text-xs text-[#7C6A5E] leading-relaxed">
                Brand guideline PDFs and Markdown policies are compiled into machine-readable regex patterns and verified numerical fact tables with automated expiration clocks.
              </p>
              <div className="pt-2 text-[11px] font-bold text-[#D95D0D] flex items-center gap-1">
                <span>Deterministic Regex & TTL Rules</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </SpotlightCard>

            {/* Stage 2 SpotlightCard */}
            <SpotlightCard className="p-7 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF8A3D] to-[#FFAE74] text-white flex items-center justify-center font-black text-base shadow-sm shadow-[#FF8A3D]/30">
                02
              </div>
              <h3 className="text-base font-extrabold text-[#201815]">
                Offline Contextual Verification
              </h3>
              <p className="text-xs text-[#7C6A5E] leading-relaxed">
                Draft copy passes through high-speed token matchers followed by offline local LLM contextual analysis. Every flag links directly to official policy citations.
              </p>
              <div className="pt-2 text-[11px] font-bold text-[#D95D0D] flex items-center gap-1">
                <span>Sub-30ms Local Inference</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </SpotlightCard>

            {/* Stage 3 SpotlightCard with BorderBeam */}
            <SpotlightCard className="p-7 space-y-4 relative">
              <BorderBeam duration={9} size={180} colorFrom="#FF8A3D" colorTo="#FFAE74" />
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#027A48] to-[#12B76A] text-white flex items-center justify-center font-black text-base shadow-sm shadow-[#027A48]/30">
                03
              </div>
              <h3 className="text-base font-extrabold text-[#201815]">
                Cryptographic Seal & Chain
              </h3>
              <p className="text-xs text-[#7C6A5E] leading-relaxed">
                Once reviewed by an authorized signatory, an HMAC-SHA256 signature permanently records the publication receipt in an immutable audit ledger.
              </p>
              <div className="pt-2 text-[11px] font-bold text-[#027A48] flex items-center gap-1">
                <span>HMAC-SHA256 Audit Proof</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* 4. Section: Risk Framework in Pale Orange & White */}
      <section id="risk-levels" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-white/90 backdrop-blur-xl border border-[#F4E2D3] shadow-md shadow-[#FF8A3D]/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl space-y-3 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF2E7] text-[#D95D0D] text-xs font-bold border border-[#FDBA74]">
                <Shield className="w-3.5 h-3.5 text-[#FF8A3D]" />
                <span>RISK CLASSIFICATION</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#201815]">
                Multi-Tier Governance Risk Framework
              </h2>
              <p className="text-xs sm:text-sm text-[#7C6A5E] leading-relaxed">
                Clear, transparent risk tiers that provide actionable guidance without halting creative momentum:
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
              <div className="p-4 rounded-2xl bg-[#EDFDF5] border border-[#A6F4C5] flex items-center gap-3.5 shadow-xs">
                <span className="w-3.5 h-3.5 rounded-full bg-[#027A48] shrink-0" />
                <div>
                  <div className="text-xs font-extrabold text-[#027A48]">Tier 1: Certified Compliant (Passing)</div>
                  <div className="text-[11px] text-[#027A48]/80 font-medium">Zero policy violations. Ready for immediate publication.</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#FDBA74] flex items-center gap-3.5 shadow-xs">
                <span className="w-3.5 h-3.5 rounded-full bg-[#FF8A3D] shrink-0" />
                <div>
                  <div className="text-xs font-extrabold text-[#D95D0D]">Tier 2: Style & Voice Advisory (Non-Blocking)</div>
                  <div className="text-[11px] text-[#7C6A5E] font-medium">Contextual suggestions to sharpen tone and clarity.</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF0F0] border border-[#FECDCA] flex items-center gap-3.5 shadow-xs">
                <span className="w-3.5 h-3.5 rounded-full bg-[#B42318] shrink-0" />
                <div>
                  <div className="text-xs font-extrabold text-[#B42318]">Tier 3: Policy Violation (Strict Blocking Flag)</div>
                  <div className="text-[11px] text-[#B42318]/80 font-medium">Unverified claim or prohibited term requiring 1-click remediation.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section: Core Capabilities Grid */}
      <section id="capabilities" className="py-20 bg-white/70 backdrop-blur-md border-y border-[#F4E2D3] px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF2E7] text-[#D95D0D] text-xs font-extrabold border border-[#FDBA74]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF8A3D]" />
              <span>ENTERPRISE SPECIFICATIONS</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#201815]">
              Core Enterprise Governance Pillars
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SpotlightCard className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF2E7] text-[#D95D0D] flex items-center justify-center border border-[#FDBA74]">
                <Database className="w-5 h-5 text-[#FF8A3D]" />
              </div>
              <h3 className="text-sm font-bold text-[#201815]">Verified Fact Vault</h3>
              <p className="text-xs text-[#7C6A5E] leading-relaxed">
                Centralized storage for metrics with TTL automated expiration to avoid quoting outdated data in press releases.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF2E7] text-[#D95D0D] flex items-center justify-center border border-[#FDBA74]">
                <BookOpen className="w-5 h-5 text-[#FF8A3D]" />
              </div>
              <h3 className="text-sm font-bold text-[#201815]">Deterministic Rulebook</h3>
              <p className="text-xs text-[#7C6A5E] leading-relaxed">
                Every rule is anchored in official brand guidelines with word-for-word citations. No unverified hallucinated constraints.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF2E7] text-[#D95D0D] flex items-center justify-center border border-[#FDBA74]">
                <Lock className="w-5 h-5 text-[#FF8A3D]" />
              </div>
              <h3 className="text-sm font-bold text-[#201815]">Local Air-Gapped Privacy</h3>
              <p className="text-xs text-[#7C6A5E] leading-relaxed">
                Runs on local open-weight models without outbound network calls, keeping sensitive roadmaps inside your firewall.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF2E7] text-[#D95D0D] flex items-center justify-center border border-[#FDBA74]">
                <ShieldCheck className="w-5 h-5 text-[#FF8A3D]" />
              </div>
              <h3 className="text-sm font-bold text-[#201815]">HMAC-SHA256 Ledger</h3>
              <p className="text-xs text-[#7C6A5E] leading-relaxed">
                Cryptographic publication certificates guaranteeing tamper-proof governance compliance and regulatory audit readiness.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ─────── 6. Section: WHAT ONLY CANON OFFERS ─────── */}
      <section id="unique" className="py-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle warm radial background */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,138,61,0.07), transparent)" }} />

        <div className="max-w-6xl mx-auto space-y-16 relative z-10">

          {/* ── Section Header ── */}
          <div className="text-center space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#201815] text-[#FF8A3D] text-xs font-extrabold tracking-widest border border-[#382A20] shadow-md">
              <Microscope className="w-3.5 h-3.5" />
              INDUSTRY-FIRST CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#201815] tracking-tight leading-tight">
              What <span className="text-[#FF8A3D]">Nobody Else</span> Provides
            </h2>
            <p className="text-sm sm:text-base text-[#7C6A5E] max-w-2xl mx-auto leading-relaxed">
              Every tool in this space relies on probabilistic LLM outputs, cloud APIs, or manual human review.
              CANON is the <strong className="text-[#201815]">world's first deterministic Brand Governance Compiler</strong> — a category that did not exist before.
            </p>
          </div>

          {/* ── 7 Unique Differentiators ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Binary,
                label: "DETERMINISTIC — NOT PROBABILISTIC",
                color: "#FF8A3D",
                title: "Regex-Compiled Guardrails",
                desc: "Grammarly, Writer, and Acrolinx use LLM probability scores to decide what's 'wrong.' CANON compiles your brand PDF into machine-readable regex patterns that match byte-for-byte — the same input always produces the same audit result, every single time.",
                badge: "World First",
              },
              {
                icon: BadgeCheck,
                label: "ZERO FALSE FLAGS — BY CONTRACT",
                color: "#D95D0D",
                title: "No Citation → No Flag Guarantee",
                desc: "Every competitor can block your copy arbitrarily based on model confidence. CANON enforces a hard rule: if a blocking flag cannot cite an exact sentence from your approved brand rulebook, the system is prohibited from raising it. No hallucination, no censorship.",
                badge: "Structural",
              },
              {
                icon: Wand2,
                label: "SURGICAL — NOT PARAGRAPH REWRITES",
                color: "#FF8A3D",
                title: "Intent-Preserving Token Replacement",
                desc: "Tools like Jasper and Copy.ai regenerate entire paragraphs, erasing your voice. CANON replaces only the violating tokens: \"100% uptime\" → \"99.99% uptime\" — one token, one fix, zero creative drift.",
                badge: "Novel",
              },
              {
                icon: Key,
                label: "AIR-GAPPED — FULLY PRIVATE",
                color: "#027A48",
                title: "Zero Cloud Egress Architecture",
                desc: "Every competitor sends your drafts to OpenAI, Anthropic, or Google APIs. CANON runs local open-weight models (Qwen2.5) on your own hardware. Unreleased product names, upcoming financials, and lawsuit drafts stay inside your firewall permanently.",
                badge: "Enterprise Only",
              },
              {
                icon: Fingerprint,
                label: "CRYPTOGRAPHIC — NOT LOG FILES",
                color: "#D95D0D",
                title: "HMAC-SHA256 Tamper-Proof Ledger",
                desc: "Manual review leaves email trails that can be deleted. CANON generates an HMAC-SHA256 signed audit receipt per publication containing the content hash, approver identity, active rulebook version, and timestamp — forming an immutable chain of custody for legal and regulatory audit.",
                badge: "Unique",
              },
              {
                icon: Timer,
                label: "AUTO-EXPIRING FACTS — NEVER STALE",
                color: "#FF8A3D",
                title: "Verified Fact Vault with TTL Clock",
                desc: "No competitor tracks whether quoted statistics are still current. CANON's Fact Vault assigns TTL expiration timestamps to every verified number. When \"42,000 clients\" crosses its expiry date, it automatically surfaces as an EXPIRED flag before the claim goes live.",
                badge: "Novel",
              },
              {
                icon: FlaskConical,
                label: "TESTABLE — LIKE UNIT TESTS FOR BRAND",
                color: "#D95D0D",
                title: "Rule Unit Test Suite",
                desc: "Brand guidelines have never had automated regression tests. CANON lets you write test cases for every rule: \"This phrase SHOULD flag,\" \"This phrase SHOULD pass\" — and run them in CI/CD before shipping a new rulebook version. A software engineering approach applied to marketing.",
                badge: "Industry First",
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="group relative p-6 rounded-3xl border bg-white/90 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl overflow-hidden"
                  style={{
                    borderColor: `${card.color}30`,
                    boxShadow: `0 4px 20px -4px ${card.color}10`,
                  }}
                >
                  {/* Glow corner */}
                  <div
                    className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at top right, ${card.color}20, transparent 70%)`,
                    }}
                  />

                  {/* Badge */}
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold mb-4 tracking-widest"
                    style={{ background: `${card.color}18`, color: card.color, border: `1px solid ${card.color}35` }}
                  >
                    ★ {card.badge.toUpperCase()}
                  </span>

                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"
                      style={{ background: `${card.color}18`, border: `1px solid ${card.color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: card.color }} />
                    </div>
                    <div>
                      <p className="text-[9px] font-extrabold tracking-widest" style={{ color: card.color }}>
                        {card.label}
                      </p>
                      <h3 className="text-sm font-extrabold text-[#201815] mt-0.5 leading-snug">{card.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-[#7C6A5E] leading-relaxed">{card.desc}</p>

                  {/* Animated underline on hover */}
                  <div
                    className="mt-4 h-0.5 w-0 group-hover:w-full rounded-full transition-all duration-500"
                    style={{ background: `linear-gradient(90deg, ${card.color}, ${card.color}40)` }}
                  />
                </div>
              );
            })}
          </div>

          {/* ── Feature Comparison Matrix ── */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF2E7] text-[#D95D0D] text-xs font-extrabold border border-[#FDBA74]">
                <TrendingUp className="w-3.5 h-3.5 text-[#FF8A3D]" />
                COMPETITIVE MATRIX
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#201815]">
                CANON vs Everyone Else
              </h3>
              <p className="text-xs text-[#7C6A5E]">
                An honest, feature-by-feature breakdown against the leading tools in the content governance space.
              </p>
            </div>

            <div className="rounded-3xl border border-[#F4E2D3] overflow-hidden shadow-lg shadow-[#FF8A3D]/5 bg-white/95 backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#F4E2D3]" style={{ background: "linear-gradient(90deg,#FFF5EC,#FFFBF7)" }}>
                      <th className="text-left px-5 py-4 font-extrabold text-[#201815] text-sm w-56">Capability</th>
                      {[
                        { name: "CANON",    color: "#FF8A3D", highlight: true },
                        { name: "Grammarly",color: "#7C6A5E", highlight: false },
                        { name: "Writer.ai",color: "#7C6A5E", highlight: false },
                        { name: "Acrolinx", color: "#7C6A5E", highlight: false },
                        { name: "Manual",   color: "#7C6A5E", highlight: false },
                      ].map((col) => (
                        <th key={col.name} className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-extrabold ${
                              col.highlight
                                ? "bg-gradient-to-r from-[#FF8A3D] to-[#FF5F0F] text-white shadow-md shadow-[#FF8A3D]/30"
                                : "bg-[#F5F0ED] text-[#7C6A5E]"
                            }`}
                          >
                            {col.name}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4E2D3]">
                    {[
                      { feature: "Deterministic (100% reproducible results)",           vals: [true,  false, false, false, false] },
                      { feature: "No citation → no flag enforcement",                   vals: [true,  false, false, false, false] },
                      { feature: "Surgical token-level fix (preserves your voice)",     vals: [true,  false, false, false, false] },
                      { feature: "Local-first / zero cloud egress",                     vals: [true,  false, false, false, true]  },
                      { feature: "HMAC-SHA256 cryptographic audit trail",               vals: [true,  false, false, false, false] },
                      { feature: "Fact Vault with TTL auto-expiration",                 vals: [true,  false, false, false, false] },
                      { feature: "Rule unit test suite (CI/CD ready)",                  vals: [true,  false, false, false, false] },
                      { feature: "Brand PDF → executable rulebook compiler",            vals: [true,  false, "Partial", "Partial", false] },
                      { feature: "Multi-tier risk framework (block / warn / pass)",     vals: [true,  false, true,  true,  false] },
                      { feature: "Grammar & style suggestions",                          vals: ["Partial", true, true, true, false] },
                      { feature: "Real-time inline editor",                             vals: [true,  true,  true,  true,  false] },
                      { feature: "Open source & self-hostable",                         vals: [true,  false, false, false, false] },
                    ].map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-[#FFFBF7]"} style={{ transition: "background 0.2s" }}>
                        <td className="px-5 py-3.5 font-semibold text-[#201815] text-xs leading-snug">{row.feature}</td>
                        {row.vals.map((v, ci) => (
                          <td key={ci} className="px-4 py-3.5 text-center">
                            {v === true ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                                ci === 0 ? "bg-[#FFF2E7]" : "bg-[#EDFDF5]"
                              }`}>
                                <CheckCircle2 className={`w-4 h-4 ${ci === 0 ? "text-[#FF8A3D]" : "text-[#027A48]"}`} />
                              </span>
                            ) : v === false ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#FFF0F0]">
                                <X className="w-3.5 h-3.5 text-[#B42318]" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[10px] font-bold text-[#92400E]">
                                {v}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-center text-[11px] text-[#A49184] font-medium">
              ✦ Based on publicly available product documentation as of 2025. \"Partial\" denotes limited or add-on capabilities.
            </p>
          </div>

          {/* ── Industry Gap Explainer ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-7 rounded-3xl border border-[#F4E2D3] bg-white/90 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF0F0] border border-[#FECDCA] flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-[#B42318]" />
                </div>
                <h4 className="text-base font-extrabold text-[#201815]">The Problem Nobody Solved</h4>
              </div>
              <p className="text-xs text-[#7C6A5E] leading-relaxed">
                Existing tools treat governance as a <strong className="text-[#201815]">blog writing / grammar problem</strong>.
                They ignore product brand architecture, logo clearspace isolation, registered trademark symbols, and hardware specification expiry.
                When marketing or partners alter logos or use deprecated product names, existing writing assistants say nothing.
              </p>
              <div className="space-y-2">
                {[
                  "Grammarly / Writer.ai: blog copywriting tools — zero product naming or logo checks",
                  "Asset DAMs (Figma, Brandfolder): passive file storage — no automated enforcement",
                  "Manual brand audits: take weeks, inconsistent across distributors, untraceable in email",
                  "Trademark infringement risks: unmonitored partner collateral dilutes brand equity",
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-[#7C6A5E]">
                    <X className="w-3.5 h-3.5 text-[#B42318] shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-7 rounded-3xl border border-[#FDBA74] bg-gradient-to-br from-[#FFF5EC] to-[#FFFBF7] space-y-4 relative overflow-hidden">
              <BorderBeam duration={10} size={180} colorFrom="#FF8A3D" colorTo="#FFAE74" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF8A3D] to-[#FF5F0F] flex items-center justify-center shadow-md shadow-[#FF8A3D]/30">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-base font-extrabold text-[#201815]">What CANON Introduces</h4>
              </div>
              <p className="text-xs text-[#7C6A5E] leading-relaxed">
                CANON treats brand identity and product governance as a <strong className="text-[#201815]">compiler problem</strong>.
                Your brand rulebook, vector logo dimensions, registered trademark rules, and certified product specs are compiled into deterministic guardrails and run locally — instantly, reproducibility, and with full citation transparency.
              </p>
              <div className="space-y-2">
                {[
                  "Product Naming Compiler: catches deprecated aliases and enforces CamelCase",
                  "Logo Clearspace & Dimension Engine: prevents distorted aspect ratios and crowding",
                  "Mandatory Trademark Guard: verifies ® and ™ designations upon initial reference",
                  "HMAC-SHA256 signed brand receipts: cryptographic proof of brand compliance",
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-[#201815] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF8A3D] shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Open Source / Category Creator Banner ── */}
          <div
            className="relative text-center py-12 px-6 rounded-3xl overflow-hidden border border-[#382A20]"
            style={{ background: "linear-gradient(135deg,#201815 0%,#2E1E16 50%,#1A1008 100%)" }}
          >
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{
              backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,138,61,0.4), transparent 50%), radial-gradient(circle at 75% 40%, rgba(255,174,116,0.2), transparent 50%)"
            }} />
            <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF8A3D]/20 text-[#FF8A3D] text-[10px] font-extrabold tracking-widest border border-[#FF8A3D]/30">
                <PackageOpen className="w-3.5 h-3.5" />
                APACHE 2.0 — OPEN SOURCE
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                CANON is a New Category — Built for Brands, Logos &amp; Product Names
              </h3>
              <p className="text-sm text-[#A49184] leading-relaxed">
                We are not a copywriting assistant. We are not a grammar checker.
                CANON is the first <span className="text-[#FFAE74] font-bold">Brand Governance Compiler</span> — software infrastructure for enterprises that need deterministic, cryptographic proof that every product name, vector logo, registered trademark, and specification is 100% compliant.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <MagnetButton strength={0.25}>
                  <Link
                    href="/login?tab=register"
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF8A3D] to-[#FF5F0F] text-white text-sm font-extrabold flex items-center gap-2 shadow-md shadow-[#FF8A3D]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    <span>Try CANON Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </MagnetButton>
                <Link
                  href="/guide"
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-sm font-bold border border-white/20 transition-all"
                >
                  Read the Docs
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. Section: FAQ Accordion */}
      <section id="faq" className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF2E7] text-[#D95D0D] text-xs font-extrabold border border-[#FDBA74]">
              <span>KNOWLEDGE BASE</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#201815]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#7C6A5E]">
              Technical and operational answers regarding CANON implementation.
            </p>
          </div>

          <div className="space-y-3.5">
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
                    <div className="p-5 pt-1 border-t border-[#FDF0E5] text-xs text-[#7C6A5E] leading-relaxed font-normal">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA Banner with BorderBeam & MagnetButton */}
      <section className="py-20 px-4 sm:px-6 bg-white/80 border-t border-[#F4E2D3]">
        <div className="relative max-w-4xl mx-auto p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-[#FFF5EC] via-[#FFFBF7] to-[#FFEAD9] border border-[#FDBA74] text-center space-y-6 shadow-xl shadow-[#FF8A3D]/10 overflow-hidden">
          <BorderBeam duration={8} size={250} colorFrom="#FF8A3D" colorTo="#FFAE74" borderWidth={2} />

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF8A3D] to-[#FF721B] text-white flex items-center justify-center mx-auto shadow-md shadow-[#FF8A3D]/30">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-[#201815] tracking-tight">
              Enforce Consistent Brand Governance Across Your Organization
            </h2>
            <p className="text-xs sm:text-sm text-[#7C6A5E] max-w-lg mx-auto leading-relaxed">
              Open source, fully private, and designed for modern marketing, legal, and engineering workflows.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <MagnetButton strength={0.25}>
              <Link
                href="/login?tab=register"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] hover:from-[#FF9952] hover:to-[#E8630D] text-white text-sm font-extrabold transition-all shadow-md shadow-[#FF8A3D]/30 flex items-center gap-2"
              >
                <span>Initialize Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </MagnetButton>

            <Link
              href="/login"
              className="px-5 py-3.5 rounded-2xl bg-white hover:bg-[#FFF5EC] text-[#201815] text-sm font-bold border border-[#F4E2D3] transition-all shadow-xs"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Public Footer */}
      <footer className="mt-auto py-8 bg-[#201815] text-[#A49184] text-xs px-4 sm:px-6 border-t border-[#382A20]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#FF8A3D] flex items-center justify-center text-white font-black text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-white">CANON — Brand Governance Compiler</span>
          </div>

          <div className="flex items-center gap-4 text-[#A49184]">
            <Link href="/login?tab=register" className="hover:text-white transition-colors">Access Portal</Link>
            <span>•</span>
            <Link href="/guide" className="hover:text-white transition-colors">Documentation</Link>
            <span>•</span>
            <Link href="/review" className="hover:text-white transition-colors">Review Studio</Link>
            <span>•</span>
            <span>Apache 2.0 Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
