"use client";

import React, { useState, useEffect, useRef } from "react";
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

const SAMPLE_GUIDELINES = [
  {
    title: "Product Naming & Trademarks",
    text: "Product Naming Directive: Always refer to our product by its official trademarked name 'Cloud Platform™'. Under no circumstances should deprecated names like 'Legacy Suite' be used in marketing or public collateral. Capitalization must always be consistent."
  },
  {
    title: "Logo Clearspace & Spacing",
    text: "Logo Usage Directive: The primary brand logo must always maintain an isolation perimeter equal to the mark height on all four sides. Never crowd, stretch, distort, or apply unapproved color fills or drop shadows to the official logomark."
  },
  {
    title: "Uptime Guarantees & Metrics",
    text: "Product Claims Policy: Never claim '100% uptime guaranteed'. All reliability communications must cite our certified SLA of 99.98% availability. Any customer metric claim must cite audited figures."
  }
];

export default function RulebookPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rulebook, setRulebook] = useState<Rulebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [compiling, setCompiling] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);

  const [compiledCandidates, setCompiledCandidates] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [testingRuleId, setTestingRuleId] = useState<string | null>(null);
  const [testingAll, setTestingAll] = useState(false);
  const [allTestsPassed, setAllTestsPassed] = useState<boolean | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const loadRulebook = () => {
    setLoading(true);
    api.getActiveRulebook()
      .then((data) => {
        setRulebook(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading rulebook:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadRulebook();
  }, []);

  const handleFileChange = (file: File) => {
    setSelectedPdf(file);
    setCompiledCandidates([]);
  };

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
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleCompile = async () => {
    if (!pastedText.trim() && !selectedPdf) return;
    setCompiling(true);

    try {
      const res = await api.compileGuidelineDocument(pastedText || undefined, selectedPdf || undefined);
      if (res && res.rules && res.rules.length > 0) {
        setCompiledCandidates(res.rules);
      } else {
        alert("The AI analyzed the document but did not extract any actionable rule constraints. Please check the document content.");
      }
    } catch (err: any) {
      console.error("Compilation error:", err);
      alert(`Could not compile guidelines: ${err.message || err}`);
    } finally {
      setCompiling(false);
    }
  };

  const handlePublishCompiled = async () => {
    if (compiledCandidates.length === 0) return;
    setPublishing(true);
    try {
      const allRules = [
        ...(rulebook?.rules || []).map((r) => ({
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
        ...compiledCandidates.map((c) => ({
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
        }))
      ];

      const currentVerNum = parseInt((rulebook?.version || "1.0.0").split(".")[1] || "0");
      const nextVer = `1.${currentVerNum + 1}.0`;

      await api.publishRulebook("Company Brand Rulebook", nextVer, allRules);
      setPublishSuccess(true);
      setCompiledCandidates([]);
      setPastedText("");
      setSelectedPdf(null);
      loadRulebook();
      setTimeout(() => setPublishSuccess(false), 5000);
    } catch (err: any) {
      console.error("Publishing error:", err);
      alert(`Failed to save rules: ${err.message || err}`);
    } finally {
      setPublishing(false);
    }
  };

  const handleRunRuleTest = async (ruleId: string) => {
    setTestingRuleId(ruleId);
    try {
      const res = await api.runRuleTests(ruleId);
      setTestResults((prev) => ({ ...prev, [ruleId]: res }));
    } catch (err) {
      console.error("Test error:", err);
    } finally {
      setTestingRuleId(null);
    }
  };

  const handleRunAllTests = async () => {
    if (!rulebook?.rules) return;
    setTestingAll(true);
    let allOk = true;
    for (const rule of rulebook.rules) {
      try {
        const res = await api.runRuleTests(rule.id);
        setTestResults((prev) => ({ ...prev, [rule.id]: res }));
        if (!res.all_passed) allOk = false;
      } catch {
        allOk = false;
      }
    }
    setAllTestsPassed(allOk);
    setTestingAll(false);
  };

  const defaultCategories = ["Brand Naming", "Logo & Visual Identity", "Product Claims", "Brand Voice", "Color & Visual"];
  const ruleCategories = (rulebook?.rules || []).map((r) => r.category).filter(Boolean);
  const categories = ["ALL", ...Array.from(new Set([...defaultCategories, ...ruleCategories]))];

  const filteredRules = (rulebook?.rules || []).filter((r) => {
    const matchesCat = selectedCategory === "ALL" ? true : r.category === selectedCategory;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rule_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.source_quote && r.source_quote.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* ── 1. Page Header ── */}
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
              <span className="text-xs text-[#8A7567] font-medium">Version {rulebook?.version || "1.0.0"}</span>
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
            onClick={handleRunAllTests}
            disabled={testingAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#027A48] hover:bg-[#02663c] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Play className={`w-4 h-4 fill-white ${testingAll ? "animate-spin" : ""}`} />
            <span>{testingAll ? "Testing All Rules..." : "⚡ Run Rule Health Check"}</span>
          </button>
        </div>
      </div>

      {/* ── Test Suite Results Notification Banner ── */}
      {allTestsPassed !== null && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in ${
            allTestsPassed
              ? "bg-[#EDFDF5] border-[#A6F4C5] text-[#027A48]"
              : "bg-[#FFF0F0] border-[#FECDCA] text-[#B42318]"
          }`}
        >
          <div className="flex items-center gap-2">
            {allTestsPassed ? (
              <CheckCircle2 className="w-5 h-5 text-[#027A48] shrink-0" />
            ) : (
              <X className="w-5 h-5 text-[#B42318] shrink-0" />
            )}
            <span>
              {allTestsPassed
                ? "All active rules passed health check verification suite successfully!"
                : "Some active rules encountered issues during testing. Review individual rule results below."}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAllTestsPassed(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── 2. Primary Feature: Upload Brand PDF to Learn Rules ── */}
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

        {/* PDF File Dropzone */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileChange(e.target.files[0]);
            }
          }}
          className="hidden"
          id="guideline-pdf-input"
        />

        {!selectedPdf ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2.5 ${
              isDragging
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
                  <span>{selectedPdf.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#027A48] border border-[#A6F4C5]">
                    READY
                  </span>
                </div>
                <div className="text-[11px] text-[#7C6A5E]">
                  {(selectedPdf.size / 1024).toFixed(1)} KB · Ready to compile into rules
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedPdf(null);
                setCompiledCandidates([]);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="p-1.5 rounded-lg text-[#7C6A5E] hover:text-[#B42318] hover:bg-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Collapsible Text Alternative */}
        <div>
          <button
            type="button"
            onClick={() => setShowTextInput(!showTextInput)}
            className="text-xs font-bold text-[#D95D0D] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showTextInput ? "Hide direct text box" : "+ Or paste brand guideline text directly"}</span>
            {showTextInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showTextInput && (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#7C6A5E]">Sample rule:</span>
                {SAMPLE_GUIDELINES.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPastedText(s.text);
                      setSelectedPdf(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#FFF9F3] hover:bg-[#FFF0E2] border border-[#F1E1D4] text-[#D95D0D] text-[11px] font-semibold transition-colors"
                  >
                    + {s.title}
                  </button>
                ))}
              </div>

              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste brand guidelines, logo usage rules, or naming policies here..."
                className="editorial-input w-full h-24 p-3 text-xs leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between border-t border-[#F4E2D3]">
          <span className="text-xs text-[#7C6A5E]">
            {selectedPdf ? `Selected file: ${selectedPdf.name}` : pastedText ? "Text ready to compile" : "Upload a PDF or paste text above"}
          </span>

          <button
            type="button"
            onClick={handleCompile}
            disabled={compiling || (!selectedPdf && !pastedText.trim())}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] hover:from-[#FF9952] hover:to-[#E8630D] text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4" />
            <span>{compiling ? "AI is Learning & Compiling..." : "Learn & Compile Rules from PDF"}</span>
          </button>
        </div>

        {/* Success Banner */}
        {publishSuccess && (
          <div className="p-4 rounded-xl bg-[#EDFDF5] border border-[#A6F4C5] text-[#027A48] text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-[#027A48]" />
            <span>Success! The learned rules have been saved and activated into your Brand Rulebook!</span>
          </div>
        )}

        {/* ── 3. Extracted Rules Displayed Directly Down Below ── */}
        {compiledCandidates.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#F4E2D3] space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#201815] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#027A48]" />
                  <span>Learned Rules from Document ({compiledCandidates.length})</span>
                </h3>
                <p className="text-xs text-[#7C6A5E] mt-0.5">
                  Review the extracted rules below, then click &ldquo;Save &amp; Activate&rdquo; to add them to your brand book.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCompiledCandidates([])}
                  className="px-3 py-1.5 rounded-lg border border-[#F4E2D3] text-xs font-bold text-[#7C6A5E] hover:bg-slate-50 cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handlePublishCompiled}
                  disabled={publishing}
                  className="px-5 py-2 rounded-xl bg-[#027A48] hover:bg-[#026038] text-white text-xs font-black transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{publishing ? "Saving Rules..." : "Save & Activate These Rules"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {compiledCandidates.map((c, idx) => (
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

      {/* ── 4. Active Rules List ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#201815]">
              Active Brand Rules ({filteredRules.length})
            </h2>
            <p className="text-xs text-[#7C6A5E]">
              These rules are actively evaluated on all uploaded marketing documents and copy.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#7C6A5E] absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active rules..."
              className="editorial-input w-full pl-9 pr-3 py-2 text-xs"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const count = cat === "ALL"
              ? (rulebook?.rules.length || 0)
              : (rulebook?.rules.filter((r) => r.category === cat).length || 0);

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#FF8A3D] text-white shadow-xs"
                    : "bg-white text-[#201815] border border-[#F4E2D3] hover:bg-[#FFF9F3]"
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  selectedCategory === cat ? "bg-white/20 text-white" : "bg-[#FFF2E7] text-[#D95D0D]"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Rules Grid */}
        {loading && !rulebook ? (
          <div className="p-12 text-center text-xs text-[#7C6A5E] bg-white border border-[#F4E2D3] rounded-2xl col-span-2">
            Loading brand rulebook...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRules.map((rule) => {
            const isTesting = testingRuleId === rule.id;
            const res = testResults[rule.id];

            return (
              <div
                key={rule.id}
                className="p-5 rounded-2xl bg-white border border-[#F4E2D3] space-y-3 shadow-xs hover:border-[#FDBA74] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase bg-[#FFF2E7] text-[#D95D0D] border border-[#FDBA74]">
                    {rule.rule_code}
                  </span>
                  <span className="text-xs text-[#7C6A5E] font-semibold">{rule.category}</span>
                </div>

                <h3 className="text-sm font-extrabold text-[#201815] leading-snug">
                  {rule.title}
                </h3>
                <p className="text-xs text-[#7C6A5E] leading-relaxed">
                  {rule.description}
                </p>

                {rule.source_quote && (
                  <div className="p-2.5 rounded-xl bg-[#FFFBF7] border border-[#F4E2D3] text-[11px] text-[#7C6A5E]">
                    <strong className="text-[#201815]">Citation: </strong>
                    &ldquo;{rule.source_quote}&rdquo;
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between border-t border-[#F4E2D3]">
                  <span className="text-[11px] font-bold text-[#7C6A5E]">
                    Severity: <strong className={rule.severity === "BLOCKING" ? "text-[#B42318]" : "text-[#D95D0D]"}>{rule.severity}</strong>
                  </span>

                  <button
                    onClick={() => handleRunRuleTest(rule.id)}
                    disabled={isTesting}
                    className="px-3 py-1 rounded-lg bg-white border border-[#F4E2D3] hover:border-[#FF8A3D] text-[#201815] text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Play className={`w-3 h-3 text-[#FF8A3D] ${isTesting ? "animate-spin" : ""}`} />
                    <span>{isTesting ? "Testing..." : res ? (res.all_passed ? "✓ Passed" : "❌ Failed") : "Test Rule"}</span>
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
