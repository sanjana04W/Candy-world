"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useShop } from "@/context/ShopContext";
import ProductCard from "@/components/ProductCard";
import { Sparkles, Tag, Clock, Flame, ArrowRight, Percent } from "lucide-react";

// Elapsed time hook — counts UP from a start date
function useElapsed(startDate) {
  const [elapsed, setElapsed] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, Date.now() - startDate);
      setElapsed({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startDate]);

  return elapsed;
}

function CountdownBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 min-w-[52px]">
      <span className="text-2xl font-black tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[9px] uppercase tracking-widest font-bold opacity-80 mt-0.5">{label}</span>
    </div>
  );
}

export default function OffersPage() {
  const { products, loading } = useShop();

  const discountedProducts = products.filter(
    (p) => p.status === "active" && p.salePrice && p.salePrice < p.basePrice
  );

  const newArrivals = products.filter((p) => p.status === "active" && p.isNewArrival);

  // Sale started on July 1st 2026 — count up from that date
  const saleStart = new Date("2026-07-01T00:00:00").getTime();
  const elapsed = useElapsed(saleStart);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-rose-500 via-candy-pink to-candy-purple overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {["🍬", "🍫", "💄", "✨", "🎁", "🌟", "🍭", "🔥"].map((emoji, i) => (
            <span
              key={i}
              className="absolute text-4xl select-none"
              style={{
                left: `${10 + i * 12}%`,
                top: `${15 + (i % 3) * 30}%`,
                transform: `rotate(${i * 30}deg)`,
                animationDelay: `${i * 0.3}s`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-extrabold uppercase px-4 py-1.5 rounded-full backdrop-blur-sm mb-5 animate-pulse">
            <Flame className="h-3.5 w-3.5" />
            🔴 Live Sale — Time Goes By!
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-4">
            🔥 Hot Deals &amp; <br />
            <span className="text-yellow-300">Sweet Savings</span>
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-lg mx-auto mb-8">
            Massive discounts on imported candy and premium chocolates. Limited stock — grab yours before it&apos;s gone!
          </p>

          {/* Elapsed timer */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">⏱ Sale has been running for</p>
            <div className="flex justify-center gap-3">
              <CountdownBlock value={elapsed.d} label="Days" />
              <CountdownBlock value={elapsed.h} label="Hours" />
              <CountdownBlock value={elapsed.m} label="Mins" />
              <CountdownBlock value={elapsed.s} label="Secs" />
            </div>
          </div>
        </div>
      </section>

      {/* Promo Banners Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "🍬", title: "Candy Flash Deals", desc: "Up to 25% off imported sweets", color: "from-candy-pink/10 to-pink-50", border: "border-candy-pink/20", text: "text-candy-pink" },
            { icon: "🍫", title: "Chocolate Discounts", desc: "Premium bars up to 35% off", color: "from-amber-50 to-yellow-50", border: "border-amber-200", text: "text-amber-700" },
            { icon: "🫙", title: "Gourmet Deals", desc: "Imported snacks on sale", color: "from-emerald-50 to-teal-50", border: "border-emerald-200", text: "text-emerald-700" },
          ].map((item, i) => (
            <Link
              key={i}
              href="/shop"
              className={`group p-5 rounded-2xl border ${item.border} bg-gradient-to-br ${item.color} flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-0.5`}
            >
              <span className="text-3xl flex-shrink-0">{item.icon}</span>
              <div>
                <h3 className={`font-extrabold text-sm ${item.text}`}>{item.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
              <ArrowRight className={`ml-auto h-4 w-4 ${item.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </Link>
          ))}
        </div>
      </section>

      {/* On Sale Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex justify-between items-end mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-500">
              <Tag className="h-5 w-5" />
              <span className="text-xs uppercase font-extrabold tracking-wider">Active Price Drops</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">Products On Sale</h2>
          </div>
          {discountedProducts.length > 0 && (
            <span className="bg-rose-50 text-rose-600 border border-rose-100 text-xs font-extrabold px-3 py-1 rounded-full">
              {discountedProducts.length} deals live
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse bg-white border border-gray-100 rounded-2xl h-80" />
            ))}
          </div>
        ) : discountedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl space-y-4">
            <span className="inline-block text-4xl">🏷️</span>
            <h3 className="font-extrabold text-gray-900 text-lg">No Active Discounts Right Now</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              All items are at their standard price. Follow our TikTok &amp; Facebook for flash sale alerts!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 bg-candy-purple text-white text-xs font-extrabold px-5 py-2.5 rounded-full hover:bg-candy-purple-dark transition-colors mt-2"
            >
              Browse All Products
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {discountedProducts.map((prod) => (
              <ProductCard key={prod.productId} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex justify-between items-end mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-candy-purple">
                <Sparkles className="h-5 w-5" />
                <span className="text-xs uppercase font-extrabold tracking-wider">Just Landed</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">New Arrivals</h2>
            </div>
            <Link href="/shop" className="text-sm font-extrabold text-candy-purple hover:text-candy-purple-dark flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((prod) => (
              <ProductCard key={prod.productId} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
