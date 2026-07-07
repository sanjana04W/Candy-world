"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { getDBService } from "@/lib/firebase";
import { CreditCard, ShoppingBag, ShieldAlert, CheckSquare } from "lucide-react";
import { triggerPixelEvent, sendOrderNotificationEmail, sendVerificationCodeEmail } from "@/lib/integrations";

export default function CheckoutPage() {
  const { cart, getCartSubtotal, getCartTotalWeight, clearCart } = useShop();
  const router = useRouter();
  const dbService = getDBService();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    district: "Colombo",
    requestedDeliveryDate: "",
    orderNotes: ""
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [verifyError, setVerifyError] = useState("");

  const subtotal = getCartSubtotal();
  const weight = getCartTotalWeight();
  
  // Get shipping settings from local storage or defaults
  const settings = (() => {
    if (typeof window === "undefined") return { deliveryFeeColombo: 250, deliveryFeeOutstation: 450, freeDeliveryThreshold: 5000, weightExtraCharge: 50 };
    try {
      const val = localStorage.getItem("candy_world_settings");
      if (val) return JSON.parse(val);
    } catch (e) {}
    return { deliveryFeeColombo: 250, deliveryFeeOutstation: 450, freeDeliveryThreshold: 5000, weightExtraCharge: 50 };
  })();

  const isColombo = formData.district === "Colombo" || formData.district === "Gampaha" || formData.district === "Kalutara";
  const baseDelivery = isColombo ? Number(settings.deliveryFeeColombo ?? 250) : Number(settings.deliveryFeeOutstation ?? 450);
  const freeThreshold = Number(settings.freeDeliveryThreshold ?? 5000);
  const extraChargeWeight = Number(settings.weightExtraCharge ?? 50);
  const deliveryFee = subtotal >= freeThreshold ? 0 : baseDelivery + Math.floor(weight / 1000) * extraChargeWeight;
  const total = subtotal + deliveryFee;

  const sriLankaDistricts = [
    "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", 
    "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", 
    "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", 
    "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", 
    "Moneragala", "Ratnapura", "Kegalle"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInitiateCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setSubmitting(true);
    setError("");

    try {
      // Generate 6 digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(code);

      const sent = await sendVerificationCodeEmail(formData.email, formData.name, code);
      if (sent) {
        setIsVerifying(true);
      } else {
        setError("Failed to send verification email. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during verification setup.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyAndSubmit = async (e) => {
    e.preventDefault();
    if (enteredCode !== verificationCode) {
      setVerifyError("Invalid verification code. Please check your email.");
      return;
    }
    
    setSubmitting(true);
    setVerifyError("");

    try {
      const orderPayload = {
        customerInfo: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          district: formData.district
        },
        items: cart.map(item => ({
          productId: item.productId,
          variantId: item.variantId || null,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal,
        deliveryFee,
        totalAmount: total,
        requestedDeliveryDate: formData.requestedDeliveryDate || null,
        paymentMethod: "COD",
        paymentStatus: "Pending Collection",
        orderStatus: "Pending",
        internalNotes: formData.orderNotes ? `[Customer Notes] ${formData.orderNotes}` : ""
      };

      // Create order
      const newOrder = await dbService.createOrder(orderPayload);
      
      // Fire integrations triggers
      await sendOrderNotificationEmail(newOrder);
      triggerPixelEvent("Purchase", {
        value: total,
        currency: "LKR",
        content_ids: newOrder.items.map(i => i.productId),
        content_type: "product"
      });

      // Clear Cart state
      clearCart();
      
      // Navigate to confirmation page
      router.push(`/checkout/confirmation?orderId=${newOrder.orderId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to process order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Checkout is Unavailable</h2>
        <p className="text-sm text-gray-500">Your shopping cart is currently empty.</p>
        <button onClick={() => router.push("/shop")} className="bg-candy-purple text-white px-6 py-2 rounded-xl text-xs">
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-2">
        Checkout Shipping Details
      </h1>

      <form onSubmit={isVerifying ? handleVerifyAndSubmit : handleInitiateCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
        {/* Left Column: Delivery Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-6">
          <h3 className="font-extrabold text-gray-900 text-lg border-b border-gray-100 pb-3">Delivery Information</h3>
          
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="E.g. Shanika Perera"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Mobile Phone *</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="E.g. +94 77 123 4567"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="E.g. customer@example.com"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">District *</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple font-bold text-gray-700"
              >
                {sriLankaDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Requested Delivery Date</label>
              <input
                type="date"
                name="requestedDeliveryDate"
                value={formData.requestedDeliveryDate}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple font-bold text-gray-700"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Detailed Shipping Address *</label>
            <textarea
              name="address"
              required
              rows={3}
              placeholder="Street number, apartment details, landmark description..."
              value={formData.address}
              onChange={handleInputChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Order Notes (Optional)</label>
            <textarea
              name="orderNotes"
              rows={2}
              placeholder="Allergen preferences or specific instructions for delivery rider..."
              value={formData.orderNotes}
              onChange={handleInputChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple"
            />
          </div>
        </div>

        {/* Right Column: Cost and COD summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-6">
            <h3 className="font-extrabold text-gray-900 text-lg border-b border-gray-100 pb-3">Your Order</h3>
            
            {/* Short Item list */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 divide-y divide-gray-50">
              {cart.map(item => (
                <div key={item.productId} className="flex justify-between items-center py-2 first:pt-0">
                  <span className="text-xs font-semibold text-gray-700 line-clamp-1">
                    {item.name} <strong className="text-candy-pink">x{item.quantity}</strong>
                  </span>
                  <span className="text-xs font-bold text-gray-800">
                    LKR {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-xs border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Cart Subtotal</span>
                <span className="font-bold text-gray-800">LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Shipping Fee</span>
                <span className="font-bold text-gray-800">
                  {deliveryFee === 0 ? "FREE" : `LKR ${deliveryFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Total Weight</span>
                <span className="font-bold text-gray-800">{weight}g</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
              <span className="font-black text-gray-900 text-sm">Payable Amount</span>
              <span className="text-lg font-black text-candy-pink">LKR {total.toLocaleString()}</span>
            </div>

            {/* Cash on Delivery Notice */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
              <div className="flex items-center gap-2.5">
                <CheckSquare className="h-5 w-5 text-emerald-500" />
                <span className="font-extrabold text-gray-900 text-sm">Cash on Delivery (COD)</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Pay in cash directly to the delivery rider upon receiving your package. Ensure exact change is prepared if possible.
              </p>
            </div>

            {isVerifying ? (
              <div className="bg-candy-purple/5 p-4 rounded-2xl border border-candy-purple/20 space-y-4">
                <div className="text-sm font-bold text-gray-900">Email Verification</div>
                <p className="text-[11px] text-gray-500">
                  We&apos;ve sent a 6-digit verification code to <span className="font-bold text-gray-800">{formData.email}</span>. 
                  Please enter it below to confirm your order.
                </p>
                {verifyError && (
                  <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-lg border border-red-100 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    {verifyError}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple text-center tracking-widest font-bold"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyAndSubmit}
                    disabled={submitting || enteredCode.length !== 6}
                    className="bg-candy-purple hover:bg-candy-purple-dark text-white font-extrabold px-6 rounded-xl transition-all text-sm disabled:opacity-50"
                  >
                    {submitting ? "Verifying..." : "Verify"}
                  </button>
                </div>
                <div className="text-center pt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsVerifying(false);
                      setEnteredCode("");
                      setVerifyError("");
                    }}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600 underline"
                  >
                    Change Email or Details
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-candy-purple hover:bg-candy-purple-dark text-white font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all text-sm disabled:opacity-50"
              >
                {submitting ? "Processing Order..." : "Confirm Purchase (COD)"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
