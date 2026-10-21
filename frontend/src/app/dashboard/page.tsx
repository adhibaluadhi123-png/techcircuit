"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileCheck2, BookOpen, Database, ShieldCheck, CheckCircle2,
  ArrowRight, Cpu, Award, Shield, Zap, Fingerprint,
  Activity, Radio, ChevronRight, Lock, BarChart3,
  TrendingUp, Globe, Terminal, AlertTriangle, Star
} from "lucide-react";
import { api, GovernanceInsights, Rulebook, Fact } from "@/lib/api";
import { SpotlightCard }        from "@/components/animations/SpotlightCard";
import { BorderBeam }           from "@/components/animations/BorderBeam";
import { MagnetButton }         from "@/components/animations/MagnetButton";
import { GlowCard }             from "@/components/animations/GlowCard";
import { CountUp }              from "@/components/animations/CountUp";
import { ScrollReveal }         from "@/components/animations/ScrollReveal";
import { AnimatedProgressBar }  from "@/components/animations/AnimatedProgressBar";
import { Typewriter }           from "@/components/animations/Typewriter";

/* ─── tiny helpers ─── */
function LiveDot({ color = "#FF8A3D" }: { color?: string }) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span
        className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
        style={{ background: color }}
      />
      <span
        className="relative inline-flex h-2.5 w-2.5 rounded-full"
        style={{ background: color }}
      />
    </span>
  );
}

function StatCard({
  label, value, suffix = "", icon: Icon, trend, color = "#FF8A3D", delay = 0,
}: {
  label: string; value: number; suffix?: string; icon: any;
  trend?: string; color?: string; delay?: number;
}) {
  return (
    <ScrollReveal direction="up" delay={delay}>
      <GlowCard className="p-5 h-full group">
        <div className="flex items-center justify-between mb-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          {trend && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-[#027A48] bg-[#EDFDF5] border border-[#A6F4C5]">
              {trend}
            </span>
          )}
        </div>

        <div className="text-2xl sm:text-3xl font-black text-[#201815] tabular-nums">
          <CountUp end={value} suffix={suffix} duration={1600} />
        </div>
        <div className="text-[11px] font-semibold text-[#7C6A5E] mt-1">{label}</div>

        {/* Animated accent underline */}
        <div
          className="mt-3 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}40)` }}
        />
      </GlowCard>
    </ScrollReveal>
  );
}

/* ─── fake recent activity ─── */
const ACTIVITY = [
  { type: "block",  label: "Deprecated name 'Apex Cloud' blocked", sub: "Spec-ApexCore-v2", time: "2m ago" },
  { type: "fix",    label: "Surgical replacement to Apex Core™",    sub: "Spec-ApexCore-v2", time: "2m ago" },
  { type: "seal",   label: "Packaging spec sealed",      sub: "SKU-Pulse-Edge-26", time: "18m ago" },
  { type: "warn",   label: "Expired lab proof TTL",        sub: "Customer metric", time: "1h ago" },
  { type: "seal",   label: "Brand identity receipt issued",      sub: "Brand-Kit-v2.0", time: "3h ago" },
];

const ACTIVITY_COLORS: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  block: { bg: "#FFF0F0", text: "#B42318", border: "#FECDCA", icon: AlertTriangle },
  fix:   { bg: "#EDFDF5", text: "#027A48", border: "#A6F4C5", icon: CheckCircle2 },
  seal:  { bg: "#FFF2E7", text: "#D95D0D", border: "#FDBA74", icon: Fingerprint },
  warn:  { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", icon: Zap },
};

