"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileCheck2,
  Upload,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  HelpCircle,
  Wand2,
  Check,
  Send,
  X,
  User,
  Trash2,
  FileCode
} from "lucide-react";
import { api, ReviewResult, User as UserType } from "@/lib/api";

const PRESET_TEST_CASES = [
  {
    badge: "Product Naming & Trademarks",
    name: "Scenario 1: Packaging & Spec (Deprecated Name & Missing Trademark)",
    title: "Apex Core Enterprise Packaging Spec Sheet",
    text: "Deploy mission-critical workloads with apex dynamics. Upgrade your servers to Apex Cloud today for maximum hardware acceleration. Apex Dynamics is the undisputed fastest platform in the world, backed by guaranteed 100% uptime.",
    explain: "Violates product brand nomenclature ('Apex Cloud' instead of 'Apex Core™'), missing registered trademark symbol (ApexDynamics®), improper lowercase capitalization ('apex dynamics'), and unverified superlative claims.",
  },
  {
    badge: "Expired Lab Evidence",
    name: "Scenario 2: Hardware Datasheet (Expired Customer Metric)",
    title: "Apex Pulse Edge Hardware Datasheet v2.1",
    text: "The new Apex Pulse Edge hardware module connects over 1,450 verified enterprise organizations across global tier-1 regions. Features certified SOC 2 Type II compliance and low-latency throughput.",
    explain: "Quotes '1,450 enterprise organizations' which expired on Dec 31, 2025 in the Approved Fact Vault (demoted to STALE).",
  },
  {
    badge: "Logo & Visual Identity",
    name: "Scenario 3: Retail Partner Packaging & Logo Guidelines",
    title: "Retail Partner Co-Branding & Display Brief",
    text: "Partners must display our altered logomark with custom neon styling and crowded logo placement beside third-party partner emblems. Use distorted logo proportions where packaging space is limited.",
    explain: "Violates strict Logo Isolation and Forbidden Alterations policies (Rule LOGO-01 crowded logo, Rule LOGO-02 distorted logo).",
  },
  {
    badge: "Redaction Gateway",
    name: "Scenario 4: Confidential Hardware Codename & Unreleased SKU",
    title: "Confidential Hardware Architecture Leak Preview",
    text: "We are secretly sampling Project Prometheus silicon with an unreleased price of $499 per unit. Internal benchmark shows 42ms roundtrip latency.",
    explain: "Redaction Gateway automatically masks confidential SKU codenames and unreleased pricing before compliance review.",
  },
  {
    badge: "100% Compliant",
    name: "Scenario 5: 100% Compliant Product Catalog Collateral",
    title: "ApexDynamics® Official Product Catalog v2026",
    text: "ApexDynamics® is pleased to introduce Apex Core™ for high-throughput enterprise infrastructure. Engineered to satisfy our 99.98% SLA availability commitment, the new telemetry tools provide real-time cluster metrics. Learn more at our documentation portal.",
    explain: "Passes all brand rules: uses registered trademark (®), approved product naming (Apex Core™), verified SLA (99.98%), and authoritative brand voice.",
  },
];

