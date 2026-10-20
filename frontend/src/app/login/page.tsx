"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  KeyRound,
  Check,
  LogOut,
  UserCheck,
  Wand2,
  Smile
} from "lucide-react";
import { api, User as UserType } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register form state
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"CREATOR" | "BRAND_MANAGER" | "APPROVER" | "AUTHORISED_REVIEWER" | "ADMIN">("CREATOR");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [workspaceUsers, setWorkspaceUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    // Load directory users
    api.getUsers()
      .then((users) => {
        setWorkspaceUsers(users);
        const savedId = typeof window !== "undefined" ? localStorage.getItem("canon_user_id") : null;
        if (savedId) {
          const match = users.find((u) => u.id === savedId);
          if (match) setCurrentUser(match);
        }
      })
      .catch((err) => console.error("Could not fetch users:", err));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email: loginEmail, password: loginPassword });
      localStorage.setItem("canon_token", res.access_token);
      localStorage.setItem("canon_user_id", res.user_id);
      localStorage.setItem("canon_user_role", res.role);
      localStorage.setItem("canon_user_name", res.full_name);
      localStorage.setItem("canon_user_email", res.email);

      setSuccessMsg(`🎉 Welcome back, ${res.full_name}! Taking you in...`);
      setTimeout(() => {
        router.push("/review");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Try one of the 1-click accounts on the right!");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError("Please fill in your name, email, and a password!");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.register({
        email: regEmail,
        full_name: regFullName,
        password: regPassword,
        role: regRole,
      });
      localStorage.setItem("canon_token", res.access_token);
      localStorage.setItem("canon_user_id", res.user_id);
      localStorage.setItem("canon_user_role", res.role);
      localStorage.setItem("canon_user_name", res.full_name);
      localStorage.setItem("canon_user_email", res.email);

      setSuccessMsg(`🌟 Yay! Account created for ${res.full_name}! Taking you to the review studio...`);
      setTimeout(() => {
        router.push("/review");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Could not create account. That email might already be registered.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillRegister = () => {
    const randomNum = Math.floor(Math.random() * 900) + 100;
    setRegFullName("Happy Writer " + randomNum);
    setRegEmail(`happy.writer${randomNum}@example.com`);
    setRegPassword("Password123!");
    setRegRole("CREATOR");
    setError(null);
  };

  const handleQuickLogin = (u: UserType) => {
    localStorage.setItem("canon_user_id", u.id);
    localStorage.setItem("canon_user_role", u.role);
    localStorage.setItem("canon_user_name", u.full_name);
    localStorage.setItem("canon_user_email", u.email);
    setCurrentUser(u);
    setSuccessMsg(`🚀 Switched to ${u.full_name} (${u.role.replace("_", " ")})!`);
    setTimeout(() => {
      router.push("/review");
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem("canon_token");
    localStorage.removeItem("canon_user_id");
    localStorage.removeItem("canon_user_role");
    localStorage.removeItem("canon_user_name");
    localStorage.removeItem("canon_user_email");
    setCurrentUser(null);
    setSuccessMsg("Signed out! Feel free to log in as anyone anytime.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Friendly Header with Archie Mascot */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FFF0E2] via-white to-[#FFF9F3] border border-[#F1E1D4] shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md shrink-0 border-2 border-[#F5A66B]/40 relative bg-white">
          <img
            src="/mascot.jpg"
            alt="Archie the Brand Owl"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C87539] text-white shadow-2xs">
            <Smile className="w-3.5 h-3.5" />
            <span>Welcome to CANON!</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#382A20]">
            Sign In or Create Your Account
          </h1>
          <p className="text-sm text-[#8A7567] leading-relaxed">
            Hi! I'm Archie the Brand Owl 🦉. Pick an existing friendly account below, or create your very own in seconds!
          </p>
        </div>
      </div>

      {/* Active Session Notification */}
      {currentUser && (
        <div className="p-5 rounded-2xl bg-[#EDFDF5] border border-[#A6F4C5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#A6F4C5] flex items-center justify-center text-[#027A48] font-black text-xl shadow-2xs">
              {currentUser.full_name.charAt(0)}
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#027A48] uppercase tracking-wide">
                You are currently signed in as
              </div>
              <h2 className="text-base font-bold text-[#382A20]">
                {currentUser.full_name}
              </h2>
              <div className="text-xs text-[#8A7567]">
                {currentUser.email} • Role: <strong className="text-[#027A48]">{currentUser.role.replace("_", " ")}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/review")}
              className="px-4 py-2.5 rounded-xl bg-[#027A48] hover:bg-[#026038] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
            >
              <span>Go to Review Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#FFF9F3] text-[#B42318] text-xs font-bold border border-[#FECDCA] transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Form + Quick Switch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Sign In or Register (7 cols) */}
        <div className="lg:col-span-7 editorial-card p-7 bg-white border border-[#F1E1D4] shadow-xs space-y-6 rounded-3xl">
          {/* Big, Obvious Friendly Tab Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#FFF0E2]/70 border border-[#F1E1D4]">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
                tab === "login"
                  ? "bg-white text-[#C87539] shadow-sm"
                  : "text-[#8A7567] hover:text-[#382A20]"
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>I Have an Account (Sign In)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab("register");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
                tab === "register"
                  ? "bg-[#C87539] text-white shadow-sm"
                  : "text-[#8A7567] hover:text-[#382A20]"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ Create New Account</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-4 rounded-2xl bg-[#FEEBEA] border border-[#FECDCA] text-[#B42318] text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-[#EDFDF5] border border-[#A6F4C5] text-[#027A48] text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#382A20] block mb-1">
                  Your Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A7567] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. creator@apexdynamics.example"
                    className="editorial-input w-full pl-10 pr-3 py-2.5 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#382A20] block mb-1">
                  Your Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A7567] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password..."
                    className="editorial-input w-full pl-10 pr-3 py-2.5 text-xs font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-extrabold transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? "Signing In..." : "🚀 Sign In & Enter"}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTab("register");
                    setError(null);
                  }}
                  className="text-xs text-[#C87539] font-bold hover:underline"
                >
                  Don't have an account yet? Click here to create one! ✨
                </button>
              </div>
            </form>
          )}

          {/* 2. Register Form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-[#382A20]">Fill in your details:</span>
                <button
                  type="button"
                  onClick={handleQuickFillRegister}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFF0E2] text-[#C87539] text-[11px] font-bold hover:bg-[#F5A66B]/20 transition-colors"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>⚡ 1-Click Auto-Fill</span>
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-[#382A20] block mb-1">
                  Your Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8A7567] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Maya Patel"
                    className="editorial-input w-full pl-10 pr-3 py-2.5 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#382A20] block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A7567] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. maya@example.com"
                    className="editorial-input w-full pl-10 pr-3 py-2.5 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#382A20] block mb-1">
                  What will you be doing? (Your Role)
                </label>
                <select
                  value={regRole}
                  onChange={(e: any) => setRegRole(e.target.value)}
                  className="editorial-input w-full p-2.5 text-xs font-semibold"
                >
                  <option value="CREATOR">✍️ Content Writer / Storyteller (Writes & fixes copy)</option>
                  <option value="BRAND_MANAGER">🛡️ Brand Guardian (Creates rules & facts)</option>
                  <option value="APPROVER">👔 Approver (Issues official golden seals)</option>
                  <option value="AUTHORISED_REVIEWER">🔍 Reviewer (Audits compliance)</option>
                  <option value="ADMIN">⚙️ Administrator (Full system access)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#382A20] block mb-1">
                  Choose a Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A7567] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create your password..."
                    className="editorial-input w-full pl-10 pr-3 py-2.5 text-xs font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#027A48] hover:bg-[#026038] text-white text-xs font-extrabold transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? "Creating Account..." : "✨ Create My Account & Enter!"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTab("login");
                    setError(null);
                  }}
                  className="text-xs text-[#8A7567] hover:text-[#382A20] font-semibold"
                >
                  Already have an account? <span className="text-[#C87539] font-bold">Sign In here</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Panel: 1-Click Ready Accounts (5 cols) */}
        <div className="lg:col-span-5 editorial-card p-6 bg-white border border-[#F1E1D4] shadow-xs space-y-4 rounded-3xl">
          <div className="flex items-center gap-2 pb-2 border-b border-[#F1E1D4]">
            <UserCheck className="w-5 h-5 text-[#C87539]" />
            <h2 className="text-sm font-extrabold text-[#382A20] uppercase tracking-wider">
              1-Click Instant Sign-In
            </h2>
          </div>
          <p className="text-xs text-[#8A7567] leading-relaxed">
            No typing needed! Just click any team member below to instantly test the platform with their permissions:
          </p>

          <div className="space-y-2.5 pt-1">
            {workspaceUsers.map((u) => {
              const isCurrent = currentUser?.id === u.id;
              let roleEmoji = "✍️";
              let badgeColor = "bg-[#FFF0E2] text-[#C87539]";
              if (u.role === "APPROVER") {
                roleEmoji = "👔";
                badgeColor = "bg-[#EDFDF5] text-[#027A48]";
              } else if (u.role === "BRAND_MANAGER") {
                roleEmoji = "🛡️";
                badgeColor = "bg-[#FFF9F3] text-[#C87539]";
              } else if (u.role === "ADMIN") {
                roleEmoji = "⚙️";
                badgeColor = "bg-[#FEEBEA] text-[#B42318]";
              }

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isCurrent
                      ? "bg-[#FFF0E2] border-[#C87539] ring-2 ring-[#C87539]/30"
                      : "bg-[#FFF9F3]/60 hover:bg-[#FFF0E2] border-[#F1E1D4] hover:border-[#C87539]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{roleEmoji}</span>
                    <div>
                      <div className="text-xs font-bold text-[#382A20]">
                        {u.full_name}
                      </div>
                      <div className="text-[11px] text-[#8A7567]">{u.email}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border border-black/5 ${badgeColor}`}>
                    {u.role.replace("_", " ")}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#F1E1D4] text-[11px] text-[#8A7567] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C87539]" />
            <span>Clicking any user switches your active role immediately!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
