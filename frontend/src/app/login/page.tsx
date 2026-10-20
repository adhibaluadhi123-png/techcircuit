"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  UserCheck
} from "lucide-react";
import { api, User as UserType } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"CREATOR" | "BRAND_MANAGER" | "APPROVER" | "AUTHORISED_REVIEWER" | "ADMIN">("CREATOR");
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
      const res = await api.login({ email, password });
      localStorage.setItem("canon_token", res.access_token);
      localStorage.setItem("canon_user_id", res.user_id);
      localStorage.setItem("canon_user_role", res.role);
      localStorage.setItem("canon_user_name", res.full_name);
      localStorage.setItem("canon_user_email", res.email);

      setSuccessMsg(`Welcome back, ${res.full_name}! Redirecting...`);
      setTimeout(() => {
        router.push("/review");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.register({
        email,
        full_name: fullName,
        password,
        role,
      });
      localStorage.setItem("canon_token", res.access_token);
      localStorage.setItem("canon_user_id", res.user_id);
      localStorage.setItem("canon_user_role", res.role);
      localStorage.setItem("canon_user_name", res.full_name);
      localStorage.setItem("canon_user_email", res.email);

      setSuccessMsg(`Account created for ${res.full_name}! Redirecting...`);
      setTimeout(() => {
        router.push("/review");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u: UserType) => {
    localStorage.setItem("canon_user_id", u.id);
    localStorage.setItem("canon_user_role", u.role);
    localStorage.setItem("canon_user_name", u.full_name);
    localStorage.setItem("canon_user_email", u.email);
    setCurrentUser(u);
    setSuccessMsg(`Switched to ${u.full_name} (${u.role.replace("_", " ")})! Redirecting...`);
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
    setSuccessMsg("Signed out successfully.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF0E2] text-[#C87539] border border-[#F5A66B]/30 uppercase tracking-wide">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Role-Based Access Control</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#382A20]">
          CANON Account & Security
        </h1>
        <p className="text-sm text-[#8A7567]">
          Sign in to test real draft submissions, manage brand rules, or grant approver certificates.
        </p>
      </div>

      {/* Active Session Card if Logged In */}
      {currentUser && (
        <div className="editorial-card p-5 bg-[#EDFDF5] border border-[#A6F4C5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#A6F4C5] flex items-center justify-center text-[#027A48] font-bold text-lg shadow-2xs">
              {currentUser.full_name.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-bold text-[#027A48] uppercase tracking-wide">
                Currently Signed In
              </div>
              <h2 className="text-base font-bold text-[#382A20]">
                {currentUser.full_name}
              </h2>
              <div className="text-xs text-[#8A7567]">
                {currentUser.email} • <span className="font-bold text-[#027A48]">{currentUser.role.replace("_", " ")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/review")}
              className="px-4 py-2 rounded-xl bg-[#027A48] hover:bg-[#026038] text-white text-xs font-bold transition-all shadow-xs"
            >
              Continue to Review Studio →
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-white hover:bg-[#FFF9F3] text-[#B42318] text-xs font-bold border border-[#FECDCA] transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Form + Quick Switch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Real Login / Register (7 cols) */}
        <div className="lg:col-span-7 editorial-card p-7 bg-white border border-[#F1E1D4] shadow-xs space-y-6">
          {/* Tab Switcher */}
          <div className="flex border-b border-[#F1E1D4] pb-1 gap-4">
            <button
              onClick={() => {
                setTab("login");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`pb-2 text-sm font-bold transition-colors relative ${
                tab === "login"
                  ? "text-[#C87539] border-b-2 border-[#C87539]"
                  : "text-[#8A7567] hover:text-[#382A20]"
              }`}
            >
              Sign In with Email
            </button>
            <button
              onClick={() => {
                setTab("register");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`pb-2 text-sm font-bold transition-colors relative ${
                tab === "register"
                  ? "text-[#C87539] border-b-2 border-[#C87539]"
                  : "text-[#8A7567] hover:text-[#382A20]"
              }`}
            >
              Create New Account
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3.5 rounded-xl bg-[#FEEBEA] border border-[#FECDCA] text-[#B42318] text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-[#EDFDF5] border border-[#A6F4C5] text-[#027A48] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#382A20] block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A7567] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. creator@apexdynamics.example"
                    className="editorial-input w-full pl-9 pr-3 py-2.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#382A20] block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A7567] absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="editorial-input w-full pl-9 pr-3 py-2.5 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? "Authenticating..." : "Sign In & Access Workspace"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#382A20] block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8A7567] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jordan Miller"
                    className="editorial-input w-full pl-9 pr-3 py-2.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#382A20] block mb-1">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A7567] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. jordan.miller@apexdynamics.example"
                    className="editorial-input w-full pl-9 pr-3 py-2.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#382A20] block mb-1">
                  Choose Your Organizational Role
                </label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="editorial-input w-full p-2.5 text-xs"
                >
                  <option value="CREATOR">Creator / Copywriter (Submits drafts & applies fixes)</option>
                  <option value="BRAND_MANAGER">Brand Manager (Maintains rulebook & facts)</option>
                  <option value="APPROVER">Authorized Approver (Issues official certificates)</option>
                  <option value="AUTHORISED_REVIEWER">Reviewer (Audits compliance findings)</option>
                  <option value="ADMIN">System Administrator (Full access)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#382A20] block mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A7567] absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="editorial-input w-full pl-9 pr-3 py-2.5 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#C87539] hover:bg-[#b0632b] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? "Creating Account..." : "Create Account & Enter Workspace"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Right Panel: 1-Click Directory Accounts (5 cols) */}
        <div className="lg:col-span-5 editorial-card p-6 bg-white border border-[#F1E1D4] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#F1E1D4]">
            <UserCheck className="w-5 h-5 text-[#C87539]" />
            <h2 className="text-sm font-bold text-[#382A20] uppercase tracking-wider">
              1-Click Directory Sign-In
            </h2>
          </div>
          <p className="text-xs text-[#8A7567] leading-relaxed">
            Need to test specific roles right now? Click any team member below to instantly assume their permissions:
          </p>

          <div className="space-y-2.5 pt-1">
            {workspaceUsers.map((u) => {
              const isCurrent = currentUser?.id === u.id;
              let roleBadgeColor = "bg-[#FFF0E2] text-[#C87539] border-[#F5A66B]/30";
              if (u.role === "APPROVER") roleBadgeColor = "bg-[#EDFDF5] text-[#027A48] border-[#A6F4C5]";
              if (u.role === "ADMIN") roleBadgeColor = "bg-[#FEEBEA] text-[#B42318] border-[#FECDCA]";

              return (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isCurrent
                      ? "bg-[#FFF0E2] border-[#C87539] ring-2 ring-[#C87539]/20"
                      : "bg-[#FFF9F3] hover:bg-white border-[#F1E1D4] hover:border-[#C87539]/40"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs text-[#382A20]">{u.full_name}</strong>
                      {isCurrent && <span className="text-[10px] text-[#027A48] font-bold">✓ Active</span>}
                    </div>
                    <div className="text-[11px] text-[#8A7567] mt-0.5">{u.email}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${roleBadgeColor}`}>
                    {u.role.replace("_", " ")}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#F1E1D4] text-[11px] text-[#8A7567]">
            Default password for directory users: <strong className="font-mono text-[#382A20]">Password123!</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
