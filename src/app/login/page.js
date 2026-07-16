"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getDBService } from "@/lib/firebase";
import { sendPasswordResetEmail } from "@/lib/integrations";
import { Sparkles, Eye, EyeOff, Lock, Mail, ArrowRight, X, KeyRound, CheckCircle2 } from "lucide-react";

// ─── Forgot Password Modal ─────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState("email"); // "email" | "sent"
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const dbService = getDBService();
      const result = await dbService.resetCustomerPassword(email);
      // Fire-and-forget email with temp password
      if (result.tempPassword) {
        sendPasswordResetEmail(email, result.customer?.name, result.tempPassword).catch(() => {});
      }
      setStep("sent");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full border border-gray-100 animate-[fadeInUp_0.25s_ease]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {step === "email" ? (
          <>
            {/* Icon */}
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-candy-purple/20 to-candy-pink/20 mx-auto mb-5">
              <KeyRound className="h-7 w-7 text-candy-purple" />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-gray-900">Forgot Password?</h2>
              <p className="text-xs text-gray-500 mt-1.5">
                Enter your registered email. We&apos;ll send you a temporary password to regain access.
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-rose-50 text-rose-600 text-xs font-semibold px-4 py-2.5 rounded-xl border border-rose-100 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple/30 focus:border-candy-purple transition-all text-gray-800"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-candy-purple to-candy-pink text-white font-extrabold py-3 px-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Send Reset Email <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-4">
              Remember it?{" "}
              <button onClick={onClose} className="text-candy-purple font-bold hover:text-candy-pink transition-colors">
                Back to Login
              </button>
            </p>
          </>
        ) : (
          // ── Success state ──
          <>
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 mx-auto mb-5">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-black text-gray-900">Check Your Email!</h2>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                A temporary password has been sent to{" "}
                <span className="font-bold text-gray-700">{email}</span>. Use it to log in, then change your password from your profile.
              </p>
              <p className="text-[10px] text-gray-400 mt-3 italic">
                Didn&apos;t receive it? Check your spam folder.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-6 w-full bg-gradient-to-r from-candy-purple to-candy-pink text-white font-extrabold py-3 rounded-2xl text-sm hover:opacity-95 hover:-translate-y-0.5 transition-all"
            >
              Back to Login
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Login Form ────────────────────────────────────────────────────────────────
function LoginForm() {
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  // If already logged in, redirect (unless showing success toast)
  React.useEffect(() => {
    if (user && !successMsg) {
      router.push(redirect);
    }
  }, [user, router, redirect, successMsg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    const res = await login(email, password);
    if (res.success) {
      setSuccessMsg("Login successful! Welcome back.");
      setTimeout(() => {
        router.push(redirect);
      }, 1500);
    } else {
      setError(res.error || "Failed to log in. Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 max-w-md w-full">
        <div className="text-center space-y-2 mb-8">
          <span className="text-4xl block animate-bounce" style={{ animationDuration: "3s" }}>🍬</span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome Back!</h1>
          <p className="text-xs text-gray-500">Log in to add sweet treats to your cart and check out.</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-rose-50 text-rose-600 px-6 py-3 rounded-full shadow-lg border border-rose-100 flex items-center gap-3 animate-pulse shadow-rose-500/10">
            <span className="text-xl">⚠️</span>
            <span className="font-extrabold text-sm">{error}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-full shadow-lg border border-emerald-100 flex items-center gap-3 animate-bounce shadow-emerald-500/10">
            <Sparkles className="h-5 w-5" />
            <span className="font-extrabold text-sm">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
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
                className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple/30 focus:border-candy-purple focus:bg-white transition-all text-gray-800"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Password
              </label>
              {/* ── Forgot Password link ── */}
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-[10px] font-bold text-candy-purple hover:text-candy-pink hover:underline transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 pl-11 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple/30 focus:border-candy-purple focus:bg-white transition-all text-gray-800"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-candy-pink transition-colors"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-candy-purple to-candy-pink hover:opacity-95 text-white font-extrabold py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-1.5 shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-gray-50 space-y-1">
          <p className="text-xs text-gray-500">
            New to Candy World?{" "}
            <Link
              href={`/register?redirect=${encodeURIComponent(redirect)}`}
              className="font-bold text-candy-purple hover:text-candy-pink hover:underline"
            >
              Create an Account
            </Link>
          </p>
          <p className="text-[10px] text-gray-400 italic">
            Tip: You can use any test credentials or register a new user!
          </p>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-candy-pink/5 via-white to-candy-purple/5">
      {/* Decorative floating bubbles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-candy-pink/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-44 h-44 bg-candy-purple/10 rounded-full blur-3xl animate-pulse animate-duration-1000" />
      
      <Suspense fallback={<div className="text-center text-xs text-gray-500">Loading form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
