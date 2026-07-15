"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getDBService } from "@/lib/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dbService = getDBService();

  useEffect(() => {
    // Subscribe to Firebase Auth state changes (cross-device persistent sessions)
    // When real Firebase is configured, this fires automatically on every device
    // when the user is already signed in — no manual localStorage check needed.
    const unsubscribe = dbService.onAuthStateChanged((currentUser) => {
      setUser(currentUser || null);
      setLoading(false);
    });

    // Fallback: if no Firebase, check localStorage immediately
    if (!unsubscribe || typeof unsubscribe !== "function") {
      const currentUser = dbService.getCurrentCustomer();
      if (currentUser) setUser(currentUser);
      setLoading(false);
    }

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const loggedUser = await dbService.loginCustomer(email, password);
      setUser(loggedUser);
      return { success: true };
    } catch (error) {
      // Normalize Firebase Auth error messages for better UX
      let msg = error.message || "Failed to log in.";
      if (msg.includes("auth/user-not-found") || msg.includes("auth/wrong-password") || msg.includes("auth/invalid-credential")) {
        msg = "Invalid email or password. Please check your credentials.";
      } else if (msg.includes("auth/too-many-requests")) {
        msg = "Too many failed attempts. Please try again later.";
      } else if (msg.includes("auth/network-request-failed")) {
        msg = "Network error. Please check your connection and try again.";
      }
      return { success: false, error: msg };
    }
  };

  const register = async (userData) => {
    try {
      const newUser = await dbService.registerCustomer(userData);
      setUser(newUser);
      return { success: true };
    } catch (error) {
      let msg = error.message || "Failed to register.";
      if (msg.includes("auth/email-already-in-use") || msg.includes("Email already registered")) {
        msg = "This email is already registered. Please log in instead.";
      } else if (msg.includes("auth/weak-password")) {
        msg = "Password is too weak. Use at least 6 characters.";
      } else if (msg.includes("auth/invalid-email")) {
        msg = "Please enter a valid email address.";
      } else if (msg.includes("auth/network-request-failed")) {
        msg = "Network error. Please check your connection and try again.";
      }
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    await dbService.logoutCustomer();
    setUser(null);
  };

  const updateProfile = async (updatedFields) => {
    if (!user) return { success: false, error: "Not logged in" };
    try {
      const updatedUser = await dbService.updateCustomer(user.email, updatedFields);
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
