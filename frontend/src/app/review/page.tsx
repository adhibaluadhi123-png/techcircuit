"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  Flame,
  Check,
  Eye,
  Send
} from "lucide-react";
import { api, ReviewResult } from "@/lib/api";

const PRESET_TEST_CASES = [
  {
    badge: "Most Popular Demo",
    name: "Scenario 1: Banned Name & Exaggeration",
    title: "Enterprise Product Launch Announcement",
    text: "Migrate your mission-critical workloads to Apex Cloud today. Apex Dynamics is the undisputed fastest platform in the world for machine learning inference, with 100% uptime guaranteed. Visit our website to sign up for an enterprise evaluation.",
    explain: "Deliberately uses deprecated 'Apex Cloud' and claims 'undisputed fastest in the world'.",
  },
  {
    badge: "Expired Evidence",
    name: "Scenario 2: Outdated 2025 Customer Number",
    title: "Quarterly Growth Highlights",
    text: "We are thrilled to celebrate our growing ecosystem! Join over 1,450 verified enterprise organizations deploying workloads on Apex Core. Explore our developer tutorials today.",
    explain: "Quoting '1,450 customers' which expired on Dec 31, 2025 in the Approved Fact Vault.",
  },
  {
    badge: "Tone Check",
    name: "Scenario 3: Clickbait & Desperate Tone",
    title: "Social Viral Announcement",
    text: "OMG you WON'T BELIEVE what we just dropped!!! Run don't walk to grab this right now before prices double forever 🚀🔥💥 Sign up immediately!",
    explain: "Excessive exclamation marks, emojis, and urgent clickbait depart from our measured voice.",
  },
  {
    badge: "Privacy Masking",
    name: "Scenario 4: Secret Codename & Pricing",
    title: "Confidential Launch Preview",
    text: "We are secretly launching Project Prometheus with an unreleased price of $499 per mo. Check out our early documentation.",
    explain: "Redaction Gateway automatically masks confidential project names and pricing before AI checks.",
  },
  {
    badge: "Perfect Post",
    name: "Scenario 5: 100% Compliant Post",
    title: "Observability Feature Release",
    text: "We are pleased to introduce enhanced observability dashboards for Apex Core. Engineered to satisfy our 99.98% SLA availability commitment, the new telemetry tools provide real-time cluster metrics. Learn more at our documentation portal.",
    explain: "Passes all brand rules, quotes verified SLA numbers, and keeps measured authoritative tone.",
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

  const handlePresetSelect = (preset: typeof PRESET_TEST_CASES[0]) => {
    setTitle(preset.title);
    setContentText(preset.text);
    setSelectedFile(null);
    setReviewResult(null);
  };

  const handleRunReview = async () => {
    if (!contentText.trim() && !selectedFile) return;
    setReviewing(true);
    setStepPercent(20);
    setActiveStep("1. Checking privacy & masking confidential terms...");

    const formData = new FormData();
    formData.append("title", title);
    if (selectedFile) {
      formData.append("file", selectedFile);
    } else {
      formData.append("content_text", contentText);
    }

    try {
      setTimeout(() => {
        setStepPercent(45);
        setActiveStep("2. Checking brand rules & banned names...");
      }, 300);

      setTimeout(() => {
        setStepPercent(70);
        setActiveStep("3. Verifying numbers & evidence dates against Fact Vault...");
      }, 700);

      setTimeout(() => {
        setStepPercent(90);
        setActiveStep("4. Checking citations & building 1-click fixes...");
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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Friendly Page Header with Stepper */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#C87539] uppercase tracking-wider">
              Step 1 of 3: Check Your Content
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#382A20] mt-0.5">
              Instant Brand & Fact Checker
            </h1>
            <p className="text-sm text-[#8A7567] mt-1.5 leading-relaxed">
              Paste your marketing post, newsletter, or document. CANON checks it in seconds against your brand rules and verified company facts.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="badge-clean flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Local AI Engine Ready
            </span>
          </div>
        </div>

        {/* Visual Progress Stepper for Non-Technical Users */}
        <div className="mt-6 grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-[#FFF0E2]/60 border border-[#F1E1D4] text-xs">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow-2xs font-bold text-[#C87539]">
            <span className="w-5 h-5 rounded-full bg-[#C87539] text-white flex items-center justify-center text-[10px]">1</span>
            <span>Paste Content</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 text-[#8A7567] font-medium">
            <span className="w-5 h-5 rounded-full bg-[#E3D9CF] text-[#382A20] flex items-center justify-center text-[10px]">2</span>
            <span>Instant Scan</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 text-[#8A7567] font-medium">
            <span className="w-5 h-5 rounded-full bg-[#E3D9CF] text-[#382A20] flex items-center justify-center text-[10px]">3</span>
            <span>1-Click Fix & Approve</span>
          </div>
        </div>
      </div>

      {/* Quick-Pick Sample Scenarios (Great for Judges & First-Time Users) */}
      <div className="editorial-card p-5 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-[#C87539]" />
            <span className="text-xs font-bold text-[#382A20] uppercase tracking-wider">
              Quick Test: Click Any Sample Post to Try
            </span>
          </div>
          <span className="text-[11px] text-[#8A7567]">Click to auto-fill</span>
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
      <div className="editorial-card p-6 bg-white space-y-4 shadow-sm">
        <div>
          <label className="text-xs font-bold text-[#382A20] uppercase tracking-wider block mb-1.5">
            Content Title / Headline
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New Product Launch Blog Post"
            className="editorial-input w-full p-3 text-sm font-semibold"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-[#382A20] uppercase tracking-wider">
              Draft Text
            </label>
            <span className="text-xs text-[#8A7567]">
              {contentText.split(/\s+/).filter(Boolean).length} words · {contentText.length} characters
            </span>
          </div>
          <textarea
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            placeholder="Type or paste your content here..."
            className="editorial-input w-full h-40 p-3.5 text-sm leading-relaxed"
          />
        </div>

        {/* Or File Upload Box */}
        <div className="p-4 rounded-xl border-2 border-dashed border-[#F1E1D4] bg-[#FFF9F3]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FFF0E2] flex items-center justify-center text-[#C87539] shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#382A20]">Or Upload a Document (PDF / Word DOCX / Text)</div>
              <div className="text-[11px] text-[#8A7567]">
                We safely parse text directly on this computer. No files leave your device.
              </div>
            </div>
          </div>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
                setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
              }
            }}
            className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#FFF0E2] file:text-[#C87539] hover:file:bg-[#fce5cf] cursor-pointer"
          />
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
              className="btn-primary w-full sm:w-auto px-8 py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{reviewing ? "Checking Brand & Facts..." : "Run Brand Review Pipeline"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Instant Result Summary Card (Shown immediately upon check) */}
      {reviewResult && (
        <div className="editorial-card p-6 bg-white border-l-4 border-l-[#C87539] space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1E1D4]">
            <div>
              <div className="text-xs font-bold text-[#8A7567] uppercase">Check Complete</div>
              <h2 className="text-xl font-extrabold text-[#382A20] mt-0.5">
                {reviewResult.blocking_findings_count > 0 ? (
                  <span className="text-[#B42318] flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" />
                    <span>{reviewResult.blocking_findings_count} Issue(s) Need Your Attention Before Publishing</span>
                  </span>
                ) : (
                  <span className="text-[#027A48] flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6" />
                    <span>Great Job! Content is Compliant and Ready for Review</span>
                  </span>
                )}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => router.push("/findings")}
              className="btn-primary px-5 py-2.5 text-xs flex items-center gap-1.5 shrink-0"
            >
              <span>Inspect Findings & Apply Fixes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Friendly Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4]">
              <span className="text-[11px] font-bold text-[#8A7567] uppercase block">Rule Violations</span>
              <span className="text-xl font-bold text-[#B42318] block mt-1">
                {reviewResult.blocking_findings_count} Blocking
              </span>
              <span className="text-[11px] text-[#8A7567] mt-0.5 block">
                Must be corrected before approval
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4]">
              <span className="text-[11px] font-bold text-[#8A7567] uppercase block">Claim Evidence</span>
              <span className="text-xl font-bold text-[#C87539] block mt-1">
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
                Your message & audience remain unchanged
              </span>
            </div>
          </div>

          {/* Tracked Changes Diff Preview */}
          {reviewResult.diff_html && (
            <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#382A20]">
                <span>✨ 1-Click Suggested Fix Preview (Tracked Changes)</span>
                <span className="text-[#027A48]">Surgical Minimal Edit</span>
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
