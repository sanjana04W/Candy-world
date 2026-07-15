"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, X, ArrowRight, CheckCircle2 } from "lucide-react";

/**
 * CartToast — shown globally whenever a product is added to the cart.
 * Receives `toast` object: { id, name, image, price, quantity, variantName }
 * Receives `onDismiss` callback.
 */
export default function CartToast({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!toast) return;
    // Trigger enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10);

    // Start exit animation after 3.5s
    const exitTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        setVisible(false);
        setExiting(false);
        onDismiss();
      }, 400);
    }, 3500);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [toast]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
      onDismiss();
    }, 400);
  };

  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[9998] w-[calc(100%-2rem)] max-w-sm
        transition-all duration-400 ease-out
        ${visible && !exiting
          ? "opacity-100 translate-y-0 -translate-x-1/2 scale-100"
          : "opacity-0 translate-y-8 -translate-x-1/2 scale-95 pointer-events-none"
        }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Candy-pink progress bar */}
        <div
          className="h-1 bg-gradient-to-r from-candy-pink to-candy-purple"
          style={{ animation: "shrink 3.5s linear forwards" }}
        />

        <div className="flex items-center gap-3 p-3.5">
          {/* Product thumbnail */}
          <div className="relative flex-shrink-0">
            <img
              src={toast.image || "/images/placeholder.jpg"}
              alt={toast.name}
              className="h-14 w-14 rounded-xl object-cover border border-gray-100"
              onError={(e) => { e.target.src = "/images/placeholder.jpg"; }}
            />
            <div className="absolute -top-1.5 -right-1.5 bg-candy-pink text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-black shadow">
              {toast.quantity}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Added to Cart</span>
            </div>
            <p className="text-sm font-extrabold text-gray-900 truncate leading-tight">{toast.name}</p>
            {toast.variantName && (
              <p className="text-[11px] text-gray-400 truncate">{toast.variantName}</p>
            )}
            <p className="text-xs font-bold text-candy-pink mt-0.5">
              LKR {(toast.price * toast.quantity).toLocaleString()}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <Link
              href="/cart"
              onClick={handleDismiss}
              className="flex items-center gap-1 bg-candy-pink text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full hover:bg-candy-pink-dark transition-colors whitespace-nowrap"
            >
              <ShoppingCart className="h-3 w-3" />
              View Cart
            </Link>
            <button
              onClick={handleDismiss}
              className="flex items-center justify-center gap-1 border border-gray-200 text-gray-500 text-[11px] font-bold px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Continue
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Dismiss X */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-gray-300 hover:text-gray-500 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
