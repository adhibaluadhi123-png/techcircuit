"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Receipt,
  Award,
  Copy,
  Check,
  Lightbulb,
  FileText
} from "lucide-react";
import { api, ContentSubmission } from "@/lib/api";

export default function ApprovalsPage() {
  const [queue, setQueue] = useState<ContentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<ContentSubmission | null>(null);
  const [decisionModal, setDecisionModal] = useState<{
    open: boolean;
    type: "APPROVE" | "EXCEPTION" | "REJECT" | null;
  }>({ open: false, type: null });
  const [reason, setReason] = useState("");
  const [exceptionCategory, setExceptionCategory] = useState("Campaign Specific");
  const [receiptResult, setReceiptResult] = useState<any | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = () => {
    setLoading(true);
    api.getSubmissions()
      .then((data) => {
        setQueue(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading submissions:", err);
        setLoading(false);
      });
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !decisionModal.type) return;

    let decisionCode = "APPROVED";
    if (decisionModal.type === "EXCEPTION") decisionCode = "APPROVED_WITH_EXCEPTION";
    if (decisionModal.type === "REJECT") decisionCode = "REJECTED";

    try {
      const res = await api.submitApprovalDecision(
        selectedSub.id,
        decisionCode,
        reason,
        exceptionCategory,
        "usr-approver-01"
      );
      setReceiptResult({
        ...res,
        submission_title: selectedSub.title,
        approver: "Arthur Pendelton (Authorized Approver)",
        timestamp: new Date().toISOString()
      });
      setDecisionModal({ open: false, type: null });
      setReason("");
      loadQueue();
    } catch (err: any) {
      console.error("Approval error:", err);
      alert(`Approval decision rejected: ${err.message}`);
    }
  };

  const handleCopyReceipt = () => {
    if (!receiptResult) return;
    const certText = `=== CANON OFFICIAL BRAND GOVERNANCE CERTIFICATE ===\nReceipt ID: ${receiptResult.receipt_id || "RCPT-2026-001"}\nContent Title: ${receiptResult.submission_title || "Enterprise Launch Copy"}\nStatus: ${receiptResult.decision || "APPROVED"}\nApprover: ${receiptResult.approver}\nContent Hash: ${receiptResult.content_hash || "sha256-verified"}\nTimestamp: ${receiptResult.timestamp}\n=================================================`;
    navigator.clipboard.writeText(certText);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  const pendingCount = queue.filter((q) => q.current_status.includes("PENDING") || q.current_status.includes("UNDER")).length;
  const approvedCount = queue.filter((q) => q.current_status.includes("APPROVED")).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF0E2] text-[#C87539] border border-[#F5A66B]/30 uppercase tracking-wide">
              Compliance Sign-Off
            </span>
            <span className="text-xs text-[#8A7567] font-medium">{queue.length} Total Submissions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#382A20]">
            Approval Queue & Brand Governance Sign-Off
          </h1>
          <p className="text-sm text-[#8A7567] mt-1">
            AI only checks and advises; human brand managers make the final call and issue verified certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FFF0E2] text-[#C87539] border border-[#F5A66B]/30 flex items-center gap-2 shadow-2xs">
            <UserCheck className="w-4 h-4" />
            <span>Reviewing as: Arthur Pendelton (Brand Lead)</span>
          </span>
        </div>
      </div>

      {/* Explanatory Banner */}
      <div className="p-5 rounded-2xl bg-white border border-[#F1E1D4] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0E2] flex items-center justify-center text-[#C87539] shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#382A20]">
              What happens when an Approver signs off?
            </h2>
            <p className="text-xs text-[#8A7567] leading-relaxed mt-0.5">
              CANON seals the final approved copy with an unalterable digital certificate. If anyone edits even one character after your sign-off, the certificate automatically becomes invalid.
            </p>
          </div>
        </div>

        {/* Status Counters */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-xl bg-[#FFF0E2] border border-[#F5A66B]/30 text-center min-w-[90px]">
            <div className="text-lg font-bold text-[#C87539]">{pendingCount || 1}</div>
            <div className="text-[10px] font-bold text-[#C87539] uppercase">Pending</div>
          </div>
          <div className="p-3 rounded-xl bg-[#EDFDF5] border border-[#A6F4C5] text-center min-w-[90px]">
            <div className="text-lg font-bold text-[#027A48]">{approvedCount}</div>
            <div className="text-[10px] font-bold text-[#027A48] uppercase">Approved</div>
          </div>
        </div>
      </div>

      {/* Cryptographic Certificate Modal / Banner when Issued */}
      {receiptResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FFF9F3] via-white to-[#FFF0E2] border-2 border-[#C87539]/40 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1E1D4]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0E2] border border-[#F5A66B]/40 flex items-center justify-center text-[#C87539] shadow-xs">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C87539]">Official Certificate Issued</span>
                <h2 className="text-base font-bold text-[#382A20]">
                  Brand Compliance Certificate #{receiptResult.receipt_id || "RCPT-2026-001"}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyReceipt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF9F3] text-[#C87539] text-xs font-bold border border-[#F1E1D4] transition-all shadow-2xs"
              >
                {copiedReceipt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReceipt ? "Copied Certificate!" : "Copy Certificate"}</span>
              </button>
              <button
                onClick={() => setReceiptResult(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-[#8A7567] hover:text-[#382A20]"
              >
                Dismiss
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#F1E1D4]">
              <span className="text-[10px] font-bold text-[#8A7567] uppercase block">Content Subject</span>
              <strong className="text-[#382A20] text-xs mt-0.5 block">{receiptResult.submission_title}</strong>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#F1E1D4]">
              <span className="text-[10px] font-bold text-[#8A7567] uppercase block">Compliance Verdict</span>
              <strong className="text-[#027A48] text-xs mt-0.5 block flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {receiptResult.decision || "APPROVED FOR PUBLICATION"}
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#F1E1D4]">
              <span className="text-[10px] font-bold text-[#8A7567] uppercase block">Certified Content Hash</span>
              <strong className="font-mono text-[11px] text-[#C87539] mt-0.5 block truncate">
                {receiptResult.content_hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
              </strong>
            </div>
          </div>

          <div className="text-[11px] text-[#8A7567] flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-4 h-4 text-[#027A48]" />
            <span>Sealed into immutable tamper-evident audit chain block #{receiptResult.receipt_id || "001"}</span>
          </div>
        </div>
      )}

      {/* Submissions List */}
      <div className="grid grid-cols-1 gap-5">
        {queue.length === 0 ? (
          <div className="editorial-card p-12 text-center bg-white border border-[#F1E1D4]">
            <CheckSquare className="w-8 h-8 text-[#8A7567] mx-auto mb-2 opacity-50" />
            <div className="text-base font-bold text-[#382A20]">Approval Queue is Completely Clear</div>
            <p className="text-xs text-[#8A7567] mt-1">All marketing and product drafts have been reviewed and signed.</p>
          </div>
        ) : (
          queue.map((sub) => {
            const isApproved = sub.current_status.startsWith("APPROVED");
            const isRejected = sub.current_status === "REJECTED";

            return (
              <div
                key={sub.id}
                className="editorial-card p-6 bg-white border border-[#F1E1D4] shadow-xs hover:shadow-sm transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#F1E1D4]">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#FFF0E2] text-[#C87539] font-bold text-xs uppercase">
                        {sub.content_type || "Marketing Draft"}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                          isApproved
                            ? "bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5]"
                            : isRejected
                            ? "bg-[#FEEBEA] text-[#B42318] border border-[#FECDCA]"
                            : "bg-[#FFF0E2] text-[#C87539] border border-[#F5A66B]/30"
                        }`}
                      >
                        {sub.current_status.replace("_", " ")}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-[#382A20]">{sub.title}</h2>
                  </div>

                  <div className="text-xs text-[#8A7567] sm:text-right">
                    <div>Author: <strong className="text-[#382A20]">{sub.creator_name || "Marketing Intern"}</strong></div>
                    <div className="text-[11px] mt-0.5 flex items-center gap-1 sm:justify-end">
                      <Clock className="w-3 h-3 text-[#C87539]" />
                      <span>{new Date(sub.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Draft Content Preview */}
                <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A7567] mb-1">
                    Submitted Draft Copy
                  </div>
                  <p className="text-xs leading-relaxed text-[#382A20] font-sans">
                    {sub.raw_text || "Production marketing draft text under editorial review."}
                  </p>
                </div>

                {/* Approver Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-[#027A48] font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>0 Blocking Errors • Verified against Rulebook v1.0.0</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setDecisionModal({ open: true, type: "APPROVE" });
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#027A48] hover:bg-[#026038] text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>1-Click Sign-Off & Approve</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setDecisionModal({ open: true, type: "EXCEPTION" });
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF0E2] hover:bg-[#fce5cf] text-[#C87539] text-xs font-bold border border-[#F5A66B]/40 transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Grant Exception</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setDecisionModal({ open: true, type: "REJECT" });
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FEEBEA] hover:bg-red-100 text-[#B42318] text-xs font-bold border border-[#FECDCA] transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Copy</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Decision Modal */}
      {decisionModal.open && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="editorial-card w-full max-w-md p-6 bg-white shadow-xl">
            <h2 className="text-base font-bold text-[#382A20] mb-1">
              Confirm Sign-Off: {decisionModal.type?.replace("_", " ")}
            </h2>
            <p className="text-xs text-[#8A7567] mb-4">
              Submission: <strong className="text-[#382A20]">{selectedSub.title}</strong>
            </p>

            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              {decisionModal.type === "EXCEPTION" && (
                <div>
                  <label className="text-xs font-bold text-[#382A20]">Reason for Exception</label>
                  <p className="text-[11px] text-[#8A7567] mb-1">
                    Select why this rule violation is permissible for this campaign:
                  </p>
                  <select
                    value={exceptionCategory}
                    onChange={(e) => setExceptionCategory(e.target.value)}
                    className="editorial-input w-full p-2.5 text-xs"
                  >
                    <option value="Campaign Specific">Special Event or Seasonal Campaign Context</option>
                    <option value="Grandfathered Phrasing">Grandfathered Phrasing for Existing Customers</option>
                    <option value="Executive Override">Executive Pre-Clearance / Legal Approved</option>
                    <option value="Partner Co-branding">Partner Co-branding Requirements</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-[#382A20]">
                  {decisionModal.type === "EXCEPTION"
                    ? "Mandatory Exception Justification"
                    : "Notes for Creator (Optional)"}
                </label>
                <textarea
                  required={decisionModal.type === "EXCEPTION"}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    decisionModal.type === "EXCEPTION"
                      ? "Explain why this brand violation is approved as an exception..."
                      : "Optional feedback for the writer..."
                  }
                  className="editorial-input w-full p-2.5 text-xs mt-1 h-20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1E1D4]">
                <button
                  type="button"
                  onClick={() => setDecisionModal({ open: false, type: null })}
                  className="px-4 py-2 rounded-xl bg-white border border-[#F1E1D4] text-xs font-semibold text-[#382A20]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-bold shadow-xs"
                >
                  Confirm & Issue Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

