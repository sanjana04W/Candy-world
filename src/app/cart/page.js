"use client";

import React from "react";
import Link from "next/link";
import { useShop } from "@/context/ShopContext";
import { Trash2, ArrowRight, ShoppingBag, Truck } from "lucide-react";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, getCartSubtotal, getCartTotalWeight } = useShop();

  const subtotal = getCartSubtotal();
  const weight = getCartTotalWeight();
  
  // Standard Delivery calculation based on client context:
  // Let's assume zone-based delivery fee: LKR 350 base + LKR 100 per 500g, free delivery above LKR 5000
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= 5000 ? 0 : 350 + Math.floor(weight / 500) * 100;
  const total = subtotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <span className="inline-block p-6 bg-gray-50 rounded-full text-4xl">🛒</span>
        <h2 className="text-2xl font-black text-gray-900">Your Cart is Empty</h2>
        <p className="text-sm text-gray-500">Add some delicious imported sweets, chocolates, or gourmet treats to get started.</p>
        <Link href="/shop" className="inline-block bg-candy-purple hover:bg-candy-purple-dark text-white font-extrabold text-xs px-6 py-3 rounded-full shadow-lg">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-2">
        <ShoppingBag className="h-8 w-8 text-candy-pink" />
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs divide-y divide-gray-100">
            {cart.map((item) => (
              <div key={`${item.productId}-${item.variantId || "default"}`} className="flex flex-col sm:flex-row gap-4 py-4 first:pt-0 last:pb-0 justify-between items-start sm:items-center">
                
                {/* Item Details */}
                <div className="flex gap-4 items-center">
                  <div className="h-16 w-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center font-bold text-gray-300">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-800 text-sm sm:text-base line-clamp-1">{item.name}</h3>
                    {item.variantName && (
                      <span className="text-xs bg-candy-purple-light/20 text-candy-purple font-bold px-2 py-0.5 rounded-md inline-block mt-1">
                        {item.variantName}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 block mt-0.5">{item.weight}g</span>
                  </div>
                </div>

                {/* Pricing & Quantity Controls */}
                <div className="flex justify-between sm:justify-end gap-6 items-center w-full sm:w-auto">
                  <div className="text-left sm:text-right">
                    <span className="text-sm font-extrabold text-gray-800 block">
                      LKR {item.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold block">Each</span>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                      className="px-2.5 py-1 text-gray-500 hover:bg-gray-50 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                      className="px-2.5 py-1 text-gray-500 hover:bg-gray-50 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>

                  {/* Total price & delete */}
                  <div className="text-right flex items-center gap-3">
                    <span className="text-sm font-black text-candy-pink">
                      LKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.productId, item.variantId)}
                      className="text-gray-400 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Cost Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-6">
            <h3 className="font-extrabold text-gray-900 text-lg">Order Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-gray-800">LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium items-center">
                <span className="flex items-center gap-1">
                  Estimated Delivery
                  <Truck className="h-4 w-4 text-gray-400" />
                </span>
                <span className="font-bold text-gray-800">
                  {deliveryFee === 0 ? "FREE" : `LKR ${deliveryFee.toLocaleString()}`}
                </span>
              </div>
              {subtotal < 5000 && (
                <p className="text-[10px] text-candy-purple font-semibold bg-candy-purple-light/10 p-2 rounded-lg">
                  💡 Add LKR {(5000 - subtotal).toLocaleString()} more to unlock Free Delivery!
                </p>
              )}
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Total Weight</span>
                <span className="font-bold text-gray-800">{weight}g</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
              <span className="font-black text-gray-900 text-base">Total Amount</span>
              <span className="text-xl font-black text-candy-pink">LKR {total.toLocaleString()}</span>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-candy-purple hover:bg-candy-purple-dark text-white font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:scale-101 transition-all text-sm"
            >
              Proceed to Checkout
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
