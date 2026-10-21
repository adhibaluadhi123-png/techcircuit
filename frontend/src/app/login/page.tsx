"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Wand2,
  Smile,
  Shield
} from "lucide-react";
import { api, User as UserType } from "@/lib/api";
import { SpotlightCard } from "@/components/animations/SpotlightCard";
import { BorderBeam } from "@/components/animations/BorderBeam";
import { ShinyText } from "@/components/animations/ShinyText";
import { AnimatedGrid } from "@/components/animations/AnimatedGrid";
import { MagnetButton } from "@/components/animations/MagnetButton";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"register" | "login">("register");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<
    "CREATOR" | "BRAND_MANAGER" | "APPROVER" | "AUTHORISED_REVIEWER" | "ADMIN"
  >("CREATOR");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<UserType | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  const refreshUserData = () => {
    api.getUsers()
      .then((users) => {
        const savedId = typeof window !== "undefined" ? localStorage.getItem("canon_user_id") : null;
        if (savedId) {
          const match = users.find((u) => u.id === savedId);
          if (match) setCurrentUser(match);
        }
      })
      .catch((err) => console.error("Could not fetch users:", err));
  };

  useEffect(() => {
    refreshUserData();

    // Check query params: if ?tab=login, switch to login tab; otherwise default to register
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "login") {
        setTab("login");
      } else {
        setTab("register");
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.login({ email: loginEmail.trim(), password: loginPassword });
      localStorage.setItem("canon_token", res.access_token);
      localStorage.setItem("canon_user_id", res.user_id);
      localStorage.setItem("canon_user_role", res.role);
      localStorage.setItem("canon_user_name", res.full_name);
      localStorage.setItem("canon_user_email", res.email);

      // Notify Sidebar and other components
      window.dispatchEvent(new Event("canon_user_changed"));
      window.dispatchEvent(new Event("storage"));

      const loggedInUser: UserType = {
        id: res.user_id,
        email: res.email,
        full_name: res.full_name,
        role: res.role,
        workspace_id: res.workspace_id,
      };
      setCurrentUser(loggedInUser);

      setSuccessMsg(`🎉 Welcome back, ${res.full_name}! Taking you to your workspace dashboard...`);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please verify your credentials or create a new account.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = regFullName.trim();
    const cleanEmail = regEmail.trim();
    const cleanPassword = regPassword.trim();

    if (!cleanName) {
      setError("Please type your name in the 'Your Full Name' field.");
      return;
    }
    if (!cleanEmail) {
      setError("Please type your email in the 'Email Address' field.");
      return;
    }
    if (!cleanPassword) {
      setError("Please choose a password in the 'Password' field.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.register({
        email: cleanEmail,
        full_name: cleanName,
        password: cleanPassword,
      });

      // Save user session
      localStorage.setItem("canon_token", res.access_token);
      localStorage.setItem("canon_user_id", res.user_id);
      localStorage.setItem("canon_user_role", res.role);
      localStorage.setItem("canon_user_name", res.full_name);
      localStorage.setItem("canon_user_email", res.email);

      // Notify all tabs and components
      window.dispatchEvent(new Event("canon_user_changed"));
      window.dispatchEvent(new Event("storage"));

      const newUser: UserType = {
        id: res.user_id,
        email: res.email,
        full_name: res.full_name,
        role: res.role,
        workspace_id: res.workspace_id,
      };

      setCurrentUser(newUser);
      setCreatedUser(newUser);

      setSuccessMsg(`🌟 Account created successfully for ${res.full_name}! You are now logged in.`);

      // Clear register inputs
      setRegFullName("");
      setRegEmail("");
      setRegPassword("");

      // Automatically route after 1.2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (err: any) {
      console.error("Account creation failed:", err);
      setError(err.message || "Could not create account. That email might already be registered. Try signing in!");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillRegister = () => {
    const randomNum = Math.floor(Math.random() * 900) + 100;
    setRegFullName("Creative Lead " + randomNum);
    setRegEmail(`lead${randomNum}@company.example`);
    setRegPassword("Password123!");
    setRegRole("CREATOR");
    setError(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("canon_token");
    localStorage.removeItem("canon_user_id");
    localStorage.removeItem("canon_user_role");
    localStorage.removeItem("canon_user_name");
    localStorage.removeItem("canon_user_email");
    setCurrentUser(null);
    setCreatedUser(null);
    window.dispatchEvent(new Event("canon_user_changed"));
    window.dispatchEvent(new Event("storage"));
    setSuccessMsg("👋 Signed out! You can now create a new account or log in anytime.");
  };

  return (
    <div className="relative min-h-screen bg-[#FFFBF7] text-[#201815] py-6 px-4 sm:px-6">
      <AnimatedGrid />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Top Navigation Bar */}
        <header className="rounded-2xl bg-white/80 backdrop-blur-xl border border-[#F4E2D3] px-6 py-3.5 shadow-sm flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF8A3D] to-[#FF721B] flex items-center justify-center text-white shadow-sm shadow-[#FF8A3D]/30 group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-[#201815]">CANON</span>
                <span className="text-[9px] bg-[#FFF2E7] text-[#D95D0D] font-extrabold px-1.5 py-0.5 rounded-full border border-[#FDBA74]">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[10px] font-semibold text-[#7C6A5E] tracking-wide">
                Brand Governance Platform
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFF5EC] text-[#201815] text-xs font-bold border border-[#F4E2D3] transition-all shadow-xs cursor-pointer"
            >
              <span>← Back to Overview</span>
            </Link>
            <Link
              href="/guide"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFF5EC] text-[#7C6A5E] hover:text-[#201815] text-xs font-bold border border-[#F4E2D3] transition-all shadow-xs"
            >
              <span>Handbook</span>
            </Link>
          </div>
        </header>

        {/* Visual Journey Breadcrumb */}
        <div className="p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-[#F4E2D3] shadow-xs flex items-center justify-between text-xs font-bold text-[#7C6A5E] overflow-x-auto gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[#7C6A5E] hover:text-[#D95D0D] shrink-0"
          >
            <span className="w-5 h-5 rounded-full bg-[#EDFDF5] text-[#027A48] flex items-center justify-center text-[11px] font-black">
              ✓
            </span>
            <span>1. Product Overview</span>
          </Link>
          <span className="text-[#FDBA74]">➔</span>
          <div className="flex items-center gap-1.5 text-[#D95D0D] font-extrabold shrink-0 bg-[#FFF2E7] px-3 py-1 rounded-xl border border-[#FDBA74]">
            <span className="w-5 h-5 rounded-full bg-[#FF8A3D] text-white flex items-center justify-center text-[11px] font-black orange-dot-glow">
              2
            </span>
            <span>2. Authentication & Credentials</span>
          </div>
          <span className="text-[#FDBA74]">➔</span>
          <div className="flex items-center gap-1.5 text-[#7C6A5E] opacity-60 shrink-0">
            <span className="w-5 h-5 rounded-full bg-[#F4E2D3] text-[#7C6A5E] flex items-center justify-center text-[11px] font-black">
              3
            </span>
            <span>3. Workspace Dashboard</span>
          </div>
        </div>

        {/* Header Title in Pale Orange Theme */}
        <div className="p-7 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#F4E2D3] shadow-sm text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF2E7] text-[#D95D0D] border border-[#FDBA74] mx-auto">
            <Shield className="w-3.5 h-3.5 text-[#FF8A3D]" />
            <span>Enterprise Access Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#201815]">
            {tab === "register" ? "Create Your Governance Account" : "Sign In to CANON Workspace"}
          </h1>
          <p className="text-sm text-[#7C6A5E] max-w-md mx-auto leading-relaxed">
            Access your brand rulebook, run deterministic compliance checks, and manage signed publications.
          </p>
        </div>

        {/* Active Session Notification */}
        {currentUser && (
          <div className="p-5 rounded-3xl bg-[#EDFDF5] border border-[#A6F4C5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#A6F4C5] flex items-center justify-center text-[#027A48] font-black text-xl shadow-xs">
                {currentUser.full_name.charAt(0)}
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#027A48] uppercase tracking-wide">
                  Active User Session
                </div>
                <h2 className="text-base font-bold text-[#201815]">
                  {currentUser.full_name}
                </h2>
                <div className="text-xs text-[#7C6A5E]">
                  {currentUser.email} • Role: <strong className="text-[#027A48]">{currentUser.role.replace("_", " ")}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] hover:from-[#FF9952] hover:to-[#E8630D] text-white text-xs font-extrabold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#FFF5EC] text-[#B42318] text-xs font-bold border border-[#FECDCA] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Auth Box with SpotlightCard + BorderBeam */}
        <SpotlightCard className="max-w-xl mx-auto w-full p-7 sm:p-9 relative">
          <BorderBeam duration={9} size={200} colorFrom="#FF8A3D" colorTo="#FFAE74" />

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#FFF5EC] border border-[#F4E2D3] mb-6">
            <button
              id="tab-register-btn"
              type="button"
              onClick={() => {
                setTab("register");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-3 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tab === "register"
                  ? "bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] text-white shadow-sm shadow-[#FF8A3D]/30"
                  : "text-[#7C6A5E] hover:text-[#201815]"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Account</span>
            </button>

            <button
              id="tab-login-btn"
              type="button"
              onClick={() => {
                setTab("login");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-3 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tab === "login"
                  ? "bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] text-white shadow-sm shadow-[#FF8A3D]/30"
                  : "text-[#7C6A5E] hover:text-[#201815]"
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-4 p-4 rounded-2xl bg-[#FFF0F0] border border-[#FECDCA] text-[#B42318] text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-4 rounded-2xl bg-[#EDFDF5] border border-[#A6F4C5] text-[#027A48] text-xs font-bold space-y-2">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          {/* 1. Register Form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h2 className="text-sm font-extrabold text-[#201815]">
                    Account Details:
                  </h2>
                  <p className="text-[11px] text-[#7C6A5E]">
                    Get immediate access to your team&apos;s workspace
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickFillRegister}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF2E7] text-[#D95D0D] text-xs font-bold hover:bg-[#FFEAD9] transition-colors cursor-pointer border border-[#FDBA74]"
                >
                  <Wand2 className="w-3.5 h-3.5 text-[#FF8A3D]" />
                  <span>1-Click Auto-Fill</span>
                </button>
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="reg-fullname"
                  className="text-xs font-bold text-[#201815] block mb-1.5 cursor-pointer"
                >
                  1. Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#7C6A5E] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    id="reg-fullname"
                    name="fullname"
                    type="text"
                    required
                    autoComplete="name"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Maya Patel"
                    className="editorial-input w-full pl-10 pr-3 py-2.5 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="reg-email"
                  className="text-xs font-bold text-[#201815] block mb-1.5 cursor-pointer"
                >
                  2. Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7C6A5E] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. maya@example.com"
                    className="editorial-input w-full pl-10 pr-3 py-2.5 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Assigned Role */}
              <div className="p-3.5 rounded-xl bg-[#FFF5EC] border border-[#FB923C]/40 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#21160F]">
                    Default Tier: Content Creator
                  </div>
                  <p className="text-[11px] text-[#75665D] mt-0.5 leading-relaxed">
                    Public registrations are assigned Creator permissions on the server. Privileged roles (Brand Guardian, Approver, Admin) are granted by Workspace Administrators.
                  </p>
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="reg-password"
                  className="text-xs font-bold text-[#201815] block mb-1.5 cursor-pointer"
                >
                  4. Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7C6A5E] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    id="reg-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a password (e.g. Password123!)..."
                    className="editorial-input w-full pl-10 pr-3 py-2.5 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Big Submit Button */}
              <button
                id="btn-create-account"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] hover:from-[#FF9952] hover:to-[#E8630D] text-white text-xs font-extrabold transition-all shadow-md shadow-[#FF8A3D]/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{loading ? "Creating Your Account..." : "✨ Create Your Account & Start Writing"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTab("login");
                    setError(null);
                  }}
                  className="text-xs text-[#7C6A5E] hover:text-[#201815] font-semibold cursor-pointer"
                >
                  Already have an account? <span className="text-[#D95D0D] font-bold">Sign In here →</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h2 className="text-sm font-extrabold text-[#201815]">
                  Sign In to Workspace:
                </h2>
                <p className="text-[11px] text-[#7C6A5E]">
                  Enter your credentials to continue
                </p>
              </div>

              {/* Quick Persona Fill */}
              <div className="p-3 rounded-2xl bg-[#FFF5EC] border border-[#FB923C]/30 space-y-2">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#C2410C]">
                  ⚡ 1-Click Demo Accounts (Select Role)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                  {[
                    { label: "Content Creator", email: "creator@canon.example" },
                    { label: "Brand Manager", email: "manager@canon.example" },
                    { label: "Executive Approver", email: "approver@canon.example" },
                    { label: "Compliance Reviewer", email: "reviewer@canon.example" },
                    { label: "System Admin", email: "admin@canon.example" },
                  ].map((p) => (
                    <button
                      key={p.email}
                      type="button"
                      onClick={() => {
                        setLoginEmail(p.email);
                        setLoginPassword("Password123!");
                      }}
                      className="px-2 py-1.5 rounded-lg bg-white border border-[#F4E2D3] hover:border-[#F97316] hover:bg-[#FFF1E6] text-left transition-colors font-medium text-[#21160F] shadow-xs cursor-pointer truncate"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-email"
                  className="text-xs font-bold text-[#201815] block mb-1.5 cursor-pointer"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7C6A5E] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. creator@company.example"
                    className="editorial-input w-full pl-10 pr-3 py-2.5 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="text-xs font-bold text-[#201815] block mb-1.5 cursor-pointer"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7C6A5E] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password..."
                    className="editorial-input w-full pl-10 pr-3 py-2.5 text-xs font-medium"
                  />
                </div>
              </div>

              <button
                id="btn-login"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF8A3D] to-[#FF721B] hover:from-[#FF9952] hover:to-[#E8630D] text-white text-xs font-extrabold transition-all shadow-md shadow-[#FF8A3D]/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? "Signing In..." : "🚀 Sign In & Enter"}</span>
              </button>

              <div className="text-center pt-3 border-t border-[#F4E2D3]">
                <button
                  type="button"
                  onClick={() => {
                    setTab("register");
                    setError(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#FFF5EC] hover:bg-[#FFEAD9] text-[#D95D0D] border border-[#FDBA74] text-xs font-bold transition-colors cursor-pointer"
                >
                  ✨ Don&apos;t have an account? Click to Create Account
                </button>
              </div>
            </form>
          )}
        </SpotlightCard>
      </div>
    </div>
  );
}
