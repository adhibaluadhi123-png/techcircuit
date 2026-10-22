"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  CheckCircle2,
  Sparkles,
  Check
} from "lucide-react";
import { api, GovernanceInsights } from "@/lib/api";

interface ExplainerStep {
  step: string;
  badgeTone: string;
  title: string;
  description: string;
}

const GOVERNANCE_STEPS: readonly ExplainerStep[] = [
  {
    step: "1",
    badgeTone: "bg-[#C87539]",
    title: "Creators Request Overrides",
    description: "When a rule causes friction (e.g. for seasonal marketing campaigns), authors request an approved exception.",
  },
  {
    step: "2",
    badgeTone: "bg-[#C87539]",
    title: "System Identifies Pattern",
    description: "If multiple creators override the same rule, FIDELIS flags the guideline as ambiguous or overly restrictive.",
  },
  {
    step: "3",
    badgeTone: "bg-[#027A48]",
    title: "Brand Manager Amends Policy",
    description: "The Brand Lead reviews the proposed update and accepts it with 1 click, updating guidelines for everyone.",
  },
];

export default function InsightsPage() {
  const [governanceData, setGovernanceData] = useState<GovernanceInsights | null>(null);
  const [activeMutationId, setActiveMutationId] = useState<string | null>(null);
  const [bannerFeedback, setBannerFeedback] = useState<string | null>(null);

  const fetchInsightsData = useCallback(async () => {
    try {
      const payload = await api.getInsights();
      setGovernanceData(payload);
    } catch (failure) {
      setGovernanceData(null);
    }
  }, []);

  useEffect(() => {
    fetchInsightsData();
  }, [fetchInsightsData]);

  const commitAmendment = async (ruleId: string) => {
    setActiveMutationId(ruleId);
    try {
      await api.acceptAmendment(ruleId);
      await fetchInsightsData();
      setBannerFeedback("Rulebook updated successfully! New guideline version is live.");
      setTimeout(() => setBannerFeedback(null), 4000);
    } catch {
      setBannerFeedback(null);
    } finally {
      setActiveMutationId(null);
    }
  };

  const cumulativeFindings = useMemo(() => {
    const list = governanceData?.findings_by_category ?? [];
    const sum = list.reduce((total, cur) => total + cur.count, 0);
    return sum > 0 ? sum : 1;
  }, [governanceData]);

  const metricCards = useMemo(() => {
    return [
      {
        tag: "Total Content Reviews",
        metric: governanceData?.total_reviews ?? 0,
        tint: "text-[#382A20]",
        annotation: "Processed through hybrid pipeline",
      },
      {
        tag: "Exceptions Documented",
        metric: governanceData?.exception_reviews ?? 0,
        tint: "text-[#C87539]",
        annotation: "Recorded on hash chain with reasons",
      },
      {
        tag: "Stale Claims Caught",
        metric: governanceData?.stale_claims_detected ?? 1,
        tint: "text-[#B42318]",
        annotation: "Expired evidence prevented from publishing",
      },
      {
        tag: "Ambiguous Rules Targeted",
        metric: governanceData?.ambiguous_rules_count ?? 0,
        tint: "text-[#C87539]",
        annotation: "Amended to clarify wording",
      },
    ];
  }, [governanceData]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {bannerFeedback && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#027A48] text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-white" />
          <span>{bannerFeedback}</span>
        </div>
      )}

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
            When teams repeatedly request exceptions, FIDELIS detects the pattern and recommends amending the rulebook itself.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5] flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Governance Loop Active</span>
          </span>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-[#F1E1D4] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#C87539]" />
          <h2 className="text-base font-bold text-[#382A20]">
            How the Governance Loop Works (In Plain English)
          </h2>
        </div>
        <p className="text-xs text-[#8A7567] leading-relaxed">
          Traditional brand guidelines get outdated because nobody updates them when reality changes. FIDELIS closes the loop:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {GOVERNANCE_STEPS.map((item) => (
            <div key={item.step} className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] relative">
              <span className={`w-6 h-6 rounded-full ${item.badgeTone} text-white text-xs font-bold flex items-center justify-center mb-2`}>
                {item.step}
              </span>
              <h3 className="text-xs font-bold text-[#382A20]">{item.title}</h3>
              <p className="text-[11px] text-[#8A7567] mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((tile, i) => (
          <div key={i} className="editorial-card p-5 bg-white border border-[#F1E1D4] shadow-2xs">
            <div className="text-xs font-bold text-[#8A7567] uppercase">{tile.tag}</div>
            <div className={`text-3xl font-bold ${tile.tint} mt-2`}>
              {tile.metric}
            </div>
            <p className="text-[11px] text-[#8A7567] mt-1">{tile.annotation}</p>
          </div>
        ))}
      </div>

      <div className="editorial-card p-6 bg-white border border-[#F1E1D4] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#F1E1D4]">
          <h2 className="text-sm font-bold text-[#382A20] uppercase tracking-wider">
            Findings Distribution by Category
          </h2>
          <span className="text-xs text-[#8A7567]">Where brand violations occur most</span>
        </div>

        <div className="space-y-3">
          {(governanceData?.findings_by_category || []).length === 0 ? (
            <p className="text-xs text-[#8A7567] italic p-4 text-center">
              No review findings recorded yet. Run content reviews to view category distribution.
            </p>
          ) : (
            (governanceData?.findings_by_category || []).map((fc) => {
              const ratio = Math.round((fc.count / cumulativeFindings) * 100) || 0;
              return (
                <div key={fc.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#382A20]">{fc.category}</span>
                    <span className="text-[#8A7567] font-semibold">{fc.count} findings ({ratio}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#FFF0E2] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#F5A66B] to-[#C87539] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(ratio, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

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

        <div className="space-y-4 pt-2">
          {(governanceData?.proposed_amendments || []).length === 0 ? (
            <div className="p-8 text-center bg-[#FFF9F3] border border-dashed border-[#F1E1D4] rounded-2xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#027A48] mx-auto opacity-75" />
              <h3 className="text-sm font-bold text-[#382A20]">No Rule Amendments Currently Recommended</h3>
              <p className="text-xs text-[#8A7567] max-w-md mx-auto leading-relaxed">
                When content creators repeatedly override a specific rule with justified reasons, the self-improving governance engine will automatically cluster the feedback and draft proposed guideline revisions here.
              </p>
            </div>
          ) : (
            governanceData?.proposed_amendments.map((amendment) => {
              const adopted = amendment.status === "ACCEPTED";
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
                        adopted
                          ? "bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5]"
                          : "bg-[#FFF0E2] text-[#C87539] border border-[#F5A66B]/30"
                      }`}
                    >
                      {adopted ? "✓ ADOPTED IN RULEBOOK" : "ACTION RECOMMENDED"}
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
                    {!adopted ? (
                      <button
                        onClick={() => commitAmendment(amendment.id)}
                        disabled={activeMutationId === amendment.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>{activeMutationId === amendment.id ? "Amending Rule..." : "Accept & Update Rulebook"}</span>
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
            })
          )}
        </div>
      </div>
    </div>
  );
}
