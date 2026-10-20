"use client";

import React from "react";
import {
  Cpu,
  ShieldCheck,
  Lock,
  EyeOff,
  Server,
  FileCheck2,
  CheckCircle2,
  ShieldAlert,
  Sparkles
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#382A20]">
          Settings & Model Disclosure
        </h1>
        <p className="text-sm text-[#8A7567] mt-1">
          Full architectural transparency: local model inference details, privacy policy, and redaction rules.
        </p>
      </div>

      {/* Model Disclosure Card */}
      <div className="editorial-card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1E1D4]">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#C87539]" />
            <h2 className="text-base font-bold text-[#382A20]">
              Active AI Model & Inference Provider Disclosure
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EDFDF5] text-[#027A48] border border-[#A6F4C5] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Zero Third-Party Cloud Data Leakage</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-[#FFF9F3] border border-[#F1E1D4] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#8A7567]">Inference Runtime</div>
            <div className="text-sm font-bold text-[#382A20]">Ollama Local Daemon (v0.32.15)</div>
            <div className="text-[#8A7567]">Runs on local hardware without sending draft text over the network.</div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#FFF9F3] border border-[#F1E1D4] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#8A7567]">Language Model Tag</div>
            <div className="text-sm font-bold text-[#382A20]">qwen2.5:1.5b / qwen2.5:3b</div>
            <div className="text-[#8A7567]">Open-weight instruction-tuned model under Apache 2.0 license.</div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#FFF9F3] border border-[#F1E1D4] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#8A7567]">Sampling Temperature</div>
            <div className="text-sm font-bold text-[#382A20]">0.1 (Constrained Governance Mode)</div>
            <div className="text-[#8A7567]">Minimizes creative drift to produce deterministic, reproducible evaluations.</div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#FFF9F3] border border-[#F1E1D4] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#8A7567]">Output Format</div>
            <div className="text-sm font-bold text-[#382A20]">Strict Pydantic JSON Schema</div>
            <div className="text-[#8A7567]">All outputs are machine-parsed into structured models with zero hallucinated keys.</div>
          </div>
        </div>
      </div>

      {/* Redaction Gateway & Security Policy */}
      <div className="editorial-card p-6 bg-white space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F1E1D4]">
          <EyeOff className="w-5 h-5 text-[#C87539]" />
          <h2 className="text-base font-bold text-[#382A20]">
            Privacy & Redaction Gateway Configuration
          </h2>
        </div>
        <p className="text-xs text-[#8A7567] leading-relaxed">
          Before any draft content or uploaded document is processed by language models, the Redaction Gateway quarantines sensitive tokens, preventing confidential product codenames and pricing leaks.
        </p>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-lg bg-[#FFF9F3] border border-[#F1E1D4] flex items-center justify-between">
            <div>
              <span className="font-bold text-[#382A20]">Pre-release Project Codenames: </span>
              <span className="font-mono text-[#8A7567] ml-2">{"\\b(Project\\s+[A-Z][a-zA-Z0-9]+)\\b"}</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Active Masking
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#FFF9F3] border border-[#F1E1D4] flex items-center justify-between">
            <div>
              <span className="font-bold text-[#382A20]">Pre-release Pricing Tokens: </span>
              <span className="font-mono text-[#8A7567] ml-2">{"\\$(\\d+(,\\d{3})*)\\s*(per|\\/)\\s*(mo|year)"}</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Active Masking
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#FFF9F3] border border-[#F1E1D4] flex items-center justify-between">
            <div>
              <span className="font-bold text-[#382A20]">Developer API Keys & Bearer Tokens: </span>
              <span className="font-mono text-[#8A7567] ml-2">{"\\b(sk-[a-zA-Z0-9]{24,})\\b"}</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Active Masking
            </span>
          </div>
        </div>
      </div>

      {/* Architecture Invariants Matrix */}
      <div className="editorial-card p-6 bg-white space-y-3">
        <h2 className="text-sm font-bold text-[#382A20] uppercase tracking-wider mb-2">
          Strict Architectural Invariants
        </h2>
        <div className="space-y-2.5 text-xs text-[#382A20]">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#027A48] shrink-0 mt-0.5" />
            <div>
              <strong>No Citation, No Blocking Flag:</strong> AI models cannot create blocking findings without verified exact quotes in the active rulebook.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#027A48] shrink-0 mt-0.5" />
            <div>
              <strong>Human Authority Primacy:</strong> The model has zero authority to approve, publish, or alter content automatically.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#027A48] shrink-0 mt-0.5" />
            <div>
              <strong>Intent Lock Protection:</strong> Edits are strictly surgical replacements preserving the creator's call to action and approved facts.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#027A48] shrink-0 mt-0.5" />
            <div>
              <strong>Tamper-Evident Receipts:</strong> Every completed review issues a cryptographic receipt with a content SHA-256 hash.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
