"use client";

import React, { useState } from "react";
import {
  Cpu,
  ShieldCheck,
  Lock,
  EyeOff,
  Server,
  FileCheck2,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Lightbulb,
  Check
} from "lucide-react";

export default function SettingsPage() {
  const [testRedactText, setTestRedactText] = useState(
    "Confidential launch draft: Project ApexPro begins next quarter at $499 per mo. Use internal auth token sk-99887766554433221100aabb for early beta testing."
  );

  // Live client-side regex simulation matching backend RedactionGateway
  const simulateRedaction = (text: string) => {
    let result = text;
    // Codenames
    result = result.replace(/\b(Project\s+[A-Z][a-zA-Z0-9]+)\b/g, "[CONFIDENTIAL_PROJECT_REDACTED]");
    // Pricing
    result = result.replace(/\$(\d+(?:,\d{3})*)\s*(per|\/)\s*(mo|year)/gi, "[SENSITIVE_PRICING_REDACTED]");
    // API Tokens
    result = result.replace(/\b(sk-[a-zA-Z0-9]{20,})\b/g, "[API_KEY_MASKED]");
    return result;
  };

  const redactedResult = simulateRedaction(testRedactText);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5] uppercase tracking-wide">
              Privacy & Infrastructure
            </span>
            <span className="text-xs text-[#8A7567] font-medium">100% On-Premises Guarantee</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#382A20]">
            Settings, AI Architecture & Privacy Gateway
          </h1>
          <p className="text-sm text-[#8A7567] mt-1">
            Your draft marketing materials and company secrets never leave your local infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5] flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Zero Third-Party Cloud Leaks</span>
          </span>
        </div>
      </div>

      {/* Non-Technical Privacy Promise Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#F1E1D4] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0E2] flex items-center justify-center text-[#C87539] shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#382A20]">
              The CANON Privacy Guarantee for Non-Technical Teams
            </h2>
            <p className="text-xs text-[#8A7567] leading-relaxed mt-0.5">
              Unlike public consumer AI chatbots, CANON runs completely inside your secure environment using open-weight local models. Unannounced product names, embargoed press releases, and pricing spreadsheets are never transmitted over the internet or used for AI training.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Privacy & Redaction Simulator */}
      <div className="editorial-card p-6 bg-white border border-[#F1E1D4] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1E1D4]">
          <div className="flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-[#C87539]" />
            <h2 className="text-base font-bold text-[#382A20]">
              Interactive Privacy & Redaction Gateway Simulator
            </h2>
          </div>
          <span className="text-xs text-[#027A48] font-bold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>Active Protection</span>
          </span>
        </div>

        <p className="text-xs text-[#8A7567]">
          Before any draft text reaches AI models, CANON's Redaction Gateway automatically masks sensitive trade secrets. Try editing the input text below to see live redaction in action:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#382A20]">Draft Copy (Contains Sensitive Info)</label>
            <textarea
              value={testRedactText}
              onChange={(e) => setTestRedactText(e.target.value)}
              className="editorial-input w-full h-32 p-3 text-xs leading-relaxed"
              placeholder="Type sensitive text containing codenames or pricing..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#027A48]">What the AI Sees (Quarantined & Masked)</label>
            <div className="p-3 rounded-xl bg-[#EDFDF5] border border-[#A6F4C5] h-32 text-xs leading-relaxed text-[#382A20] font-mono overflow-y-auto">
              {redactedResult}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-[#8A7567]">
          <span className="font-bold text-[#382A20]">Protected Patterns:</span>
          <span className="px-2 py-0.5 rounded bg-[#FFF0E2] text-[#C87539] font-medium">Pre-release Codenames (Project X)</span>
          <span className="px-2 py-0.5 rounded bg-[#FFF0E2] text-[#C87539] font-medium">Unreleased Pricing ($X / mo)</span>
          <span className="px-2 py-0.5 rounded bg-[#FFF0E2] text-[#C87539] font-medium">API Keys & Tokens (sk-...)</span>
        </div>
      </div>

      {/* Model Disclosure Card */}
      <div className="editorial-card p-6 bg-white border border-[#F1E1D4] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1E1D4]">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#C87539]" />
            <h2 className="text-base font-bold text-[#382A20]">
              Active AI Model & Local Inference Runtime
            </h2>
          </div>
          <span className="text-xs text-[#8A7567] font-semibold">Self-Hosted Daemon</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#8A7567]">Inference Runtime</div>
            <div className="text-sm font-bold text-[#382A20]">Ollama Local Daemon</div>
            <div className="text-[#8A7567] leading-relaxed">
              Executes on local hardware. Zero network calls or external cloud dependencies.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#8A7567]">Model Weight Architecture</div>
            <div className="text-sm font-bold text-[#382A20]">qwen2.5:1.5b (Open-Weight Apache 2.0)</div>
            <div className="text-[#8A7567] leading-relaxed">
              Fast, deterministic instruction-tuned model specialized in structured governance evaluations.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#8A7567]">Sampling Temperature</div>
            <div className="text-sm font-bold text-[#382A20]">0.1 (Strict Constrained Governance)</div>
            <div className="text-[#8A7567] leading-relaxed">
              Eliminates creative drift to guarantee reproducible, consistent compliance findings.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#8A7567]">Output Validation Format</div>
            <div className="text-sm font-bold text-[#382A20]">Strict Pydantic JSON Schema</div>
            <div className="text-[#8A7567] leading-relaxed">
              All evaluations are validated through strict schemas with zero hallucinated keys.
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Invariants Matrix */}
      <div className="editorial-card p-6 bg-white border border-[#F1E1D4] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#F1E1D4]">
          <ShieldCheck className="w-5 h-5 text-[#027A48]" />
          <h2 className="text-sm font-bold text-[#382A20] uppercase tracking-wider">
            CANON's Four Non-Negotiable Core Invariants
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#382A20]">
          <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#027A48] shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm block text-[#382A20] mb-0.5">1. No Citation, No Blocking Flag</strong>
              <p className="text-[#8A7567] leading-relaxed">
                AI cannot block a marketing deadline without quoting the exact brand guideline clause.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#027A48] shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm block text-[#382A20] mb-0.5">2. Human Authority Primacy</strong>
              <p className="text-[#8A7567] leading-relaxed">
                AI only recommends; human Brand Managers retain sole authority to approve or grant exceptions.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#027A48] shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm block text-[#382A20] mb-0.5">3. Creator Intent Lock</strong>
              <p className="text-[#8A7567] leading-relaxed">
                Suggested edits are minimal surgical diffs that preserve the writer's Call to Action and message.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F1E1D4] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#027A48] shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm block text-[#382A20] mb-0.5">4. Tamper-Proof Cryptographic Receipts</strong>
              <p className="text-[#8A7567] leading-relaxed">
                Every approved document is signed and anchored in an append-only sequential SHA-256 chain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
