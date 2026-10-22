"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  BookOpen,
  Play,
  CheckCircle2,
  Upload,
  FileText,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react";
import { api, Rulebook } from "@/lib/api";

const STATIC_CANONICAL_CATEGORIES = [
  "Brand Naming",
  "Logo & Visual Identity",
  "Product Claims",
  "Brand Voice",
  "Color & Visual",
];

export default function RulebookPage() {
  const filePickerRef = useRef<HTMLInputElement>(null);
  const [activeBook, setActiveBook] = useState<Rulebook | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [activeCategoryScope, setActiveCategoryScope] = useState<string>("ALL");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [manualTextEntry, setManualTextEntry] = useState("");
  const [attachedDocument, setAttachedDocument] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [toggleTextCard, setToggleTextCard] = useState(false);

  const [extractedRuleDrafts, setExtractedRuleDrafts] = useState<any[]>([]);
  const [ruleTestMatrix, setRuleTestMatrix] = useState<Record<string, any>>({});
  const [evaluatingRuleKey, setEvaluatingRuleKey] = useState<string | null>(null);
  const [isBatchTesting, setIsBatchTesting] = useState(false);
  const [batchTestOutcome, setBatchTestOutcome] = useState<boolean | null>(null);
  const [isPersistingRules, setIsPersistingRules] = useState(false);
  const [persistedToast, setPersistedToast] = useState(false);

  const fetchActiveRulebook = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const result = await api.getActiveRulebook();
      setActiveBook(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveRulebook();
  }, [fetchActiveRulebook]);

  const onFileSelected = (file: File) => {
    setAttachedDocument(file);
    setExtractedRuleDrafts([]);
  };

  const executeCompilation = async () => {
    if (!manualTextEntry.trim() && !attachedDocument) return;
    setIsCompiling(true);

    try {
      const outcome = await api.compileGuidelineDocument(
        manualTextEntry || undefined,
        attachedDocument || undefined
      );
      if (outcome && outcome.rules && outcome.rules.length > 0) {
        setExtractedRuleDrafts(outcome.rules);
      } else {
        alert("The AI analyzed the document but did not extract any actionable rule constraints. Please check the document content.");
      }
    } catch (err: any) {
      alert(`Could not compile guidelines: ${err.message || err}`);
    } finally {
      setIsCompiling(false);
    }
  };

  const publishExtractedRules = async () => {
    if (extractedRuleDrafts.length === 0) return;
    setIsPersistingRules(true);
    try {
      const consolidatedRules = [
        ...(activeBook?.rules || []).map((r) => ({
          rule_code: r.rule_code,
          title: r.title,
          category: r.category,
          description: r.description,
          source_quote: r.source_quote,
          source_section: r.source_section,
          severity: r.severity,
          enforcement_type: r.enforcement_type,
          pass_example: r.pass_example,
          fail_example: r.fail_example,
          ambiguity_status: r.ambiguity_status,
        })),
        ...extractedRuleDrafts.map((c, i) => ({
          rule_code: c.rule_code || `RULE-${Math.floor(100 + Math.random() * 900)}`,
          title: c.title,
          category: c.category || "Brand Guidelines",
          description: c.description || "",
          source_quote: c.source_quote || "",
          source_section: c.source_section || "Compiled PDF",
          severity: c.severity || "BLOCKING",
          enforcement_type: c.enforcement_type || "DETERMINISTIC",
          pass_example: c.pass_example || null,
          fail_example: c.fail_example || null,
          ambiguity_status: c.ambiguity_status || "CLEAR",
        })),
      ];

      const currentVerNum = parseInt((activeBook?.version || "1.0.0").split(".")[1] || "0");
      const nextVer = `1.${currentVerNum + 1}.0`;

      await api.publishRulebook("Company Brand Rulebook", nextVer, consolidatedRules);
      setPersistedToast(true);
      setExtractedRuleDrafts([]);
      setManualTextEntry("");
      setAttachedDocument(null);
      await fetchActiveRulebook();
      setTimeout(() => setPersistedToast(false), 5000);
    } catch (err: any) {
      alert(`Failed to save rules: ${err.message || err}`);
    } finally {
      setIsPersistingRules(false);
    }
  };

  const executeRuleDiagnostic = async (id: string) => {
    setEvaluatingRuleKey(id);
    try {
      const result = await api.runRuleTests(id);
      setRuleTestMatrix((prev) => ({ ...prev, [id]: result }));
    } catch {
    } finally {
      setEvaluatingRuleKey(null);
    }
  };

  const executeGlobalSuite = async () => {
    if (!activeBook?.rules) return;
    setIsBatchTesting(true);
    let allValid = true;
    for (const item of activeBook.rules) {
      try {
        const diagnostics = await api.runRuleTests(item.id);
        setRuleTestMatrix((prev) => ({ ...prev, [item.id]: diagnostics }));
        if (!diagnostics.all_passed) allValid = false;
      } catch {
        allValid = false;
      }
    }
    setBatchTestOutcome(allValid);
    setIsBatchTesting(false);
  };

  const dynamicCategories = useMemo(() => {
    const fromRules = (activeBook?.rules || []).map((r) => r.category).filter(Boolean);
    return ["ALL", ...Array.from(new Set([...STATIC_CANONICAL_CATEGORIES, ...fromRules]))];
  }, [activeBook]);

  const visibleRules = useMemo(() => {
    const keyword = filterKeyword.toLowerCase().trim();
    return (activeBook?.rules || []).filter((item) => {
      const categoryMatch = activeCategoryScope === "ALL" || item.category === activeCategoryScope;
      if (!categoryMatch) return false;
      if (!keyword) return true;
      return (
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.rule_code.toLowerCase().includes(keyword) ||
        (item.source_quote && item.source_quote.toLowerCase().includes(keyword))
      );
    });
  }, [activeBook, activeCategoryScope, filterKeyword]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF8A3D] to-[#FF721B] text-white flex items-center justify-center shadow-xs shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF2E7] text-[#D95D0D] border border-[#FDBA74] uppercase tracking-wider">
                Brand Rules Library
              </span>
              <span className="text-xs text-[#8A7567] font-medium">Version {activeBook?.version || "1.0.0"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#201815]">
              Brand Rules &amp; Guidelines
            </h1>
            <p className="text-sm text-[#7C6A5E] mt-0.5">
              Upload your company brand guide PDF. The AI reads it, learns the rules, and automatically enforces them.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={executeGlobalSuite}
            disabled={isBatchTesting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#027A48] hover:bg-[#02663c] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Play className={`w-4 h-4 fill-white ${isBatchTesting ? "animate-spin" : ""}`} />
            <span>{isBatchTesting ? "Testing All Rules..." : "⚡ Run Rule Health Check"}</span>
          </button>
        </div>
      </div>

      {batchTestOutcome !== null && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in ${
            batchTestOutcome
              ? "bg-[#EDFDF5] border-[#A6F4C5] text-[#027A48]"
              : "bg-[#FFF0F0] border-[#FECDCA] text-[#B42318]"
          }`}
        >
          <div className="flex items-center gap-2">
            {batchTestOutcome ? (
              <CheckCircle2 className="w-5 h-5 text-[#027A48] shrink-0" />
            ) : (
              <X className="w-5 h-5 text-[#B42318] shrink-0" />
            )}
            <span>
              {batchTestOutcome
                ? "All active rules passed health check verification suite successfully!"
                : "Some active rules encountered issues during testing. Review individual rule results below."}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setBatchTestOutcome(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="editorial-card p-6 sm:p-8 bg-white border border-[#F1E1D4] space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF8A3D]" />
            <h2 className="text-base font-black text-[#201815]">
              Upload Brand Guidelines (AI Learns from PDF)
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFF2E7] text-[#D95D0D] border border-[#FDBA74]">
            Automated Extraction
          </span>
        </div>
        <p className="text-xs text-[#7C6A5E] leading-relaxed">
          Drop your company brand guidelines PDF, style book, or product naming guide. The AI reads the document, extracts enforceable rules with exact citations, and compiles them directly below.
        </p>

        <input
          ref={filePickerRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onFileSelected(e.target.files[0]);
            }
          }}
          className="hidden"
          id="guideline-pdf-input"
        />

        {!attachedDocument ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                onFileSelected(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => filePickerRef.current?.click()}
            className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2.5 ${
              dragActive
                ? "border-[#FF8A3D] bg-[#FFF5EC]"
                : "border-[#F4E2D3] bg-[#FFFBF7] hover:border-[#FF8A3D] hover:bg-[#FFF9F3]"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-[#FFF2E7] text-[#D95D0D] border border-[#FDBA74] flex items-center justify-center shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#201815]">
                Drag &amp; drop Brand Guidelines PDF here
              </p>
              <p className="text-[11px] text-[#7C6A5E] mt-0.5">
                Supports PDF (.pdf), Word (.docx), or Text (.txt)
              </p>
            </div>
            <button
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[#FDBA74] text-[#D95D0D] text-xs font-bold shadow-xs hover:bg-[#FFF5EC] transition-all"
            >
              Browse Brand PDF
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#EDFDF5] border border-[#A6F4C5] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#A6F4C5] text-[#027A48] flex items-center justify-center shadow-xs shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-[#201815] flex items-center gap-2">
                  <span>{attachedDocument.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#027A48] border border-[#A6F4C5]">
                    READY
                  </span>
                </div>
                <div className="text-[11px] text-[#7C6A5E]">
                  {(attachedDocument.size / 1024).toFixed(1)} KB · Ready to compile into rules
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setAttachedDocument(null);
                setExtractedRuleDrafts([]);
                if (filePickerRef.current) filePickerRef.current.value = "";
              }}
              className="p-1.5 rounded-lg text-[#7C6A5E] hover:text-[#B42318] hover:bg-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={() => setToggleTextCard(!toggleTextCard)}
            className="text-xs font-bold text-[#D95D0D] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{toggleTextCard ? "Hide direct text box" : "+ Or paste brand guideline text directly"}</span>
            {toggleTextCard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {toggleTextCard && (
            <div className="mt-3 space-y-3">
              <textarea
                value={manualTextEntry}
                onChange={(e) => setManualTextEntry(e.target.value)}
                placeholder="Paste your brand guidelines, logo usage rules, trademark standards, or style directives here to compile official rules..."
                className="editorial-input w-full h-28 p-3 text-xs leading-relaxed"
              />
            </div>
          )}
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-[#F4E2D3]">
          <span className="text-xs text-[#7C6A5E]">
            {attachedDocument ? `Selected file: ${attachedDocument.name}` : manualTextEntry ? "Text ready to compile" : "Upload a PDF or paste text above"}
          </span>

          <button
            type="button"
            onClick={executeCompilation}
            disabled={isCompiling || (!attachedDocument && !manualTextEntry.trim())}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] hover:from-[#FF9952] hover:to-[#E8630D] text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isCompiling ? "AI is Learning & Compiling..." : "Learn & Compile Rules from PDF"}</span>
          </button>
        </div>

        {persistedToast && (
          <div className="p-4 rounded-xl bg-[#EDFDF5] border border-[#A6F4C5] text-[#027A48] text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-[#027A48]" />
            <span>Success! The learned rules have been saved and activated into your Brand Rulebook!</span>
          </div>
        )}

        {extractedRuleDrafts.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#F4E2D3] space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#201815] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#027A48]" />
                  <span>Learned Rules from Document ({extractedRuleDrafts.length})</span>
                </h3>
                <p className="text-xs text-[#7C6A5E] mt-0.5">
                  Review the extracted rules below, then click &ldquo;Save &amp; Activate&rdquo; to add them to your brand book.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExtractedRuleDrafts([])}
                  className="px-3 py-1.5 rounded-lg border border-[#F4E2D3] text-xs font-bold text-[#7C6A5E] hover:bg-slate-50 cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={publishExtractedRules}
                  disabled={isPersistingRules}
                  className="px-5 py-2 rounded-xl bg-[#027A48] hover:bg-[#026038] text-white text-xs font-black transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isPersistingRules ? "Saving Rules..." : "Save & Activate These Rules"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {extractedRuleDrafts.map((c, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#FDBA74] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#201815] text-sm">
                      {c.rule_code || `RULE-${idx + 1}`} — {c.title}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-[#D95D0D] border border-[#FDBA74]">
                      {c.category || "Brand Rule"}
                    </span>
                  </div>

                  <p className="text-xs text-[#201815]">{c.description}</p>

                  {c.source_quote && (
                    <div className="p-2.5 rounded-xl bg-white border border-[#F4E2D3] text-[11px] text-[#7C6A5E]">
                      <strong className="text-[#201815]">Extracted Quote: </strong>
                      &ldquo;{c.source_quote}&rdquo;
                    </div>
                  )}

                  {(c.pass_example || c.fail_example) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {c.pass_example && (
                        <div className="p-2 rounded-lg bg-[#EDFDF5] text-[#027A48] text-[11px]">
                          <strong>Pass: </strong>{c.pass_example}
                        </div>
                      )}
                      {c.fail_example && (
                        <div className="p-2 rounded-lg bg-[#FFF0F0] text-[#B42318] text-[11px]">
                          <strong>Fail: </strong>{c.fail_example}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#201815]">
              Active Brand Rules ({visibleRules.length})
            </h2>
            <p className="text-xs text-[#7C6A5E]">
              These rules are actively evaluated on all uploaded marketing documents and copy.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#7C6A5E] absolute left-3 top-3" />
            <input
              type="text"
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              placeholder="Search active rules..."
              className="editorial-input w-full pl-9 pr-3 py-2 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {dynamicCategories.map((cat) => {
            const count = cat === "ALL"
              ? (activeBook?.rules.length || 0)
              : (activeBook?.rules.filter((r) => r.category === cat).length || 0);

            return (
              <button
                key={cat}
                onClick={() => setActiveCategoryScope(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeCategoryScope === cat
                    ? "bg-[#FF8A3D] text-white shadow-xs"
                    : "bg-white text-[#201815] border border-[#F4E2D3] hover:bg-[#FFF9F3]"
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeCategoryScope === cat ? "bg-white/20 text-white" : "bg-[#FFF2E7] text-[#D95D0D]"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {isDataLoading && !activeBook ? (
          <div className="p-12 text-center text-xs text-[#7C6A5E] bg-white border border-[#F4E2D3] rounded-2xl col-span-2">
            Loading brand rulebook...
          </div>
        ) : visibleRules.length === 0 ? (
          <div className="p-12 text-center bg-white border-2 border-dashed border-[#F4E2D3] rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF5EC] text-[#FF8A3D] border border-[#FDBA74] flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-[#201815]">No Brand Rules in Active Rulebook</h3>
            <p className="text-xs text-[#7C6A5E] max-w-md mx-auto leading-relaxed">
              Upload your brand guideline document or paste brand directives into the compiler above to generate, test, and publish official rules.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleRules.map((item) => {
              const inProgress = evaluatingRuleKey === item.id;
              const outcome = ruleTestMatrix[item.id];

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white border border-[#F4E2D3] space-y-3 shadow-xs hover:border-[#FDBA74] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase bg-[#FFF2E7] text-[#D95D0D] border border-[#FDBA74]">
                      {item.rule_code}
                    </span>
                    <span className="text-xs text-[#7C6A5E] font-semibold">{item.category}</span>
                  </div>

                  <h3 className="text-sm font-extrabold text-[#201815] leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#7C6A5E] leading-relaxed">
                    {item.description}
                  </p>

                  {item.source_quote && (
                    <div className="p-2.5 rounded-xl bg-[#FFFBF7] border border-[#F4E2D3] text-[11px] text-[#7C6A5E]">
                      <strong className="text-[#201815]">Citation: </strong>
                      &ldquo;{item.source_quote}&rdquo;
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between border-t border-[#F4E2D3]">
                    <span className="text-[11px] font-bold text-[#7C6A5E]">
                      Severity: <strong className={item.severity === "BLOCKING" ? "text-[#B42318]" : "text-[#D95D0D]"}>{item.severity}</strong>
                    </span>

                    <button
                      onClick={() => executeRuleDiagnostic(item.id)}
                      disabled={inProgress}
                      className="px-3 py-1 rounded-lg bg-white border border-[#F4E2D3] hover:border-[#FF8A3D] text-[#201815] text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Play className={`w-3 h-3 text-[#FF8A3D] ${inProgress ? "animate-spin" : ""}`} />
                      <span>{inProgress ? "Testing..." : outcome ? (outcome.all_passed ? "✓ Passed" : "❌ Failed") : "Test Rule"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
