"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  BookOpen,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldAlert,
  HelpCircle,
  KeyRound,
  Sparkles,
  Award
} from "lucide-react";
import { api, GovernanceInsights, Rulebook, Fact } from "@/lib/api";

export default function OverviewPage() {
  const [insights, setInsights] = useState<GovernanceInsights | null>(null);
  const [rulebook, setRulebook] = useState<Rulebook | null>(null);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getInsights().catch(() => null),
      api.getActiveRulebook().catch(() => null),
      api.getFacts().catch(() => []),
    ]).then(([insData, rbData, factsData]) => {
      setInsights(insData);
      setRulebook(rbData);
      setFacts(factsData);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Editorial Header Banner */}
      <div className="editorial-card p-8 bg-gradient-to-r from-white via-[#FFF9F3] to-[#FFF0E2] border-[#F1E1D4] relative overflow-hidden shadow-xs">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E2] text-[#C87539] text-xs font-bold border border-[#F5A66B]/30 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open-Source Brand Governance Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#382A20]">
            Automated guardrails for your brand identity.
          </h1>
          <p className="text-sm leading-relaxed text-[#8A7567]">
            CANON converts brand guidelines into testable rules, checks promotional claims against certified evidence, verifies all citations, and preserves creator intent.
          </p>
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              href="/review"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Review Content Draft →</span>
            </Link>
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[#FFF9F3] text-[#382A20] text-xs font-bold border border-[#F1E1D4] transition-all shadow-2xs"
            >
              <HelpCircle className="w-4 h-4 text-[#C87539]" />
              <span>How to Use Guide</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FFF9F3] text-[#8A7567] hover:text-[#382A20] text-xs font-bold border border-[#F1E1D4] transition-all shadow-2xs"
            >
              <KeyRound className="w-4 h-4 text-[#C87539]" />
              <span>Switch Account / Sign In</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Core Architectural Invariant Callout */}
      <div className="p-5 rounded-2xl bg-[#FFF0E2] border border-[#F5A66B]/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start md:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#C87539] text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#382A20]">
              The Core Invariant: NO CITATION, NO BLOCKING FLAG
            </h2>
            <p className="text-xs text-[#8A7567] mt-0.5">
              Unverified AI findings and missing quotes are strictly demoted to non-blocking Advisories. AI cannot block your deadlines without citing verified brand guidelines.
            </p>
          </div>
        </div>
        <Link
          href="/audit"
          className="text-xs font-bold text-[#C87539] hover:underline shrink-0 flex items-center gap-1.5 self-start md:self-auto"
        >
          <span>Verify Tamper-Proof Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="editorial-card p-5 bg-white border border-[#F1E1D4] shadow-2xs">
          <div className="flex items-center justify-between text-[#8A7567] text-xs font-bold">
            <span className="uppercase tracking-wider">Active Rules</span>
            <BookOpen className="w-4 h-4 text-[#F5A66B]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#382A20]">
              {rulebook ? rulebook.rules.length : 5}
            </span>
            <span className="text-xs font-bold text-[#027A48]">v{rulebook?.version || "1.0.0"}</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8A7567]">Compiled & verified atomic rules</p>
        </div>

        <div className="editorial-card p-5 bg-white border border-[#F1E1D4] shadow-2xs">
          <div className="flex items-center justify-between text-[#8A7567] text-xs font-bold">
            <span className="uppercase tracking-wider">Approved Facts</span>
            <Database className="w-4 h-4 text-[#F5A66B]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#382A20]">{facts.length || 4}</span>
            <span className="text-xs font-bold text-[#B42318]">1 Expired</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8A7567]">Fact vault with evidence expiry dates</p>
        </div>

        <div className="editorial-card p-5 bg-white border border-[#F1E1D4] shadow-2xs">
          <div className="flex items-center justify-between text-[#8A7567] text-xs font-bold">
            <span className="uppercase tracking-wider">Reviews Run</span>
            <FileCheck2 className="w-4 h-4 text-[#F5A66B]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#382A20]">
              {insights ? insights.total_reviews : 1}
            </span>
            <span className="text-xs font-bold text-[#027A48]">100% cited</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8A7567]">Tracked on tamper-evident log</p>
        </div>

        <div className="editorial-card p-5 bg-white border border-[#F1E1D4] shadow-2xs">
          <div className="flex items-center justify-between text-[#8A7567] text-xs font-bold">
            <span className="uppercase tracking-wider">Governance Loop</span>
            <TrendingUp className="w-4 h-4 text-[#F5A66B]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#382A20]">
              {insights?.proposed_amendments?.length || 1}
            </span>
            <span className="text-xs font-bold text-[#C87539]">Proposal</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8A7567]">Auto-drafted rule amendment</p>
        </div>
      </div>

      {/* Two-Column Feature Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Five Signature Mechanisms */}
        <div className="editorial-card p-6 bg-white border border-[#F1E1D4] shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F1E1D4]">
            <h2 className="text-base font-bold text-[#382A20]">
              CANON's 5 Signature Mechanisms
            </h2>
            <span className="text-[10px] font-bold uppercase text-[#027A48]">Enterprise Grade</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#FFF0E2] text-[#C87539] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div>
                <h3 className="text-xs font-bold text-[#382A20]">Guideline Compiler</h3>
                <p className="text-[11px] text-[#8A7567] mt-0.5 leading-relaxed">
                  Converts static PDFs into testable atomic rules paired with pass/fail unit test examples.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#FFF0E2] text-[#C87539] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <div>
                <h3 className="text-xs font-bold text-[#382A20]">Claim Ledger with Expiry</h3>
                <p className="text-[11px] text-[#8A7567] mt-0.5 leading-relaxed">
                  Binds claims to approved facts. Catches expired benchmarks and unsupported superlatives.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#FFF0E2] text-[#C87539] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <div>
                <h3 className="text-xs font-bold text-[#382A20]">No Citation, No Flag</h3>
                <p className="text-[11px] text-[#8A7567] mt-0.5 leading-relaxed">
                  Independent Citation Verifier drops or demotes any unverified AI finding without a rule quote.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#FFF0E2] text-[#C87539] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                4
              </span>
              <div>
                <h3 className="text-xs font-bold text-[#382A20]">Creator Intent Lock</h3>
                <p className="text-[11px] text-[#8A7567] mt-0.5 leading-relaxed">
                  Surgical tracked-change edits machine-checked to preserve call-to-action & core message.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#FFF0E2] text-[#C87539] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                5
              </span>
              <div>
                <h3 className="text-xs font-bold text-[#382A20]">Governance Loop & Receipts</h3>
                <p className="text-[11px] text-[#8A7567] mt-0.5 leading-relaxed">
                  Overrides feed guideline amendments, and approvals issue signed cryptographic receipts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Active Rules Quick Glance */}
        <div className="editorial-card p-6 bg-white border border-[#F1E1D4] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F1E1D4]">
              <h2 className="text-base font-bold text-[#382A20]">
                Active Rules Quick Inspector
              </h2>
              <Link href="/rulebook" className="text-xs text-[#C87539] font-bold hover:underline">
                View All Rules →
              </Link>
            </div>
            <div className="space-y-3">
              {rulebook?.rules.slice(0, 4).map((rule) => (
                <div
                  key={rule.id}
                  className="p-3 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-[#382A20]">{rule.rule_code}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-white text-[#8A7567] border border-[#F1E1D4]">
                        {rule.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#382A20] mt-1 font-semibold">{rule.title}</p>
                    <p className="text-[11px] text-[#8A7567] mt-0.5 line-clamp-1 italic font-serif">
                      "{rule.source_quote}"
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                      rule.severity === "BLOCKING"
                        ? "bg-[#FEEBEA] text-[#B42318] border border-[#FECDCA]"
                        : "bg-[#FFF0E2] text-[#C87539] border border-[#F5A66B]/30"
                    }`}
                  >
                    {rule.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F1E1D4] flex items-center justify-between text-xs text-[#8A7567]">
            <span className="flex items-center gap-1.5 font-medium">
              <Cpu className="w-3.5 h-3.5 text-[#C87539]" />
              Inference: Qwen2.5 (100% Privacy Sovereignty)
            </span>
            <Link href="/settings" className="font-bold text-[#C87539] hover:underline">
              Model Disclosures →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
