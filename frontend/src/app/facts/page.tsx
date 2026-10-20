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
  Search,
  Filter,
  Send,
  RefreshCw,
  Lightbulb,
  Check,
  Sparkles
} from "lucide-react";
import { api, Fact } from "@/lib/api";

export default function FactsPage() {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "STALE">("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
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
      showToast("New certified fact added successfully to the Vault!");
    } catch (err) {
      console.error("Error creating fact:", err);
    }
  };

  const handleRequestUpdate = (fact: Fact) => {
    showToast(`Proof renewal request sent to ${fact.owner_name} (${fact.owner_email})!`);
  };

  const handleRenewFact = (factId: string) => {
    // In-memory extension for demonstration
    setFacts((prev) =>
      prev.map((f) =>
        f.id === factId
          ? {
              ...f,
              is_expired: false,
              valid_until: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
            }
          : f
      )
    );
    showToast("Fact validity renewed for +1 year. Claim is now certified!");
  };

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  const activeCount = facts.filter((f) => !f.is_expired).length;
  const staleCount = facts.filter((f) => f.is_expired).length;

  const filteredFacts = facts.filter((f) => {
    const matchesSearch =
      f.subject.toLowerCase().includes(search.toLowerCase()) ||
      f.approved_statement.toLowerCase().includes(search.toLowerCase()) ||
      f.fact_code.toLowerCase().includes(search.toLowerCase()) ||
      f.source_document.toLowerCase().includes(search.toLowerCase());

    if (filterStatus === "ACTIVE") return matchesSearch && !f.is_expired;
    if (filterStatus === "STALE") return matchesSearch && f.is_expired;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Toast */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#382A20] text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-[#F5A66B]" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF0E2] text-[#C87539] border border-[#F5A66B]/30 uppercase tracking-wide">
              Official Knowledge Vault
            </span>
            <span className="text-xs text-[#8A7567] font-medium">{facts.length} Verified Claims</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#382A20]">
            Approved Fact Vault & Claim Ledger
          </h1>
          <p className="text-sm text-[#8A7567] mt-1">
            Every statistic, uptime guarantee, and customer benchmark certified by department heads.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Approved Fact</span>
        </button>
      </div>

      {/* Non-Technical Explanatory Card */}
      <div className="p-5 rounded-2xl bg-white border border-[#F1E1D4] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0E2] flex items-center justify-center text-[#C87539] shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#382A20]">
              Why does CANON track Fact Expiration Dates?
            </h2>
            <p className="text-xs text-[#8A7567] leading-relaxed mt-0.5">
              Marketing claims (e.g. "Over 500 customers" or "99.98% SLA") age quickly. When a fact expires, CANON gently warns creators so stale or untrue numbers are never accidentally published.
            </p>
          </div>
        </div>

        {/* Fact Status Summary Chips */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-xl bg-[#EDFDF5] border border-[#A6F4C5] text-center min-w-[90px]">
            <div className="text-lg font-bold text-[#027A48]">{activeCount}</div>
            <div className="text-[10px] font-bold text-[#027A48] uppercase">In-Date</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FEEBEA] border border-[#FECDCA] text-center min-w-[90px]">
            <div className="text-lg font-bold text-[#B42318]">{staleCount}</div>
            <div className="text-[10px] font-bold text-[#B42318] uppercase">Expired</div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === "ALL"
                ? "bg-[#C87539] text-white shadow-xs"
                : "bg-white text-[#382A20] border border-[#F1E1D4] hover:bg-[#FFF9F3]"
            }`}
          >
            All Facts ({facts.length})
          </button>
          <button
            onClick={() => setFilterStatus("ACTIVE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === "ACTIVE"
                ? "bg-[#027A48] text-white shadow-xs"
                : "bg-white text-[#382A20] border border-[#F1E1D4] hover:bg-[#FFF9F3]"
            }`}
          >
            ✓ Active & Certified ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus("STALE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === "STALE"
                ? "bg-[#B42318] text-white shadow-xs"
                : "bg-white text-[#382A20] border border-[#F1E1D4] hover:bg-[#FFF9F3]"
            }`}
          >
            ⚠️ Expired / Needs Proof ({staleCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#8A7567] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by fact, subject, or owner..."
            className="editorial-input w-full pl-8 pr-3 py-2 text-xs"
          />
        </div>
      </div>

      {/* Facts Table Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredFacts.length === 0 ? (
          <div className="editorial-card p-12 text-center bg-white border border-[#F1E1D4]">
            <Database className="w-8 h-8 text-[#8A7567] mx-auto mb-2 opacity-50" />
            <div className="text-sm font-bold text-[#382A20]">No facts match your filter</div>
            <p className="text-xs text-[#8A7567] mt-1">Try switching to "All Facts" or clearing the search query.</p>
          </div>
        ) : (
          filteredFacts.map((fact) => {
            const isStale = fact.is_expired;
            return (
              <div
                key={fact.id}
                className={`editorial-card p-6 bg-white transition-all shadow-xs hover:shadow-sm ${
                  isStale ? "border-[#FECDCA] bg-gradient-to-r from-white to-[#FEEBEA]/10" : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#F1E1D4]">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#FFF0E2] text-[#C87539] font-bold text-xs font-mono">
                        {fact.fact_code}
                      </span>
                      <span className="text-xs font-semibold text-[#8A7567]">
                        Topic: {fact.subject}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[#382A20]">{fact.subject}</h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {isStale ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FEEBEA] text-[#B42318] border border-[#FECDCA] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>EVIDENCE EXPIRED / STALE</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ACTIVE & CERTIFIED</span>
                      </span>
                    )}

                    {fact.normalized_value && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#FFF9F3] text-[#382A20] border border-[#F1E1D4]">
                        Official Value: {fact.normalized_value} {fact.normalized_unit || ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Certified Statement */}
                <div className="mt-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A7567] mb-1">
                    Approved Phrasing for Marketing & PR
                  </div>
                  <p className="text-sm font-semibold text-[#382A20] leading-relaxed bg-[#FFF9F3]/60 p-3 rounded-xl border border-[#F1E1D4]/60">
                    "{fact.approved_statement}"
                  </p>
                </div>

                {/* Source Evidence & Quote */}
                <div className="mt-3 p-3.5 rounded-xl bg-white border border-[#F1E1D4]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-[#8A7567] mb-1.5">
                    <span className="font-bold text-[#382A20]">
                      Document: {fact.source_document}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#C87539]" />
                      Owner: <strong>{fact.owner_name}</strong> ({fact.owner_email})
                    </span>
                  </div>
                  <p className="text-xs text-[#382A20] italic font-serif">
                    Source Quote: "{fact.source_quote}"
                  </p>
                </div>

                {/* Card Footer: Expiry date & Interactive Actions */}
                <div className="mt-4 pt-3 border-t border-[#F1E1D4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#8A7567]">
                    <Calendar className="w-4 h-4 text-[#C87539]" />
                    <span>
                      Evidence Valid Until:{" "}
                      <strong className={isStale ? "text-[#B42318] font-bold" : "text-[#382A20] font-bold"}>
                        {new Date(fact.valid_until).toLocaleDateString()}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isStale ? (
                      <>
                        <button
                          onClick={() => handleRequestUpdate(fact)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#FFF9F3] text-[#B42318] font-bold border border-[#FECDCA] transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Request Proof from {fact.owner_name.split(" ")[0]}</span>
                        </button>
                        <button
                          onClick={() => handleRenewFact(fact.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EDFDF5] hover:bg-emerald-100 text-[#027A48] font-bold border border-[#A6F4C5] transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>1-Click Renew (+1 Year)</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-[#027A48] font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Ready for Safe Usage</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Fact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="editorial-card w-full max-w-lg p-6 bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-[#382A20]">
                Certify New Fact for the Brand Vault
              </h2>
              <span className="text-xs text-[#8A7567]">Non-technical creators can certify</span>
            </div>
            <p className="text-xs text-[#8A7567] mb-4">
              Enter the exact benchmark or statistic. Once added, content writers can reference it with zero compliance friction.
            </p>

            <form onSubmit={handleCreateFact} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#382A20]">Fact Code / Identifier</label>
                <input
                  type="text"
                  required
                  value={newFact.fact_code}
                  onChange={(e) => setNewFact({ ...newFact, fact_code: e.target.value })}
                  className="editorial-input w-full p-2.5 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#382A20]">Subject / What is being claimed?</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infrastructure Availability SLA"
                  value={newFact.subject}
                  onChange={(e) => setNewFact({ ...newFact, subject: e.target.value })}
                  className="editorial-input w-full p-2.5 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#382A20]">Approved Statement (The exact copy to allow)</label>
                <textarea
                  required
                  placeholder="e.g. Apex Core provides a 99.98% uptime SLA backed by automated failover."
                  value={newFact.approved_statement}
                  onChange={(e) => setNewFact({ ...newFact, approved_statement: e.target.value })}
                  className="editorial-input w-full p-2.5 text-xs mt-1 h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#382A20]">Certified Value</label>
                  <input
                    type="text"
                    placeholder="e.g. 99.98"
                    value={newFact.normalized_value}
                    onChange={(e) => setNewFact({ ...newFact, normalized_value: e.target.value })}
                    className="editorial-input w-full p-2.5 text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#382A20]">Unit (if applicable)</label>
                  <input
                    type="text"
                    placeholder="e.g. % or ms or customers"
                    value={newFact.normalized_unit}
                    onChange={(e) => setNewFact({ ...newFact, normalized_unit: e.target.value })}
                    className="editorial-input w-full p-2.5 text-xs mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#382A20]">Proof Document Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 2026 SLA Audit Report v2.1"
                  value={newFact.source_document}
                  onChange={(e) => setNewFact({ ...newFact, source_document: e.target.value })}
                  className="editorial-input w-full p-2.5 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#382A20]">Verbatim Proof Quote</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 'Production infrastructure demonstrated 99.98% uptime in Q3.'"
                  value={newFact.source_quote}
                  onChange={(e) => setNewFact({ ...newFact, source_quote: e.target.value })}
                  className="editorial-input w-full p-2.5 text-xs mt-1"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1E1D4]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#F1E1D4] text-xs font-semibold text-[#382A20]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-bold shadow-xs"
                >
                  Save & Certify Fact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

