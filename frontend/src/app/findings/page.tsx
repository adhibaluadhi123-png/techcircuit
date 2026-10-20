"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  UserCheck,
  Check,
  X,
  MessageSquare,
  Clock,
  Sparkles
} from "lucide-react";
import { api, ReviewResult, Finding } from "@/lib/api";

export default function FindingsPage() {
  const [reviewData, setReviewData] = useState<ReviewResult | null>(null);
  const [overrideModal, setOverrideModal] = useState<{ open: boolean; findingId: string }>({
    open: false,
    findingId: "",
  });
  const [overrideReason, setOverrideReason] = useState("");
  const [submittedForApproval, setSubmittedForApproval] = useState(false);

  useEffect(() => {
    // Load last review from localStorage or fetch latest from submissions
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("canon_last_review");
      if (saved) {
        try {
          setReviewData(JSON.parse(saved));
        } catch {}
      }
    }
  }, []);

  const handleDecision = async (findingId: string, decision: string, reason?: string) => {
    try {
      await api.updateFindingDecision(findingId, decision, reason);
      // Update local state
      if (reviewData) {
        const updatedFindings = reviewData.findings.map((f) =>
          f.id === findingId
            ? { ...f, user_decision: decision as any }
            : f
        );
        const updated = { ...reviewData, findings: updatedFindings };
        setReviewData(updated);
        localStorage.setItem("canon_last_review", JSON.stringify(updated));
      }
    } catch (err) {
      console.error("Error updating finding decision:", err);
    }
  };

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;
    handleDecision(overrideModal.findingId, "OVERRIDDEN", overrideReason);
    setOverrideModal({ open: false, findingId: "" });
    setOverrideReason("");
  };

  if (!reviewData) {
    return (
      <div className="editorial-card p-12 text-center bg-white">
        <FileCheck2 className="w-10 h-10 text-[#C87539] mx-auto mb-3" />
        <h2 className="text-base font-bold text-[#382A20]">No Active Review Findings</h2>
        <p className="text-xs text-[#8A7567] mt-1 max-w-md mx-auto">
          Submit a draft in the Content Review Studio to inspect deterministic violations, claim evidence, and minimal corrections.
        </p>
        <Link
          href="/review"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-semibold shadow-xs"
        >
          <span>Go to Content Review Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#8A7567] uppercase">Submission Review</span>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                reviewData.blocking_findings_count > 0
                  ? "bg-[#FEEBEA] text-[#B42318] border border-[#FECDCA]"
                  : "bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5]"
              }`}
            >
              {reviewData.overall_status.replace("_", " ")}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#382A20] mt-1">
            Review Findings & Verification Ledger
          </h1>
          <p className="text-xs text-[#8A7567] mt-1">
            Every blocking finding is verified against approved rule citations. Unverified findings are demoted to Advisory.
          </p>
        </div>

        <Link
          href="/approvals"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-semibold shadow-xs"
        >
          <UserCheck className="w-4 h-4" />
          <span>Open Approval Queue</span>
        </Link>
      </div>

      {/* Top Banner: Verification Invariant Proof */}
      <div className="p-4 rounded-xl bg-[#FFF0E2] border border-[#F5A66B]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#C87539] shrink-0" />
          <div className="text-xs text-[#382A20]">
            <span className="font-bold">Citation Verification Guarantee: </span>
            {reviewData.findings.length} findings evaluated. All blocking flags trace to verified source quotes in Rulebook v{reviewData.rulebook_version}.
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-white px-2.5 py-1.5 rounded-md border border-[#F1E1D4]">
          <span className="text-[#8A7567]">SHA-256:</span>
          <span className="font-bold text-[#382A20]">{reviewData.content_hash.slice(0, 12)}...</span>
        </div>
      </div>

      {/* Intent Card Display */}
      {reviewData.intent_card && (
        <div className="editorial-card p-6 bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1E1D4]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C87539]" />
              <h2 className="text-sm font-bold text-[#382A20]">
                Extracted Intent Card (Pre-Edit Baseline)
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Intent Preserved: {reviewData.intent_card.preservation_status}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-[#FFF9F3] border border-[#F1E1D4]">
              <div className="text-[10px] font-bold text-[#8A7567] uppercase mb-1">Purpose</div>
              <p className="text-[#382A20] font-medium">{reviewData.intent_card.purpose}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#FFF9F3] border border-[#F1E1D4]">
              <div className="text-[10px] font-bold text-[#8A7567] uppercase mb-1">Target Audience</div>
              <p className="text-[#382A20] font-medium">{reviewData.intent_card.target_audience}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#FFF9F3] border border-[#F1E1D4]">
              <div className="text-[10px] font-bold text-[#8A7567] uppercase mb-1">Call to Action (Must Keep)</div>
              <p className="text-[#027A48] font-bold">"{reviewData.intent_card.call_to_action}"</p>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Tracked Changes Diff Inspector */}
      {reviewData.diff_html && (
        <div className="editorial-card p-6 bg-white space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1E1D4]">
            <h2 className="text-sm font-bold text-[#382A20]">
              Intent Lock Minimal Correction Inspector
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-red-700 font-medium">
                <span className="w-2.5 h-2.5 rounded bg-red-200 inline-block"></span>
                Deletions
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <span className="w-2.5 h-2.5 rounded bg-emerald-200 inline-block"></span>
                Surgical Corrections
              </span>
            </div>
          </div>
          <div
            className="p-5 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] text-xs leading-relaxed text-[#382A20]"
            dangerouslySetInnerHTML={{ __html: reviewData.diff_html }}
          />
        </div>
      )}

      {/* Individual Finding Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#382A20]">
            Itemized Findings & Evidence Ledger ({reviewData.findings.length})
          </h2>
        </div>

        {reviewData.findings.map((finding) => {
          const isBlocking = finding.severity === "BLOCKING";
          const isVerified = finding.verification_status === "VERIFIED";

          return (
            <div
              key={finding.id}
              className={`editorial-card p-6 bg-white transition-colors ${
                isBlocking ? "border-[#FECDCA]" : "border-[#F1E1D4]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F1E1D4]">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      isBlocking
                        ? "bg-[#FEEBEA] text-[#B42318] border border-[#FECDCA]"
                        : "bg-[#FFF0E2] text-[#C87539] border border-[#F5A66B]/30"
                    }`}
                  >
                    {finding.severity}
                  </span>
                  <span className="text-xs font-bold text-[#382A20]">
                    {finding.rule_code || "RULE-VIOLATION"} · {finding.category}
                  </span>
                </div>

                {/* Confidence Tier Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      finding.confidence_tier === "DETERMINISTIC"
                        ? "bg-slate-100 text-slate-800 border border-slate-200"
                        : finding.confidence_tier === "EVIDENCE_BACKED_AI"
                        ? "bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5]"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    Tier: {finding.confidence_tier.replace("_", " ")}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      isVerified
                        ? "bg-[#EDFDF5] text-[#027A48]"
                        : "bg-[#FEEBEA] text-[#B42318]"
                    }`}
                  >
                    {finding.verification_status}
                  </span>
                </div>
              </div>

              {/* Matched Text & Explanation */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-[#8A7567]">Flagged Content Span:</span>
                  <span className="font-mono bg-red-50 text-red-900 px-2 py-0.5 rounded border border-red-200 font-semibold">
                    "{finding.matched_text}"
                  </span>
                </div>
                <p className="text-xs text-[#382A20] leading-relaxed">
                  {finding.explanation}
                </p>
              </div>

              {/* Verified Source Citation Box */}
              {finding.source_quote && (
                <div className="mt-3 p-3 rounded-lg bg-[#FFF9F3] border border-[#F1E1D4]">
                  <div className="text-[10px] font-bold text-[#8A7567] uppercase tracking-wider mb-1">
                    Certified Guideline Citation ({finding.source_section || "Official Rulebook"})
                  </div>
                  <p className="text-xs text-[#382A20] italic">
                    "{finding.source_quote}"
                  </p>
                </div>
              )}

              {/* Demotion / Rejection Reason if any */}
              {finding.rejection_reason && (
                <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{finding.rejection_reason}</span>
                </div>
              )}

              {/* Suggested Correction Pill */}
              {finding.suggested_correction && (
                <div className="mt-3 p-3 rounded-lg bg-[#EDFDF5] border border-[#A6F4C5] text-xs">
                  <span className="font-bold text-[#027A48] mr-2">Minimal Surgical Fix:</span>
                  <span className="font-mono font-semibold text-[#027A48]">
                    {finding.suggested_correction}
                  </span>
                </div>
              )}

              {/* Decision Actions */}
              <div className="mt-4 pt-3 border-t border-[#F1E1D4] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#8A7567]">Current Decision:</span>
                  <span className="font-bold text-[#382A20] px-2 py-0.5 rounded bg-[#FFF9F3] border border-[#F1E1D4]">
                    {finding.user_decision}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDecision(finding.id, "ACCEPTED")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EDFDF5] text-[#027A48] hover:bg-emerald-100 font-semibold border border-[#A6F4C5] transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept Fix</span>
                  </button>
                  <button
                    onClick={() => handleDecision(finding.id, "DISPUTED")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-[#8A7567] hover:bg-[#FFF9F3] font-semibold border border-[#F1E1D4] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Dispute</span>
                  </button>
                  <button
                    onClick={() => setOverrideModal({ open: true, findingId: finding.id })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFF0E2] text-[#C87539] hover:bg-[#fce5cf] font-semibold border border-[#F5A66B]/30 transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Override with Exception</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Override Reason Modal */}
      {overrideModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="editorial-card w-full max-w-md p-6 bg-white shadow-xl">
            <h2 className="text-base font-bold text-[#382A20] mb-2">
              Document Exception Override
            </h2>
            <p className="text-xs text-[#8A7567] mb-4">
              Human control requirement: An authorized exception requires an explicit justification and is permanently recorded on the hash-chained audit ledger.
            </p>
            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#382A20]">Documented Justification</label>
                <textarea
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Pre-approved Q4 enterprise campaign exception signed off by VP Marketing..."
                  className="editorial-input w-full p-2.5 text-xs mt-1.5 h-20"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOverrideModal({ open: false, findingId: "" })}
                  className="px-4 py-2 rounded-lg bg-white border border-[#F1E1D4] text-xs font-semibold text-[#382A20]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-semibold shadow-xs"
                >
                  Record Override to Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
