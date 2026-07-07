"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getDBService } from "@/lib/firebase";
import { KeyRound, ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const dbService = getDBService();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await dbService.loginAdmin(email, password);
      // Success: redirect to dashboard
      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid administrative credentials or inactive user account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-rose-400 via-fuchsia-500 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl space-y-6 -mt-8">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-gradient-to-br from-rose-400 to-purple-600 text-white rounded-2xl mb-1 shadow-inner">
            <KeyRound className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Admin Portal Login</h1>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Candy World Operations</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Admin Email</label>
            <input
              type="email"
              required
              placeholder="e.g. owner@candyworld.lk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 font-semibold text-gray-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Secret Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 font-semibold text-gray-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-400 to-purple-600 hover:from-rose-500 hover:to-purple-700 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-md transition-all text-xs"
          >
            {loading ? "Authorizing Account..." : "Log In to Operations"}
          </button>
        </form>
      </div>
    </div>
  );
}
