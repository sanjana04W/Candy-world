"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Mock API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 max-w-md w-full relative z-10">
      <div className="text-center space-y-2 mb-8">
        <span className="text-4xl block animate-pulse" style={{ animationDuration: "2s" }}>🤔</span>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Forgot Password?</h1>
        <p className="text-xs text-gray-500">
          No worries! Enter your email and we'll send you a link to reset it.
        </p>
      </div>

      {success ? (
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl border border-emerald-100 flex flex-col items-center gap-3">
            <Sparkles className="h-8 w-8 animate-bounce" />
            <div>
              <p className="font-extrabold text-sm">Reset Link Sent!</p>
              <p className="text-xs mt-1">Check your inbox at <span className="font-bold">{email}</span>.</p>
            </div>
          </div>
          <Link
            href="/login"
            className="block w-full bg-gray-900 hover:bg-black text-white font-extrabold py-3.5 px-4 rounded-2xl text-sm transition-all"
          >
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-gradient-to-r from-candy-purple to-candy-pink hover:opacity-95 text-white font-extrabold py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-1.5 shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Send Reset Link
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}

      {!success && (
        <div className="text-center mt-6 pt-6 border-t border-gray-50">
          <p className="text-xs text-gray-500">
            Remembered your password?{" "}
            <Link
              href="/login"
              className="font-bold text-candy-purple hover:text-candy-pink hover:underline"
            >
              Back to Sign In
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-candy-pink/5 via-white to-candy-purple/5">
      {/* Decorative floating bubbles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-candy-pink/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-44 h-44 bg-candy-purple/10 rounded-full blur-3xl animate-pulse animate-duration-1000" />
      
      <Suspense fallback={<div className="text-center text-xs text-gray-500">Loading form...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
