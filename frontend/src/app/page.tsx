"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  BookOpen,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldAlert,
  HelpCircle,
  KeyRound,
  Sparkles,
  Award,
  Smile,
  Wand2,
  Lock,
  Heart
} from "lucide-react";
import { api, GovernanceInsights, Rulebook, Fact } from "@/lib/api";

export default function OverviewPage() {
  const [insights, setInsights] = useState<GovernanceInsights | null>(null);
  const [rulebook, setRulebook] = useState<Rulebook | null>(null);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getInsights().catch(() => null),
      api.getActiveRulebook().catch(() => null),
      api.getFacts().catch(() => []),
    ]).then(([insData, rbData, factsData]) => {
      setInsights(insData);
      setRulebook(rbData);
      setFacts(factsData);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Friendly Hero Banner with Archie the Mascot */}
      <div className="editorial-card p-8 bg-gradient-to-r from-white via-[#FFF9F3] to-[#FFF0E2] border-[#F1E1D4] relative overflow-hidden shadow-xs rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl space-y-3.5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E2] text-[#C87539] text-xs font-black border border-[#F5A66B]/30 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Friendly Brand Guardian</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#382A20]">
            Spell-Check for Your Brand Promises! 🦉
          </h1>
          <p className="text-sm leading-relaxed text-[#8A7567]">
            Meet <strong>Archie the Owl</strong>! CANON checks your marketing posts, newsletters, and stories to make sure you never accidentally say the wrong product name or quote outdated numbers. Easy enough for a child to use!
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <Link
              href="/review"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-extrabold transition-all shadow-sm hover:shadow-md"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Check My Story Now (It's Fun!) →</span>
            </Link>
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-[#FFF9F3] text-[#382A20] text-xs font-bold border border-[#F1E1D4] transition-all shadow-2xs"
            >
              <HelpCircle className="w-4 h-4 text-[#C87539]" />
              <span>How It Works (Easy Guide)</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-[#FFF9F3] text-[#8A7567] hover:text-[#382A20] text-xs font-bold border border-[#F1E1D4] transition-all shadow-2xs"
            >
              <KeyRound className="w-4 h-4 text-[#C87539]" />
              <span>Log In / Switch Account</span>
            </Link>
          </div>
        </div>

        {/* Mascot Photo */}
        <div className="w-44 h-44 rounded-3xl overflow-hidden shadow-lg border-4 border-white shrink-0 relative bg-white">
          <img
            src="/mascot.jpg"
            alt="Archie the Brand Owl"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* The 3 Traffic Light Core Guarantee */}
      <div className="p-5 rounded-3xl bg-[#FFF0E2] border border-[#F5A66B]/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start md:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#C87539] text-white flex items-center justify-center shrink-0 shadow-xs text-xl">
            🚦
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#382A20]">
              Our Promise: NO CITATION, NO BLOCKING FLAG
            </h2>
            <p className="text-xs text-[#8A7567] mt-0.5 leading-relaxed">
              Computers cannot be bossy. If CANON cannot prove the exact sentence in your brand rulebook, it will never block your deadline. Only friendly suggestions allowed!
            </p>
          </div>
        </div>
        <Link
          href="/audit"
          className="text-xs font-bold text-[#C87539] hover:underline shrink-0 flex items-center gap-1.5 self-start md:self-auto"
        >
          <span>See the Magic Digital Seal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Cheerful Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="editorial-card p-5 bg-white border border-[#F1E1D4] shadow-2xs rounded-3xl">
          <div className="flex items-center justify-between text-[#8A7567] text-xs font-bold">
            <span className="uppercase tracking-wider">Active Rules 📜</span>
            <BookOpen className="w-4 h-4 text-[#F5A66B]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#382A20]">
              {rulebook ? rulebook.rules.length : 5}
            </span>
            <span className="text-xs font-bold text-[#027A48]">v{rulebook?.version || "1.0.0"}</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8A7567]">Brand promises we watch over</p>
        </div>

        <div className="editorial-card p-5 bg-white border border-[#F1E1D4] shadow-2xs rounded-3xl">
          <div className="flex items-center justify-between text-[#8A7567] text-xs font-bold">
            <span className="uppercase tracking-wider">True Facts 📊</span>
            <Database className="w-4 h-4 text-[#F5A66B]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#382A20]">{facts.length || 4}</span>
            <span className="text-xs font-bold text-[#B42318]">1 Alarm Set</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8A7567]">Verified statistics in our vault</p>
        </div>

        <div className="editorial-card p-5 bg-white border border-[#F1E1D4] shadow-2xs rounded-3xl">
          <div className="flex items-center justify-between text-[#8A7567] text-xs font-bold">
            <span className="uppercase tracking-wider">Stories Checked 📝</span>
            <FileCheck2 className="w-4 h-4 text-[#F5A66B]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#382A20]">
              {insights ? insights.total_reviews : 1}
            </span>
            <span className="text-xs font-bold text-[#027A48]">100% Honest</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8A7567]">Protected on our tamper ledger</p>
        </div>

        <div className="editorial-card p-5 bg-white border border-[#F1E1D4] shadow-2xs rounded-3xl">
          <div className="flex items-center justify-between text-[#8A7567] text-xs font-bold">
            <span className="uppercase tracking-wider">Happy Fixes 🪄</span>
            <TrendingUp className="w-4 h-4 text-[#F5A66B]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#382A20]">
              {insights?.proposed_amendments?.length || 1}
            </span>
            <span className="text-xs font-bold text-[#C87539]">Smart Tip</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8A7567]">Auto-updating our rulebook</p>
        </div>
      </div>

      {/* Two-Column Showcase with Cheerful Team & Live Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left: Team Illustration Card */}
        <div className="editorial-card p-6 bg-white border border-[#F1E1D4] shadow-xs rounded-3xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#F1E1D4] mb-3">
              <h2 className="text-base font-extrabold text-[#382A20] flex items-center gap-2">
                <span>The 5 Superpowers of CANON</span>
              </h2>
              <span className="text-[10px] font-bold text-[#027A48] bg-[#EDFDF5] px-2 py-0.5 rounded-full">
                Safe & Simple
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#FFF9F3]">
                <span className="text-xl">📜</span>
                <div>
                  <h3 className="text-xs font-extrabold text-[#382A20]">1. Rulebook Detective</h3>
                  <p className="text-[11px] text-[#8A7567]">
                    Reads company guidelines and creates automatic pass/fail tests.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#FFF9F3]">
                <span className="text-xl">⏰</span>
                <div>
                  <h3 className="text-xs font-extrabold text-[#382A20]">2. The Truth Alarm</h3>
                  <p className="text-[11px] text-[#8A7567]">
                    Stops you from accidentally bragging about old, expired statistics.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#FFF9F3]">
                <span className="text-xl">🛡️</span>
                <div>
                  <h3 className="text-xs font-extrabold text-[#382A20]">3. Friendly Referee</h3>
                  <p className="text-[11px] text-[#8A7567]">
                    Never blocks you unless it has an exact quotation from your official handbook.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#FFF9F3]">
                <span className="text-xl">🪄</span>
                <div>
                  <h3 className="text-xs font-extrabold text-[#382A20]">4. 1-Click Magic Fix</h3>
                  <p className="text-[11px] text-[#8A7567]">
                    Swaps the forbidden words while keeping your story and voice 100% intact.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#FFF9F3]">
                <span className="text-xl">🏅</span>
                <div>
                  <h3 className="text-xs font-extrabold text-[#382A20]">5. The Golden Seal</h3>
                  <p className="text-[11px] text-[#8A7567]">
                    A mathematical stamp proving nobody can secretly change your approved work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Golden Seal Preview & Active Rules */}
        <div className="editorial-card p-6 bg-white border border-[#F1E1D4] shadow-xs flex flex-col justify-between rounded-3xl space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F1E1D4]">
              <h2 className="text-base font-extrabold text-[#382A20] flex items-center gap-2">
                <span>Active Rules Explorer</span>
              </h2>
              <Link href="/rulebook" className="text-xs text-[#C87539] font-bold hover:underline">
                View All Rules →
              </Link>
            </div>

            <div className="space-y-3">
              {rulebook?.rules.slice(0, 3).map((rule) => (
                <div
                  key={rule.id}
                  className="p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#F1E1D4] flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-[#382A20]">{rule.rule_code}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-white text-[#8A7567] border border-[#F1E1D4]">
                        {rule.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#382A20] mt-1 font-semibold">{rule.title}</p>
                    <p className="text-[11px] text-[#8A7567] mt-0.5 line-clamp-1 italic font-serif">
                      "{rule.source_quote}"
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                      rule.severity === "BLOCKING"
                        ? "bg-[#FEEBEA] text-[#B42318] border border-[#FECDCA]"
                        : "bg-[#FFF0E2] text-[#C87539] border border-[#F5A66B]/30"
                    }`}
                  >
                    {rule.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Golden Seal Thumbnail */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF0E2] to-white border border-[#F5A66B]/30 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xs shrink-0 bg-white">
              <img src="/seal.jpg" alt="Golden Seal" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-[#382A20]">100% Cryptographic Golden Seal</div>
              <p className="text-[11px] text-[#8A7567] mt-0.5">
                Every approved story gets a digital wax stamp anchored in our tamper-proof history chain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
