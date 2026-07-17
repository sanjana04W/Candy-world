"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";

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
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 max-w-md w-full">
      <div className="text-center space-y-2 mb-8">
        <span className="text-4xl block animate-bounce" style={{ animationDuration: "3s" }}>🍬</span>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome Back!</h1>
        <p className="text-xs text-gray-500">Log in to add sweet treats to your cart and check out.</p>
      </div>

      {/* Error Notification */}
      {error && (
        <div className="mb-6 bg-rose-50 text-rose-600 px-4 py-3 rounded-2xl border border-rose-100 flex items-center gap-3 animate-pulse shadow-sm shadow-rose-500/10">
          <span className="text-xl flex-shrink-0">⚠️</span>
          <span className="font-extrabold text-sm">{error}</span>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="mb-6 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-bounce shadow-sm shadow-emerald-500/10">
          <Sparkles className="h-5 w-5 flex-shrink-0" />
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
            <Link href="/forgot-password" className="text-[10px] font-bold text-candy-purple hover:text-candy-pink hover:underline transition-colors">
              Forgot Password?
            </Link>
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
