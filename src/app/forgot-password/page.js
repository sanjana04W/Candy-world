"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  // Step 1 = enter email, Step 2 = set new password, Step 3 = success
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── Step 1: Verify email exists ── */
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No account found with this email.");
      } else {
        setStep(2);
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Set new password ── */
  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update password.");
      } else {
        setStep(3);
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-candy-pink/5 via-white to-candy-purple/5">
      {/* Decorative blobs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-candy-pink/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-44 h-44 bg-candy-purple/10 rounded-full blur-3xl animate-pulse" />

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 max-w-md w-full relative z-10">

        {/* ── STEP 1: Enter Email ── */}
        {step === 1 && (
          <>
            <div className="text-center space-y-2 mb-8">
              <span className="text-4xl block animate-bounce" style={{ animationDuration: "3s" }}>🔐</span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Forgot Password?</h1>
              <p className="text-xs text-gray-500">Enter your registered email address to continue.</p>
            </div>

            {error && (
              <div className="mb-5 bg-rose-50 text-rose-600 px-4 py-3 rounded-2xl border border-rose-100 flex items-center gap-3 shadow-sm">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <span className="font-semibold text-sm">{error}</span>
              </div>
            )}

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex-1 h-1 rounded-full bg-candy-pink" />
              <div className="flex-1 h-1 rounded-full bg-gray-200" />
            </div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-5">Step 1 of 2 — Verify Email</p>

            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block pl-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="email"
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple/30 focus:border-candy-purple focus:bg-white transition-all text-gray-800"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-candy-purple to-candy-pink text-white font-extrabold py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Continue <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-gray-50">
              <Link href="/login" className="inline-flex items-center gap-1.5 font-bold text-xs text-gray-400 hover:text-candy-purple transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Login
              </Link>
            </div>
          </>
        )}

        {/* ── STEP 2: Set New Password ── */}
        {step === 2 && (
          <>
            <div className="text-center space-y-2 mb-8">
              <span className="text-4xl block animate-bounce" style={{ animationDuration: "3s" }}>🔑</span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Set New Password</h1>
              <p className="text-xs text-gray-500">
                Creating password for <span className="font-bold text-candy-purple">{email}</span>
              </p>
            </div>

            {error && (
              <div className="mb-5 bg-rose-50 text-rose-600 px-4 py-3 rounded-2xl border border-rose-100 flex items-center gap-3 shadow-sm">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <span className="font-semibold text-sm">{error}</span>
              </div>
            )}

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex-1 h-1 rounded-full bg-candy-pink" />
              <div className="flex-1 h-1 rounded-full bg-candy-purple" />
            </div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-5">Step 2 of 2 — New Password</p>

            <form onSubmit={handleSetPassword} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block pl-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="new-password"
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 pl-11 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple/30 focus:border-candy-purple focus:bg-white transition-all text-gray-800"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-3.5 text-gray-400 hover:text-candy-pink transition-colors">
                    {showNew ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block pl-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="new-password"
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 pl-11 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple/30 focus:border-candy-purple focus:bg-white transition-all text-gray-800"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-3.5 text-gray-400 hover:text-candy-pink transition-colors">
                    {showConfirm ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {/* Live match indicator */}
                {confirmPassword && (
                  <p className={`text-[10px] pl-1 font-bold mt-1 ${newPassword === confirmPassword ? "text-emerald-500" : "text-rose-400"}`}>
                    {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-candy-purple to-candy-pink text-white font-extrabold py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Update Password <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-gray-50">
              <button onClick={() => { setStep(1); setError(""); }} className="inline-flex items-center gap-1.5 font-bold text-xs text-gray-400 hover:text-candy-purple transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />
                Change Email
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3: Success ── */}
        {step === 3 && (
          <div className="text-center space-y-6 py-4">
            <div className="flex justify-center">
              <div className="p-4 bg-emerald-50 rounded-full">
                <CheckCircle className="h-14 w-14 text-emerald-500" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Password Updated!</h1>
              <p className="text-sm text-gray-500 mt-2">
                Your password has been successfully updated. You can now log in with your new password.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-candy-purple to-candy-pink text-white font-extrabold px-8 py-3.5 rounded-2xl text-sm shadow-md hover:opacity-95 hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Go to Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
