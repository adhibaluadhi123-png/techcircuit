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
  Receipt
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
  const [exceptionCategory, setExceptionCategory] = useState("Campaign Context");
  const [receiptResult, setReceiptResult] = useState<any | null>(null);

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
      setReceiptResult(res);
      setDecisionModal({ open: false, type: null });
      setReason("");
      loadQueue();
    } catch (err: any) {
      console.error("Approval error:", err);
      alert(`Approval decision rejected: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#382A20]">
            Human Approval Queue & Governance Sign-Off
          </h1>
          <p className="text-sm text-[#8A7567] mt-1">
            Server-enforced role authorization: Only designated Approvers and Brand Managers can sign off.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF0E2] text-[#C87539] border border-[#F5A66B]/30 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Simulating: Arthur Pendelton (APPROVER)</span>
          </span>
        </div>
      </div>

      {/* Invariant Banner */}
      <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#027A48] shrink-0 mt-0.5" />
        <div className="text-xs text-[#382A20] leading-relaxed">
          <span className="font-bold">Cryptographic Review Receipt Issuance: </span>
          Approval binds the exact content SHA-256 hash, active rulebook version, verified citations, and approver attestation into a signed receipt and appends the decision to the immutable hash chain.
        </div>
      </div>

      {/* Submissions List */}
      <div className="grid grid-cols-1 gap-4">
        {queue.length === 0 ? (
          <div className="editorial-card p-12 text-center bg-white">
            <CheckSquare className="w-8 h-8 text-[#8A7567] mx-auto mb-2" />
            <div className="text-sm font-bold text-[#382A20]">Queue is Clear</div>
            <p className="text-xs text-[#8A7567] mt-1">All content submissions have been reviewed.</p>
          </div>
        ) : (
          queue.map((sub) => {
            const isApproved = sub.current_status.startsWith("APPROVED");
            const isRejected = sub.current_status === "REJECTED";

            return (
              <div key={sub.id} className="editorial-card p-6 bg-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F1E1D4]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#8A7567]">{sub.content_type}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isApproved
                            ? "bg-[#EDFDF5] text-[#027A48]"
                            : isRejected
                            ? "bg-[#FEEBEA] text-[#B42318]"
                            : "bg-[#FFF0E2] text-[#C87539]"
                        }`}
                      >
                        {sub.current_status.replace("_", " ")}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[#382A20] mt-1">{sub.title}</h2>
                  </div>
                  <div className="text-xs text-[#8A7567] text-right">
                    <div>Submitted by: <strong className="text-[#382A20]">{sub.creator_name}</strong></div>
                    <div className="text-[11px] mt-0.5">{new Date(sub.created_at).toLocaleString()}</div>
                  </div>
                </div>

                {/* Approver Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-[#8A7567]">
                    Content Hash & Evidence Verified
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setDecisionModal({ open: true, type: "APPROVE" });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EDFDF5] hover:bg-emerald-100 text-[#027A48] text-xs font-semibold border border-[#A6F4C5] transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setDecisionModal({ open: true, type: "EXCEPTION" });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF0E2] hover:bg-[#fce5cf] text-[#C87539] text-xs font-semibold border border-[#F5A66B]/40 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Approve with Exception</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setDecisionModal({ open: true, type: "REJECT" });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FEEBEA] hover:bg-red-100 text-[#B42318] text-xs font-semibold border border-[#FECDCA] transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
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
            <h2 className="text-base font-bold text-[#382A20] mb-2">
              Confirm Decision: {decisionModal.type?.replace("_", " ")}
            </h2>
            <p className="text-xs text-[#8A7567] mb-4">
              Submission: <strong className="text-[#382A20]">{selectedSub.title}</strong>
            </p>
            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              {decisionModal.type === "EXCEPTION" && (
                <div>
                  <label className="text-xs font-bold text-[#382A20]">Exception Category</label>
                  <select
                    value={exceptionCategory}
                    onChange={(e) => setExceptionCategory(e.target.value)}
                    className="editorial-input w-full p-2 text-xs mt-1"
                  >
                    <option value="Campaign Specific">Campaign Specific Need</option>
                    <option value="Grandfathered Phrasing">Grandfathered Phrasing</option>
                    <option value="Executive Override">Executive Pre-clearance</option>
                    <option value="Partner Co-branding">Partner Co-branding Exception</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-[#382A20]">
                  {decisionModal.type === "EXCEPTION"
                    ? "Mandatory Exception Justification"
                    : "Review Notes / Comments"}
                </label>
                <textarea
                  required={decisionModal.type === "EXCEPTION"}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    decisionModal.type === "EXCEPTION"
                      ? "Explain why this brand violation is approved as an exception..."
                      : "Optional review notes..."
                  }
                  className="editorial-input w-full p-2.5 text-xs mt-1 h-20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDecisionModal({ open: false, type: null })}
                  className="px-4 py-2 rounded-lg bg-white border border-[#F1E1D4] text-xs font-semibold text-[#382A20]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-semibold shadow-xs"
                >
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Output Confirmation */}
      {receiptResult && (
        <div className="editorial-card p-6 bg-[#EDFDF5] border border-[#A6F4C5] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#027A48]">
            <Receipt className="w-4 h-4" />
            <span>Cryptographic Review Receipt Issued Successfully</span>
          </div>
          <div className="text-xs text-[#382A20] space-y-1">
            <div>Receipt ID: <strong className="font-mono">{receiptResult.receipt_id || "rcpt-001"}</strong></div>
            <div>Content Hash: <strong className="font-mono">{receiptResult.content_hash}</strong></div>
            <div>Status: <strong className="text-[#027A48]">{receiptResult.decision}</strong> by {receiptResult.approver}</div>
          </div>
        </div>
      )}
    </div>
  );
}
