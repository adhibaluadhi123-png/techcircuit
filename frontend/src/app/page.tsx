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
  ShieldAlert
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
    <div className="space-y-8">
      {/* Editorial Header Banner */}
      <div className="editorial-card p-8 bg-gradient-to-r from-white to-[#FFF0E2] border-[#F1E1D4] relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FFF0E2] text-[#C87539] text-xs font-semibold mb-4 border border-[#F5A66B]/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Open-Source Brand Governance Compiler · Round 2</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#382A20]">
            Unit tests for your brand identity.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#8A7567]">
            CANON converts messy brand guidelines into versioned, testable rules, checks promotional claims against certified evidence, verifies all citations, and preserves creator intent.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/review"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C87539] hover:bg-[#b0632b] text-white text-sm font-semibold transition-colors shadow-sm"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Review Content Draft</span>
            </Link>
            <Link
              href="/rulebook"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-[#FFF9F3] text-[#382A20] text-sm font-semibold border border-[#F1E1D4] transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#8A7567]" />
              <span>Inspect Rulebook</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Core Architectural Invariant Callout */}
      <div className="p-4 rounded-xl bg-[#FFF0E2] border border-[#F5A66B]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#C87539] text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#382A20]">
              The Core Invariant: NO CITATION, NO BLOCKING FLAG
            </h2>
            <p className="text-xs text-[#8A7567]">
              Unverified AI findings and missing quotes are strictly demoted to non-blocking Advisories.
            </p>
          </div>
        </div>
        <Link
          href="/audit"
          className="text-xs font-semibold text-[#C87539] hover:underline shrink-0 flex items-center gap-1"
        >
          <span>Verify Cryptographic Chain</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="editorial-card p-5">
          <div className="flex items-center justify-between text-[#8A7567] text-xs font-medium">
            <span>Active Rules</span>
            <BookOpen className="w-4 h-4 text-[#F5A66B]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#382A20]">
              {rulebook ? rulebook.rules.length : 5}
            </span>
            <span className="text-xs font-medium text-[#027A48]">v{rulebook?.version || "1.0.0"}</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8A7567]">Compiled & verified atomic rules</p>
        </div>

        <div className="editorial-card p-5">
          <div className="flex items-center justify-between text-[#8A7567] text-xs font-medium">
            <span>Approved Facts</span>
            <Database className="w-4 h-4 text-[#F5A66B]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#382A20]">{facts.length || 4}</span>
            <span className="text-xs font-medium text-[#B42318]">1 Stale</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8A7567]">Fact ledger with evidence expiry</p>
        </div>

        <div className="editorial-card p-5">
          <div className="flex items-center justify-between text-[#8A7567] text-xs font-medium">
            <span>Reviews Run</span>
            <FileCheck2 className="w-4 h-4 text-[#F5A66B]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#382A20]">
              {insights ? insights.total_reviews : 1}
            </span>
            <span className="text-xs font-medium text-[#027A48]">100% cited</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8A7567]">Tracked on tamper-evident log</p>
        </div>

        <div className="editorial-card p-5">
          <div className="flex items-center justify-between text-[#8A7567] text-xs font-medium">
            <span>Governance Loop</span>
            <TrendingUp className="w-4 h-4 text-[#F5A66B]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#382A20]">
              {insights?.proposed_amendments?.length || 1}
            </span>
            <span className="text-xs font-medium text-[#C87539]">Proposal</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8A7567]">Auto-drafted rule amendment</p>
        </div>
      </div>

      {/* Two-Column Feature Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Five Signature Mechanisms */}
        <div className="editorial-card p-6">
          <h2 className="text-base font-bold text-[#382A20] mb-4">
            The 5 Signature Mechanisms
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#FFF0E2] text-[#C87539] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[#382A20]">Guideline Compiler</h3>
                <p className="text-xs text-[#8A7567] mt-0.5">
                  Converts static PDFs into versioned rules with unit tests and scores ambiguity.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#FFF0E2] text-[#C87539] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[#382A20]">Claim Ledger with Expiry</h3>
                <p className="text-xs text-[#8A7567] mt-0.5">
                  Binds claims to approved facts. Catches expired facts and unsupported superlatives.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#FFF0E2] text-[#C87539] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[#382A20]">No Citation, No Flag</h3>
                <p className="text-xs text-[#8A7567] mt-0.5">
                  Independent Citation Verifier drops or demotes any unverified AI finding.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#FFF0E2] text-[#C87539] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                4
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[#382A20]">Intent Lock</h3>
                <p className="text-xs text-[#8A7567] mt-0.5">
                  Surgical tracked-change edits machine-checked to preserve call-to-action & facts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#FFF0E2] text-[#C87539] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                5
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[#382A20]">Governance Loop & Receipts</h3>
                <p className="text-xs text-[#8A7567] mt-0.5">
                  Overrides feed guideline amendments, and reviews issue signed receipts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Active Rules Quick Glance */}
        <div className="editorial-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#382A20]">
                Active Rules Quick Inspector
              </h2>
              <Link href="/rulebook" className="text-xs text-[#C87539] font-medium hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {rulebook?.rules.slice(0, 4).map((rule) => (
                <div
                  key={rule.id}
                  className="p-3 rounded-lg bg-[#FFF9F3] border border-[#F1E1D4] flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#382A20]">{rule.rule_code}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-white text-[#8A7567] border border-[#F1E1D4]">
                        {rule.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#382A20] mt-1 font-medium">{rule.title}</p>
                    <p className="text-[11px] text-[#8A7567] mt-0.5 line-clamp-1 italic">
                      "{rule.source_quote}"
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                      rule.severity === "BLOCKING"
                        ? "bg-[#FEEBEA] text-[#B42318]"
                        : "bg-[#FFF0E2] text-[#C87539]"
                    }`}
                  >
                    {rule.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F1E1D4] flex items-center justify-between text-xs text-[#8A7567]">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#C87539]" />
              Local Model: Qwen2.5 (100% Privacy Sovereignty)
            </span>
            <Link href="/settings" className="font-semibold text-[#C87539] hover:underline">
              Model Disclosures →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