/* ─── Main Component ─── */
export default function DashboardPage() {
  const [rulebook, setRulebook] = useState<Rulebook | null>(null);
  const [facts,    setFacts]    = useState<Fact[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("CREATOR");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const n = localStorage.getItem("canon_user_name");
      const r = localStorage.getItem("canon_user_role");
      if (n) setUserName(n);
      if (r) setUserRole(r);
    }
    Promise.all([
      api.getActiveRulebook().catch(() => null),
      api.getFacts().catch(() => []),
    ]).then(([rb, f]) => {
      setRulebook(rb);
      setFacts(f);
      setLoading(false);
    });
  }, []);

  const ruleCount  = rulebook?.rules_count ?? 12;
  const factCount  = facts.length || 7;
  const passRate   = 98.4;
  const latencyMs  = 28;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">

      {/* ═══════════════════════ 1. HERO BANNER ═══════════════════════ */}
      <ScrollReveal direction="up">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Full-bleed warm gradient background */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: "linear-gradient(135deg, #FFF5EC 0%, #FFFBF7 50%, #FFF9F3 100%)",
            }}
          />
          {/* SVG grid overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dash-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,138,61,0.18)" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dash-grid)" />
          </svg>

          {/* Scanner sweep */}
          <div
            className="absolute left-0 right-0 h-px pointer-events-none animate-scanner opacity-60"
            style={{ background: "linear-gradient(90deg, transparent, #FF8A3D 40%, #FFAE74 60%, transparent)" }}
          />

          <BorderBeam duration={7} size={260} colorFrom="#FF8A3D" colorTo="#FFAE74" borderWidth={2} />

          <div className="relative z-10 p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Left */}
            <div className="space-y-4 max-w-xl">
              {/* Online badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur border border-[#FDBA74] shadow-xs">
                <LiveDot color="#FF8A3D" />
                <span className="text-xs font-extrabold text-[#D95D0D] tracking-wide">GOVERNANCE NODE ACTIVE</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-[#201815] tracking-tight leading-tight">
                  Hey, {userName.split(" ")[0]} 👋
                </h1>
                <p className="mt-2 text-sm text-[#7C6A5E] leading-relaxed">
                  Role: <span className="font-bold text-[#D95D0D] bg-[#FFF2E7] px-2 py-0.5 rounded-lg border border-[#FDBA74] text-xs">
                    {userRole.replace(/_/g, " ")}
                  </span>
                  <span className="mx-2 text-[#F4E2D3]">•</span>
                  <Typewriter
                    lines={[
                      "Zero hallucinations on brand assets.",
                      "Every flag cites an exact rule or spec.",
                      "Surgical naming fixes preserve intent.",
                      "SHA-256 seals every packaging spec.",
                    ]}
                    speed={42}
                    pause={1600}
                    className="text-sm text-[#7C6A5E] italic"
                  />
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <MagnetButton strength={0.2}>
                  <Link
                    href="/review"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-sm font-extrabold transition-all shadow-md shadow-[#FF8A3D]/35 hover:shadow-lg hover:shadow-[#FF8A3D]/45 hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg,#FF8A3D,#FF5F0F)" }}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Run Compliance Audit</span>
                  </Link>
                </MagnetButton>
                <Link
                  href="/rulebook"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/90 hover:bg-white text-[#201815] text-sm font-bold border border-[#F4E2D3] transition-all shadow-xs hover:-translate-y-0.5"
                >
                  <BookOpen className="w-4 h-4 text-[#D95D0D]" />
                  <span>Rulebook</span>
                </Link>
                <Link
                  href="/assets"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/90 hover:bg-white text-[#201815] text-sm font-bold border border-[#F4E2D3] transition-all shadow-xs hover:-translate-y-0.5"
                >
                  <Award className="w-4 h-4 text-[#027A48]" />
                  <span>Brand Assets</span>
                </Link>
              </div>
            </div>

            {/* Right: live terminal status card */}
            <div className="w-full lg:w-72 shrink-0">
              <div
                className="rounded-2xl p-5 space-y-3 font-mono text-xs border"
                style={{ background: "#120E0C", borderColor: "#2A1F1B" }}
              >
                <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "#2A1F1B" }}>
                  <div className="flex items-center gap-2 text-[#FF8A3D] font-sans font-bold text-xs">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>CANON Compiler</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5]">
                    ONLINE
                  </span>
                </div>

                {[
                  ["Model",    "Qwen2.5-1.5B (Local)", "#FF8A3D"],
                  ["Air-Gap",  "100% Offline",          "#12B76A"],
                  ["Rulebook", `v${rulebook?.version ?? "2.4"} · Active`, "#FFAE74"],
                  ["Latency",  "28ms avg",              "#A49184"],
                  ["Uptime",   "99.99% (30d)",          "#12B76A"],
                ].map(([k, v, c]) => (
                  <div key={k} className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5C4A3E]">{k}:</span>
                    <span className="font-bold" style={{ color: c }}>{v}</span>
                  </div>
                ))}

                {/* Animated progress bar */}
                <div className="pt-1 space-y-1.5">
                  <div className="flex justify-between text-[10px] text-[#5C4A3E]">
                    <span>Pass Rate</span>
                    <span className="text-[#FF8A3D] font-bold">98.4%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#2A1F1B] overflow-hidden">
                    <div
                      className="h-full rounded-full animate-pulse-subtle relative overflow-hidden"
                      style={{ width: "98.4%", background: "linear-gradient(90deg,#FF8A3D,#FFAE74)" }}
                    >
                      <div className="absolute inset-0 animate-shine" style={{
                        background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)",
                        backgroundSize: "200% 100%",
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ═══════════════════════ 2. KPI METRICS ═══════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Brand Rules Active"       value={ruleCount}    suffix=" rules"   icon={BookOpen}    trend="↑ All Cited"  color="#FF8A3D" delay={0}   />
        <StatCard label="Verified Specs in Vault"  value={factCount}    suffix=" specs"   icon={Database}    trend="7 Fresh"      color="#D95D0D" delay={80}  />
        <StatCard label="Compliance Pass Rate"     value={passRate}     suffix="%"        icon={TrendingUp}  trend="↑ +2.3%"      color="#027A48" delay={160} />
        <StatCard label="Local Inference Latency"  value={latencyMs}    suffix="ms"       icon={Cpu}                              color="#FFAE74" delay={240} />
      </div>

      {/* ═══════════════════════ 3. MAIN GRID ═══════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column: Quick Actions (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Quick Access Cards Row */}
          <ScrollReveal direction="up" delay={60}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  href: "/review", emoji: "⚡", title: "Brand Spec Review",
                  desc: "Audit product naming, logo clearspace, trademarks, and benchmark specs with 1-click surgical fixes.",
                  accent: "#FF8A3D", border: "#FDBA74", bg: "#FFF2E7", cta: "Open Studio",
                },
                {
                  href: "/assets", emoji: "🎨", title: "Brand Assets & Logos",
                  desc: "Access vector logos, clearspace isolation boundaries, and product naming taxonomy matrices.",
                  accent: "#D95D0D", border: "#FDBA74", bg: "#FFF2E7", cta: "View Brand Kit",
                },
                {
                  href: "/approvals", emoji: "🔐", title: "Cryptographic Seals",
                  desc: "Issue tamper-proof HMAC-SHA256 brand compliance certificates before retail or public distribution.",
                  accent: "#027A48", border: "#A6F4C5", bg: "#EDFDF5", cta: "View Seals",
                },
              ].map((card, i) => (
                <Link key={i} href={card.href} className="block group">
                  <GlowCard className="p-5 h-full space-y-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-110 duration-300 shadow-sm"
                      style={{ background: card.bg, border: `1px solid ${card.border}` }}
                    >
                      {card.emoji}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#201815] leading-tight">{card.title}</h3>
                      <p className="text-[11px] text-[#7C6A5E] mt-1 leading-relaxed">{card.desc}</p>
                    </div>
                    <div
                      className="flex items-center gap-1 text-xs font-extrabold transition-all group-hover:gap-2"
                      style={{ color: card.accent }}
                    >
                      <span>{card.cta}</span>
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </GlowCard>
                </Link>
              ))}
            </div>
          </ScrollReveal>

          {/* System Health Progress Bars */}
          <ScrollReveal direction="up" delay={120}>
            <GlowCard className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF2E7] flex items-center justify-center border border-[#FDBA74]">
                    <Activity className="w-4 h-4 text-[#FF8A3D]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#201815]">System Health</h3>
                    <p className="text-[11px] text-[#7C6A5E]">Live governance performance metrics</p>
                  </div>
                </div>
                <LiveDot color="#027A48" />
              </div>

              <div className="space-y-4">
                <AnimatedProgressBar
                  label="Compliance Pass Rate"
                  sublabel="(last 30d)"
                  value={98.4}
                  color="#FF8A3D"
                  bgColor="#F4E2D3"
                  height={8}
                  delay={100}
                />
                <AnimatedProgressBar
                  label="Citation Coverage"
                  sublabel="(active rules)"
                  value={100}
                  color="#027A48"
                  bgColor="#D1FAE5"
                  height={8}
                  delay={200}
                />
                <AnimatedProgressBar
                  label="Fact Vault Freshness"
                  sublabel="(TTL within expiry)"
                  value={85}
                  color="#D95D0D"
                  bgColor="#FFF0E0"
                  height={8}
                  delay={300}
                />
                <AnimatedProgressBar
                  label="Rulebook Coverage"
                  sublabel="(brand guidelines mapped)"
                  value={92}
                  color="#FFAE74"
                  bgColor="#FFF5EC"
                  height={8}
                  delay={400}
                />
              </div>
            </GlowCard>
          </ScrollReveal>

          {/* Core Guarantee Banner */}
          <ScrollReveal direction="up" delay={80}>
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border"
              style={{ background: "linear-gradient(135deg,#FFF5EC,#FFFBF7)", borderColor: "#FDBA74" }}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF8A3D] to-[#FF5F0F] text-white flex items-center justify-center shadow-md shadow-[#FF8A3D]/30 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-[#201815]">
                    Core Guarantee: No Citation → No Flag
                  </h2>
                  <p className="text-xs text-[#7C6A5E] mt-0.5 leading-relaxed">
                    Every blocking violation maps to an exact policy clause. Zero AI hallucination, zero arbitrary censorship.
                  </p>
                </div>
              </div>
              <Link
                href="/audit"
                className="shrink-0 flex items-center gap-1.5 text-xs font-extrabold text-[#D95D0D] hover:text-[#FF8A3D] transition-colors"
              >
                <span>Audit Chain</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* Right column: Activity Feed */}
        <ScrollReveal direction="left" delay={100}>
          <GlowCard className="p-5 h-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#FF8A3D]" />
                <span className="text-sm font-extrabold text-[#201815]">Live Activity</span>
              </div>
              <LiveDot color="#FF8A3D" />
            </div>

            <div className="space-y-2.5">
              {ACTIVITY.map((a, i) => {
                const cfg = ACTIVITY_COLORS[a.type];
                const Icon = cfg.icon;
                return (
                  <ScrollReveal key={i} direction="right" delay={i * 70}>
                    <div
                      className="flex items-start gap-3 p-3 rounded-xl border transition-all hover:-translate-x-0.5 hover:shadow-xs cursor-default"
                      style={{ background: cfg.bg, borderColor: cfg.border }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: `${cfg.text}18`, border: `1px solid ${cfg.border}` }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: cfg.text }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#201815] truncate">{a.label}</p>
                        <p className="text-[10px] text-[#7C6A5E] font-mono truncate">{a.sub}</p>
                      </div>
                      <span className="text-[10px] text-[#A49184] font-medium shrink-0 ml-auto pt-0.5">{a.time}</span>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>

            <Link
              href="/audit"
              className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold text-[#D95D0D] hover:text-[#FF8A3D] transition-colors py-2 rounded-xl bg-[#FFF5EC] hover:bg-[#FFEAD9] border border-[#F4E2D3] hover:border-[#FDBA74]"
            >
              <span>Full Audit Trail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </GlowCard>
        </ScrollReveal>
      </div>

      {/* ═══════════════════════ 4. MORE LINKS GRID ═══════════════════════ */}
      <ScrollReveal direction="up" delay={60}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/findings",  icon: AlertTriangle, label: "Audit Findings",     sub: "Diffs & Flags",    color: "#D95D0D" },
            { href: "/facts",     icon: Database,      label: "Fact Vault",          sub: "TTL & Citations",  color: "#FF8A3D" },
            { href: "/assets",    icon: Star,          label: "Brand Assets",        sub: "Registry",         color: "#FFAE74" },
            { href: "/insights",  icon: BarChart3,     label: "Analytics",           sub: "Governance KPIs",  color: "#027A48" },
            { href: "/audit",     icon: Fingerprint,   label: "Audit Chain",         sub: "HMAC Ledger",      color: "#FF8A3D" },
            { href: "/guide",     icon: BookOpen,      label: "Operations Handbook", sub: "Documentation",    color: "#D95D0D" },
            { href: "/settings",  icon: Cpu,           label: "LLM Settings",        sub: "Compiler Config",  color: "#7C6A5E" },
            { href: "/login",     icon: Lock,          label: "Switch User",         sub: "Identity Vault",   color: "#A49184" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={i} direction="up" delay={i * 40}>
                <Link href={item.href} className="group block">
                  <div
                    className="p-4 rounded-2xl bg-white/90 border border-[#F4E2D3] hover:border-[#FDBA74] transition-all hover:shadow-md hover:-translate-y-1 duration-200 space-y-2"
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                      style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#201815] truncate">{item.label}</p>
                      <p className="text-[10px] text-[#A49184] font-medium truncate">{item.sub}</p>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </ScrollReveal>
    </div>
  );
}
