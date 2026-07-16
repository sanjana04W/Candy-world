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
  const [step, setStep] = useState("email"); // "email" | "newpass" | "done"
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 – verify email exists
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Directly fetch from central API for most up-to-date data
      let customers = [];
      try {
        const res = await fetch('/api/mockDb', { cache: 'no-store' });
        const db = await res.json();
        customers = db.customers || [];
      } catch {
        // Fallback via dbService if direct fetch fails
        const dbService = getDBService();
        customers = await dbService.getCustomers();
      }
      const found = customers.find(c => c.email === email.trim().toLowerCase()) ||
                    customers.find(c => c.email?.toLowerCase() === email.trim().toLowerCase());
      if (!found) throw new Error("No account found with this email address.");
      setFoundCustomer(found);
      setStep("newpass");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 – save new password
  const handleSavePassword = async (e) => {
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
      // Fetch all customers, update the matching one, save back
      const getRes = await fetch('/api/mockDb', { cache: 'no-store' });
      if (!getRes.ok) throw new Error("Could not connect to the database. Make sure the dev server is running.");
      const db = await getRes.json();
      const customers = db.customers || [];
      const normalizedEmail = email.trim().toLowerCase();
      const idx = customers.findIndex(c => c.email?.toLowerCase() === normalizedEmail);
      if (idx === -1) throw new Error("Account not found. Please try again.");
      customers[idx] = { ...customers[idx], password: newPassword };
      const saveRes = await fetch('/api/mockDb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'customers', data: customers })
      });
      const saveResult = await saveRes.json();
      if (!saveResult.success) throw new Error("Failed to save password. Please try again.");
      setStep("done");
    } catch (err) {
      setError(err.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strengthScore = (() => {
    if (!newPassword) return 0;
    let s = 0;
    if (newPassword.length >= 6) s++;
    if (newPassword.length >= 10) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][strengthScore];
  const strengthColor = ["", "bg-rose-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-400", "bg-emerald-600"][strengthScore];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full border border-gray-100"
        style={{ animation: "fadeInUp 0.25s ease" }}>
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
          <X className="h-4 w-4" />
        </button>

        {/* ── STEP 1: Enter Email ── */}
        {step === "email" && (
          <>
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-candy-purple/20 to-candy-pink/20 mx-auto mb-5">
              <KeyRound className="h-7 w-7 text-candy-purple" />
            </div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-gray-900">Forgot Password?</h2>
              <p className="text-xs text-gray-500 mt-1.5">
                Enter your registered email address to reset your password.
              </p>
            </div>
            {error && (
              <div className="mb-4 bg-rose-50 text-rose-600 text-xs font-semibold px-4 py-2.5 rounded-xl border border-rose-100 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div className="relative">
                <input type="email" required placeholder="your@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple/30 focus:border-candy-purple transition-all text-gray-800" />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-candy-purple to-candy-pink text-white font-extrabold py-3 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-95 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                {loading
                  ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><span>Continue</span><ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
            <p className="text-center text-xs text-gray-400 mt-4">
              Remember it?{" "}
              <button onClick={onClose} className="text-candy-purple font-bold hover:text-candy-pink transition-colors">Back to Login</button>
            </p>
          </>
        )}

        {/* ── STEP 2: Set New Password ── */}
        {step === "newpass" && (
          <>
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-candy-purple/20 to-candy-pink/20 mx-auto mb-5">
              <Lock className="h-7 w-7 text-candy-purple" />
            </div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-gray-900">Set New Password</h2>
              <p className="text-xs text-gray-500 mt-1.5">
                Hi <span className="font-bold text-gray-700">{foundCustomer?.name || email}</span>! Choose a strong new password.
              </p>
            </div>
            {error && (
              <div className="mb-4 bg-rose-50 text-rose-600 text-xs font-semibold px-4 py-2.5 rounded-xl border border-rose-100 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
            <form onSubmit={handleSavePassword} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block pl-1">New Password</label>
                <div className="relative">
                  <input type={showNew ? "text" : "password"} required placeholder="Min. 6 characters"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-11 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple/30 focus:border-candy-purple transition-all text-gray-800" />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-candy-pink transition-colors">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {newPassword && (
                  <div className="space-y-1 px-1">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strengthScore ? strengthColor : "bg-gray-100"}`} />
                      ))}
                    </div>
                    <p className={`text-[10px] font-bold ${strengthScore <= 1 ? "text-rose-400" : strengthScore <= 2 ? "text-orange-400" : strengthScore <= 3 ? "text-yellow-500" : "text-emerald-500"}`}>
                      {strengthLabel}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block pl-1">Confirm Password</label>
                <div className="relative">
                  <input type={showConfirm ? "text" : "password"} required placeholder="Re-enter password"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-gray-50 border rounded-2xl px-4 py-3 pl-11 pr-11 text-sm focus:outline-none focus:ring-2 transition-all text-gray-800 ${
                      confirmPassword && newPassword !== confirmPassword
                        ? "border-rose-300 focus:ring-rose-200"
                        : "border-gray-200 focus:ring-candy-purple/30 focus:border-candy-purple"}`} />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-candy-pink transition-colors">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[10px] text-rose-500 pl-1 font-semibold">Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-[10px] text-emerald-500 pl-1 font-semibold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Passwords match!</p>
                )}
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-candy-purple to-candy-pink text-white font-extrabold py-3 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-95 hover:-translate-y-0.5 transition-all disabled:opacity-50 mt-2">
                {loading
                  ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><span>Update Password</span><ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
            <button onClick={() => { setStep("email"); setError(""); }}
              className="w-full text-center text-xs text-gray-400 hover:text-candy-purple mt-3 transition-colors">
              ← Back
            </button>
          </>
        )}

        {/* ── STEP 3: Success ── */}
        {step === "done" && (
          <>
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 mx-auto mb-5">
              <CheckCircle2 className="h-9 w-9 text-emerald-500" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-black text-gray-900">Password Updated!</h2>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Your password has been changed successfully. You can now log in with your new password.
              </p>
            </div>
            <button onClick={onClose}
              className="mt-6 w-full bg-gradient-to-r from-candy-purple to-candy-pink text-white font-extrabold py-3 rounded-2xl text-sm hover:opacity-95 hover:-translate-y-0.5 transition-all">
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
