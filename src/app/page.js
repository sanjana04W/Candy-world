"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useShop } from "@/context/ShopContext";
import ProductCard from "@/components/ProductCard";
import {
  Sparkles, ArrowRight, ShieldCheck, Truck, RotateCcw, Clock,
  Star, Quote, Play, MapPin, Phone, ChevronLeft, ChevronRight
} from "lucide-react";

const HERO_SLIDES = [
  {
    title: "Sour. Sweet. Iconic.",
    sub: "Directly imported candy from the US, UK, and Korea — now in Colombo!",
    badge: "🍬 Candy Drop Sale — 25% Off",
    bg: "from-rose-500 via-pink-600 to-purple-600",
    image: "/candy_hero.png",
    cta: "Shop Candy",
    link: "/category/candy",
    accent: "text-yellow-300",
  },
  {
    title: "Chocolate Heaven",
    sub: "Toblerone, Ferrero Rocher & premium imported gift boxes — perfect for gifting.",
    badge: "🍫 Up to 35% Off Chocolates",
    bg: "from-amber-700 via-yellow-700 to-amber-900",
    image: "/chocolate_hero.png",
    cta: "Explore Chocolates",
    link: "/category/chocolate",
    accent: "text-amber-200",
  },
  {
    title: "Gourmet Imported Snacks",
    sub: "Pringles, Nutella & premium pantry picks — straight from global shelves.",
    badge: "🫙 Gourmet Imports In Stock",
    bg: "from-green-600 via-emerald-700 to-teal-800",
    image: "/gourmet_hero.png",
    cta: "Explore Gourmet",
    link: "/category/gourmet",
    accent: "text-emerald-200",
  },
];

const CATEGORIES = [
  {
    slug: "candy",
    name: "Candy",
    emoji: "🍬",
    desc: "Gummy, Sour & Viral Sweets",
    image: "/cat_candy.png",
    from: "from-pink-500",
    to: "to-rose-600",
    border: "border-pink-200",
    text: "text-white",
    badge: "bg-candy-pink",
    glow: "group-hover:shadow-candy-pink/40",
  },
  {
    slug: "chocolate",
    name: "Chocolate",
    emoji: "🍫",
    desc: "Imported Bars & Gift Boxes",
    image: "/cat_chocolate.png",
    from: "from-amber-600",
    to: "to-yellow-700",
    border: "border-amber-200",
    text: "text-white",
    badge: "bg-amber-500",
    glow: "group-hover:shadow-amber-500/40",
  },
  {
    slug: "gourmet",
    name: "Gourmet",
    emoji: "🫙",
    desc: "Snacks, Crisps & Condiments",
    image: "/cat_gourmet.png",
    from: "from-emerald-600",
    to: "to-teal-700",
    border: "border-emerald-200",
    text: "text-white",
    badge: "bg-emerald-500",
    glow: "group-hover:shadow-emerald-500/40",
  },
];

const TESTIMONIALS = [
  { name: "Malani A.", area: "Colombo 07", text: "Ordered the Haribo and Ferrero box — came next day in perfect condition! Amazing packaging and everything tasted fresh. Will definitely reorder.", rating: 5 },
  { name: "Kasun P.", area: "Kandy", text: "Delivered all the way to Kandy in 3 days with COD. No issues at all. The Sour Patch Kids were exactly as described — super authentic!", rating: 5 },
  { name: "Dinesh M.", area: "Battaramulla", text: "Love the TikTok page updates — I always know what's new. Fast delivery and the Pringles were fresh. Highly recommend for imported snacks.", rating: 5 },
  { name: "Nethma R.", area: "Piliyandala", text: "The giant lollipops were a hit for my daughter's birthday! Super sweet, colorful and they loved it. Easy ordering process through the website.", rating: 5 },
  { name: "Shenali W.", area: "Mount Lavinia", text: "Found all my favorite childhood chocolates here. Everything was within expiry dates and tasted perfectly fresh. Great customer service too!", rating: 5 },
];

const TRUST_BADGES = [
  { Icon: Truck, title: "Islandwide COD", desc: "Pay cash on delivery", color: "text-candy-pink", hoverClass: "hover:bg-candy-pink/10 hover:border-candy-pink/30" },
  { Icon: ShieldCheck, title: "100% Genuine", desc: "Directly imported brands", color: "text-candy-purple", hoverClass: "hover:bg-candy-purple/10 hover:border-candy-purple/30" },
  { Icon: RotateCcw, title: "Easy Exchange", desc: "Hassle-free returns", color: "text-amber-500", hoverClass: "hover:bg-amber-50 hover:border-amber-200" },
  { Icon: Clock, title: "Fast Delivery", desc: "1–5 business days", color: "text-emerald-500", hoverClass: "hover:bg-emerald-50 hover:border-emerald-200" },
];

