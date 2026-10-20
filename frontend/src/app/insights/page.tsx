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
  Layers
} from "lucide-react";
import { api, GovernanceInsights } from "@/lib/api";

export default function InsightsPage() {
  const [insights, setInsights] = useState<GovernanceInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

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
    } catch (err) {
      console.error("Error accepting amendment:", err);
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#382A20]">
            Governance Insights & Continuous Improvement Loop
          </h1>
          <p className="text-sm text-[#8A7567] mt-1">
            Turns human overrides into data-driven guideline amendments, eliminating recurring brand confusion.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Governance Loop Active</span>
          </span>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="editorial-card p-5 bg-white">
          <div className="text-xs font-bold text-[#8A7567] uppercase">Total Content Reviews</div>
          <div className="text-2xl font-bold text-[#382A20] mt-2">
            {insights?.total_reviews || 0}
          </div>
          <p className="text-[11px] text-[#8A7567] mt-1">Processed through hybrid pipeline</p>
        </div>

        <div className="editorial-card p-5 bg-white">
          <div className="text-xs font-bold text-[#8A7567] uppercase">Exceptions Documented</div>
          <div className="text-2xl font-bold text-[#C87539] mt-2">
            {insights?.exception_reviews || 0}
          </div>
          <p className="text-[11px] text-[#8A7567] mt-1">Recorded on hash chain with reasons</p>
        </div>

        <div className="editorial-card p-5 bg-white">
          <div className="text-xs font-bold text-[#8A7567] uppercase">Stale Claims Caught</div>
          <div className="text-2xl font-bold text-[#B42318] mt-2">
            {insights?.stale_claims_detected || 1}
          </div>
          <p className="text-[11px] text-[#8A7567] mt-1">Expired evidence prevented from publishing</p>
        </div>

        <div className="editorial-card p-5 bg-white">
          <div className="text-xs font-bold text-[#8A7567] uppercase">Ambiguous Rules Flagged</div>
          <div className="text-2xl font-bold text-[#C87539] mt-2">
            {insights?.ambiguous_rules_count || 1}
          </div>
          <p className="text-[11px] text-[#8A7567] mt-1">Targeted for amendment</p>
        </div>
      </div>

      {/* Breakdown: Violations by Category */}
      <div className="editorial-card p-6 bg-white space-y-4">
        <h2 className="text-sm font-bold text-[#382A20] uppercase tracking-wider">
          Findings Distribution by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {insights?.findings_by_category.map((fc) => (
            <div key={fc.category} className="p-3 rounded-lg bg-[#FFF9F3] border border-[#F1E1D4]">
              <div className="text-xs font-medium text-[#8A7567]">{fc.category}</div>
              <div className="text-lg font-bold text-[#382A20] mt-1">{fc.count} findings</div>
            </div>
          ))}
        </div>
      </div>

      {/* Signature Feature: The Governance Loop & Amendment Proposals */}
      <div className="editorial-card p-6 bg-white space-y-4 border-l-4 border-l-[#C87539]">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1E1D4]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C87539]" />
            <h2 className="text-base font-bold text-[#382A20]">
              Governance Loop: Automated Guideline Amendment Proposals
            </h2>
          </div>
          <span className="text-xs text-[#8A7567] font-semibold">Human Approval Required</span>
        </div>

        <p className="text-xs text-[#8A7567] leading-relaxed">
          When creators repeatedly override a rule, or when a rule is scored as ambiguous, CANON does not merely penalize creators. It identifies that the guideline itself is the problem and automatically drafts a proposed rule amendment for the Brand Manager to inspect and accept.
        </p>

        {/* Proposals List */}
        <div className="space-y-4 pt-2">
          {insights?.proposed_amendments.map((amendment) => {
            const isAccepted = amendment.status === "ACCEPTED";
            return (
              <div
                key={amendment.id}
                className="p-5 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-[#FFF0E2] text-[#C87539] font-bold text-xs">
                      {amendment.rule_code}
                    </span>
                    <span className="text-xs font-bold text-[#382A20]">
                      {amendment.rule_title}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                      isAccepted
                        ? "bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5]"
                        : "bg-[#FFF0E2] text-[#C87539] border border-[#F5A66B]/30"
                    }`}
                  >
                    {amendment.status}
                  </span>
                </div>

                <div className="text-xs text-[#8A7567] font-medium">
                  Trigger: <strong className="text-[#382A20]">{amendment.trigger_reason}</strong>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-[#F1E1D4] text-xs">
                  <span className="font-bold text-[#027A48] mr-2">Proposed Amendment Text:</span>
                  <span className="text-[#382A20] leading-relaxed">
                    "{amendment.proposed_change}"
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#8A7567]">
                    Override frequency: {amendment.override_count} documented exceptions across reviews.
                  </span>
                  {!isAccepted ? (
                    <button
                      onClick={() => handleAcceptAmendment(amendment.id)}
                      disabled={acceptingId === amendment.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{acceptingId === amendment.id ? "Updating Rule..." : "Accept & Update Rulebook"}</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-[#027A48] flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Rulebook Updated Successfully</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Repeatedly Overridden Rules Table */}
      <div className="editorial-card p-6 bg-white space-y-3">
        <h2 className="text-sm font-bold text-[#382A20] uppercase tracking-wider">
          Repeatedly Overridden Rules & Operational Contexts
        </h2>
        <div className="space-y-3">
          {insights?.frequently_overridden_rules.map((rule) => (
            <div key={rule.rule_id} className="p-3.5 rounded-lg bg-[#FFF9F3] border border-[#F1E1D4] text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#382A20]">
                  {rule.rule_code} — {rule.rule_title}
                </span>
                <span className="font-bold text-[#C87539] px-2 py-0.5 rounded bg-white border border-[#F1E1D4]">
                  {rule.override_count} Overrides
                </span>
              </div>
              <div className="mt-2 text-[11px] text-[#8A7567]">
                Common Operational Reasons: {rule.common_reasons.join(" · ")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
