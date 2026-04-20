"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "../../hooks/useAuth";

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
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-bisu-blue-DEFAULT flex-col items-center justify-center px-12">
        <Image
          src="/bisuLogo.png"
          alt="BISU Logo"
          width={120}
          height={120}
          className="mb-6 drop-shadow-xl"
        />
        <h1 className="text-white text-3xl font-extrabold text-center leading-tight">
          Bohol Island State University
        </h1>
        <p className="text-bisu-yellow-DEFAULT font-semibold mt-1 text-center">
          Bilar Campus
        </p>
        <div className="mt-8 w-16 h-1 bg-bisu-yellow-DEFAULT rounded-full" />
        <p className="text-white/60 text-sm mt-6 text-center max-w-xs">
          Web-Based Procurement Management Information System
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 bg-bisu-offwhite">
        <div className="bg-white rounded-2xl shadow-card w-full max-w-sm p-8 border border-gray-100">
          <div className="flex flex-col items-center mb-7 lg:hidden">
            <Image
              src="/bisuLogo.png"
              alt="BISU Logo"
              width={72}
              height={72}
              className="mb-3"
            />
          </div>
          <h2 className="text-2xl font-bold text-bisu-blue-DEFAULT mb-1">
            Welcome back
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Sign in to your account to continue
          </p>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2.5 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@bisu.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            BISU-Bilar Procurement MIS &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