export default function HomePage() {
  const { products, loading } = useShop();
  const [activeSlide, setActiveSlide] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const timerRef = useRef(null);
  const testimonialTimerRef = useRef(null);

  // Auto-rotate hero
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveSlide((s) => (s + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const totalPages = Math.ceil(TESTIMONIALS.length / 3);
    if (totalPages > 1) {
      testimonialTimerRef.current = setInterval(() => {
        setTestimonialIdx((s) => {
          const nextPage = Math.floor(s / 3) + 1;
          return (nextPage % totalPages) * 3;
        });
      }, 5000);
    }
    return () => clearInterval(testimonialTimerRef.current);
  }, []);

  const goSlide = (idx) => {
    clearInterval(timerRef.current);
    setActiveSlide(idx);
    timerRef.current = setInterval(() => {
      setActiveSlide((s) => (s + 1) % HERO_SLIDES.length);
    }, 5000);
  };

  const goTestimonial = (idx) => {
    clearInterval(testimonialTimerRef.current);
    setTestimonialIdx(idx);
    const totalPages = Math.ceil(TESTIMONIALS.length / 3);
    if (totalPages > 1) {
      testimonialTimerRef.current = setInterval(() => {
        setTestimonialIdx((s) => {
          const nextPage = Math.floor(s / 3) + 1;
          return (nextPage % totalPages) * 3;
        });
      }, 5000);
    }
  };

  const featured = products.filter((p) => p.isFeatured && p.status === "active").slice(0, 4);
  const newArrivals = products.filter((p) => p.isNewArrival && p.status === "active").slice(0, 4);
  const onSale = products.filter((p) => p.salePrice && p.salePrice < p.basePrice && p.status === "active").slice(0, 4);

  return (
    <div className="space-y-16 pb-16 bg-gray-50/30">

      {/* ─────────── HERO BANNER ─────────── */}
      <section className="relative w-full h-[440px] md:h-[540px] overflow-hidden">
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 text-white transition-all duration-1000 flex items-center ${
              activeSlide === i ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            {/* Overlay for contrast and readability */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg} opacity-40 mix-blend-multiply`} />
            <div className="absolute inset-0 bg-black/30" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-xl space-y-4 md:space-y-6">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white font-extrabold text-xs uppercase px-4 py-1.5 rounded-full tracking-wider animate-pulse">
                  {slide.badge}
                </span>
                <h1 className={`text-4xl md:text-6xl font-black tracking-tight leading-tight ${slide.accent}`}>
                  {slide.title}
                </h1>
                <p className="text-sm md:text-lg text-white/85 font-medium leading-relaxed">{slide.sub}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href={slide.link}
                    className="inline-flex items-center gap-2 bg-white text-gray-900 font-extrabold px-6 py-3 rounded-full hover:bg-gray-50 shadow-lg transition-all hover:-translate-y-0.5 text-sm"
                  >
                    {slide.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-extrabold px-6 py-3 rounded-full hover:bg-white/30 transition-all text-sm"
                  >
                    View All
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Arrows */}
        <button
          onClick={() => goSlide((activeSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => goSlide((activeSlide + 1) % HERO_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full transition-all"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeSlide === i ? "bg-white w-8" : "bg-white/40 w-2"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ─────────── TRUST BADGES ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden">
          {TRUST_BADGES.map(({ Icon, title, desc, color, hoverClass }, i) => (
            <div key={i} className={`flex gap-3.5 items-center p-5 bg-white border border-transparent ${hoverClass} hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer relative z-10 hover:z-20`}>
              <Icon className={`h-9 w-9 ${color} flex-shrink-0`} />
              <div>
                <h5 className="font-extrabold text-gray-900 text-sm">{title}</h5>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── CATEGORY GRID ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <div className="flex items-center justify-center gap-2 text-candy-pink mb-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs uppercase font-extrabold tracking-wider">Collections</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">Browse Sweet Categories</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Explore premium imported candies, chocolates, and gourmet pantry picks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={`group relative rounded-3xl overflow-hidden h-64 md:h-80 shadow-lg hover:shadow-2xl ${cat.glow} transition-all duration-500 hover:-translate-y-2`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Background Image with zoom on hover */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: `url(${cat.image})` }}
              />

              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.from} ${cat.to} opacity-60 group-hover:opacity-70 transition-opacity duration-500`} />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />

              {/* Content slides up on hover */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                  <span className="text-3xl mb-2 block drop-shadow-lg">{cat.emoji}</span>
                  <h3 className="text-2xl font-black tracking-tight drop-shadow-md">{cat.name}</h3>
                  <p className="text-sm text-white/80 mt-1 leading-relaxed">{cat.desc}</p>

                  {/* Arrow button fades in on hover */}
                  <div className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-extrabold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-400">
                    Shop Now
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────── FEATURED PRODUCTS ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-2 text-candy-pink mb-1">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs uppercase font-extrabold tracking-wider">Top Selling Items</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">Featured Products</h2>
          </div>
          <Link
            href="/shop"
            className="text-sm font-extrabold text-candy-purple hover:text-candy-purple-dark flex items-center gap-1 hover:underline underline-offset-2"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse bg-white border border-gray-100 rounded-2xl h-80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.productId} product={p} />
            ))}
          </div>
        )}
      </section>



      {/* ─────────── TIKTOK SECTION ─────────── */}
      <section className="bg-gradient-to-br from-candy-purple via-purple-900 to-indigo-950 text-white py-16 relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-extrabold uppercase px-4 py-1.5 rounded-full tracking-wider">
              📱 Follow Us on TikTok
            </span>
            <h2 className="text-3xl md:text-4xl font-black leading-tight">
              Watch Candy World Unboxings &amp;{" "}
              <span className="text-yellow-300">Viral Sweet Reviews</span>
            </h2>
            <p className="text-sm text-purple-200 leading-relaxed max-w-lg">
              Follow{" "}
              <strong className="text-yellow-300">@_candy_world_byp</strong> on TikTok for daily product drops, candy challenges, ASMR unboxings, and exclusive sale announcements.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://www.tiktok.com/@_candy_world_byp?_r=1&_t=ZS97iZ3h5DETC"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-gray-900 font-extrabold px-6 py-3 rounded-full hover:bg-gray-100 shadow-lg transition-all hover:-translate-y-0.5 text-sm"
              >
                <Play className="h-4 w-4 fill-current" />
                View TikTok Profile
              </a>
              <a
                href="https://wa.me/94771234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-3 rounded-full shadow-lg transition-all hover:-translate-y-0.5 text-sm"
              >
                Order via WhatsApp
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              {[
                { label: "TikTok Followers", value: "15K+" },
                { label: "Products Listed", value: "120+" },
                { label: "Orders Delivered", value: "5K+" },
              ].map(({ label, value }, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-colors">
                  <div className="text-2xl font-black text-white">{value}</div>
                  <div className="text-[10px] text-cyan-200 font-bold uppercase tracking-wider mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Phone mockup */}
          <div className="hidden lg:flex justify-center">
            <div className="relative w-64 h-[480px] bg-gray-900 rounded-[42px] border-4 border-gray-700 shadow-[0_0_60px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col animate-bounce" style={{ animationDuration: '4s' }}>
              {/* Status bar */}
              <div className="bg-black text-white flex justify-between items-center px-5 py-2 text-[9px] font-bold">
                <span>9:41</span>
                <span>■■■</span>
              </div>

              {/* Video content area */}
              <div className="flex-1 bg-gradient-to-b from-purple-900 to-gray-900 relative flex flex-col justify-between p-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gradient-to-tr from-candy-pink to-candy-purple rounded-full flex items-center justify-center text-xs font-black text-white">CW</div>
                  <div>
                    <p className="text-white text-[10px] font-extrabold">@candy_world_byp</p>
                    <p className="text-gray-400 text-[9px]">🇱🇰 Colombo, Sri Lanka</p>
                  </div>
                </div>

                <div className="space-y-3 text-center py-4">
                  <span className="text-5xl">🍬</span>
                  <p className="text-white text-[11px] font-bold leading-snug">
                    &quot;Sour Patch Kids just landed! The MOST viral candy in Sri Lanka right now 🤯&quot;
                  </p>
                  <div className="flex justify-center gap-2 text-[10px] text-gray-400">
                    <span>♥ 2.4K</span>
                    <span>💬 158</span>
                    <span>↗ 412</span>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/10 pt-3 text-center">
                  <span className="text-[10px] text-purple-300">📦 COD Available Islandwide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── NEW ARRIVALS ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs uppercase font-extrabold tracking-wider">Just Landed</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">New Arrivals</h2>
          </div>
          <Link
            href="/shop"
            className="text-sm font-extrabold text-candy-purple hover:text-candy-purple-dark flex items-center gap-1"
          >
            See All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse bg-white border border-gray-100 rounded-2xl h-80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((p) => (
              <ProductCard key={p.productId} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ─────────── DISCOUNTS & SALES ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16">
        <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-candy-pink rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden hover:shadow-candy-pink/20 transition-all duration-500 group">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: "2s" }} />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 gap-6">
              <div className="text-center md:text-left text-white">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-extrabold uppercase px-4 py-1.5 rounded-full mb-4 group-hover:-translate-y-1 transition-transform">
                  <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                  Limited Time Offers
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-2">Discounts & Sales</h2>
                <p className="text-white/80 font-medium max-w-md">Grab our sweetest deals before they disappear. Exclusive discounts on your favorite treats!</p>
              </div>
              <Link
                href="/offers"
                className="bg-white text-candy-pink font-extrabold px-6 py-3 rounded-full hover:bg-gray-50 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl flex items-center gap-2 text-sm"
              >
                View All Offers
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="animate-pulse bg-white/20 rounded-2xl h-80" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {onSale.map((p) => (
                  <div key={p.productId} className="group/card hover:-translate-y-2 transition-transform duration-300">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────── TESTIMONIALS ─────────── */}
      <section className="bg-white border-y border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-2">
            <div className="flex items-center justify-center gap-2 text-candy-pink mb-2">
              <Star className="h-4 w-4 fill-candy-pink" />
              <span className="text-xs uppercase font-extrabold tracking-wider">Customer Reviews</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">What Our Customers Say</h2>
            <p className="text-sm text-gray-500">Real reviews from verified buyers across Sri Lanka</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.slice(testimonialIdx, testimonialIdx + 3).map((t, i) => (
              <div
                key={i}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <Quote className="h-6 w-6 text-candy-pink/40" />
                <p className="text-sm text-gray-600 leading-relaxed">&quot;{t.text}&quot;</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-gray-800 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {t.area}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, si) => (
                      <Star key={si} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial pagination dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(TESTIMONIALS.length / 3) }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTestimonial(i * 3)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  Math.floor(testimonialIdx / 3) === i
                    ? "bg-candy-pink w-6"
                    : "bg-gray-200 w-2"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── STORE LOCATIONS ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Map embed */}
            <div className="h-72 lg:h-auto min-h-[280px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.07782!2d79.9200!3d6.8500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTEnMDAuMCJOIDc5wrA1NSczNi4wIkU!5e0!3m2!1sen!2slk!4v1680000000000!5m2!1sen!2slk"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "280px" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Candy World Store Locations"
              />
            </div>

            {/* Info */}
            <div className="p-8 md:p-10 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-candy-pink mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs uppercase font-extrabold tracking-wider">Our Stores</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                  Visit Us In-Store 🏪
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Drop by either of our physical retail outlets to taste our candy collection, pick foundation shades, and shop without waiting for delivery!
                </p>
              </div>

              <div className="space-y-5">
                {[
                  {
                    name: "Thalawathugoda Outlet",
                    address: "124, Hokandara Road, Thalawathugoda",
                    phone: "+94 77 123 4567",
                    hours: "Mon–Sat: 9 AM – 8 PM · Sun: 10 AM – 6 PM",
                    color: "border-candy-pink",
                  },
                  {
                    name: "Colombo 03 Outlet",
                    address: "34/2, Flower Road, Colombo 03",
                    phone: "+94 77 987 6543",
                    hours: "Mon–Sat: 10 AM – 9 PM · Sun: 11 AM – 7 PM",
                    color: "border-candy-purple",
                  },
                ].map((store, i) => (
                  <div key={i} className={`border-l-4 ${store.color} pl-4 py-1`}>
                    <h5 className="font-extrabold text-gray-800 text-sm">{store.name}</h5>
                    <p className="text-xs text-gray-500 mt-0.5">{store.address}</p>
                    <p className="text-xs text-gray-500">{store.hours}</p>
                    <a
                      href={`tel:${store.phone}`}
                      className="text-xs text-candy-purple font-bold mt-1 flex items-center gap-1 hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {store.phone}
                    </a>
                  </div>
                ))}
              </div>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-candy-purple hover:bg-candy-purple-dark text-white font-extrabold px-6 py-2.5 rounded-full text-sm transition-all shadow-md"
              >
                Full Store Details
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
