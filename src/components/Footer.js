"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone, ArrowRight, ChevronRight, Sparkles } from "lucide-react";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "All Products" },
  { href: "/offers", label: "Deals & Offers" },
  { href: "/cart", label: "Shopping Cart" },
  { href: "/checkout", label: "Checkout" },
];

const CATEGORIES = [
  { href: "/category/candy", label: "🍬 Candy", desc: "Gummy, sour & viral sweets" },
  { href: "/category/chocolate", label: "🍫 Chocolate", desc: "Bars, truffles & gift boxes" },
  { href: "/category/gourmet", label: "🫙 Gourmet", desc: "Snacks, crisps & condiments" },
];

const ABOUT_LINKS = [
  { href: "/about", label: "Our Story" },
  { href: "/about#team", label: "Meet the Team" },
  { href: "/about#stores", label: "Our Stores" },
  { href: "/about#journey", label: "How We Grew" },
];

const SOCIAL_LINKS = [
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@_candy_world_byp?_r=1&_t=ZS97iZ3h5DETC",
    color: "hover:bg-black",
    icon: (
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.79 1.53V6.77a4.85 4.85 0 01-1.02-.08z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/94771234567",
    color: "hover:bg-emerald-500",
    icon: (
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M11.972 0C5.362 0 0 5.362 0 11.972c0 2.098.548 4.07 1.504 5.776L0 24l6.406-1.504a11.935 11.935 0 005.566 1.38c6.61 0 11.972-5.362 11.972-11.972C23.944 5.362 18.582 0 11.972 0zm0 21.87a9.88 9.88 0 01-5.043-1.38l-.36-.214-3.74.98.999-3.65-.237-.376a9.858 9.858 0 01-1.508-5.276c0-5.451 4.438-9.888 9.889-9.888 5.451 0 9.889 4.437 9.889 9.888 0 5.451-4.438 9.888-9.889 9.888z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    color: "hover:bg-blue-600",
    icon: (
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
        <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h3V1H13c-2.8 0-5 2.2-5 5v2z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    color: "hover:bg-gradient-to-br hover:from-pink-500 hover:to-orange-400",
    icon: (
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
];

function FooterLink({ href, children }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-all duration-200"
      >
        <ChevronRight className="h-3 w-3 text-candy-pink opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0" />
        <span className="group-hover:translate-x-1 transition-transform duration-200">{children}</span>
      </Link>
    </li>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-gray-950 text-gray-400 relative overflow-hidden">

      {/* Subtle background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-candy-pink/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-candy-purple/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top divider with gradient */}
      <div className="h-px bg-gradient-to-r from-transparent via-candy-pink/40 to-transparent" />

      {/* Main footer content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* ── Brand Column (2 cols wide) ── */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-block group">
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-candy-pink to-candy-purple text-transparent bg-clip-text group-hover:from-candy-purple group-hover:to-candy-pink transition-all duration-500">
                🍬 CANDY WORLD
              </span>
            </Link>

            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Sri Lanka&apos;s leading importer of viral candies, premium chocolates, and gourmet groceries — delivered islandwide with COD.
            </p>

            {/* COD Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-2.5 text-xs font-bold text-emerald-400">
              🚀 Islandwide Cash on Delivery
            </div>

            {/* Social icons */}
            <div>
              <p className="text-[10px] uppercase font-extrabold tracking-widest text-gray-600 mb-3">Follow Us</p>
              <div className="flex gap-2.5">
                {SOCIAL_LINKS.map(({ label, href, color, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`p-2.5 bg-gray-800 ${color} text-gray-400 hover:text-white rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div className="space-y-5">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-widest flex items-center gap-2">
              <span className="h-px w-4 bg-candy-pink inline-block" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map(({ href, label }) => (
                <FooterLink key={href} href={href}>{label}</FooterLink>
              ))}
            </ul>
          </div>

          {/* ── Categories ── */}
          <div className="space-y-5">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-widest flex items-center gap-2">
              <span className="h-px w-4 bg-candy-purple inline-block" />
              Categories
            </h4>
            <ul className="space-y-4">
              {CATEGORIES.map(({ href, label, desc }) => (
                <li key={href}>
                  <Link href={href} className="group block">
                    <span className="text-sm text-gray-300 font-semibold group-hover:text-white transition-colors duration-200 flex items-center gap-1">
                      {label}
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                    </span>
                    <span className="text-xs text-gray-600 group-hover:text-gray-400 transition-colors duration-200">{desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── About & Contact ── */}
          <div className="space-y-8">
            {/* About */}
            <div className="space-y-5">
              <h4 className="font-extrabold text-white text-sm uppercase tracking-widest flex items-center gap-2">
                <span className="h-px w-4 bg-amber-400 inline-block" />
                About Us
              </h4>
              <ul className="space-y-3">
                {ABOUT_LINKS.map(({ href, label }) => (
                  <FooterLink key={href} href={href}>{label}</FooterLink>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-white text-sm uppercase tracking-widest flex items-center gap-2">
                <span className="h-px w-4 bg-emerald-400 inline-block" />
                Contact
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="tel:+94771234567" className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors group">
                    <div className="p-1.5 bg-gray-800 group-hover:bg-candy-pink/20 rounded-lg transition-colors">
                      <Phone className="h-3.5 w-3.5 text-candy-pink" />
                    </div>
                    +94 77 123 4567
                  </a>
                </li>
                <li>
                  <a href="mailto:candyworld.lk23@gmail.com" className="flex items-start gap-2.5 text-gray-400 hover:text-white transition-colors group">
                    <div className="p-1.5 bg-gray-800 group-hover:bg-candy-purple/20 rounded-lg transition-colors flex-shrink-0 mt-0.5">
                      <Mail className="h-3.5 w-3.5 text-candy-purple" />
                    </div>
                    candyworld.lk23@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-2.5 text-gray-400">
                  <div className="p-1.5 bg-gray-800 rounded-lg flex-shrink-0 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-candy-pink" />
                  </div>
                  Thalawathugoda &amp; Colombo 03, Sri Lanka
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Newsletter bar */}
        <div className="mt-14 pt-10 border-t border-gray-800/60">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-white font-extrabold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-candy-pink" />
                Stay in the Sweet Loop
              </p>
              <p className="text-xs text-gray-500 mt-1">Get early access to new drops, exclusive discounts & viral candy alerts.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              {subscribed ? (
                <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-6 py-2.5 text-sm font-bold">
                  ✅ You&apos;re subscribed!
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 md:w-64 bg-gray-800/80 border border-gray-700 focus:border-candy-pink/60 focus:outline-none text-white text-sm rounded-full px-5 py-2.5 placeholder:text-gray-600 transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-candy-pink to-candy-purple text-white font-extrabold text-sm px-5 py-2.5 rounded-full hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shadow-lg"
                  >
                    Subscribe
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Candy World Sri Lanka. All Rights Reserved.</p>
          <div className="flex gap-5">
            <Link href="/about" className="hover:text-gray-300 transition-colors">About</Link>
            <Link href="/contact" className="hover:text-gray-300 transition-colors">Contact</Link>
            <Link href="/shop" className="hover:text-gray-300 transition-colors">Shop</Link>
            <Link href="/offers" className="hover:text-candy-pink transition-colors">Offers</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
