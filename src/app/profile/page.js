"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getDBService } from "@/lib/firebase";
import {
  User, ClipboardList, Settings as SettingsIcon, LogOut, Package,
  Mail, Phone, Clock, Edit2, Check, X, Shield, ArrowRight,
  Eye, CheckCircle2, XCircle, MapPin, CreditCard, Calendar
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout, loading, updateProfile } = useAuth();
  const router = useRouter();
  const dbService = getDBService();

  const [activeTab, setActiveTab] = useState("history"); // "overview", "history", "settings"
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Profile edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editNameActive, setEditNameActive] = useState(false);
  const [editPhoneActive, setEditPhoneActive] = useState(false);
  const [editAddressActive, setEditAddressActive] = useState(false);

  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Redirect to login if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/profile");
    }
  }, [user, loading, router]);

  // Load user order history from central DB and local storage
  const fetchOrders = async () => {
    if (user && typeof window !== "undefined") {
      try {
        const userEmail = user.email?.trim().toLowerCase();
        const userPhone = user.phone?.trim();
        const userId = user.uid || user.customerId;
        const userName = user.name?.trim().toLowerCase();

        const isUserOrder = (o) => {
          if (!o) return false;
          const orderEmail = (o.customerInfo?.email || o.userEmail || "").trim().toLowerCase();
          if (userEmail && orderEmail && orderEmail === userEmail) return true;
          if (userId && (o.userId === userId || o.customerId === userId)) return true;
          if (userPhone && o.customerInfo?.phone && o.customerInfo.phone.trim() === userPhone) return true;
          if (userName && o.customerInfo?.name && o.customerInfo.name.trim().toLowerCase() === userName) return true;
          return false;
        };

        // Source 1: Server API orders
        let serverOrders = [];
        try {
          const allServerOrders = await dbService.getOrders();
          serverOrders = allServerOrders.filter(isUserOrder);
        } catch (_) {}

        // Source 2: Per-user localStorage keys
        let myLocalOrders = [];
        if (userEmail) {
          try {
            const userKey = `candy_world_myorders_${userEmail}`;
            myLocalOrders = JSON.parse(localStorage.getItem(userKey) || "[]");
          } catch (_) {}
        }

        // Source 3: Recent placed orders in current browser session
        let recentOrders = [];
        try {
          recentOrders = JSON.parse(localStorage.getItem("candy_world_recent_placed_orders") || "[]").filter(isUserOrder);
        } catch (_) {}

        // Source 4: General orders localStorage
        let generalLocalOrders = [];
        try {
          const all = JSON.parse(localStorage.getItem("candy_world_orders") || "[]");
          generalLocalOrders = all.filter(isUserOrder);
        } catch (_) {}

        // Merge all four sources, deduplicate by orderId + orderNumber
        const seen = new Set();
        const merged = [];
        for (const order of [...serverOrders, ...myLocalOrders, ...recentOrders, ...generalLocalOrders]) {
          const key = order.orderId || order.orderNumber;
          if (!seen.has(key)) {
            seen.add(key);
            if (order.orderNumber && seen.has(`num_${order.orderNumber}`)) continue;
            if (order.orderNumber) seen.add(`num_${order.orderNumber}`);
            merged.push(order);
          }
        }

        // Sort newest first
        setOrders(merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (e) {
        console.error("Error reading order history", e);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
      setEditName(user.name);
      setEditPhone(user.phone || "");
      setEditAddress(user.address || "");
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setError("Name cannot be empty");
      return;
    }
    setError("");
    setSuccessMsg("");
    setSaveLoading(true);
    const result = await updateProfile({
      name: editName,
      phone: editPhone,
      address: editAddress
    });
    setSaveLoading(false);
    if (result.success) {
      setSuccessMsg("Personal information updated successfully!");
      setEditNameActive(false);
      setEditPhoneActive(false);
      setEditAddressActive(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    } else {
      setError(result.error || "Failed to update profile");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }
    if (user.password && currentPassword !== user.password) {
      setPasswordError("Current password is incorrect");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setPasswordLoading(true);
    const result = await updateProfile({ password: newPassword });
    setPasswordLoading(false);

    if (result.success) {
      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } else {
      setPasswordError(result.error || "Failed to update password");
    }
  };

  if (loading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500 mx-auto"></div>
        <p className="text-xs text-gray-500 mt-4">Loading your profile info...</p>
      </div>
    );
  }

  // Get status badge colors
  const getStatusStyle = (status) => {
    const s = (status || "Pending").toLowerCase();
    if (s.includes("processing")) {
      return "bg-[#EDE9FE] text-[#5B21B6] border border-[#DDD6FE]";
    } else if (s.includes("confirm")) {
      return "bg-[#DBEAFE] text-[#1E40AF] border border-[#BFDBFE]";
    } else if (s.includes("dispatch")) {
      return "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]";
    } else if (s.includes("deliver")) {
      return "bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]";
    } else if (s.includes("cancel")) {
      return "bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]";
    }
    // Pending confirmation or pending collection
    return "bg-[#FFEDD5] text-[#9A3412] border border-[#FED7AA]";
  };

  // Format order short hash ID
  const getDisplayOrderId = (order) => {
    if (order.orderNumber) return order.orderNumber;
    const cleanId = (order.orderId || "").replace("ord-", "");
    return cleanId.substring(0, 8);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* ── LEFT CARD — NAVIGATION SIDEBAR ── */}
          <div className="w-full md:w-64 bg-[#FAF6F0] border border-[#EBE4D8] rounded-3xl p-4 shadow-xs space-y-4">
            
            {/* User Badge Info Card */}
            <div className="bg-white rounded-2xl p-4 shadow-xs flex items-center gap-3 border border-gray-50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 text-white flex items-center justify-center font-black uppercase text-sm">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-black text-gray-800 truncate">{user.name}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Customer</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="space-y-1.5">
              {[
                { id: "overview", label: "Overview", icon: User },
                { id: "history", label: "Order History", icon: ClipboardList },
                { id: "settings", label: "Settings", icon: SettingsIcon }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsEditing(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                      isActive
                        ? "bg-[#F3ECE4] text-[#E11D48] border-l-4 border-[#E11D48] shadow-xs"
                        : "text-gray-500 hover:bg-white/50 hover:text-gray-800"
                    }`}
                  >
                    <TabIcon className={`h-4 w-4 ${isActive ? "text-[#E11D48]" : "text-gray-400"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 text-rose-500 hover:bg-rose-50/50 transition-all mt-4"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* ── RIGHT PANEL — TAB CONTENTS ── */}
          <div className="flex-1 w-full bg-[#FAF6F0] border border-[#EBE4D8] rounded-3xl p-6 shadow-xs min-h-[450px]">

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Welcome Back, {user.name}!</h3>
                  <p className="text-xs text-gray-400 mt-1">Manage your order history, delivery details, and keep your contact information up-to-date.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Total Orders</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{orders.length}</p>
                  </div>
                  <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Total Spent</p>
                    <p className="text-2xl font-black text-rose-600 mt-1">
                      LKR {orders.filter(o => o.orderStatus !== "Cancelled").reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Member Since</p>
                    <p className="text-sm font-black text-gray-700 mt-3.5">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "July 2026"}
                    </p>
                  </div>
                </div>

                {/* Profile Overview card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-xs">
                  <h4 className="font-extrabold text-gray-800 text-sm">Account Overview</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Email Address</span>
                      <p className="font-semibold text-gray-800">{user.email}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</span>
                      <p className="font-semibold text-gray-800">{user.phone || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ORDER HISTORY */}
            {activeTab === "history" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-[#EBE4D8]">
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Order History</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{orders.length} orders placed</p>
                  </div>
                  <div className="p-2.5 bg-[#F5EDE2] rounded-xl text-gray-600">
                    <Package className="h-5 w-5" />
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <span className="text-4xl block">📦</span>
                    <h4 className="font-extrabold text-gray-800 text-sm">No Orders Placed Yet</h4>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto">
                      Explore our delicious candies and cosmetics catalog, place your first order and it will appear here!
                    </p>
                    <button
                      onClick={() => router.push("/shop")}
                      className="bg-gradient-to-r from-rose-500 to-purple-600 text-white font-black text-xs px-6 py-2.5 rounded-full shadow-md hover:opacity-95 transition-opacity"
                    >
                      Explore Shop Catalog
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="pb-3 pr-4">Order ID</th>
                          <th className="pb-3 px-4">Date</th>
                          <th className="pb-3 px-4">Status</th>
                          <th className="pb-3 px-4">Total</th>
                          <th className="pb-3 pl-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs text-gray-700">
                        {orders.map((order, index) => {
                          const orderIdStr = getDisplayOrderId(order);
                          const orderTotal = order.totalAmount || order.total || 0;
                          return (
                            <tr
                              key={order.orderId || index}
                              className={`border-b border-[#EBE4D8]/45 ${
                                index % 2 === 0 ? "bg-white/40" : "bg-transparent"
                              }`}
                            >
                              <td className="py-4 pr-4 font-mono font-bold text-gray-900">
                                #{orderIdStr}
                              </td>
                              <td className="py-4 px-4 font-medium text-gray-500">
                                {new Date(order.createdAt || Date.now()).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric"
                                })}
                              </td>
                              <td className="py-4 px-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${getStatusStyle(order.orderStatus || order.status)}`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
                                  {order.orderStatus || order.status || "Pending"}
                                </span>
                              </td>
                              <td className="py-4 px-4 font-black text-gray-900">
                                LKR {orderTotal.toLocaleString()}
                              </td>
                              <td className="py-4 pl-4 text-right">
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="text-[#E11D48] hover:underline font-bold inline-flex items-center gap-0.5"
                                >
                                  View Details <ArrowRight className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SETTINGS / PROFILE UPDATE */}
            {activeTab === "settings" && (
              <div className="space-y-8">
                {/* Notification banners */}
                {(successMsg || error) && (
                  <div className="space-y-2">
                    {successMsg && (
                      <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-150 text-emerald-700 text-xs font-bold rounded-2xl">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{successMsg}</span>
                      </div>
                    )}
                    {error && (
                      <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-150 text-rose-700 text-xs font-bold rounded-2xl">
                        <XCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── CARD 1: PERSONAL INFORMATION ── */}
                <div className="bg-[#FAF6F0] border border-[#EBE4D8] rounded-3xl p-6 shadow-sm space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-50 rounded-xl text-[#E11D48]">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-gray-800">Personal Information</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Your basic account details</p>
                    </div>
                  </div>

                  <form onSubmit={handleSavePersonalInfo} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Name field */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-gray-400" /> Full Name
                          </label>
                          <button
                            type="button"
                            onClick={() => setEditNameActive(!editNameActive)}
                            className="text-[10px] font-black text-rose-500 hover:text-rose-600 flex items-center gap-0.5"
                          >
                            <Edit2 className="h-3 w-3" /> {editNameActive ? "Cancel" : "Edit"}
                          </button>
                        </div>
                        <input
                          required
                          type="text"
                          disabled={!editNameActive}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className={`w-full rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none transition-all ${
                            editNameActive
                              ? "bg-white border-2 border-rose-300 text-gray-800"
                              : "bg-[#FAF6F0] border border-[#EBE4D8] text-gray-500 cursor-not-allowed"
                          }`}
                        />
                      </div>

                      {/* Email field (Read Only) */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-gray-400" /> Email Address
                        </label>
                        <input
                          type="email"
                          disabled
                          value={user.email}
                          className="w-full bg-[#FAF6F0] border border-[#EBE4D8] rounded-xl px-4 py-3 text-xs text-gray-400 font-semibold cursor-not-allowed outline-none"
                        />
                        <p className="text-[9px] text-gray-400 flex items-center gap-1 font-bold">
                          🔒 Email address cannot be changed
                        </p>
                      </div>

                      {/* Phone field */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5 text-gray-400" /> Phone Number
                          </label>
                          <button
                            type="button"
                            onClick={() => setEditPhoneActive(!editPhoneActive)}
                            className="text-[10px] font-black text-rose-500 hover:text-rose-600 flex items-center gap-0.5"
                          >
                            <Edit2 className="h-3 w-3" /> {editPhoneActive ? "Cancel" : "Edit"}
                          </button>
                        </div>
                        <input
                          required
                          type="tel"
                          disabled={!editPhoneActive}
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className={`w-full rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none transition-all ${
                            editPhoneActive
                              ? "bg-white border-2 border-rose-300 text-gray-800"
                              : "bg-[#FAF6F0] border border-[#EBE4D8] text-gray-500 cursor-not-allowed"
                          }`}
                          placeholder="e.g. 077 123 4567"
                        />
                      </div>

                      {/* Address field */}
                      <div className="space-y-2 sm:col-span-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" /> Default Delivery Address
                          </label>
                          <button
                            type="button"
                            onClick={() => setEditAddressActive(!editAddressActive)}
                            className="text-[10px] font-black text-rose-500 hover:text-rose-600 flex items-center gap-0.5"
                          >
                            <Edit2 className="h-3 w-3" /> {editAddressActive ? "Cancel" : "Edit"}
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          disabled={!editAddressActive}
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          placeholder="Enter your full delivery address"
                          className={`w-full rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none transition-all resize-none ${
                            editAddressActive
                              ? "bg-white border-2 border-rose-300 text-gray-800"
                              : "bg-[#FAF6F0] border border-[#EBE4D8] text-gray-500 cursor-not-allowed"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    {(editNameActive || editPhoneActive || editAddressActive) && (
                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={saveLoading}
                          className="bg-gradient-to-r from-rose-500 to-purple-600 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                        >
                          {saveLoading ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          Save Personal Info
                        </button>
                      </div>
                    )}
                  </form>
                </div>

                {/* ── CARD 2: CHANGE PASSWORD ── */}
                <div className="bg-[#FAF6F0] border border-[#EBE4D8] rounded-3xl p-6 shadow-sm space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-50 rounded-xl text-[#E11D48]">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-gray-800">Change Password</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Leave fields blank if you don&apos;t want to change your password</p>
                    </div>
                  </div>

                  {/* Password alerts */}
                  {(passwordSuccess || passwordError) && (
                    <div className="space-y-2">
                      {passwordSuccess && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          <span>{passwordSuccess}</span>
                        </div>
                      )}
                      {passwordError && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-xl">
                          <XCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{passwordError}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {/* Current password */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#FAF6F0] border border-[#EBE4D8] rounded-xl px-4 py-3 text-xs text-gray-800 font-semibold focus:outline-none focus:bg-white focus:border-2 focus:border-rose-300 focus:ring-0 transition-all"
                      />
                    </div>

                    {/* New & confirm passwords */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#FAF6F0] border border-[#EBE4D8] rounded-xl px-4 py-3 text-xs text-gray-800 font-semibold focus:outline-none focus:bg-white focus:border-2 focus:border-rose-300 focus:ring-0 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#FAF6F0] border border-[#EBE4D8] rounded-xl px-4 py-3 text-xs text-gray-800 font-semibold focus:outline-none focus:bg-white focus:border-2 focus:border-rose-300 focus:ring-0 transition-all"
                        />
                      </div>
                    </div>

                    {/* Password submit button */}
                    {(currentPassword || newPassword || confirmPassword) && (
                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="bg-gradient-to-r from-rose-500 to-purple-600 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                        >
                          {passwordLoading ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          Update Password
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* ── DETAIL MODAL POPUP ── */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-150 animate-in fade-in zoom-in-95 duration-255">
            {/* Header */}
            <div className="bg-[#FAF6F0] px-6 py-4 border-b border-[#EBE4D8] flex justify-between items-center">
              <div>
                <h4 className="font-black text-gray-900 text-sm flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-rose-500" />
                  Order Details #{getDisplayOrderId(selectedOrder)}
                </h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt || Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-gray-200/60 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
              
              {/* Order Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Status</span>
                  <span className={`inline-block mt-1.5 px-3 py-0.5 rounded-full text-[9px] font-black uppercase ${getStatusStyle(selectedOrder.orderStatus || selectedOrder.status)}`}>
                    {selectedOrder.orderStatus || selectedOrder.status || "Pending"}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5 text-gray-400" /> Payment Mode
                  </span>
                  <span className="font-bold text-gray-800 block mt-1.5">
                    {selectedOrder.paymentMethod || "COD (Cash on Delivery)"}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" /> Delivery Date
                  </span>
                  <span className="font-bold text-gray-800 block mt-1.5">
                    {selectedOrder.requestedDeliveryDate
                      ? new Date(selectedOrder.requestedDeliveryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                      : "Standard Delivery"}
                  </span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EBE4D8]/50 space-y-2">
                <h5 className="font-extrabold text-gray-800 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-rose-500 shrink-0" /> Shipping Destination
                </h5>
                <div className="pl-5 text-gray-600 space-y-1 font-medium">
                  <p className="font-black text-gray-900">{selectedOrder.customerInfo?.name}</p>
                  <p>{selectedOrder.customerInfo?.address}</p>
                  <p className="flex items-center gap-1 mt-1 text-[11px] font-black text-gray-800">
                    <Phone className="h-3 w-3 text-gray-400" /> {selectedOrder.customerInfo?.phone}
                  </p>
                </div>
              </div>

              {/* Purchased items list */}
              <div className="space-y-2">
                <h5 className="font-extrabold text-gray-800">Items Ordered</h5>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        <th className="px-4 py-3">Product Name</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 font-bold text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 text-center font-bold text-gray-800">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">LKR {item.price.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">LKR {(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Fees block */}
              <div className="border-t border-gray-100 pt-4 flex flex-col items-end space-y-2 text-xs">
                <div className="flex justify-between w-64 text-gray-500 font-medium">
                  <span>Subtotal:</span>
                  <span>LKR {(selectedOrder.subtotal || selectedOrder.totalAmount - (selectedOrder.deliveryFee || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between w-64 text-gray-500 font-medium">
                  <span>Delivery Fee:</span>
                  <span>LKR {(selectedOrder.deliveryFee || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between w-64 border-t border-gray-150 pt-2 text-sm font-black text-gray-900">
                  <span>Total Amount:</span>
                  <span className="text-[#E11D48]">LKR {(selectedOrder.totalAmount || selectedOrder.total || 0).toLocaleString()}</span>
                </div>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="bg-[#FAF6F0] px-6 py-4 border-t border-[#EBE4D8] flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-white border border-[#EBE4D8] text-gray-700 font-extrabold text-xs px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
