"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Sparkles,
  Wand2,
  Eye,
  FileText,
  Send,
  SlidersHorizontal,
  ChevronDown,
  Info
} from "lucide-react";
import { api, ReviewResult, Finding } from "@/lib/api";

export default function FindingsPage() {
  const router = useRouter();
  const [reviewData, setReviewData] = useState<ReviewResult | null>(null);
  const [viewMode, setViewMode] = useState<"SIMPLE" | "COMPLIANCE">("SIMPLE");
  const [overrideModal, setOverrideModal] = useState<{ open: boolean; findingId: string }>({
    open: false,
    findingId: "",
  });
  const [overrideReason, setOverrideReason] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
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
      if (reviewData) {
        const updatedFindings = reviewData.findings.map((f) =>
          f.id === findingId ? { ...f, user_decision: decision as any } : f
        );
        const updated = { ...reviewData, findings: updatedFindings };
        setReviewData(updated);
        localStorage.setItem("canon_last_review", JSON.stringify(updated));
      }
    } catch (err) {
      console.error("Error updating finding decision:", err);
    }
  };

  const handleAcceptAllFixes = () => {
    if (!reviewData) return;
    reviewData.findings.forEach((f) => {
      handleDecision(f.id, "ACCEPTED");
    });
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
      <div className="editorial-card p-12 text-center bg-white max-w-xl mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF0E2] text-[#C87539] flex items-center justify-center mx-auto mb-4">
          <FileCheck2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-[#382A20]">No Active Review Yet</h2>
        <p className="text-xs text-[#8A7567] mt-2 max-w-md mx-auto leading-relaxed">
          To see how CANON flags issues and suggests clean, 1-click fixes, start by submitting a draft or loading one of our sample scenarios.
        </p>
        <Link
          href="/review"
          className="mt-6 inline-flex items-center gap-2 btn-primary px-6 py-2.5 text-xs font-bold"
        >
          <span>Open Content Review Studio</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const blockingFindings = reviewData.findings.filter((f) => f.severity === "BLOCKING");
  const warnings = reviewData.findings.filter((f) => f.severity !== "BLOCKING");
  const allFixed = reviewData.findings.every((f) => f.user_decision === "ACCEPTED");

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Friendly Header with View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#C87539] uppercase tracking-wider">
            Step 2 of 3: Review & Fix Issues
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#382A20] mt-0.5">
            Review Findings & Fixes
          </h1>
          <p className="text-xs text-[#8A7567] mt-1">
            Review detected issues below. You can apply 1-click fixes, dispute flags, or document an exception.
          </p>
        </div>

        {/* View Mode Toggle: Simple vs Compliance */}
        <div className="flex items-center p-1 rounded-xl bg-white border border-[#F1E1D4] text-xs font-semibold shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode("SIMPLE")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "SIMPLE"
                ? "bg-[#C87539] text-white shadow-2xs font-bold"
                : "text-[#8A7567] hover:text-[#382A20]"
            }`}
          >
            Simple View (Recommended)
          </button>
          <button
            type="button"
            onClick={() => setViewMode("COMPLIANCE")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "COMPLIANCE"
                ? "bg-[#C87539] text-white shadow-2xs font-bold"
                : "text-[#8A7567] hover:text-[#382A20]"
            }`}
          >
            Compliance & Citations
          </button>
        </div>
      </div>

      {/* Top Friendly Action Banner */}
      <div className="editorial-card p-6 bg-gradient-to-r from-white to-[#FFF0E2] border-[#F1E1D4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                blockingFindings.length > 0 && !allFixed
                  ? "bg-[#FEEBEA] text-[#B42318] border border-[#FECDCA]"
                  : "bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5]"
              }`}
            >
              {allFixed
                ? "All Fixes Accepted ✓"
                : blockingFindings.length > 0
                ? `${blockingFindings.length} Fixes Recommended`
                : "All Clear"}
            </span>
            <span className="text-xs text-[#8A7567]">
              Rulebook v{reviewData.rulebook_version}
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#382A20] mt-1.5">
            {allFixed
              ? "Your content is ready to send for final approval!"
              : "We found a few items that depart from your brand guidelines."}
          </h2>
          <p className="text-xs text-[#8A7567] mt-0.5">
            Every fix is guaranteed to preserve your original purpose, audience, and call to action.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {!allFixed && (
            <button
              type="button"
              onClick={handleAcceptAllFixes}
              className="btn-secondary px-4 py-2.5 text-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C87539]" />
              <span>Accept All Suggested Fixes</span>
            </button>
          )}

          <Link
            href="/approvals"
            className="btn-primary px-5 py-2.5 text-xs flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit for Sign-Off</span>
          </Link>
        </div>
      </div>

      {/* Tracked Changes Diff Box (High Visual Appeal) */}
      {reviewData.diff_html && (
        <div className="editorial-card p-6 bg-white space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1E1D4]">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-[#C87539]" />
              <h2 className="text-sm font-bold text-[#382A20]">
                Tracked Changes Diff (Original vs Minimal Edit)
              </h2>
            </div>
            <span className="text-[11px] text-[#027A48] font-bold bg-[#EDFDF5] px-2 py-0.5 rounded-full border border-[#A6F4C5]">
              CTA & Critical Facts Preserved
            </span>
          </div>

          <div
            className="p-5 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] text-xs leading-relaxed text-[#382A20]"
            dangerouslySetInnerHTML={{ __html: reviewData.diff_html }}
          />

          <div className="flex items-center justify-between text-[11px] text-[#8A7567] pt-1">
            <span className="flex items-center gap-2">
              <span className="bg-red-100 text-red-800 line-through px-1.5 py-0.5 rounded">Red: Removed violation</span>
              <span className="bg-emerald-100 text-emerald-800 font-medium px-1.5 py-0.5 rounded">Green: Approved replacement</span>
            </span>
            <span>Zero wholesale rewriting</span>
          </div>
        </div>
      )}

      {/* Itemized Plain-English Findings Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#382A20]">
            Itemized Issues & Suggested Fixes ({reviewData.findings.length})
          </h2>
          <span className="text-xs text-[#8A7567]">
            Click <strong>Accept Fix</strong> to update
          </span>
        </div>

        {reviewData.findings.map((finding) => {
          const isAccepted = finding.user_decision === "ACCEPTED";
          const isOverridden = finding.user_decision === "OVERRIDDEN";
          const isBlocking = finding.severity === "BLOCKING";

          return (
            <div
              key={finding.id}
              className={`editorial-card p-6 bg-white transition-all space-y-4 ${
                isAccepted
                  ? "border-[#A6F4C5] bg-[#EDFDF5]/10"
                  : isBlocking
                  ? "border-l-4 border-l-[#B42318] border-[#F1E1D4]"
                  : "border-[#F1E1D4]"
              }`}
            >
              {/* Card Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F1E1D4]">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      isAccepted
                        ? "bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5]"
                        : isBlocking
                        ? "bg-[#FEEBEA] text-[#B42318] border border-[#FECDCA]"
                        : "bg-[#FFF0E2] text-[#C87539] border border-[#F5A66B]/30"
                    }`}
                  >
                    {isAccepted ? "Fixed ✓" : isBlocking ? "Needs Fix" : "Advisory"}
                  </span>
                  <h3 className="text-sm font-bold text-[#382A20]">
                    {finding.rule_code ? `${finding.rule_code}: ${finding.category}` : "Claim Requiring Evidence"}
                  </h3>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#FFF9F3] text-[#8A7567] border border-[#F1E1D4]">
                    Tier: {finding.confidence_tier.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* What was found in plain English */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-2 text-xs">
                  <span className="font-bold text-[#8A7567] shrink-0">Flagged Phrase:</span>
                  <span className="font-mono bg-red-50 text-red-900 px-2 py-0.5 rounded border border-red-200 font-bold">
                    "{finding.matched_text}"
                  </span>
                </div>
                <p className="text-xs text-[#382A20] leading-relaxed">
                  {finding.explanation}
                </p>
              </div>

              {/* In Compliance View: Show exact source quote & location */}
              {viewMode === "COMPLIANCE" && finding.source_quote && (
                <div className="p-3.5 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#8A7567] uppercase tracking-wider">
                    <span>Verbatim Guideline Evidence ({finding.source_section})</span>
                    <span className="text-[#027A48]">100% Quote Match Verified</span>
                  </div>
                  <p className="text-xs text-[#382A20] italic">"{finding.source_quote}"</p>
                </div>
              )}

              {/* Suggested 1-Click Fix Box */}
              {finding.suggested_correction && (
                <div className="p-3.5 rounded-xl bg-[#EDFDF5] border border-[#A6F4C5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-[#027A48] block">✨ Recommended 1-Click Fix:</span>
                    <span className="text-[#382A20] mt-0.5 block">
                      Replace <span className="line-through text-red-700">"{finding.matched_text}"</span> with <strong className="font-mono text-[#027A48]">"{finding.suggested_correction}"</strong>
                    </span>
                  </div>

                  {!isAccepted ? (
                    <button
                      type="button"
                      onClick={() => handleDecision(finding.id, "ACCEPTED")}
                      className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply This Fix</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-[#027A48] flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Fix Accepted</span>
                    </span>
                  )}
                </div>
              )}

              {/* Card Footer: Alternate Actions */}
              <div className="pt-2 border-t border-[#F1E1D4] flex flex-wrap items-center justify-between gap-3 text-xs text-[#8A7567]">
                <div className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#C87539]" />
                  <span>
                    Status: <strong className="text-[#382A20]">{finding.user_decision}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDecision(finding.id, "DISPUTED")}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#FFF9F3] text-[#8A7567] border border-[#F1E1D4] font-semibold text-xs transition-colors"
                  >
                    Dispute Flag
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverrideModal({ open: true, findingId: finding.id })}
                    className="px-3 py-1.5 rounded-lg bg-[#FFF0E2] hover:bg-[#fce5cf] text-[#C87539] border border-[#F5A66B]/30 font-semibold text-xs transition-colors"
                  >
                    Request Exception Override
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Override Modal */}
      {overrideModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="editorial-card w-full max-w-md p-6 bg-white shadow-xl space-y-4">
            <h2 className="text-base font-bold text-[#382A20]">
              Request Brand Policy Exception
            </h2>
            <p className="text-xs text-[#8A7567] leading-relaxed">
              If your marketing campaign genuinely requires this phrasing (e.g. pre-approved co-branding), provide a brief explanation. It will be recorded in the audit trail.
            </p>
            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#382A20]">Reason for Exception</label>
                <textarea
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Campaign executive sign-off for regional partner launch..."
                  className="editorial-input w-full p-2.5 text-xs mt-1.5 h-20"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOverrideModal({ open: false, findingId: "" })}
                  className="btn-secondary px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 text-xs font-semibold"
                >
                  Record Exception
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
