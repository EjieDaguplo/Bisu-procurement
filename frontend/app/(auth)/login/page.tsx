"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/api";
import { saveAuth } from "@/src/lib/auth";
import { User } from "@/src/types";
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react";

type Tab = "login" | "register";

interface Department {
  id: number;
  code: string;
  name: string;
}

// ── Password strength helper ─────────────────────────────────
const getStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = [
  "",
  "bg-red-400",
  "bg-yellow-400",
  "bg-blue-400",
  "bg-green-500",
];

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Register state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPw, setRegPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [deptId, setDeptId] = useState("");
  const [showRegPw, setShowRegPw] = useState(false);
  const [showConPw, setShowConPw] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  // Departments for register dropdown
  const [departments, setDepartments] = useState<Department[]>([]);
  // Loading state for departments fetch
  const [deptsLoading, setDeptsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/departments`,
      {
        signal: controller.signal,
      },
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data: Department[]) => setDepartments(data))
      .catch(() => setDepartments([])) // silently fail — dept is optional
      .finally(() => {
        clearTimeout(timeout);
        setDeptsLoading(false); // always resolves
      });

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await api.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>("/auth/login", { email: loginEmail, password: loginPw });

      saveAuth(res.accessToken, res.refreshToken, res.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!firstName.trim() || !lastName.trim()) {
      setRegError("First name and last name are required.");
      return;
    }
    if (regPw.length < 8) {
      setRegError("Password must be at least 8 characters.");
      return;
    }
    if (regPw !== confirmPw) {
      setRegError("Passwords do not match.");
      return;
    }

    setRegLoading(true);
    try {
      const res = await api.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
        message: string;
      }>("/auth/register", {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        employee_id: employeeId.trim() || undefined,
        email: regEmail.trim(),
        password: regPw,
        department_id: deptId || undefined,
      });

      // Auto-login after registration
      saveAuth(res.accessToken, res.refreshToken, res.user);
      setRegSuccess(true);

      // Redirect after a short delay so user sees the success state
      setTimeout(() => {
        router.push("/dashboard");
      }, 1800);
    } catch (err: unknown) {
      setRegError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setRegLoading(false);
    }
  };

  const pwStrength = getStrength(regPw);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-1/2 h-screen flex-shrink-0 flex-col items-center justify-center px-12 bg-[#1A3A8F]">
        <Image
          src="/bisuLogo.png"
          alt="BISU Logo"
          width={120}
          height={120}
          className="mb-6 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
        />
        <h1 className="text-white text-3xl font-extrabold text-center leading-tight m-0">
          Bohol Island State University
        </h1>
        <p className="text-[#F5C400] font-semibold mt-1 text-center">
          Bilar Campus
        </p>
        <div className="mt-8 w-16 h-1 bg-[#F5C400] rounded-full" />
        <p className="text-white/60 text-sm mt-6 text-center max-w-[280px]">
          Web-Based Procurement Management Information System
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 h-screen flex items-center justify-center px-6 py-8 bg-[#F7F8FC]">
        <div className="w-full max-w-sm max-h-full flex flex-col">
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-6 lg:hidden">
            <Image
              src="/bisuLogo.png"
              alt="BISU Logo"
              width={64}
              height={64}
              className="rounded-full mb-2"
            />
            <p className="text-[#1A3A8F] font-bold text-sm m-0">BISU – Bilar</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(26,58,143,0.08)] flex flex-col min-h-0 overflow-hidden">
            {/* ── Tabs ── */}
            <div className="flex border-b border-gray-100 flex-shrink-0">
              {(["login", "register"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setLoginError("");
                    setRegError("");
                    setRegSuccess(false);
                  }}
                  className={`flex-1 py-3.5 text-sm font-bold transition-colors border-b-2 capitalize
                    ${
                      tab === t
                        ? "border-[#1A3A8F] text-[#1A3A8F] bg-blue-50/40"
                        : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {t === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <div className="px-8 py-6 overflow-y-auto flex-1 min-h-0">
              {/* ══════════ LOGIN FORM ══════════ */}
              {tab === "login" && (
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div>
                    <h2 className="text-[#1A3A8F] text-xl font-extrabold mb-1">
                      Welcome back
                    </h2>
                    <p className="text-gray-500 text-[13px] m-0">
                      Sign in to your account to continue
                    </p>
                  </div>

                  {loginError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3.5 py-2.5 text-sm flex items-center gap-2">
                      <XCircle size={15} className="flex-shrink-0" />{" "}
                      {loginError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@bisu.edu.ph"
                      required
                      autoComplete="email"
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A3A8F]/30 focus:border-[#1A3A8F] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showLoginPw ? "text" : "password"}
                        value={loginPw}
                        onChange={(e) => setLoginPw(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A3A8F]/30 focus:border-[#1A3A8F] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPw(!showLoginPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showLoginPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className={`w-full py-2.5 rounded-lg text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      loginLoading ? "bg-gray-500" : "bg-[#1A3A8F]"
                    }`}
                  >
                    {loginLoading && (
                      <Loader2 size={15} className="animate-spin" />
                    )}
                    {loginLoading ? "Signing in..." : "Sign In"}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setTab("register")}
                      className="text-[#1A3A8F] font-semibold hover:underline"
                    >
                      Create one here
                    </button>
                  </p>
                </form>
              )}

              {/* ══════════ REGISTER FORM ══════════ */}
              {tab === "register" && (
                <>
                  {regSuccess ? (
                    /* ── Success state ── */
                    <div className="flex flex-col items-center text-center gap-4 py-4">
                      <div className="w-16 h-16 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center">
                        <CheckCircle size={32} className="text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-800 text-lg mb-1">
                          Account Created! 🎉
                        </h3>
                        <p className="text-sm text-gray-500">
                          Welcome,{" "}
                          <strong>
                            {firstName} {lastName}
                          </strong>
                          !
                          <br />
                          You&apos;re now logged in as a{" "}
                          <strong>Requester</strong>.
                          <br />
                          Redirecting to your dashboard...
                        </p>
                      </div>
                      {/* Live status visible without re-login */}
                      <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full bg-green-400 rounded-full"
                          style={{ animation: "shrink 1.8s linear forwards" }}
                        />
                      </div>
                      <style>{`
                        @keyframes shrink {
                          from { width: 100%; }
                          to   { width: 0%;   }
                        }
                      `}</style>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleRegister}
                      className="flex flex-col gap-3.5"
                    >
                      <div>
                        <h2 className="text-[#1A3A8F] text-xl font-extrabold mb-1">
                          Create Account
                        </h2>
                        <p className="text-gray-500 text-[13px] m-0">
                          Register as a <strong>Requester</strong> to submit
                          Purchase Requests
                        </p>
                      </div>

                      {regError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3.5 py-2.5 text-sm flex items-center gap-2">
                          <XCircle size={15} className="flex-shrink-0" />{" "}
                          {regError}
                        </div>
                      )}

                      {/* Name row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A3A8F]/30 focus:border-[#1A3A8F] transition-all"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Juan"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A3A8F]/30 focus:border-[#1A3A8F] transition-all"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Dela Cruz"
                            required
                          />
                        </div>
                      </div>

                      {/* Employee ID */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                          Employee ID{" "}
                          <span className="text-gray-400 font-normal">
                            (optional)
                          </span>
                        </label>
                        <input
                          className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A3A8F]/30 focus:border-[#1A3A8F] transition-all"
                          value={employeeId}
                          onChange={(e) => setEmployeeId(e.target.value)}
                          placeholder="BISU-2024-XXX"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A3A8F]/30 focus:border-[#1A3A8F] transition-all"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="you@bisu.edu.ph"
                          required
                          autoComplete="email"
                        />
                      </div>

                      {/* Department */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                          Department{" "}
                          <span className="text-gray-400 font-normal">
                            (optional)
                          </span>
                        </label>
                        <select
                          className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1A3A8F]/30 focus:border-[#1A3A8F] transition-all"
                          value={deptId}
                          onChange={(e) => setDeptId(e.target.value)}
                        >
                          <option value="">— Select Department —</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showRegPw ? "text" : "password"}
                            className="w-full border border-gray-200 rounded-lg px-3.5 py-2 pr-10 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A3A8F]/30 focus:border-[#1A3A8F] transition-all"
                            value={regPw}
                            onChange={(e) => setRegPw(e.target.value)}
                            placeholder="Min. 8 characters"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPw(!showRegPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showRegPw ? (
                              <EyeOff size={15} />
                            ) : (
                              <Eye size={15} />
                            )}
                          </button>
                        </div>

                        {/* ✅ Live password strength bar */}
                        {regPw && (
                          <div className="mt-2">
                            <div className="flex gap-1 mb-1">
                              {[1, 2, 3, 4].map((i) => (
                                <div
                                  key={i}
                                  className={`h-1 flex-1 rounded-full transition-all ${
                                    pwStrength >= i
                                      ? strengthColor[pwStrength]
                                      : "bg-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-gray-400">
                              {strengthLabel[pwStrength]} password
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Confirm password */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                          Confirm Password{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConPw ? "text" : "password"}
                            className={`w-full border rounded-lg px-3.5 py-2 pr-10 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all
                              ${
                                confirmPw && confirmPw !== regPw
                                  ? "border-red-300 focus:ring-red-200"
                                  : confirmPw && confirmPw === regPw
                                    ? "border-green-300 focus:ring-green-200"
                                    : "border-gray-200 focus:ring-[#1A3A8F]/30 focus:border-[#1A3A8F]"
                              }`}
                            value={confirmPw}
                            onChange={(e) => setConfirmPw(e.target.value)}
                            placeholder="Re-enter password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConPw(!showConPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConPw ? (
                              <EyeOff size={15} />
                            ) : (
                              <Eye size={15} />
                            )}
                          </button>
                        </div>

                        {/* ✅ Live match indicator */}
                        {confirmPw && (
                          <p
                            className={`text-xs mt-1 flex items-center gap-1 ${
                              confirmPw === regPw
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            {confirmPw === regPw ? (
                              <>
                                <CheckCircle size={12} /> Passwords match
                              </>
                            ) : (
                              <>
                                <XCircle size={12} /> Passwords do not match
                              </>
                            )}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={
                          regLoading || (!!confirmPw && confirmPw !== regPw)
                        }
                        className="w-full py-2.5 rounded-lg text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1 bg-[#1A3A8F]"
                      >
                        {regLoading && (
                          <Loader2 size={15} className="animate-spin" />
                        )}
                        {regLoading ? "Creating account..." : "Create Account"}
                      </button>

                      <p className="text-center text-xs text-gray-400">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setTab("login")}
                          className="text-[#1A3A8F] font-semibold hover:underline"
                        >
                          Sign in here
                        </button>
                      </p>
                    </form>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 pb-5 text-center flex-shrink-0">
              <p className="text-xs text-gray-300">
                BISU-Bilar Procurement MIS &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
