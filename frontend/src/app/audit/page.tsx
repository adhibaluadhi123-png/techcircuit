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
  FileCheck2
} from "lucide-react";
import { api, AuditEvent, AuditVerificationResult } from "@/lib/api";

export default function AuditTrailPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<AuditVerificationResult | null>(null);

  useEffect(() => {
    loadAuditEvents();
  }, []);

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#382A20]">
            Tamper-Evident Audit Trail & Receipts
          </h1>
          <p className="text-sm text-[#8A7567] mt-1">
            Sequential SHA-256 hash-chained ledger. Any past edit or deletion breaks the cryptographic verification sequence.
          </p>
        </div>
        <button
          onClick={handleVerifyChain}
          disabled={verifying}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-bold transition-colors shadow-xs"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{verifying ? "Computing Cryptographic Hashes..." : "Verify Entire Audit Ledger"}</span>
        </button>
      </div>

      {/* Verification Results Panel */}
      {verificationResult && (
        <div
          className={`editorial-card p-6 border-l-4 ${
            verificationResult.is_valid
              ? "bg-[#EDFDF5] border-l-[#027A48] border-[#A6F4C5]"
              : "bg-[#FEEBEA] border-l-[#B42318] border-[#FECDCA]"
          }`}
        >
          <div className="flex items-center gap-3">
            {verificationResult.is_valid ? (
              <CheckCircle2 className="w-6 h-6 text-[#027A48] shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-[#B42318] shrink-0" />
            )}
            <div>
              <h2 className="text-sm font-bold text-[#382A20]">
                {verificationResult.is_valid
                  ? "Cryptographic Verification Passed: Zero Tampering Detected"
                  : "Audit Chain Integrity Compromised"}
              </h2>
              <p className="text-xs text-[#8A7567] mt-0.5">
                {verificationResult.message}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs font-mono">
            <span>Verified Blocks: <strong>{verificationResult.verified_events} / {verificationResult.total_events}</strong></span>
            <span>Mathematical Proof: SHA-256 Chained Hashes</span>
          </div>
        </div>
      )}

      {/* Sequential Hash-Chain Visualizer */}
      <div className="editorial-card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1E1D4]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#C87539]" />
            <h2 className="text-sm font-bold text-[#382A20]">
              Sequential Hash Chain Blocks ({events.length} Blocks Recorded)
            </h2>
          </div>
          <span className="text-xs text-[#8A7567] font-medium">Tamper-Evident Append-Only</span>
        </div>

        <div className="space-y-4">
          {events.map((ev, index) => (
            <div key={ev.id} className="relative">
              <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F1E1D4]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-[#FFF0E2] text-[#C87539] text-[10px]">
                      BLOCK #{events.length - index}
                    </span>
                    <span className="font-bold text-[#382A20]">{ev.event_type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#8A7567]">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-[#C87539]" />
                      {ev.actor_role} ({ev.actor_id})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ev.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Hashes Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded bg-white border border-[#F1E1D4] truncate">
                    <span className="text-[#8A7567] block text-[9px] uppercase font-sans font-bold">
                      Current Block Hash (SHA-256)
                    </span>
                    <span className="text-[#382A20] font-bold">{ev.current_event_hash}</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-[#F1E1D4] truncate">
                    <span className="text-[#8A7567] block text-[9px] uppercase font-sans font-bold">
                      Previous Block Link
                    </span>
                    <span className="text-[#8A7567]">{ev.prev_event_hash}</span>
                  </div>
                </div>

                {/* Payload Summary */}
                <div className="text-[11px] text-[#8A7567] bg-white p-2 rounded border border-[#F1E1D4]">
                  <span className="font-bold text-[#382A20] mr-2">Payload Digest:</span>
                  <span className="font-mono">{JSON.stringify(ev.details)}</span>
                </div>
              </div>

              {/* Connecting Down Arrow */}
              {index < events.length - 1 && (
                <div className="flex justify-center my-1">
                  <ArrowDown className="w-4 h-4 text-[#F5A66B]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