export default function ReviewStudioPage() {
  const router = useRouter();
  const [title, setTitle] = useState(PRESET_TEST_CASES[0].title);
  const [contentText, setContentText] = useState(PRESET_TEST_CASES[0].text);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [activeStep, setActiveStep] = useState<string>("");
  const [stepPercent, setStepPercent] = useState<number>(0);
  const [submitterName, setSubmitterName] = useState("Liam Chen");
  const [submitterRole, setSubmitterRole] = useState("CREATOR");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("canon_user_name");
      const storedRole = localStorage.getItem("canon_user_role");
      if (storedName) setSubmitterName(storedName);
      if (storedRole) setSubmitterRole(storedRole);
    }
  }, []);

  const handlePresetSelect = (preset: typeof PRESET_TEST_CASES[0]) => {
    setTitle(preset.title);
    setContentText(preset.text);
    setSelectedFile(null);
    setReviewResult(null);
  };

  const handleClearAll = () => {
    setTitle("");
    setContentText("");
    setSelectedFile(null);
    setReviewResult(null);
  };

  const handleRunReview = async () => {
    if (!contentText.trim() && !selectedFile) return;
    setReviewing(true);
    setStepPercent(20);
    setActiveStep("1. Scanning for confidential trade secrets & redactions...");

    const formData = new FormData();
    formData.append("title", title || "Untitled Marketing Copy");
    if (selectedFile) {
      formData.append("file", selectedFile);
    } else {
      formData.append("content_text", contentText);
    }

    const storedUserId = typeof window !== "undefined" ? localStorage.getItem("canon_user_id") : null;
    if (storedUserId) {
      formData.append("creator_id", storedUserId);
    }

    try {
      setTimeout(() => {
        setStepPercent(45);
        setActiveStep("2. Evaluating against active Brand Rulebook...");
      }, 300);

      setTimeout(() => {
        setStepPercent(70);
        setActiveStep("3. Cross-referencing statistics against Approved Fact Vault...");
      }, 700);

      setTimeout(() => {
        setStepPercent(90);
        setActiveStep("4. Locking creative intent & generating surgical fixes...");
      }, 1100);

      const result = await api.submitReview(formData);
      setStepPercent(100);
      setReviewResult(result);
      if (typeof window !== "undefined") {
        localStorage.setItem("canon_last_review", JSON.stringify(result));
      }
    } catch (err: any) {
      console.error("Review submission failed:", err);
      alert(`Review check failed: ${err.message}`);
    } finally {
      setReviewing(false);
      setActiveStep("");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Executive Page Header */}
      <div className="p-6 rounded-2xl bg-white border border-[#F1E1D4] shadow-xs flex flex-col sm:flex-row items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-xs shrink-0">
          <FileCheck2 className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white uppercase tracking-wider">
              Brand Governance Compiler
            </span>
            <span className="text-xs text-[#8A7567]">Submitter: <strong className="text-[#1E1B4B]">{submitterName}</strong> ({submitterRole.replace("_", " ")})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
            Brand Spec &amp; Collateral Review Studio
          </h1>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Audit product packaging, hardware datasheets, brand name usage, logo placement directives, and certified benchmark claims against the compiled rulebook.
          </p>
        </div>
        <Link
          href="/guide"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#1E1B4B] text-xs font-bold border border-[#F1E1D4] transition-all shadow-2xs shrink-0"
        >
          <HelpCircle className="w-4 h-4 text-slate-600" />
          <span>Documentation</span>
        </Link>
      </div>

        {/* Visual Progress Stepper for Non-Technical Users */}
        <div className="mt-5 grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-[#FFF0E2]/60 border border-[#F1E1D4] text-xs">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow-2xs font-bold text-[#C87539]">
            <span className="w-5 h-5 rounded-full bg-[#C87539] text-white flex items-center justify-center text-[10px]">1</span>
            <span>Paste / Upload Draft</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 text-[#8A7567] font-medium">
            <span className="w-5 h-5 rounded-full bg-[#E3D9CF] text-[#382A20] flex items-center justify-center text-[10px]">2</span>
            <span>Instant Rule Scan</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 text-[#8A7567] font-medium">
            <span className="w-5 h-5 rounded-full bg-[#E3D9CF] text-[#382A20] flex items-center justify-center text-[10px]">3</span>
            <span>1-Click Fix & Sign-Off</span>
          </div>
        </div>

      {/* Quick Prompt Starters */}
      <div className="editorial-card p-5 bg-white border border-[#F1E1D4] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-[#C87539]" />
            <span className="text-xs font-bold text-[#382A20] uppercase tracking-wider">
              Test Scenarios: Click to Test Specific Rules
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-[#B42318] hover:underline font-bold flex items-center gap-1 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear & Write My Own Real Copy</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESET_TEST_CASES.map((preset, idx) => {
            const isSelected = contentText === preset.text;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-[#C87539] bg-[#FFF0E2] ring-2 ring-[#F5A66B]/30"
                    : "border-[#F1E1D4] bg-[#FFF9F3]/60 hover:bg-[#FFF9F3] hover:border-[#F5A66B]"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-[#C87539] border border-[#F1E1D4]">
                    {preset.badge}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#C87539]" />}
                </div>
                <div className="text-xs font-bold text-[#382A20] line-clamp-1">{preset.name}</div>
                <div className="text-[11px] text-[#8A7567] line-clamp-2 mt-1 leading-snug">
                  {preset.explain}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* The Content Input Box */}
      <div className="editorial-card p-6 bg-white border border-[#F1E1D4] space-y-4 shadow-xs">
        <div>
          <label className="text-xs font-bold text-[#382A20] uppercase tracking-wider block mb-1.5">
            Product Collateral Title / Packaging SKU
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Apex Core Packaging Spec Sheet v2.0"
            className="editorial-input w-full p-3 text-sm font-semibold"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-[#382A20] uppercase tracking-wider">
              Product Collateral &amp; Brand Spec Text
            </label>
            <span className="text-xs text-[#8A7567]">
              {contentText.split(/\s+/).filter(Boolean).length} words · {contentText.length} characters
            </span>
          </div>
          <textarea
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            placeholder="Paste product packaging copy, hardware datasheet text, brand naming references, or logo guidelines..."
            className="editorial-input w-full h-40 p-3.5 text-sm leading-relaxed"
          />
        </div>

        {/* Or File Upload Box */}
        <div className="p-4 rounded-xl border-2 border-dashed border-[#F1E1D4] bg-[#FFF9F3]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0E2] flex items-center justify-center text-[#C87539] shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#382A20]">
                {selectedFile ? `Selected: ${selectedFile.name}` : "Or Upload a Document (PDF / Word DOCX / Text)"}
              </div>
              <div className="text-[11px] text-[#8A7567]">
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB • Ready for extraction`
                  : "We safely parse text directly on this computer. No files leave your device."}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedFile && (
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-xs text-[#B42318] hover:underline px-2 py-1"
              >
                Remove
              </button>
            )}
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                  setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
                }
              }}
              className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FFF0E2] file:text-[#C87539] hover:file:bg-[#fce5cf] cursor-pointer"
            />
          </div>
        </div>

        {/* Big Action Check Button */}
        <div className="pt-2">
          {reviewing && (
            <div className="mb-4 p-4 rounded-xl bg-[#FFF0E2] border border-[#F5A66B]/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#C87539]">
                <span>{activeStep}</span>
                <span>{stepPercent}%</span>
              </div>
              <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#F1E1D4]">
                <div
                  className="bg-[#C87539] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${stepPercent}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-[#8A7567] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#C87539]" />
              <span>Protected by <strong>"No Citation, No Blocking Flag"</strong> guarantee</span>
            </div>

            <button
              type="button"
              onClick={handleRunReview}
              disabled={reviewing || (!contentText.trim() && !selectedFile)}
              className="btn-primary w-full sm:w-auto px-8 py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>{reviewing ? "Checking Brand & Facts..." : "Run Brand Review Pipeline"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Instant Result Summary Card (Shown immediately upon check) */}
      {reviewResult && (
        <div className="editorial-card p-6 bg-white border border-[#F1E1D4] border-l-4 border-l-[#C87539] space-y-5 animate-in fade-in duration-300 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1E1D4]">
            <div>
              <div className="text-xs font-bold text-[#8A7567] uppercase">Review Complete</div>
              <h2 className="text-xl font-extrabold text-[#382A20] mt-0.5">
                {reviewResult.blocking_findings_count > 0 ? (
                  <span className="text-[#B42318] flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" />
                    <span>{reviewResult.blocking_findings_count} Issue(s) Need Your Attention Before Publishing</span>
                  </span>
                ) : (
                  <span className="text-[#027A48] flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6" />
                    <span>Great Job! Content is Compliant and Ready for Approver Sign-Off</span>
                  </span>
                )}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => router.push("/findings")}
              className="btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              <span>Inspect Findings & Apply Fixes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Friendly Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4]">
              <span className="text-[11px] font-bold text-[#8A7567] uppercase block">Rule Violations</span>
              <span className="text-2xl font-bold text-[#B42318] block mt-1">
                {reviewResult.blocking_findings_count} Blocking
              </span>
              <span className="text-[11px] text-[#8A7567] mt-0.5 block">
                Must be corrected before approval
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4]">
              <span className="text-[11px] font-bold text-[#8A7567] uppercase block">Claim Evidence</span>
              <span className="text-2xl font-bold text-[#C87539] block mt-1">
                {reviewResult.claims.filter((c) => c.status !== "SUPPORTED").length} Needs Proof
              </span>
              <span className="text-[11px] text-[#8A7567] mt-0.5 block">
                Promotional statements without verified proof
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4]">
              <span className="text-[11px] font-bold text-[#8A7567] uppercase block">Intent Preserved</span>
              <span className="text-sm font-bold text-[#027A48] flex items-center gap-1 mt-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Call to Action Intact</span>
              </span>
              <span className="text-[11px] text-[#8A7567] mt-0.5 block">
                Your creative voice remains unchanged
              </span>
            </div>
          </div>

          {/* Tracked Changes Diff Preview */}
          {reviewResult.diff_html && (
            <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#382A20]">
                <span>✨ 1-Click Suggested Fix Preview (Tracked Changes)</span>
                <span className="text-[#027A48] font-bold">Surgical Minimal Edit</span>
              </div>
              <div
                className="text-xs leading-relaxed text-[#382A20] font-sans"
                dangerouslySetInnerHTML={{ __html: reviewResult.diff_html }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
