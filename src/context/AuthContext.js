"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut,
  onAuthStateChanged,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { getDBService } from "@/lib/firebase";

const AuthContext = createContext();
const SESSION_KEY = "candy_world_logged_customer";

// Detect if real Firebase Auth is available (env vars configured)
const isFirebaseConfigured = () =>
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "mock-api-key";

// Lazy-load Firebase auth instance (only when configured)
let _auth = null;
const getFirebaseAuth = async () => {
  if (_auth) return _auth;
  const { getAuth } = await import("firebase/auth");
  const { initializeApp, getApps, getApp } = await import("firebase/app");
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const app = getApps().length === 0 ? initializeApp(config) : getApp();
  _auth = getAuth(app);
  return _auth;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    const init = async () => {
      if (isFirebaseConfigured()) {
        // ── Firebase Auth mode: listen to real auth state ──
        const auth = await getFirebaseAuth();
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            const u = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
              customerId: firebaseUser.uid,
            };
            setUser(u);
            localStorage.setItem(SESSION_KEY, JSON.stringify(u));
          } else {
            setUser(null);
            localStorage.removeItem(SESSION_KEY);
          }
          setLoading(false);
        });
      } else {
        // ── Mock/API mode: restore from localStorage session ──
        try {
          const stored = localStorage.getItem(SESSION_KEY);
          if (stored) setUser(JSON.parse(stored));
        } catch (_) {}
        setLoading(false);
      }
    };

    init();
    return () => unsubscribe();
  }, []);

  // ─── LOGIN ───────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured()) {
        const auth = await getFirebaseAuth();
        const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password.trim());
        const u = {
          uid: cred.user.uid,
          email: cred.user.email,
          name: cred.user.displayName || cred.user.email.split("@")[0],
          customerId: cred.user.uid,
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        setUser(u);
        return { success: true };
      } else {
        // API-route fallback (works on localhost)
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) return { success: false, error: data.error || "Invalid email or password." };
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.code === "auth/invalid-credential" || err.code === "auth/wrong-password"
        ? "Invalid email or password."
        : err.code === "auth/user-not-found"
        ? "No account found with this email."
        : err.code === "auth/too-many-requests"
        ? "Too many attempts. Please try again later."
        : err.message || "Login failed. Please try again.";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // ─── REGISTER ────────────────────────────────────────────────
  const register = async (userData) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured()) {
        const auth = await getFirebaseAuth();
        const { updateProfile } = await import("firebase/auth");
        const cred = await createUserWithEmailAndPassword(
          auth,
          userData.email.trim().toLowerCase(),
          userData.password.trim()
        );
        // Save display name
        await updateProfile(cred.user, { displayName: userData.name });
        const u = {
          uid: cred.user.uid,
          email: cred.user.email,
          name: userData.name,
          phone: userData.phone || "",
          customerId: cred.user.uid,
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        setUser(u);
        return { success: true };
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
        const data = await res.json();
        if (!res.ok) return { success: false, error: data.error || "Registration failed." };
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.code === "auth/email-already-in-use"
        ? "Email already registered."
        : err.code === "auth/weak-password"
        ? "Password must be at least 6 characters."
        : err.message || "Registration failed.";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // ─── LOGOUT ──────────────────────────────────────────────────
  const logout = async () => {
    if (isFirebaseConfigured()) {
      const auth = await getFirebaseAuth();
      await signOut(auth);
    }
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  // ─── RESET PASSWORD (send email link) ────────────────────────
  const resetPassword = async (email) => {
    try {
      if (isFirebaseConfigured()) {
        const auth = await getFirebaseAuth();
        // Send Firebase reset email; on click, user lands on /forgot-password with oobCode
        await sendPasswordResetEmail(auth, email.trim().toLowerCase(), {
          url: `${window.location.origin}/forgot-password`,
        });
        return { success: true };
      } else {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) return { success: false, error: data.error || "Reset failed." };
        return { success: true };
      }
    } catch (err) {
      const msg = err.code === "auth/user-not-found"
        ? "No account found with this email."
        : err.message || "Failed to send reset email.";
      return { success: false, error: msg };
    }
  };

  // ─── CONFIRM PASSWORD RESET (with Firebase oobCode) ──────────
  const confirmReset = async (oobCode, newPassword) => {
    try {
      if (isFirebaseConfigured()) {
        const auth = await getFirebaseAuth();
        await confirmPasswordReset(auth, oobCode, newPassword.trim());
        return { success: true };
      } else {
        return { success: false, error: "Firebase is not configured on this server." };
      }
    } catch (err) {
      const msg = err.code === "auth/expired-action-code"
        ? "Reset link has expired. Please request a new one."
        : err.code === "auth/invalid-action-code"
        ? "Invalid reset link. Please request a new one."
        : err.message || "Failed to update password.";
      return { success: false, error: msg };
    }
  };

  // ─── UPDATE PASSWORD (direct, via API, no-firebase fallback) ─
  const updatePasswordDirect = async (email, newPassword) => {
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || "Failed to update password." };
      return { success: true };
    } catch (err) {
      return { success: false, error: "Network error. Please check your connection." };
    }
  };

  // ─── UPDATE PROFILE ──────────────────────────────────────────
  const updateProfile = async (updatedFields) => {
    if (!user) return { success: false, error: "Not logged in" };
    try {
      const updatedUser = { ...user, ...updatedFields };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        resetPassword,
        confirmReset,
        updatePasswordDirect,
        updateProfile,
        isFirebaseConfigured: isFirebaseConfigured(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
