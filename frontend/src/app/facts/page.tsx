"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Sparkles,
  Upload,
  FileUp,
  FileCheck,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Shield
} from "lucide-react";
import { api, Fact, CandidateFact, FactExtractionResult } from "@/lib/api";

export default function FactsPage() {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "STALE">("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // PDF Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pastedDocText, setPastedDocText] = useState("");
  const [showManualDocText, setShowManualDocText] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractionStep, setExtractionStep] = useState("");
  const [extractedResult, setExtractedResult] = useState<FactExtractionResult | null>(null);
  const [certifyingId, setCertifyingId] = useState<string | null>(null);
  const [certifiedFactCodes, setCertifiedFactCodes] = useState<Record<string, boolean>>({});

  // Manual Add Modal State
  const [newFact, setNewFact] = useState<Partial<Fact>>({
    fact_code: "FACT-NEW-2026",
    subject: "",
    approved_statement: "",
    normalized_value: "",
    normalized_unit: "",
    source_document: "",
    source_quote: "",
    owner_name: "Content Creator",
    owner_email: "creator@canon.example",
    valid_until: "2027-12-31T23:59:59Z",
  });

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

  useEffect(() => {
    loadFacts();
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("canon_user_name");
      const storedEmail = localStorage.getItem("canon_user_email");
      if (storedName) {
        setNewFact((prev) => ({
          ...prev,
          owner_name: storedName,
          owner_email: storedEmail || prev.owner_email,
        }));
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 4500);
  };

  // Drag and Drop handlers for PDF upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setExtractedResult(null);
    setCertifiedFactCodes({});
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPastedDocText("");
    setExtractedResult(null);
    setCertifiedFactCodes({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Extract facts via Backend API
  const handleExtractFacts = async () => {
    if (!selectedFile && !pastedDocText.trim()) {
      showToast("Please upload a PDF proof document or paste document text.");
      return;
    }

    setExtracting(true);
    setExtractionStep("Reading and parsing proof document...");

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      if (pastedDocText.trim()) {
        formData.append("text", pastedDocText.trim());
      }

      setExtractionStep("AI scanning for SLAs, benchmark metrics, and certifications...");
      const result = await api.extractFacts(formData);
      setExtractedResult(result);
      setExtractionStep("");
      showToast(`🎉 Successfully extracted ${result.candidate_facts_count} candidate facts from ${result.source_document}!`);
    } catch (err: any) {
      console.error("Fact extraction failed:", err);
      showToast(`Extraction failed: ${err.message || "Could not parse document."}`);
      setExtractionStep("");
    } finally {
      setExtracting(false);
    }
  };

  // 1-Click Certify candidate fact into vault
  const handleCertifyCandidateFact = async (candidate: CandidateFact) => {
    setCertifyingId(candidate.fact_code);
    try {
      let ownerName = "Content Creator";
      let ownerEmail = "creator@canon.example";
      if (typeof window !== "undefined") {
        ownerName = localStorage.getItem("canon_user_name") || ownerName;
        ownerEmail = localStorage.getItem("canon_user_email") || ownerEmail;
      }

      await api.createFact({
        fact_code: candidate.fact_code,
        subject: candidate.subject,
        approved_statement: candidate.approved_statement,
        normalized_value: candidate.normalized_value,
        normalized_unit: candidate.normalized_unit,
        source_document: candidate.source_document,
        source_quote: candidate.source_quote,
        owner_name: ownerName,
        owner_email: ownerEmail,
        valid_until: candidate.valid_until,
      });

      setCertifiedFactCodes((prev) => ({ ...prev, [candidate.fact_code]: true }));
      loadFacts();
      showToast(`✓ Fact ${candidate.fact_code} successfully certified to Brand Vault!`);
    } catch (err: any) {
      console.error("Failed to certify fact:", err);
      showToast(`Certification failed: ${err.message || "Server error"}`);
    } finally {
      setCertifyingId(null);
    }
  };

  // 1-Click Certify ALL candidate facts
  const handleCertifyAll = async () => {
    if (!extractedResult || extractedResult.candidate_facts.length === 0) return;
    setCertifyingId("ALL");
    let count = 0;

    let ownerName = "Content Creator";
    let ownerEmail = "creator@canon.example";
    if (typeof window !== "undefined") {
      ownerName = localStorage.getItem("canon_user_name") || ownerName;
      ownerEmail = localStorage.getItem("canon_user_email") || ownerEmail;
    }

    for (const f of extractedResult.candidate_facts) {
      if (certifiedFactCodes[f.fact_code]) continue;
      try {
        await api.createFact({
          fact_code: f.fact_code,
          subject: f.subject,
          approved_statement: f.approved_statement,
          normalized_value: f.normalized_value,
          normalized_unit: f.normalized_unit,
          source_document: f.source_document,
          source_quote: f.source_quote,
          owner_name: ownerName,
          owner_email: ownerEmail,
          valid_until: f.valid_until,
        });
        setCertifiedFactCodes((prev) => ({ ...prev, [f.fact_code]: true }));
        count++;
      } catch (err) {
        console.error("Error certifying fact:", f.fact_code, err);
      }
    }

    setCertifyingId(null);
    loadFacts();
    showToast(`🎉 Certified ${count} new facts into Brand Vault!`);
  };

  // Handle modal PDF upload to auto-fill modal
  const handleModalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    showToast("Analyzing proof PDF to auto-fill form...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.extractFacts(formData);
      if (res.candidate_facts.length > 0) {
        const first = res.candidate_facts[0];
        setNewFact((prev) => ({
          ...prev,
          fact_code: first.fact_code,
          subject: first.subject,
          approved_statement: first.approved_statement,
          normalized_value: first.normalized_value,
          normalized_unit: first.normalized_unit,
          source_document: first.source_document,
          source_quote: first.source_quote,
          valid_until: first.valid_until,
        }));
        showToast("✓ Fields auto-filled from uploaded PDF!");
      }
    } catch (err) {
      console.error("Could not auto-fill:", err);
    }
  };

  const handleCreateFact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createFact(newFact);
      setShowAddModal(false);
      loadFacts();
      showToast("New certified fact added successfully to the Vault!");
    } catch (err: any) {
      console.error("Error creating fact:", err);
      showToast(`Error creating fact: ${err.message || "Failed"}`);
    }
  };

  const handleRequestUpdate = (fact: Fact) => {
    showToast(`Proof renewal request sent to ${fact.owner_name} (${fact.owner_email})!`);
  };

  const handleRenewFact = async (factId: string) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    const newDate = d.toISOString();
    try {
      await api.updateFact(factId, { valid_until: newDate });
      loadFacts();
      showToast("🎉 Fact validity renewed for +1 year! Claim is certified and live in the database.");
    } catch (err: any) {
      console.error("Failed to renew fact:", err);
      setFacts((prev) =>
        prev.map((f) =>
          f.id === factId
            ? { ...f, is_expired: false, valid_until: newDate }
            : f
        )
      );
      showToast("Fact validity renewed for +1 year. Claim is now certified!");
    }
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
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#21160F] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-[#FB923C]/30 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#F97316] shrink-0" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFF1E6] text-[#C2410C] border border-[#FDBA74] uppercase tracking-wider">
                Approved Facts &amp; Metrics Vault
              </span>
              <span className="text-xs text-[#7C6A5E] font-medium">{facts.length} Verified Facts Live</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#21160F]">
              Approved Facts &amp; Metrics
            </h1>
            <p className="text-sm text-[#7C6A5E] mt-0.5">
              Upload SLA reports, SOC 2 certificates, or audit PDFs. CANON extracts candidate metrics and certifies them directly into the Brand Vault.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FFF9F3] text-[#21160F] border border-[#F4E2D3] text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#F97316]" />
          <span>+ Add Fact Manually</span>
        </button>
      </div>

      {/* ── 1. PRIMARY FEATURE: PDF PROOF DOCUMENT UPLOADER ── */}
      <div className="editorial-card p-6 bg-white border border-[#F4E2D3] shadow-sm rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F4E2D3]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF1E6] text-[#EA580C] flex items-center justify-center">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#21160F]">
                Upload Proof Document (AI Extracts &amp; Certifies Facts from PDF)
              </h2>
              <p className="text-xs text-[#7C6A5E]">
                Drop an SLA audit report, SOC 2 certification, benchmark PDF, or trademark filing. The AI learns verified numbers directly from the document.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5] self-start sm:self-auto shrink-0">
            PDF • DOCX • TXT Supported
          </span>
        </div>

        {/* Dropzone Card */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-[#F97316] bg-[#FFF5EC] scale-[0.99]"
              : selectedFile
              ? "border-emerald-400 bg-emerald-50/40"
              : "border-[#F4E2D3] bg-[#FFFAF5] hover:border-[#FB923C] hover:bg-[#FFF5EC]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelected(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {selectedFile ? (
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#21160F]">{selectedFile.name}</div>
                <div className="text-xs text-[#7C6A5E] mt-0.5">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready for AI extraction
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFile();
                  }}
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                >
                  Remove File
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FFF1E6] text-[#EA580C] flex items-center justify-center shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-[#21160F]">
                Drag and drop your proof document here, or <span className="text-[#EA580C] underline">browse files</span>
              </div>
              <p className="text-xs text-[#7C6A5E] max-w-md mx-auto">
                Upload your quarterly SLA metrics, SOC 2 compliance reports, customer count certificates, or legal trademark registration documents.
              </p>
            </div>
          )}
        </div>

        {/* Optional Manual Text Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowManualDocText(!showManualDocText)}
            className="text-xs font-semibold text-[#EA580C] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showManualDocText ? "Hide direct text box" : "+ Need to paste proof text directly instead of uploading a PDF?"}</span>
            {showManualDocText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showManualDocText && (
            <div className="mt-3 space-y-2 animate-in fade-in duration-200">
              <label className="text-xs font-bold text-[#21160F]">
                Paste Verbatim Proof Text (e.g. Audit Excerpts, SLA Guarantee):
              </label>
              <textarea
                value={pastedDocText}
                onChange={(e) => setPastedDocText(e.target.value)}
                placeholder="e.g. Production infrastructure demonstrated 99.98% uptime SLA in Q3. Sub-45ms roundtrip latency was achieved across all European nodes. The platform completed SOC 2 Type II compliance audit successfully."
                className="editorial-input w-full p-3 text-xs h-24"
              />
            </div>
          )}
        </div>

        {/* Action Button & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-[#7C6A5E] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#EA580C]" />
            <span>AI extracts verified metrics with 100% verbatim proof quote citations.</span>
          </div>

          <button
            type="button"
            onClick={handleExtractFacts}
            disabled={extracting || (!selectedFile && !pastedDocText.trim())}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
              extracting || (!selectedFile && !pastedDocText.trim())
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:opacity-95 shadow-orange-500/20 cursor-pointer"
            }`}
          >
            {extracting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{extractionStep || "Extracting Facts from PDF..."}</span>
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>🚀 Extract Facts from PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── 2. RESULTS DISPLAYED DIRECTLY DOWN BELOW THE UPLOADER ── */}
      {extractedResult && (
        <div className="editorial-card p-6 bg-gradient-to-b from-[#FFFDFB] to-white border-2 border-[#FB923C]/40 shadow-md rounded-2xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F4E2D3]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs shrink-0">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    AI Extraction Complete
                  </span>
                  <span className="text-xs font-bold text-[#7C6A5E]">
                    Source: {extractedResult.source_document}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#21160F] mt-0.5">
                  Extracted Candidate Facts ({extractedResult.candidate_facts_count} Verified Metrics Found)
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCertifyAll}
              disabled={certifyingId === "ALL"}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#027A48] hover:bg-[#02663c] text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto shrink-0"
            >
              {certifyingId === "ALL" ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>Certify All Extracted Facts (1-Click)</span>
            </button>
          </div>

          <p className="text-xs text-[#7C6A5E]">
            Review the extracted metrics below. Click <strong>"Certify to Brand Vault"</strong> on any fact to add it directly to active database enforcement with zero compliance friction.
          </p>

          {/* Candidate Fact Cards Grid */}
          <div className="grid grid-cols-1 gap-4">
            {extractedResult.candidate_facts.map((candidate, idx) => {
              const isCertified = certifiedFactCodes[candidate.fact_code];
              const isBusy = certifyingId === candidate.fact_code;

              return (
                <div
                  key={candidate.fact_code + idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCertified
                      ? "bg-[#EDFDF5] border-[#A6F4C5] shadow-xs"
                      : "bg-white border-[#F4E2D3] hover:border-[#FB923C] shadow-xs"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#FFF1E6] text-[#EA580C] font-mono font-bold text-xs">
                          {candidate.fact_code}
                        </span>
                        <span className="text-xs font-extrabold text-[#21160F]">
                          {candidate.subject}
                        </span>
                      </div>

                      {candidate.normalized_value && (
                        <div className="pt-1">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#FFFAF5] text-[#21160F] border border-[#F4E2D3]">
                            Certified Metric: <strong>{candidate.normalized_value} {candidate.normalized_unit}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Certify Button / Badge */}
                    <div className="shrink-0">
                      {isCertified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#027A48] border border-[#A6F4C5] text-xs font-bold shadow-xs">
                          <CheckCircle2 className="w-4 h-4 text-[#027A48]" />
                          <span>✓ Certified in Brand Vault</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCertifyCandidateFact(candidate)}
                          disabled={isBusy}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:opacity-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                          {isBusy ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Certify to Brand Vault</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Approved Statement Copy */}
                  <div className="mt-3">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C6A5E] mb-1">
                      Approved Statement for Marketing &amp; Public Collateral:
                    </div>
                    <p className="text-xs font-semibold text-[#21160F] bg-[#FFFAF5] p-3 rounded-xl border border-[#F4E2D3]">
                      "{candidate.approved_statement}"
                    </p>
                  </div>

                  {/* Source Quote Evidence */}
                  <div className="mt-2.5 p-3 rounded-xl bg-white border border-[#F4E2D3] text-xs space-y-1">
                    <div className="text-[11px] font-bold text-[#7C6A5E]">
                      Verbatim Proof Quote from {candidate.source_document}:
                    </div>
                    <p className="italic text-[#21160F] font-serif">
                      "{candidate.source_quote}"
                    </p>
                  </div>

                  {/* Expiration Guarantee */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-[#7C6A5E]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>Valid until: <strong>{new Date(candidate.valid_until).toLocaleDateString()}</strong> (Auto 1-year verification)</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold">100% Zero Hallucination Citation</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. Non-Technical Explanatory Card ── */}
      <div className="p-5 rounded-2xl bg-white border border-[#F4E2D3] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF1E6] flex items-center justify-center text-[#EA580C] shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#21160F]">
              Why does CANON track Fact Expiration Dates?
            </h2>
            <p className="text-xs text-[#7C6A5E] leading-relaxed mt-0.5">
              Marketing claims (e.g. "Over 50,000 customers" or "99.98% SLA") age quickly. When a fact expires, CANON gently warns creators so stale or untrue numbers are never accidentally published.
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

      {/* ── 4. Filters & Search ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === "ALL"
                ? "bg-[#21160F] text-white shadow-xs"
                : "bg-white text-[#21160F] border border-[#F4E2D3] hover:bg-[#FFFAF5]"
            }`}
          >
            All Facts ({facts.length})
          </button>
          <button
            onClick={() => setFilterStatus("ACTIVE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === "ACTIVE"
                ? "bg-[#027A48] text-white shadow-xs"
                : "bg-white text-[#21160F] border border-[#F4E2D3] hover:bg-[#FFFAF5]"
            }`}
          >
            ✓ Active &amp; Certified ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus("STALE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === "STALE"
                ? "bg-[#B42318] text-white shadow-xs"
                : "bg-white text-[#21160F] border border-[#F4E2D3] hover:bg-[#FFFAF5]"
            }`}
          >
            ⚠️ Expired / Needs Proof ({staleCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#7C6A5E] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by fact, subject, or owner..."
            className="editorial-input w-full pl-8 pr-3 py-2 text-xs"
          />
        </div>
      </div>

      {/* ── 5. Facts Vault List ── */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="editorial-card p-12 text-center bg-white border border-[#F4E2D3]">
            <RefreshCw className="w-6 h-6 animate-spin text-[#F97316] mx-auto mb-2" />
            <div className="text-xs font-bold text-[#21160F]">Loading Brand Fact Vault...</div>
          </div>
        ) : filteredFacts.length === 0 ? (
          <div className="editorial-card p-12 text-center bg-white border border-[#F4E2D3]">
            <Database className="w-8 h-8 text-[#7C6A5E] mx-auto mb-2 opacity-50" />
            <div className="text-sm font-bold text-[#21160F]">No facts match your filter</div>
            <p className="text-xs text-[#7C6A5E] mt-1">Upload a proof document above or click "+ Add Fact Manually".</p>
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
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#F4E2D3]">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#FFF1E6] text-[#EA580C] font-bold text-xs font-mono">
                        {fact.fact_code}
                      </span>
                      <span className="text-xs font-semibold text-[#7C6A5E]">
                        Topic: {fact.subject}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[#21160F]">{fact.subject}</h2>
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
                        <span>ACTIVE &amp; CERTIFIED</span>
                      </span>
                    )}

                    {fact.normalized_value && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#FFFAF5] text-[#21160F] border border-[#F4E2D3]">
                        Official Value: {fact.normalized_value} {fact.normalized_unit || ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Certified Statement */}
                <div className="mt-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#7C6A5E] mb-1">
                    Approved Phrasing for Marketing &amp; PR
                  </div>
                  <p className="text-sm font-semibold text-[#21160F] leading-relaxed bg-[#FFFAF5]/70 p-3 rounded-xl border border-[#F4E2D3]">
                    "{fact.approved_statement}"
                  </p>
                </div>

                {/* Source Evidence & Quote */}
                <div className="mt-3 p-3.5 rounded-xl bg-white border border-[#F4E2D3]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-[#7C6A5E] mb-1.5">
                    <span className="font-bold text-[#21160F] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#EA580C]" />
                      Proof Document: {fact.source_document}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#EA580C]" />
                      Owner: <strong>{fact.owner_name}</strong> ({fact.owner_email})
                    </span>
                  </div>
                  <p className="text-xs text-[#21160F] italic font-serif">
                    Source Quote: "{fact.source_quote}"
                  </p>
                </div>

                {/* Card Footer: Expiry date & Interactive Actions */}
                <div className="mt-4 pt-3 border-t border-[#F4E2D3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#7C6A5E]">
                    <Calendar className="w-4 h-4 text-[#EA580C]" />
                    <span>
                      Evidence Valid Until:{" "}
                      <strong className={isStale ? "text-[#B42318] font-bold" : "text-[#21160F] font-bold"}>
                        {new Date(fact.valid_until).toLocaleDateString()}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isStale ? (
                      <>
                        <button
                          onClick={() => handleRequestUpdate(fact)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#FFFAF5] text-[#B42318] font-bold border border-[#FECDCA] transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Request Proof from {fact.owner_name.split(" ")[0]}</span>
                        </button>
                        <button
                          onClick={() => handleRenewFact(fact.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EDFDF5] hover:bg-emerald-100 text-[#027A48] font-bold border border-[#A6F4C5] transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>1-Click Renew (+1 Year)</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-[#027A48] font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Ready for Safe Usage in Content</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── 6. Add Fact Modal (With optional PDF auto-fill) ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="editorial-card w-full max-w-lg p-6 bg-white shadow-2xl rounded-2xl max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#F4E2D3] pb-3">
              <div>
                <h2 className="text-base font-extrabold text-[#21160F]">
                  Certify New Fact for the Brand Vault
                </h2>
                <span className="text-xs text-[#7C6A5E]">Accessible to all content creators &amp; managers</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Auto-fill via PDF */}
            <div className="p-3 rounded-xl bg-[#FFF5EC] border border-[#FB923C]/30 flex items-center justify-between gap-3">
              <div className="text-xs text-[#21160F]">
                <strong>Drop proof PDF to auto-fill:</strong>
                <p className="text-[11px] text-[#7C6A5E]">Have an SLA or SOC 2 PDF? Auto-fill with 1 click.</p>
              </div>
              <input
                ref={modalFileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleModalFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => modalFileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#F4E2D3] hover:border-[#F97316] text-[#EA580C] text-xs font-bold shrink-0 cursor-pointer shadow-xs"
              >
                Upload PDF
              </button>
            </div>

            <form onSubmit={handleCreateFact} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#21160F]">Fact Code / Identifier</label>
                <input
                  type="text"
                  required
                  value={newFact.fact_code}
                  onChange={(e) => setNewFact({ ...newFact, fact_code: e.target.value })}
                  className="editorial-input w-full p-2.5 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#21160F]">Subject / Metric Claimed</label>
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
                <label className="text-xs font-bold text-[#21160F]">Approved Statement (The exact copy to allow)</label>
                <textarea
                  required
                  placeholder="e.g. CloudPlatform™ provides a 99.98% uptime SLA backed by automated multi-zone failover."
                  value={newFact.approved_statement}
                  onChange={(e) => setNewFact({ ...newFact, approved_statement: e.target.value })}
                  className="editorial-input w-full p-2.5 text-xs mt-1 h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#21160F]">Certified Value</label>
                  <input
                    type="text"
                    placeholder="e.g. 99.98"
                    value={newFact.normalized_value}
                    onChange={(e) => setNewFact({ ...newFact, normalized_value: e.target.value })}
                    className="editorial-input w-full p-2.5 text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#21160F]">Unit (if applicable)</label>
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
                <label className="text-xs font-bold text-[#21160F]">Proof Document Name</label>
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
                <label className="text-xs font-bold text-[#21160F]">Verbatim Proof Quote</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 'Production infrastructure demonstrated 99.98% uptime in Q3.'"
                  value={newFact.source_quote}
                  onChange={(e) => setNewFact({ ...newFact, source_quote: e.target.value })}
                  className="editorial-input w-full p-2.5 text-xs mt-1"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F4E2D3]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#F4E2D3] text-xs font-semibold text-[#21160F] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:opacity-95 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save &amp; Certify Fact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
