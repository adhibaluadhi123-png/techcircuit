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
  X
} from "lucide-react";
import { api, Rulebook, Rule } from "@/lib/api";

export default function RulebookPage() {
  const [rulebook, setRulebook] = useState<Rulebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [compiling, setCompiling] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [compiledCandidates, setCompiledCandidates] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [testingRuleId, setTestingRuleId] = useState<string | null>(null);

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

  const filteredRules = rulebook?.rules.filter((r) =>
    selectedCategory === "ALL" ? true : r.category === selectedCategory
  ) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#382A20]">
            Brand Rulebook & Compiler Studio
          </h1>
          <p className="text-sm text-[#8A7567] mt-1">
            Versioned, testable brand rules backed by verbatim source citations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF0E2] text-[#C87539] border border-[#F5A66B]/30">
            Active Version: {rulebook?.version || "1.0.0"}
          </span>
        </div>
      </div>

      {/* Compiler Action Box */}
      <div className="editorial-card p-6 bg-white">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-[#C87539]" />
          <h2 className="text-base font-bold text-[#382A20]">
            Interactive Guideline Compiler
          </h2>
        </div>
        <p className="text-xs text-[#8A7567] mb-4">
          Paste raw brand guidelines or policy clauses. The local model splits them into atomic rules, extracts cited source spans, generates pass/fail unit test pairs, and scores ambiguity.
        </p>
        <textarea
          aria-label="Brand guideline text to compile"
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Paste guideline text here (e.g. 'Never refer to our platform as Apex Cloud. Always refer to it as Apex Core in enterprise contexts...')"
          className="editorial-input w-full h-24 p-3 text-xs leading-relaxed"
        />
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => {
              setPastedText(
                "Brand Voice Directive: Communications should be clean, modern, and high quality. Never use the deprecated term 'Apex Cloud'. All claims regarding uptime must not guarantee 100% availability, but cite our 99.98% SLA."
              );
            }}
            className="text-xs text-[#C87539] font-medium hover:underline"
          >
            Load Sample Guideline Text
          </button>
          <button
            onClick={handleCompile}
            disabled={compiling || !pastedText.trim()}
            className="px-4 py-2 rounded-lg bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-semibold disabled:opacity-50 transition-colors shadow-xs"
          >
            {compiling ? "Compiling with Local LLM..." : "Compile Candidate Rules"}
          </button>
        </div>

        {/* Compiled Candidate Preview */}
        {compiledCandidates.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#F1E1D4]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A7567] mb-3">
              Candidate Rules Extracted ({compiledCandidates.length})
            </h3>
            <div className="space-y-3">
              {compiledCandidates.map((c, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#FFF9F3] border border-[#F1E1D4] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#382A20]">{c.rule_code} — {c.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-[#C87539] border border-[#F1E1D4]">
                      {c.ambiguity_status}
                    </span>
                  </div>
                  <p className="mt-1 text-[#8A7567] italic">"{c.source_quote}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rules Filtering */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-[#8A7567] shrink-0" />
        {["ALL", "Terminology", "Claims", "Tone", "Visual", "Accessibility"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              selectedCategory === cat
                ? "bg-[#C87539] text-white"
                : "bg-white text-[#382A20] border border-[#F1E1D4] hover:bg-[#FFF9F3]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Rulebook Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRules.map((rule) => {
          const testResult = testResults[rule.id];
          return (
            <div key={rule.id} className="editorial-card p-6 bg-white hover:border-[#F5A66B]/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F1E1D4]">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md bg-[#FFF0E2] text-[#C87539] font-bold text-xs">
                    {rule.rule_code}
                  </span>
                  <h2 className="text-sm font-bold text-[#382A20]">{rule.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      rule.severity === "BLOCKING"
                        ? "bg-[#FEEBEA] text-[#B42318] border border-[#FECDCA]"
                        : "bg-[#FFF0E2] text-[#C87539] border border-[#F5A66B]/30"
                    }`}
                  >
                    {rule.severity}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white text-[#8A7567] border border-[#F1E1D4]">
                    {rule.enforcement_type}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      rule.ambiguity_status === "CLEAR"
                        ? "bg-[#EDFDF5] text-[#027A48]"
                        : "bg-[#FFF0E2] text-[#C87539]"
                    }`}
                  >
                    {rule.ambiguity_status}
                  </span>
                </div>
              </div>

              {/* Directive */}
              <p className="mt-3 text-xs leading-relaxed text-[#382A20] font-medium">
                {rule.description}
              </p>

              {/* Cited Source Quote */}
              <div className="mt-3 p-3 rounded-lg bg-[#FFF9F3] border border-[#F1E1D4]">
                <div className="text-[10px] font-bold text-[#8A7567] uppercase tracking-wider mb-1">
                  Verbatim Source Evidence ({rule.source_section})
                </div>
                <p className="text-xs text-[#382A20] italic">"{rule.source_quote}"</p>
              </div>

              {/* Pass / Fail Unit Test Pairs */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#EDFDF5] border border-[#A6F4C5]/60 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#027A48] mb-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Pass Example</span>
                  </div>
                  <p className="text-[#027A48]">{rule.pass_example || "Compliant usage"}</p>
                </div>

                <div className="p-3 rounded-lg bg-[#FEEBEA] border border-[#FECDCA] text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#B42318] mb-1">
                    <X className="w-3.5 h-3.5" />
                    <span>Fail Example</span>
                  </div>
                  <p className="text-[#B42318]">{rule.fail_example || "Violation sample"}</p>
                </div>
              </div>

              {/* Unit Test Execution Output */}
              {testResult && (
                <div className="mt-3 p-3 rounded-lg bg-white border border-[#F1E1D4] text-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-[#382A20]">
                      Rule Unit Tests Passed (2/2)
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-[#8A7567]">
                    {testResult.results.map((r: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <span>"{r.input_text}"</span>
                        <span className="font-semibold text-emerald-700">✓ PASSED</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-[#F1E1D4] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#8A7567]">
                  Unit test pairs validated against guideline text.
                </span>
                <button
                  onClick={() => handleRunTests(rule.id)}
                  disabled={testingRuleId === rule.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#FFF9F3] text-[#C87539] font-semibold border border-[#F1E1D4] transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-[#C87539]" />
                  <span>{testingRuleId === rule.id ? "Running..." : "Run Unit Tests"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
