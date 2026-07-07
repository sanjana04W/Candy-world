"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getDBService } from "@/lib/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dbService = getDBService();

  useEffect(() => {
    // On mount, check if a user session exists in local storage
    const currentUser = dbService.getCurrentCustomer();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await dbService.loginCustomer(email, password);
      setUser(loggedUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const newUser = await dbService.registerCustomer(userData);
      setUser(newUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    dbService.logoutCustomer();
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
