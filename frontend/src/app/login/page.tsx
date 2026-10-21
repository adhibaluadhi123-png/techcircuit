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
  UserCheck,
  Wand2,
  Smile,
  Shield
} from "lucide-react";
import { api, User as UserType } from "@/lib/api";

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
  const [workspaceUsers, setWorkspaceUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  const refreshUserData = () => {
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

      setSuccessMsg(`🎉 Welcome back, ${res.full_name}! Taking you to your workspace...`);
      setTimeout(() => {
        if (res.role === "APPROVER") router.push("/approvals");
        else if (res.role === "BRAND_MANAGER") router.push("/rulebook");
        else router.push("/review");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Invalid email or password. You can also pick a 1-click account on the right!");
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
        role: regRole,
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
      setWorkspaceUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);

      setSuccessMsg(`🌟 Yay! Account created successfully for ${res.full_name} (${res.role.replace("_", " ")})! You are now logged in.`);

      // Clear register inputs
      setRegFullName("");
      setRegEmail("");
      setRegPassword("");

      // Automatically route after 1.8 seconds
      setTimeout(() => {
        if (res.role === "APPROVER") router.push("/approvals");
        else if (res.role === "BRAND_MANAGER") router.push("/rulebook");
        else router.push("/review");
      }, 1800);
    } catch (err: any) {
      console.error("Account creation failed:", err);
      setError(err.message || "Could not create account. That email might already be registered. Try signing in!");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillRegister = () => {
    const randomNum = Math.floor(Math.random() * 900) + 100;
    setRegFullName("Creative Storyteller " + randomNum);
    setRegEmail(`storyteller${randomNum}@apexdynamics.example`);
    setRegPassword("Password123!");
    setRegRole("CREATOR");
    setError(null);
  };

  const handleQuickLogin = async (u: UserType) => {
    localStorage.setItem("canon_user_id", u.id);
    localStorage.setItem("canon_user_role", u.role);
    localStorage.setItem("canon_user_name", u.full_name);
    localStorage.setItem("canon_user_email", u.email);
    setCurrentUser(u);

    // Try logging in to get authentic JWT token
    try {
      const res = await api.login({ email: u.email, password: "Password123!" });
      localStorage.setItem("canon_token", res.access_token);
    } catch {
      // Demo session fallback
    }

    window.dispatchEvent(new Event("canon_user_changed"));
    window.dispatchEvent(new Event("storage"));

    setSuccessMsg(`🚀 Switched to ${u.full_name} (${u.role.replace("_", " ")})!`);
    setTimeout(() => {
      if (u.role === "APPROVER") router.push("/approvals");
      else if (u.role === "BRAND_MANAGER") router.push("/rulebook");
      else router.push("/review");
    }, 1000);
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
    setSuccessMsg("👋 Signed out! You can now create a new account or log in as anyone anytime.");
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
        <div className="space-y-1.5 text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C87539] text-white shadow-2xs">
            <Smile className="w-3.5 h-3.5" />
            <span>Welcome to CANON!</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#382A20]">
            {tab === "register" ? "Create Your Free Account" : "Sign In to Your Account"}
          </h1>
          <p className="text-sm text-[#8A7567] leading-relaxed">
            Hi! I&apos;m Archie the Brand Owl 🦉. Create a fresh account below in 10 seconds, or pick any ready-to-test team profile on the right!
          </p>
        </div>
      </div>

      {/* Active Session Notification */}
      {currentUser && (
        <div className="p-5 rounded-3xl bg-[#EDFDF5] border border-[#A6F4C5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#A6F4C5] flex items-center justify-center text-[#027A48] font-black text-xl shadow-2xs">
              {currentUser.full_name.charAt(0)}
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#027A48] uppercase tracking-wide">
                Active User Profile
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
              onClick={() => router.push(currentUser.role === "APPROVER" ? "/approvals" : currentUser.role === "BRAND_MANAGER" ? "/rulebook" : "/review")}
              className="px-4 py-2.5 rounded-xl bg-[#027A48] hover:bg-[#026038] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <span>Go to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#FFF9F3] text-[#B42318] text-xs font-bold border border-[#FECDCA] transition-colors flex items-center gap-1.5 cursor-pointer"
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
              id="tab-register-btn"
              type="button"
              onClick={() => {
                setTab("register");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-3 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tab === "register"
                  ? "bg-[#027A48] text-white shadow-sm"
                  : "text-[#8A7567] hover:text-[#382A20]"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ Create New Account</span>
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
                  ? "bg-[#C87539] text-white shadow-sm"
                  : "text-[#8A7567] hover:text-[#382A20]"
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>👋 Sign In (Existing User)</span>
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
            <div className="p-4 rounded-2xl bg-[#EDFDF5] border border-[#A6F4C5] text-[#027A48] text-xs font-bold space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
              <div className="pt-2 flex items-center gap-2">
                <Link
                  href="/review"
                  className="px-3 py-1.5 rounded-lg bg-[#027A48] text-white text-xs font-bold hover:bg-[#026038]"
                >
                  Go to Review Studio →
                </Link>
                <Link
                  href="/rulebook"
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#A6F4C5] text-[#027A48] text-xs font-bold hover:bg-[#EDFDF5]"
                >
                  View Rulebook
                </Link>
              </div>
            </div>
          )}

          {/* 1. Register Form (Default) */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h2 className="text-sm font-extrabold text-[#382A20]">
                    Create Your Account Fields:
                  </h2>
                  <p className="text-[11px] text-[#8A7567]">
                    Fill in these 4 simple fields to get your own safe workspace
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickFillRegister}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF0E2] text-[#C87539] text-xs font-bold hover:bg-[#F5A66B]/20 transition-colors cursor-pointer border border-[#F5A66B]/30"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>⚡ 1-Click Auto-Fill</span>
                </button>
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="reg-fullname"
                  className="text-xs font-bold text-[#382A20] block mb-1.5 cursor-pointer"
                >
                  1. Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8A7567] absolute left-3.5 top-3 pointer-events-none" />
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
                  className="text-xs font-bold text-[#382A20] block mb-1.5 cursor-pointer"
                >
                  2. Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A7567] absolute left-3.5 top-3 pointer-events-none" />
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

              {/* Role Selection Dropdown */}
              <div>
                <label
                  htmlFor="reg-role"
                  className="text-xs font-bold text-[#382A20] block mb-1.5 cursor-pointer"
                >
                  3. What is your role? (Select an option)
                </label>
                <select
                  id="reg-role"
                  name="role"
                  value={regRole}
                  onChange={(e: any) => setRegRole(e.target.value)}
                  className="editorial-input w-full p-2.5 text-xs font-semibold cursor-pointer"
                >
                  <option value="CREATOR">✍️ Content Writer / Storyteller (Writes & fixes copy)</option>
                  <option value="BRAND_MANAGER">🛡️ Brand Guardian (Creates rules & facts)</option>
                  <option value="APPROVER">👔 Approver (Issues official golden seals)</option>
                  <option value="AUTHORISED_REVIEWER">🔍 Reviewer (Audits compliance)</option>
                  <option value="ADMIN">⚙️ Administrator (Full system access)</option>
                </select>
                <p className="text-[11px] text-[#8A7567] mt-1">
                  Pick <strong>Content Writer</strong> if you want to write and fix stories!
                </p>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="reg-password"
                  className="text-xs font-bold text-[#382A20] block mb-1.5 cursor-pointer"
                >
                  4. Choose a Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A7567] absolute left-3.5 top-3 pointer-events-none" />
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
                className="w-full py-3.5 rounded-2xl bg-[#027A48] hover:bg-[#026038] text-white text-xs font-extrabold transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{loading ? "Creating Your Account..." : "✨ Create Your Account & Start Writing!"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTab("login");
                    setError(null);
                  }}
                  className="text-xs text-[#8A7567] hover:text-[#382A20] font-semibold cursor-pointer"
                >
                  Already have an account? <span className="text-[#C87539] font-bold">Sign In here →</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h2 className="text-sm font-extrabold text-[#382A20]">
                  Sign In to CANON:
                </h2>
                <p className="text-[11px] text-[#8A7567]">
                  Enter your email and password to continue
                </p>
              </div>

              <div>
                <label
                  htmlFor="login-email"
                  className="text-xs font-bold text-[#382A20] block mb-1.5 cursor-pointer"
                >
                  Your Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A7567] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. creator@apexdynamics.example"
                    className="editorial-input w-full pl-10 pr-3 py-2.5 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="text-xs font-bold text-[#382A20] block mb-1.5 cursor-pointer"
                >
                  Your Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A7567] absolute left-3.5 top-3 pointer-events-none" />
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
                className="w-full py-3.5 rounded-2xl bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-extrabold transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? "Signing In..." : "🚀 Sign In & Enter"}</span>
              </button>

              <div className="text-center pt-3 border-t border-[#F1E1D4]">
                <button
                  type="button"
                  onClick={() => {
                    setTab("register");
                    setError(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#FFF9F3] hover:bg-[#FFF0E2] text-[#027A48] border border-[#A6F4C5] text-xs font-bold transition-colors cursor-pointer"
                >
                  ✨ Don&apos;t have an account? Click here to Create Free Account
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
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isCurrent
                      ? "bg-[#FFF9F3] border-[#C87539] ring-2 ring-[#C87539]/20 shadow-xs"
                      : "bg-white border-[#F1E1D4] hover:bg-[#FFF9F3] hover:border-[#F5A66B]/50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#F1E1D4] flex items-center justify-center text-sm shadow-2xs shrink-0">
                      {roleEmoji}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#382A20] truncate">
                        {u.full_name}
                      </div>
                      <div className="text-[10px] text-[#8A7567] truncate">
                        {u.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}>
                      {u.role.replace("_", " ")}
                    </span>
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active"></span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
