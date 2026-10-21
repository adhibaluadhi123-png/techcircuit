"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Lock,
  Layers,
  ArrowDown,
  Hash,
  Clock,
  User,
  FileCheck2,
  Award,
  Lightbulb,
  Check,
  Copy
} from "lucide-react";
import { api, AuditEvent, AuditVerificationResult } from "@/lib/api";

export default function AuditTrailPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<AuditVerificationResult | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const loadAuditEvents = () => {
    setLoading(true);
    api.getAuditEvents()
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading audit events:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAuditEvents();
  }, []);

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyAuditChain();
      setVerificationResult(res);
    } catch (err) {
      console.error("Chain verification error:", err);
    } finally {
      setVerifying(false);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  const formatEventHumanTitle = (ev: AuditEvent) => {
    switch (ev.event_type) {
      case "APPROVAL_DECISION":
        return "Human Approver Signed Off on Submission";
      case "RULE_CREATED":
        return "Brand Guideline Rule Certified";
      case "FACT_CREATED":
        return "New Certified Fact Added to Vault";
      case "FACT_EXPIRED":
        return "Claim Evidence Date Expired (Stale Warning Issued)";
      case "RULEBOOK_COMPILED":
        return "Rulebook Compiled & Versioned";
      case "EXCEPTION_RECORDED":
        return "Brand Exception Justification Recorded";
      default:
        return ev.event_type.replace(/_/g, " ");
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5] uppercase tracking-wide">
              Approved Audit Trail
            </span>
            <span className="text-xs text-[#8A7567] font-medium">{events.length} Sealed Audit Blocks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#382A20]">
            Audit History &amp; Verification
          </h1>
          <p className="text-sm text-[#8A7567] mt-1">
            Complete chronological record of all content reviews, manager sign-offs, and rule updates.
          </p>
        </div>

        <button
          onClick={handleVerifyChain}
          disabled={verifying}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50"
        >
          <ShieldCheck className={`w-4 h-4 ${verifying ? "animate-spin" : ""}`} />
          <span>{verifying ? "Checking Ledger Integrity..." : "⚡ Verify Audit Integrity"}</span>
        </button>
      </div>

      {/* Non-Technical Explanatory Card */}
      <div className="p-5 rounded-3xl bg-white border border-[#F1E1D4] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#F5A66B]/40 shadow-xs shrink-0">
            <img src="/seal.jpg" alt="Golden Seal Ledger" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-[#382A20]">
                What is this Tamper-Proof Golden Ledger?
              </h2>
              <span className="text-[10px] bg-[#EDFDF5] text-[#027A48] font-bold px-2 py-0.5 rounded-full border border-[#A6F4C5]">
                🔒 Permanent Digital Ink
              </span>
            </div>
            <p className="text-xs text-[#8A7567] leading-relaxed mt-1 max-w-xl">
              Imagine every brand rule and approved story is stamped with permanent golden ink into an unbroken chain of trust. If someone tries to secretly erase or alter an approved post, the chain detects it instantly!
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFF9F3] border border-[#F1E1D4]">
          <Lock className="w-4 h-4 text-[#C87539]" />
          <span className="text-xs font-bold text-[#382A20]">Append-Only SHA-256 Ledger</span>
        </div>
      </div>

      {/* Verification Results Seal Banner */}
      {verificationResult && (
        <div
          className={`p-6 rounded-3xl border-2 transition-all shadow-md ${
            verificationResult.is_valid
              ? "bg-gradient-to-r from-[#EDFDF5] to-white border-[#A6F4C5]"
              : "bg-gradient-to-r from-[#FEEBEA] to-white border-[#FECDCA]"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#A6F4C5] shadow-xs shrink-0">
                <img src="/seal.jpg" alt="Golden Seal" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#027A48]">
                  Tamper Verification Report
                </span>
                <h2 className="text-base font-bold text-[#382A20]">
                  {verificationResult.is_valid
                    ? "Official Seal INTACT: 100% Tamper-Proof"
                    : "Integrity Warning: Chain Sequence Disrupted"}
                </h2>
                <p className="text-xs text-[#8A7567] mt-0.5">
                  {verificationResult.message}
                </p>
              </div>
            </div>

            <div className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-white border border-[#F1E1D4] text-[#382A20] shadow-2xs">
              Verified: {verificationResult.verified_events} / {verificationResult.total_events} Sequential Blocks
            </div>
          </div>
        </div>
      )}

      {/* Sequential Blocks Timeline */}
      <div className="editorial-card p-6 bg-white border border-[#F1E1D4] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1E1D4]">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#C87539]" />
            <h2 className="text-base font-bold text-[#382A20]">
              Sequential Governance Timeline ({events.length} Sealed Blocks)
            </h2>
          </div>
          <span className="text-xs text-[#8A7567] font-medium">Newest first</span>
        </div>

        <div className="space-y-4">
          {events.map((ev, index) => {
            const blockNumber = events.length - index;
            const isLatest = index === 0;

            return (
              <div key={ev.id} className="relative">
                <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#F1E1D4] text-xs space-y-3 hover:border-[#F5A66B]/50 transition-all shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F1E1D4]">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md font-mono font-bold bg-[#FFF0E2] text-[#C87539] text-xs">
                        BLOCK #{blockNumber}
                      </span>
                      {isLatest && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5]">
                          Latest Head
                        </span>
                      )}
                      <h3 className="font-bold text-[#382A20] text-sm">
                        {formatEventHumanTitle(ev)}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#8A7567]">
                      <span className="flex items-center gap-1 font-semibold text-[#382A20]">
                        <User className="w-3.5 h-3.5 text-[#C87539]" />
                        {ev.actor_role} ({ev.actor_id})
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(ev.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Hashes Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white border border-[#F1E1D4] truncate">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[#8A7567] text-[10px] uppercase font-sans font-bold">
                          Current Block Hash (SHA-256)
                        </span>
                        <button
                          onClick={() => copyHash(ev.current_event_hash)}
                          className="text-[#8A7567] hover:text-[#C87539] p-0.5"
                          title="Copy hash"
                        >
                          {copiedHash === ev.current_event_hash ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <span className="text-[#C87539] font-bold truncate block">
                        {ev.current_event_hash}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-[#F1E1D4] truncate">
                      <span className="text-[#8A7567] block text-[10px] uppercase font-sans font-bold mb-0.5">
                        Previous Block Link
                      </span>
                      <span className="text-[#8A7567] truncate block">
                        {ev.prev_event_hash}
                      </span>
                    </div>
                  </div>

                  {/* Payload Summary */}
                  {ev.details && (
                    <div className="text-[11px] text-[#8A7567] bg-white p-2.5 rounded-xl border border-[#F1E1D4]">
                      <span className="font-bold text-[#382A20] mr-2">Audit Payload:</span>
                      <span className="font-mono text-[#8A7567]">
                        {typeof ev.details === "object" ? JSON.stringify(ev.details) : String(ev.details)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Connecting Down Arrow */}
                {index < events.length - 1 && (
                  <div className="flex justify-center my-1.5">
                    <ArrowDown className="w-4 h-4 text-[#F5A66B]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
