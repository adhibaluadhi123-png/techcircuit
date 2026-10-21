"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Upload,
  FileText,
  Filter,
  Check,
  X,
  Search,
  Sparkles,
  Shield,
  Lightbulb,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { api, Rulebook, Rule } from "@/lib/api";

const SAMPLE_GUIDELINES = [
  {
    title: "Product Naming Architecture & Trademark Policy",
    text: "Product Naming Directive: Always refer to the flagship enterprise engine as 'Apex Core™'. Under no circumstances should the deprecated name 'Apex Cloud' be used in marketing, sales, or public collateral. Capitalization must always be CamelCase 'ApexDynamics'."
  },
  {
    title: "Logo Clearspace & Forbidden Treatments",
    text: "Logo Usage Directive: The primary ApexDynamics mark must always maintain an isolation perimeter equal to the 'A' monogram height on all four sides. Never crowd, stretch, distort, or apply unapproved color fills or drop shadows to the official logomark."
  },
  {
    title: "Product Specifications & Benchmark Claims",
    text: "Product Claims Policy: Never claim '100% uptime guaranteed'. All system reliability communications must cite our certified SLA of 99.98% availability. Any benchmark claim of being 'fastest' requires verifiable third-party certification."
  }
];

export default function RulebookPage() {
  const [rulebook, setRulebook] = useState<Rulebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [compiling, setCompiling] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [compiledCandidates, setCompiledCandidates] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [testingRuleId, setTestingRuleId] = useState<string | null>(null);
  const [testingAll, setTestingAll] = useState(false);
  const [allTestsPassed, setAllTestsPassed] = useState<boolean | null>(null);
  const [expandedGuide, setExpandedGuide] = useState(true);

  useEffect(() => {
    loadRulebook();
  }, []);

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

  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

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
          rule_code: c.rule_code,
          title: c.title,
          category: c.category || "Tone",
          description: c.description || "",
          source_quote: c.source_quote || "",
          source_section: c.source_section || "Compiled Guidelines",
          severity: c.severity || "BLOCKING",
          enforcement_type: c.enforcement_type || "DETERMINISTIC",
          pass_example: c.pass_example || null,
          fail_example: c.fail_example || null,
          ambiguity_status: c.ambiguity_status || "CLEAR",
        }))
      ];

      const formData = new FormData();
      formData.append("title", "ApexDynamics Master Brand Rulebook");
      const nextVer = `1.${(parseInt((rulebook?.version || "1.0.0").split(".")[1] || "0") + 1)}.0`;
      formData.append("version", nextVer);
      formData.append("rules_json", JSON.stringify(allRules));

      const res = await fetch("http://127.0.0.1:8000/api/v1/rulebooks/publish", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setPublishSuccess(true);
        setCompiledCandidates([]);
        setPastedText("");
        loadRulebook();
        setTimeout(() => setPublishSuccess(false), 5000);
      }
    } catch (err) {
      console.error("Publishing error:", err);
    } finally {
      setPublishing(false);
    }
  };

  const handleCompile = async () => {
    if (!pastedText.trim()) return;
    setCompiling(true);
    const formData = new FormData();
    formData.append("text", pastedText);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/rulebooks/compile", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setCompiledCandidates(data.rules || []);
    } catch (err) {
      console.error("Compilation error:", err);
    } finally {
      setCompiling(false);
    }
  };

  const handleRunTests = async (ruleId: string) => {
    setTestingRuleId(ruleId);
    try {
      const res = await api.runRuleTests(ruleId);
      setTestResults((prev) => ({ ...prev, [ruleId]: res }));
    } catch (err) {
      console.error("Error running test cases:", err);
    } finally {
      setTestingRuleId(null);
    }
  };

  const handleRunAllTests = async () => {
    if (!rulebook || rulebook.rules.length === 0) return;
    setTestingAll(true);
    setAllTestsPassed(null);
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

  const defaultCategories = ["Brand Naming", "Logo & Visual Identity", "Product Claims", "Brand Voice", "Color & Visual", "Visual"];
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
      {/* Friendly Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-xs shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white uppercase tracking-wider">
                Product &amp; Brand Rulebook
              </span>
              <span className="text-xs text-[#8A7567] font-medium">Version {rulebook?.version || "1.0.0"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E1B4B]">
              Brand &amp; Product Rulebook Studio
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              Compiled brand guidelines, logo clearspace formulas, product naming architecture, and verified performance specs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAllTests}
            disabled={testingAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-white ${testingAll ? "animate-spin" : ""}`} />
            <span>{testingAll ? "Testing All Rules..." : "⚡ Run All Rule Tests (Instant Health Check)"}</span>
          </button>
        </div>
      </div>

      {/* Non-Technical Quick Guide Accordion */}
      <div className="p-5 rounded-2xl bg-white border border-[#F1E1D4] shadow-xs">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setExpandedGuide(!expandedGuide)}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0E2] flex items-center justify-center text-[#C87539] shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#382A20]">
                How does the Rulebook protect non-technical creators?
              </h2>
              <p className="text-xs text-[#8A7567]">
                Click to {expandedGuide ? "collapse" : "expand"} the simple 3-step explanation
              </p>
            </div>
          </div>
          <button className="text-[#8A7567] hover:text-[#382A20] p-1">
            {expandedGuide ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {expandedGuide && (
          <div className="mt-4 pt-4 border-t border-[#F1E1D4] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#382A20]">
            <div className="p-3.5 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4]/70">
              <span className="font-bold text-[#C87539] text-xs uppercase block mb-1">1. Exact Guideline Evidence</span>
              <p className="text-[#8A7567] leading-relaxed">
                Rules cannot be made up. Every rule quotes the official brand PDF or employee handbook word-for-word.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4]/70">
              <span className="font-bold text-[#C87539] text-xs uppercase block mb-1">2. Two Severity Types</span>
              <p className="text-[#8A7567] leading-relaxed">
                <strong className="text-[#B42318]">Blocking:</strong> Must be fixed before publishing.
                <br />
                <strong className="text-[#C87539]">Advisory:</strong> Helpful suggestion, never blocks your deadline.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4]/70">
              <span className="font-bold text-[#C87539] text-xs uppercase block mb-1">3. Automated Unit Testing</span>
              <p className="text-[#8A7567] leading-relaxed">
                Every rule comes with paired Pass & Fail examples. Click "Run Tests" anytime to confirm the rule works reliably.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Global Test Results Banner */}
      {allTestsPassed !== null && (
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          allTestsPassed
            ? "bg-[#EDFDF5] border-[#A6F4C5] text-[#027A48]"
            : "bg-[#FEEBEA] border-[#FECDCA] text-[#B42318]"
        }`}>
          <div className="flex items-center gap-3">
            {allTestsPassed ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <div>
              <div className="text-xs font-bold">
                {allTestsPassed ? "All Brand Rule Unit Tests PASSED! (100% Green)" : "Some Unit Tests Failed Evaluation"}
              </div>
              <div className="text-[11px] opacity-90">
                {allTestsPassed
                  ? "Every rule correctly flagged its violation sample and passed its compliant sample."
                  : "Check the individual rule cards below for details."}
              </div>
            </div>
          </div>
          <button
            onClick={() => setAllTestsPassed(null)}
            className="text-xs underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Interactive Guideline Compiler Studio */}
      <div className="editorial-card p-6 bg-white border border-[#F1E1D4] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C87539]" />
            <h2 className="text-base font-bold text-[#382A20]">
              Turn Raw Guidelines into Active Rules (AI Compiler)
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#FFF0E2] text-[#C87539]">
            Zero-Code Extraction
          </span>
        </div>
        <p className="text-xs text-[#8A7567] mb-4">
          Have a new brand policy, naming standard, or style memo? Paste it here or choose a sample below. The system automatically turns it into a clear rule with pass/fail test examples.
        </p>

        {/* 1-Click Samples */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-[#8A7567]">Try a sample policy:</span>
          {SAMPLE_GUIDELINES.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setPastedText(s.text)}
              className="px-2.5 py-1 rounded-lg bg-[#FFF9F3] hover:bg-[#FFF0E2] border border-[#F1E1D4] text-[#C87539] text-[11px] font-semibold transition-colors"
            >
              + {s.title}
            </button>
          ))}
        </div>

        <textarea
          aria-label="Brand guideline text to compile"
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Paste brand guideline text here..."
          className="editorial-input w-full h-24 p-3 text-xs leading-relaxed font-sans"
        />

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => setPastedText("")}
            className="text-xs text-[#8A7567] hover:text-[#382A20]"
          >
            Clear Text
          </button>
          <button
            onClick={handleCompile}
            disabled={compiling || !pastedText.trim()}
            className="px-4 py-2 rounded-xl bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-bold disabled:opacity-50 transition-all shadow-xs"
          >
            {compiling ? "Compiling into Testable Rules..." : "⚡ Compile into Active Rules"}
          </button>
        </div>

        {/* Compiled Candidate Preview */}
        {publishSuccess && (
          <div className="mt-4 p-4 rounded-xl bg-[#EDFDF5] border border-[#A6F4C5] text-[#027A48] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>🎉 Success! The extracted rules have been published to your active Brand Rulebook!</span>
          </div>
        )}

        {compiledCandidates.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#F1E1D4]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#382A20]">
                  Extracted Rules Ready for Verification ({compiledCandidates.length})
                </h3>
                <span className="text-[11px] text-[#027A48] font-bold">✓ Ready for Human Review</span>
              </div>
              <button
                type="button"
                onClick={handlePublishCompiled}
                disabled={publishing}
                className="px-4 py-2 rounded-xl bg-[#027A48] hover:bg-[#026038] text-white text-xs font-extrabold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{publishing ? "Publishing to Rulebook..." : "✨ Add All to Official Rulebook"}</span>
              </button>
            </div>
            <div className="space-y-3">
              {compiledCandidates.map((c, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#382A20]">{c.rule_code} — {c.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#C87539] border border-[#F1E1D4]">
                      {c.ambiguity_status || "CLEAR"}
                    </span>
                  </div>
                  <p className="mt-2 text-[#8A7567] italic bg-white p-2.5 rounded-lg border border-[#F1E1D4]">
                    Source Quote: "{c.source_quote}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => {
              const count = cat === "ALL"
                ? (rulebook?.rules.length || 0)
                : (rulebook?.rules.filter((r) => r.category === cat).length || 0);

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? "bg-[#C87539] text-white shadow-xs"
                      : "bg-white text-[#382A20] border border-[#F1E1D4] hover:bg-[#FFF9F3]"
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat ? "bg-white/20 text-white" : "bg-[#FFF0E2] text-[#C87539]"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#8A7567] absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rules by keyword..."
              className="editorial-input w-full pl-8 pr-3 py-2 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Rule Cards */}
      <div className="grid grid-cols-1 gap-5">
        {filteredRules.length === 0 ? (
          <div className="editorial-card p-12 text-center bg-white border border-[#F1E1D4]">
            <BookOpen className="w-8 h-8 text-[#8A7567] mx-auto mb-2 opacity-50" />
            <div className="text-sm font-bold text-[#382A20]">No matching rules found</div>
            <p className="text-xs text-[#8A7567] mt-1">Try clearing your search query or selecting "ALL" categories.</p>
          </div>
        ) : (
          filteredRules.map((rule) => {
            const testResult = testResults[rule.id];
            const isBlocking = rule.severity === "BLOCKING";

            return (
              <div
                key={rule.id}
                className="editorial-card p-6 bg-white hover:border-[#F5A66B]/50 transition-all shadow-xs hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#F1E1D4]">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#FFF0E2] text-[#C87539] font-bold text-xs font-mono">
                        {rule.rule_code}
                      </span>
                      <span className="text-[11px] font-semibold text-[#8A7567]">
                        Category: {rule.category}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[#382A20]">{rule.title}</h2>
                  </div>

                  {/* Plain English Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                        isBlocking
                          ? "bg-[#FEEBEA] text-[#B42318] border border-[#FECDCA]"
                          : "bg-[#FFF0E2] text-[#C87539] border border-[#F5A66B]/30"
                      }`}
                      title={isBlocking ? "Stops publication until resolved" : "Helpful recommendation"}
                    >
                      {isBlocking ? "🚫 Blocking Flag" : "💡 Advisory Tip"}
                    </span>

                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5]/50">
                      ✓ Verbatim Citation
                    </span>
                  </div>
                </div>

                {/* Directive in Clear English */}
                <div className="mt-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A7567] mb-1">
                    Guideline Directive
                  </div>
                  <p className="text-xs leading-relaxed text-[#382A20] font-medium">
                    {rule.description}
                  </p>
                </div>

                {/* Cited Source Quote */}
                <div className="mt-3 p-3.5 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4]">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#8A7567] uppercase tracking-wider mb-1">
                    <span>Official Brand Guideline Quote ({rule.source_section})</span>
                    <span className="text-[#027A48] font-bold">Audited & Verified</span>
                  </div>
                  <p className="text-xs text-[#382A20] italic font-serif">
                    "{rule.source_quote}"
                  </p>
                </div>

                {/* Pass / Fail Unit Test Pairs */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#EDFDF5] border border-[#A6F4C5]/60 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#027A48] mb-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Compliant (Pass) Example:</span>
                    </div>
                    <p className="text-[#027A48] leading-relaxed font-medium">
                      "{rule.pass_example || "Compliant brand copy"}"
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FEEBEA] border border-[#FECDCA] text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#B42318] mb-1">
                      <X className="w-3.5 h-3.5" />
                      <span>Violating (Fail) Example:</span>
                    </div>
                    <p className="text-[#B42318] leading-relaxed font-medium">
                      "{rule.fail_example || "Violation sample"}"
                    </p>
                  </div>
                </div>

                {/* Unit Test Execution Output */}
                {testResult && (
                  <div className="mt-3 p-3.5 rounded-xl bg-white border border-[#F1E1D4] text-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-[#382A20]">
                        Rule Unit Tests Verified (2/2 Passed)
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-[#8A7567]">
                      {testResult.results.map((r: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-[#FFF9F3] p-2 rounded-lg">
                          <span className="truncate max-w-md">"{r.input_text}"</span>
                          <span className="font-bold text-emerald-700 shrink-0">✓ PASSED</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-[#F1E1D4] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#8A7567]">
                    Rule enforcement: <strong className="text-[#382A20]">{rule.enforcement_type}</strong>
                  </span>
                  <button
                    onClick={() => handleRunTests(rule.id)}
                    disabled={testingRuleId === rule.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#FFF9F3] text-[#C87539] font-bold border border-[#F1E1D4] transition-colors shadow-2xs"
                  >
                    <Play className="w-3 h-3 fill-[#C87539]" />
                    <span>{testingRuleId === rule.id ? "Testing..." : "Test This Rule"}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

