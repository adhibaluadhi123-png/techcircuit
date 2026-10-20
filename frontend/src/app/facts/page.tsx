"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  Plus,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search
} from "lucide-react";
import { api, Fact } from "@/lib/api";

export default function FactsPage() {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFact, setNewFact] = useState<Partial<Fact>>({
    fact_code: "FACT-NEW-2026",
    subject: "",
    approved_statement: "",
    normalized_value: "",
    normalized_unit: "",
    source_document: "",
    source_quote: "",
    owner_name: "Elena Rostova",
    owner_email: "elena.rostova@apexdynamics.example",
    valid_until: "2027-12-31T23:59:59Z",
  });

  useEffect(() => {
    loadFacts();
  }, []);

  const loadFacts = () => {
    setLoading(true);
    api.getFacts()
      .then((data) => {
        setFacts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading facts:", err);
        setLoading(false);
      });
  };

  const handleCreateFact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createFact(newFact);
      setShowAddModal(false);
      loadFacts();
    } catch (err) {
      console.error("Error creating fact:", err);
    }
  };

  const filteredFacts = facts.filter(
    (f) =>
      f.subject.toLowerCase().includes(search.toLowerCase()) ||
      f.approved_statement.toLowerCase().includes(search.toLowerCase()) ||
      f.fact_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#382A20]">
            Approved Fact Vault & Claim Ledger
          </h1>
          <p className="text-sm text-[#8A7567] mt-1">
            Certified organizational facts with responsible owners and strict evidence expiry dates.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-semibold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Approved Fact</span>
        </button>
      </div>

      {/* Claim Ledger Expiry Invariant Banner */}
      <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] flex items-start gap-3">
        <Clock className="w-5 h-5 text-[#C87539] shrink-0 mt-0.5" />
        <div className="text-xs text-[#382A20] leading-relaxed">
          <span className="font-bold">Automated Evidence Expiry Protection: </span>
          Content referencing claims whose certified evidence date has passed (such as expired customer metrics or historical benchmarks) is automatically flagged as <span className="font-bold text-[#B42318]">STALE</span> during content review.
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8A7567] absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by fact code, subject, or statement..."
          className="editorial-input w-full pl-9 pr-4 py-2 text-xs"
        />
      </div>

      {/* Facts Table Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredFacts.map((fact) => {
          const isStale = fact.is_expired;
          return (
            <div
              key={fact.id}
              className={`editorial-card p-6 bg-white transition-colors ${
                isStale ? "border-[#FECDCA] bg-gradient-to-r from-white to-[#FEEBEA]/20" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F1E1D4]">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md bg-[#FFF0E2] text-[#C87539] font-bold text-xs">
                    {fact.fact_code}
                  </span>
                  <h2 className="text-sm font-bold text-[#382A20]">{fact.subject}</h2>
                </div>
                <div className="flex items-center gap-2">
                  {isStale ? (
                    <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#FEEBEA] text-[#B42318] border border-[#FECDCA] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>EVIDENCE EXPIRED / STALE</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>ACTIVE & IN-DATE</span>
                    </span>
                  )}
                  {fact.normalized_value && (
                    <span className="text-[10px] font-semibold px-2 py-1 rounded bg-[#FFF9F3] text-[#382A20] border border-[#F1E1D4]">
                      Certified Value: {fact.normalized_value} {fact.normalized_unit || ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Statement */}
              <div className="mt-3">
                <p className="text-xs font-semibold text-[#382A20] leading-relaxed">
                  "{fact.approved_statement}"
                </p>
              </div>

              {/* Source Evidence & Quote */}
              <div className="mt-3 p-3 rounded-lg bg-[#FFF9F3] border border-[#F1E1D4]">
                <div className="flex items-center justify-between text-[10px] text-[#8A7567] uppercase font-bold mb-1">
                  <span>Source Document: {fact.source_document}</span>
                  <span>Owner: {fact.owner_name} ({fact.owner_email})</span>
                </div>
                <p className="text-xs text-[#382A20] italic">"{fact.source_quote}"</p>
              </div>

              {/* Card Footer: Expiry date */}
              <div className="mt-4 pt-3 border-t border-[#F1E1D4] flex items-center justify-between text-xs text-[#8A7567]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#C87539]" />
                  <span>
                    Valid Until:{" "}
                    <strong className={isStale ? "text-[#B42318]" : "text-[#382A20]"}>
                      {new Date(fact.valid_until).toLocaleDateString()}
                    </strong>
                  </span>
                </div>
                {isStale && (
                  <span className="text-[11px] text-[#B42318] font-semibold">
                    Review required by owner before approving new claims.
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Fact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="editorial-card w-full max-w-lg p-6 bg-white shadow-xl">
            <h2 className="text-base font-bold text-[#382A20] mb-4">
              Add Certified Fact to Vault
            </h2>
            <form onSubmit={handleCreateFact} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#382A20]">Fact Code</label>
                <input
                  type="text"
                  required
                  value={newFact.fact_code}
                  onChange={(e) => setNewFact({ ...newFact, fact_code: e.target.value })}
                  className="editorial-input w-full p-2 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#382A20]">Subject / Entity</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infrastructure Availability SLA"
                  value={newFact.subject}
                  onChange={(e) => setNewFact({ ...newFact, subject: e.target.value })}
                  className="editorial-input w-full p-2 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#382A20]">Approved Statement</label>
                <textarea
                  required
                  placeholder="Official certified phrasing"
                  value={newFact.approved_statement}
                  onChange={(e) => setNewFact({ ...newFact, approved_statement: e.target.value })}
                  className="editorial-input w-full p-2 text-xs mt-1 h-16"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#382A20]">Normalized Value</label>
                  <input
                    type="text"
                    placeholder="e.g. 99.98"
                    value={newFact.normalized_value}
                    onChange={(e) => setNewFact({ ...newFact, normalized_value: e.target.value })}
                    className="editorial-input w-full p-2 text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#382A20]">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. % or ms"
                    value={newFact.normalized_unit}
                    onChange={(e) => setNewFact({ ...newFact, normalized_unit: e.target.value })}
                    className="editorial-input w-full p-2 text-xs mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#382A20]">Source Document Citation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 2026 SLA Audit Report v2.1"
                  value={newFact.source_document}
                  onChange={(e) => setNewFact({ ...newFact, source_document: e.target.value })}
                  className="editorial-input w-full p-2 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#382A20]">Verbatim Source Quote</label>
                <input
                  type="text"
                  required
                  placeholder="Exact quote supporting this fact"
                  value={newFact.source_quote}
                  onChange={(e) => setNewFact({ ...newFact, source_quote: e.target.value })}
                  className="editorial-input w-full p-2 text-xs mt-1"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1E1D4]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-[#F1E1D4] text-xs font-semibold text-[#382A20]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-semibold shadow-xs"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
