"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

// ── Inner component (needs useSearchParams inside Suspense) ──────────────────
function ForgotPasswordInner() {
  const { resetPassword, confirmReset, updatePasswordDirect, isFirebaseConfigured } = useAuth();
  const searchParams = useSearchParams();

  // Firebase passes ?oobCode=...&mode=resetPassword when user clicks the email link
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  // If Firebase sent the user here with oobCode, jump straight to Step 2
  const [step, setStep] = useState(oobCode && mode === "resetPassword" ? 2 : 1);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── Step 1: Send reset email (Firebase) OR verify email (mock) ── */
  const handleStep1 = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await resetPassword(email);
      if (!res.success) {
        setError(res.error || "No account found with this email.");
      } else {
        if (isFirebaseConfigured) {
          // Firebase mode: reset email sent — tell user to check inbox
          setStep("email-sent");
        } else {
          // Mock/API mode: go directly to password set step
          setStep(2);
        }
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Set new password ── */
  const handleStep2 = async (e) => {
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
      let res;
      if (isFirebaseConfigured && oobCode) {
        // Firebase mode: use the oobCode from the email link
        res = await confirmReset(oobCode, newPassword);
      } else {
        // Mock/API mode: update directly via server API
        res = await updatePasswordDirect(email, newPassword);
      }

      if (!res.success) {
        setError(res.error || "Failed to update password.");
      } else {
        setStep(3);
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ── Shared card wrapper ──────────────────────────────────────
  const Card = ({ children }) => (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 relative overflow-hidden bg-gradient-to-br from-candy-pink/5 via-white to-candy-purple/5">
      <div className="absolute top-10 left-10 w-32 h-32 bg-candy-pink/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-44 h-44 bg-candy-purple/10 rounded-full blur-3xl animate-pulse" />
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 max-w-md w-full relative z-10">
        {children}
      </div>
    </div>
  );

  // ── Error banner ─────────────────────────────────────────────
  const ErrorBanner = () =>
    error ? (
      <div className="mb-5 bg-rose-50 text-rose-600 px-4 py-3 rounded-2xl border border-rose-100 flex items-center gap-3 shadow-sm">
        <span className="text-lg flex-shrink-0">⚠️</span>
        <span className="font-semibold text-sm">{error}</span>
      </div>
    ) : null;

  // ── Step indicator ───────────────────────────────────────────
  const StepBar = ({ active }) => (
    <div className="flex items-center gap-2 mb-5">
      <div className="flex-1 h-1 rounded-full bg-candy-pink" />
      <div className={`flex-1 h-1 rounded-full ${active === 2 ? "bg-candy-purple" : "bg-gray-200"}`} />
    </div>
  );

  /* ──────────── STEP 1: Enter Email ──────────── */
  if (step === 1) {
    return (
      <Card>
        <div className="text-center space-y-2 mb-8">
          <span className="text-4xl block animate-bounce" style={{ animationDuration: "3s" }}>🔐</span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Forgot Password?</h1>
          <p className="text-xs text-gray-500">Enter your registered email address to continue.</p>
        </div>

        <ErrorBanner />
        <StepBar active={1} />
        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-5">Step 1 of 2 — Verify Email</p>

        <form onSubmit={handleStep1} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block pl-1">Email Address</label>
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
            className="w-full bg-gradient-to-r from-candy-purple to-candy-pink text-white font-extrabold py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-gray-50">
          <Link href="/login" className="inline-flex items-center gap-1.5 font-bold text-xs text-gray-400 hover:text-candy-purple transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
          </Link>
        </div>
      </Card>
    );
  }

  /* ──────────── EMAIL SENT (Firebase mode) ──────────── */
  if (step === "email-sent") {
    return (
      <Card>
        <div className="text-center space-y-5 py-4">
          <div className="flex justify-center">
            <div className="p-4 bg-blue-50 rounded-full">
              <Mail className="h-14 w-14 text-blue-500" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Check Your Inbox</h1>
            <p className="text-sm text-gray-500 mt-2">
              A password reset link has been sent to <span className="font-bold text-candy-purple">{email}</span>.<br />
              Click the link in the email to set your new password.
            </p>
          </div>
          <p className="text-xs text-gray-400">Didn&apos;t receive it? Check your spam folder or{" "}
            <button onClick={() => { setStep(1); setError(""); }} className="text-candy-purple font-bold hover:underline">try again</button>.
          </p>
          <Link href="/login" className="inline-flex items-center gap-1.5 font-bold text-xs text-gray-400 hover:text-candy-purple transition-colors mt-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
          </Link>
        </div>
      </Card>
    );
  }

  /* ──────────── STEP 2: Set New Password ──────────── */
  if (step === 2) {
    return (
      <Card>
        <div className="text-center space-y-2 mb-8">
          <span className="text-4xl block animate-bounce" style={{ animationDuration: "3s" }}>🔑</span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Set New Password</h1>
          {email && <p className="text-xs text-gray-500">Creating password for <span className="font-bold text-candy-purple">{email}</span></p>}
        </div>

        <ErrorBanner />
        <StepBar active={2} />
        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-5">Step 2 of 2 — New Password</p>

        <form onSubmit={handleStep2} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block pl-1">New Password</label>
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
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block pl-1">Confirm Password</label>
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
            {confirmPassword && (
              <p className={`text-[10px] pl-1 font-bold mt-1 ${newPassword === confirmPassword ? "text-emerald-500" : "text-rose-400"}`}>
                {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-candy-purple to-candy-pink text-white font-extrabold py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Update Password <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        {!oobCode && (
          <div className="text-center mt-6 pt-6 border-t border-gray-50">
            <button onClick={() => { setStep(1); setError(""); }} className="inline-flex items-center gap-1.5 font-bold text-xs text-gray-400 hover:text-candy-purple transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Change Email
            </button>
          </div>
        )}
      </Card>
    );
  }

  /* ──────────── STEP 3: Success ──────────── */
  return (
    <Card>
      <div className="text-center space-y-6 py-4">
        <div className="flex justify-center">
          <div className="p-4 bg-emerald-50 rounded-full">
            <CheckCircle className="h-14 w-14 text-emerald-500" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Password Updated!</h1>
          <p className="text-sm text-gray-500 mt-2">Your password has been successfully updated. You can now log in with your new password.</p>
        </div>
        <Link href="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-candy-purple to-candy-pink text-white font-extrabold px-8 py-3.5 rounded-2xl text-sm shadow-md hover:opacity-95 hover:-translate-y-0.5 transition-all">
          <Sparkles className="h-4 w-4" />
          Go to Login
        </Link>
      </div>
    </Card>
  );
}

// ── Default export with Suspense (required for useSearchParams) ──────────────
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-candy-purple border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ForgotPasswordInner />
    </Suspense>
  );
}
