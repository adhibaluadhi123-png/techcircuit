"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Layers,
  Lightbulb,
  RefreshCw
} from "lucide-react";
import { api, GovernanceInsights } from "@/lib/api";

export default function InsightsPage() {
  const [insights, setInsights] = useState<GovernanceInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = () => {
    setLoading(true);
    api.getInsights()
      .then((data) => {
        setInsights(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading insights:", err);
        setLoading(false);
      });
  };

  const handleAcceptAmendment = async (id: string) => {
    setAcceptingId(id);
    try {
      await api.acceptAmendment(id);
      loadInsights();
      setToastMessage("Rulebook updated successfully! New guideline version is live.");
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Error accepting amendment:", err);
    } finally {
      setAcceptingId(null);
    }
  };

  const totalFindings = (insights?.findings_by_category || []).reduce((acc, c) => acc + c.count, 0) || 1;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#027A48] text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5] uppercase tracking-wide">
              Continuous Improvement
            </span>
            <span className="text-xs text-[#8A7567] font-medium">Data-Driven Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#382A20]">
            Brand Insights & Self-Improving Rulebook
          </h1>
          <p className="text-sm text-[#8A7567] mt-1">
            When teams repeatedly request exceptions, CANON detects the pattern and recommends amending the rulebook itself.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5] flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Governance Loop Active</span>
          </span>
        </div>
      </div>

      {/* Visual Governance Loop Diagram for Non-Technical Users */}
      <div className="p-6 rounded-2xl bg-white border border-[#F1E1D4] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#C87539]" />
          <h2 className="text-base font-bold text-[#382A20]">
            How the Governance Loop Works (In Plain English)
          </h2>
        </div>
        <p className="text-xs text-[#8A7567] leading-relaxed">
          Traditional brand guidelines get outdated because nobody updates them when reality changes. CANON closes the loop:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] relative">
            <span className="w-6 h-6 rounded-full bg-[#C87539] text-white text-xs font-bold flex items-center justify-center mb-2">1</span>
            <h3 className="text-xs font-bold text-[#382A20]">Creators Request Overrides</h3>
            <p className="text-[11px] text-[#8A7567] mt-1 leading-relaxed">
              When a rule causes friction (e.g. for seasonal marketing campaigns), authors request an approved exception.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] relative">
            <span className="w-6 h-6 rounded-full bg-[#C87539] text-white text-xs font-bold flex items-center justify-center mb-2">2</span>
            <h3 className="text-xs font-bold text-[#382A20]">System Identifies Pattern</h3>
            <p className="text-[11px] text-[#8A7567] mt-1 leading-relaxed">
              If multiple creators override the same rule, CANON flags the guideline as ambiguous or overly restrictive.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] relative">
            <span className="w-6 h-6 rounded-full bg-[#027A48] text-white text-xs font-bold flex items-center justify-center mb-2">3</span>
            <h3 className="text-xs font-bold text-[#382A20]">Brand Manager Amends Policy</h3>
            <p className="text-[11px] text-[#8A7567] mt-1 leading-relaxed">
              The Brand Lead reviews the proposed update and accepts it with 1 click, updating guidelines for everyone.
            </p>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="editorial-card p-5 bg-white border border-[#F1E1D4] shadow-2xs">
          <div className="text-xs font-bold text-[#8A7567] uppercase">Total Content Reviews</div>
          <div className="text-3xl font-bold text-[#382A20] mt-2">
            {insights?.total_reviews || 0}
          </div>
          <p className="text-[11px] text-[#8A7567] mt-1">Processed through hybrid pipeline</p>
        </div>

        <div className="editorial-card p-5 bg-white border border-[#F1E1D4] shadow-2xs">
          <div className="text-xs font-bold text-[#8A7567] uppercase">Exceptions Documented</div>
          <div className="text-3xl font-bold text-[#C87539] mt-2">
            {insights?.exception_reviews || 0}
          </div>
          <p className="text-[11px] text-[#8A7567] mt-1">Recorded on hash chain with reasons</p>
        </div>

        <div className="editorial-card p-5 bg-white border border-[#F1E1D4] shadow-2xs">
          <div className="text-xs font-bold text-[#8A7567] uppercase">Stale Claims Caught</div>
          <div className="text-3xl font-bold text-[#B42318] mt-2">
            {insights?.stale_claims_detected || 1}
          </div>
          <p className="text-[11px] text-[#8A7567] mt-1">Expired evidence prevented from publishing</p>
        </div>

        <div className="editorial-card p-5 bg-white border border-[#F1E1D4] shadow-2xs">
          <div className="text-xs font-bold text-[#8A7567] uppercase">Ambiguous Rules Targeted</div>
          <div className="text-3xl font-bold text-[#C87539] mt-2">
            {insights?.ambiguous_rules_count || 1}
          </div>
          <p className="text-[11px] text-[#8A7567] mt-1">Amended to clarify wording</p>
        </div>
      </div>

      {/* Visual Findings Distribution Bars */}
      <div className="editorial-card p-6 bg-white border border-[#F1E1D4] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#F1E1D4]">
          <h2 className="text-sm font-bold text-[#382A20] uppercase tracking-wider">
            Findings Distribution by Category
          </h2>
          <span className="text-xs text-[#8A7567]">Where brand violations occur most</span>
        </div>

        <div className="space-y-3">
          {(insights?.findings_by_category || []).map((fc) => {
            const pct = Math.round((fc.count / totalFindings) * 100) || 15;
            return (
              <div key={fc.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#382A20]">{fc.category}</span>
                  <span className="text-[#8A7567] font-semibold">{fc.count} findings ({pct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#FFF0E2] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#F5A66B] to-[#C87539] rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 8)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Signature Feature: The Governance Loop & Amendment Proposals */}
      <div className="editorial-card p-6 bg-white border border-[#F1E1D4] border-l-4 border-l-[#C87539] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1E1D4]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C87539]" />
            <h2 className="text-base font-bold text-[#382A20]">
              Automated Guideline Amendment Proposals
            </h2>
          </div>
          <span className="text-xs text-[#8A7567] font-semibold">Human Approval Required</span>
        </div>

        <p className="text-xs text-[#8A7567] leading-relaxed">
          The following proposed amendments were drafted automatically by analyzing recent review overrides. Brand Managers can review the wording and update the official rulebook in 1 click.
        </p>

        {/* Proposals List */}
        <div className="space-y-4 pt-2">
          {insights?.proposed_amendments.map((amendment) => {
            const isAccepted = amendment.status === "ACCEPTED";
            return (
              <div
                key={amendment.id}
                className="p-5 rounded-2xl bg-[#FFF9F3] border border-[#F1E1D4] space-y-3 shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#FFF0E2] text-[#C87539] font-bold text-xs font-mono">
                      {amendment.rule_code}
                    </span>
                    <h3 className="text-sm font-bold text-[#382A20]">
                      {amendment.rule_title}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                      isAccepted
                        ? "bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5]"
                        : "bg-[#FFF0E2] text-[#C87539] border border-[#F5A66B]/30"
                    }`}
                  >
                    {isAccepted ? "✓ ADOPTED IN RULEBOOK" : "ACTION RECOMMENDED"}
                  </span>
                </div>

                <div className="text-xs text-[#8A7567]">
                  Why proposed: <strong className="text-[#382A20]">{amendment.trigger_reason}</strong>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#F1E1D4] text-xs">
                  <span className="font-bold text-[#027A48] mr-2 block mb-1">
                    Proposed Clarified Phrasing:
                  </span>
                  <span className="text-[#382A20] leading-relaxed font-sans font-medium">
                    "{amendment.proposed_change}"
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-[#8A7567]">
                    Frequency: {amendment.override_count} documented overrides across recent reviews.
                  </span>
                  {!isAccepted ? (
                    <button
                      onClick={() => handleAcceptAmendment(amendment.id)}
                      disabled={acceptingId === amendment.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{acceptingId === amendment.id ? "Amending Rule..." : "Accept & Update Rulebook"}</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-[#027A48] flex items-center gap-1.5 bg-[#EDFDF5] px-3 py-1.5 rounded-xl border border-[#A6F4C5]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Guideline Updated Live for All Writers</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
