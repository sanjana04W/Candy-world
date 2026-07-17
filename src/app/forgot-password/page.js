"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

const STEPS = { EMAIL: "email", NEW_PASSWORD: "new_password", DONE: "done" };

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(STEPS.EMAIL);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Step 1: verify email exists ──────────────────────────────
  const handleEmailSubmit = async (e) => {
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
        setStep(STEPS.NEW_PASSWORD);
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: set new password ─────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
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
        setStep(STEPS.DONE);
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-candy-pink/5 via-white to-candy-purple/5">
      {/* Decorative floating bubbles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-candy-pink/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-44 h-44 bg-candy-purple/10 rounded-full blur-3xl animate-pulse" />

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 max-w-md w-full relative z-10">

        {/* ── Step indicator ── */}
        {step !== STEPS.DONE && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[STEPS.EMAIL, STEPS.NEW_PASSWORD].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`h-2 w-2 rounded-full transition-all duration-300 ${step === s ? "bg-candy-pink w-6" : step === STEPS.NEW_PASSWORD && i === 0 ? "bg-emerald-400" : "bg-gray-200"}`} />
              </React.Fragment>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 1 — Enter Email
        ══════════════════════════════════════════ */}
        {step === STEPS.EMAIL && (
          <>
            <div className="text-center space-y-2 mb-8">
              <span className="text-4xl block animate-bounce" style={{ animationDuration: "3s" }}>🔐</span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Forgot Password?</h1>
              <p className="text-xs text-gray-500">Enter your registered email address and we'll let you set a new password.</p>
            </div>

            {error && (
              <div className="mb-5 bg-rose-50 text-rose-600 px-4 py-3 rounded-2xl border border-rose-100 flex items-center gap-3">
                <span className="text-xl flex-shrink-0">⚠️</span>
                <span className="font-extrabold text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                className="w-full bg-gradient-to-r from-candy-purple to-candy-pink hover:opacity-95 text-white font-extrabold py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-1.5 shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
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

        {/* ══════════════════════════════════════════
            STEP 2 — Set New Password
        ══════════════════════════════════════════ */}
        {step === STEPS.NEW_PASSWORD && (
          <>
            <div className="text-center space-y-2 mb-8">
              <span className="text-4xl block animate-bounce" style={{ animationDuration: "3s" }}>🔑</span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Set New Password</h1>
              <p className="text-xs text-gray-500">
                Creating a new password for <span className="font-bold text-candy-purple">{email}</span>
              </p>
            </div>

            {error && (
              <div className="mb-5 bg-rose-50 text-rose-600 px-4 py-3 rounded-2xl border border-rose-100 flex items-center gap-3">
                <span className="text-xl flex-shrink-0">⚠️</span>
                <span className="font-extrabold text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block pl-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="new-password"
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 pl-11 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple/30 focus:border-candy-purple focus:bg-white transition-all text-gray-800"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                  <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3.5 top-3.5 text-gray-400 hover:text-candy-pink transition-colors">
                    {showNew ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {/* Strength bar */}
                {newPassword && (
                  <div className="flex gap-1 mt-1 px-1">
                    {[1, 2, 3].map(n => (
                      <div key={n} className={`h-1 flex-1 rounded-full transition-all ${
                        newPassword.length >= n * 4
                          ? n === 1 ? "bg-rose-400" : n === 2 ? "bg-amber-400" : "bg-emerald-400"
                          : "bg-gray-100"
                      }`} />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block pl-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="new-password"
                    className={`w-full bg-gray-50/50 border rounded-2xl px-4 py-3 pl-11 pr-11 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all text-gray-800 ${
                      confirmPassword && confirmPassword !== newPassword
                        ? "border-rose-300 focus:ring-rose-200"
                        : confirmPassword && confirmPassword === newPassword
                        ? "border-emerald-300 focus:ring-emerald-200"
                        : "border-gray-200 focus:ring-candy-purple/30 focus:border-candy-purple"
                    }`}
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3.5 top-3.5 text-gray-400 hover:text-candy-pink transition-colors">
                    {showConfirm ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword === newPassword && (
                  <p className="text-[10px] text-emerald-500 font-bold pl-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-candy-purple to-candy-pink hover:opacity-95 text-white font-extrabold py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-1.5 shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Update Password
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <button onClick={() => { setStep(STEPS.EMAIL); setError(""); }} className="inline-flex items-center gap-1.5 font-bold text-xs text-gray-400 hover:text-candy-purple transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />
                Change email
              </button>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════
            STEP 3 — Success
        ══════════════════════════════════════════ */}
        {step === STEPS.DONE && (
          <div className="text-center space-y-6 py-4">
            <div className="text-6xl animate-bounce" style={{ animationDuration: "2s" }}>🎉</div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-gray-900">Password Updated!</h1>
              <p className="text-sm text-gray-500">Your password has been successfully changed. You can now log in with your new password.</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <p className="text-xs text-emerald-700 font-bold text-left">Account updated for <span className="text-emerald-600">{email}</span></p>
            </div>
            <Link
              href="/login"
              className="block w-full bg-gradient-to-r from-candy-purple to-candy-pink text-white font-extrabold py-3.5 px-4 rounded-2xl text-sm text-center shadow-md hover:opacity-95 hover:-translate-y-0.5 transition-all"
            >
              Go to Login →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
