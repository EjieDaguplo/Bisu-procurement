"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "../../../src/hooks/useAuth";
import { Mail, Lock, LogIn, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-[44%] bg-bisu-blue-dark flex-col items-center justify-center px-12 py-16 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute w-80 h-80 rounded-full bg-bisu-yellow opacity-5 -top-20 -left-20" />
        <div className="absolute w-52 h-52 rounded-full bg-white opacity-[0.03] -bottom-10 -right-10" />
        <div className="absolute w-40 h-40 rounded-full bg-bisu-yellow opacity-[0.04] bottom-24 -left-10" />

        {/* Logo */}
        <div className="relative z-10 w-24 h-24 rounded-full bg-bisu-blue border-2 border-bisu-yellow border-opacity-50 flex items-center justify-center mb-6 shadow-2xl">
          <Image
            src="/bisuLogo.png"
            alt="BISU Logo"
            width={64}
            height={64}
            className="rounded-full"
          />
        </div>

        <h1 className="relative z-10 text-white text-lg font-extrabold text-center leading-snug tracking-tight">
          Bohol Island State University
        </h1>
        <p className="relative z-10 text-bisu-yellow text-[0.68rem] font-bold mt-1 tracking-[0.12em] uppercase">
          Bilar Campus
        </p>

        {/* Gold divider */}
        <div className="relative z-10 w-8 h-0.5 bg-bisu-yellow rounded-full mt-5 mb-5 opacity-80" />

        <p className="relative z-10 text-white/50 text-xs text-center max-w-[190px] leading-relaxed">
          Web-Based Procurement Management Information System
        </p>

        {/* Feature pills */}
        <div className="relative z-10 flex flex-col gap-2 mt-8 w-full max-w-[210px]">
          {["Purchase Requests", "Budget Tracking", "Approval Workflow"].map(
            (label) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-bisu-yellow flex-shrink-0" />
                <span className="text-white/60 text-[0.7rem] font-medium">
                  {label}
                </span>
              </div>
            ),
          )}
        </div>

        {/* Dots */}
        <div className="relative z-10 flex gap-1.5 mt-7">
          <div className="w-1.5 h-1.5 rounded-full bg-bisu-yellow" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-bisu-offwhite">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card w-full max-w-[400px] px-9 py-10">
          {/* Mobile logo */}
          <div className="flex lg:hidden flex-col items-center mb-7">
            <div className="w-16 h-16 rounded-full border-2 border-bisu-blue/20 overflow-hidden mb-2">
              <Image
                src="/bisuLogo.png"
                alt="BISU Logo"
                width={64}
                height={64}
                className="rounded-full"
              />
            </div>
            <p className="text-bisu-blue text-xs font-bold tracking-wide">
              BISU – Bilar
            </p>
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-5">
              <ShieldCheck size={12} className="text-bisu-blue" />
              <span className="text-bisu-blue text-[0.65rem] font-bold tracking-widest uppercase">
                Procurement MIS
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-7">
            <h2 className="text-bisu-blue-dark text-2xl font-extrabold tracking-tight mb-1 text-center">
              Welcome back
            </h2>
            <p className="text-gray-400 text-sm text-center">
              Sign in to access the BISU-Bilar procurement portal
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2.5 text-sm mb-4">
              <span className="text-base">⚠</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="block text-[0.7rem] font-bold text-gray-500 uppercase tracking-[0.07em] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="email"
                  placeholder="you@bisu.edu.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="input-field pl-10 bg-gray-50 focus:bg-white rounded-xl border-gray-200 focus:border-bisu-blue focus:shadow-[0_0_0_3px_rgba(26,58,143,0.1)]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[0.7rem] font-bold text-gray-500 uppercase tracking-[0.07em] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="input-field pl-10 bg-gray-50 focus:bg-white rounded-xl border-gray-200 focus:border-bisu-blue focus:shadow-[0_0_0_3px_rgba(26,58,143,0.1)]"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full py-3 rounded-xl text-sm font-bold tracking-wide flex items-center justify-center gap-2 mt-1 shadow-[0_4px_14px_rgba(26,58,143,0.3)] transition-all active:scale-[0.985] ${
                loading
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-bisu-blue-dark hover:shadow-[0_6px_20px_rgba(26,58,143,0.4)]"
              }`}
            >
              <LogIn size={15} />
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[0.68rem] text-gray-300 mt-6">
            BISU-Bilar Procurement MIS &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
