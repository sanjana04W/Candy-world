import React from "react";
import Link from "next/link";
import { Sparkles, MapPin, CheckCircle, ShieldCheck, Truck, Star, ArrowRight, Package, Heart, Globe } from "lucide-react";

export const metadata = {
  title: "About Us | Candy World Sri Lanka",
  description: "Candy World is Sri Lanka's leading importer of viral candies, premium chocolates, cosmetics, and gourmet groceries. Learn our brand story, values, and where to find us.",
};

const VALUES = [
  { Icon: ShieldCheck, title: "100% Authenticity", desc: "Every item is sourced directly from certified international distributors and hand-inspected before listing.", color: "text-candy-purple bg-candy-purple/10" },
  { Icon: Globe, title: "Global Imports", desc: "We source from the US, UK, Europe, Japan, and Korea — bringing you items that aren't available elsewhere in Sri Lanka.", color: "text-sky-600 bg-sky-50" },
  { Icon: Truck, title: "Islandwide COD", desc: "We deliver to every corner of Sri Lanka with Cash on Delivery — no prepayment required.", color: "text-emerald-600 bg-emerald-50" },
  { Icon: Heart, title: "Community First", desc: "Our TikTok family drives everything. We listen to trends, respond to requests, and stock what our customers love.", color: "text-candy-pink bg-candy-pink/10" },
];

const MILESTONES = [
  { year: "2020", label: "Brand Founded", desc: "Candy World began as a social media page selling imported sweets via TikTok DMs." },
  { year: "2021", label: "First Physical Store", desc: "Opened our first walk-in candy retail store in Battaramulla, Colombo." },
  { year: "2022", label: "Cosmetics Line Launch", desc: "Expanded to include NMRA-compliant imported cosmetics — CeraVe, Maybelline, and more." },
  { year: "2023", label: "Second Outlet + E-Commerce", desc: "Opened Colombo 03 outlet and launched the online ordering platform for islandwide delivery." },
];

const TEAM = [
  { name: "Prasad B.", role: "Founder & Owner", emoji: "👨‍💼", desc: "Candy enthusiast turned entrepreneur. Imports the best treats and leads the brand vision." },
  { name: "Nimasha R.", role: "Operations Manager", emoji: "👩‍💼", desc: "Keeps everything running smoothly — inventory, orders, and logistics." },
  { name: "Dulaj M.", role: "TikTok & Social Media", emoji: "📱", desc: "The creative brain behind our viral content and TikTok community growth." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-candy-pink via-rose-500 to-candy-purple text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 select-none pointer-events-none">
          {["🍬", "🍫", "💄", "🫙", "✨", "🌟"].map((e, i) => (
            <span key={i} className="absolute text-5xl" style={{ left: `${8 + i * 16}%`, top: `${20 + (i % 2) * 50}%`, transform: `rotate(${i * 25}deg)` }}>{e}</span>
          ))}
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-extrabold uppercase px-4 py-1.5 rounded-full tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Our Brand Story
          </span>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            Sri Lanka&apos;s Sweetest<br />
            <span className="text-yellow-300">Import Destination</span>
          </h1>
          <p className="text-sm md:text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
            Candy World is Colombo&apos;s leading multi-category importer — bringing the world&apos;s most viral candies, premium chocolates, certified cosmetics, and gourmet groceries directly to your doorstep.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "120+", label: "Products Listed" },
            { value: "5,000+", label: "Orders Delivered" },
            { value: "15K+", label: "TikTok Followers" },
            { value: "2", label: "Physical Stores" },
          ].map(({ value, label }, i) => (
            <div key={i} className="space-y-1">
              <p className="text-3xl font-black text-candy-pink">{value}</p>
              <p className="text-xs text-gray-500 font-semibold">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* Our Story */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-candy-pink">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs uppercase font-extrabold tracking-wider">Where It Started</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
              Born from a Passion for Sweet Surprises
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Candy World was founded in Colombo as a dream to bring hard-to-find international treats to local candy lovers. What began as a small TikTok page sharing imported sweet hauls quickly evolved into one of Sri Lanka&apos;s most recognised confectionery brands.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              By partnering directly with certified global suppliers, we guarantee that every food item is authentic, fresh, and hand-inspected — while our cosmetic imports strictly comply with Sri Lanka&apos;s NMRA quality standards.
            </p>
            <div className="space-y-2">
              {["Direct-import partnerships with certified distributors", "NMRA-compliant cosmetic imports", "Real-time inventory managed centrally", "Islandwide COD — no card required"].map((point, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
                  {point}
                </div>
              ))}
            </div>
          </div>

          {/* Brand card */}
          <div className="relative">
            <div className="bg-gradient-to-br from-candy-pink to-candy-purple rounded-3xl p-8 text-white shadow-2xl space-y-6">
              <div className="text-4xl font-black tracking-tight">🍬 Candy World</div>
              <p className="text-sm text-purple-100 leading-relaxed">
                &quot;Our mission is simple — make the world&apos;s best-tasting imports accessible to every Sri Lankan, delivered safely to their door with the warmth of a local brand.&quot;
              </p>
              <div className="border-t border-white/20 pt-4 grid grid-cols-2 gap-3 text-xs font-bold">
                <div className="bg-white/10 rounded-xl p-3">📦 50+ Candy Lines</div>
                <div className="bg-white/10 rounded-xl p-3">🌍 5 Import Countries</div>
                <div className="bg-white/10 rounded-xl p-3">💄 Cosmetics NMRA OK</div>
                <div className="bg-white/10 rounded-xl p-3">🚀 COD Islandwide</div>
              </div>
            </div>
            {/* Floating emoji */}
            <div className="absolute -top-4 -right-4 text-5xl animate-bounce" style={{ animationDuration: "2.5s" }}>✨</div>
          </div>
        </section>

        {/* Our Values */}
        <section>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 text-candy-purple mb-2">
              <Star className="h-4 w-4" />
              <span className="text-xs uppercase font-extrabold tracking-wider">What We Stand For</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ Icon, title, desc, color }, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-3">
                <div className={`inline-flex p-3 rounded-xl ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 text-candy-pink mb-2">
              <Package className="h-4 w-4" />
              <span className="text-xs uppercase font-extrabold tracking-wider">Our Journey</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">How We Grew</h2>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2 hidden md:block" />
            <div className="space-y-8 md:space-y-0">
              {MILESTONES.map(({ year, label, desc }, i) => (
                <div key={i} className={`flex items-start gap-6 md:gap-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className={`hidden md:block w-5/12 ${i % 2 === 0 ? "text-right pr-10" : "text-left pl-10"}`}>
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm inline-block text-left">
                      <p className="text-xs font-extrabold text-candy-pink uppercase tracking-wider mb-1">{year}</p>
                      <h4 className="font-extrabold text-gray-800 text-sm mb-1">{label}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                  {/* Center dot */}
                  <div className="hidden md:flex w-2/12 justify-center">
                    <div className="relative z-10 w-10 h-10 bg-gradient-to-br from-candy-pink to-candy-purple rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg">
                      {year.slice(2)}
                    </div>
                  </div>
                  <div className="hidden md:block w-5/12" />

                  {/* Mobile version */}
                  <div className="md:hidden flex gap-4 items-start bg-white border border-gray-100 rounded-2xl p-5 shadow-sm w-full">
                    <div className="w-12 h-12 bg-gradient-to-br from-candy-pink to-candy-purple rounded-full flex items-center justify-center text-white text-xs font-black shadow-md flex-shrink-0">
                      {year}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-800 text-sm mb-1">{label}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 text-candy-purple mb-2">
              <Heart className="h-4 w-4" />
              <span className="text-xs uppercase font-extrabold tracking-wider">The People</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">Meet Our Team</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEAM.map(({ name, role, emoji, desc }, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-candy-purple/30 hover:bg-candy-purple/5 hover:-translate-y-1 transition-all duration-300 text-center space-y-3 cursor-pointer group">
                <div className="w-16 h-16 bg-gradient-to-br from-candy-pink/20 to-candy-purple/20 rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm">
                  {emoji}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900">{name}</h3>
                  <p className="text-xs font-bold text-candy-purple uppercase tracking-wider mt-0.5">{role}</p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Locations */}
        <section>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 text-candy-pink mb-2">
              <MapPin className="h-4 w-4" />
              <span className="text-xs uppercase font-extrabold tracking-wider">Visit Us</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">Our Physical Stores</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { name: "Thalawathugoda Outlet", address: "124, Hokandara Road, Thalawathugoda, Sri Lanka", hours: "Mon–Sat 9:00 AM – 8:00 PM · Sun 10:00 AM – 6:00 PM", color: "border-candy-pink", badge: "🏪" },
              { name: "Colombo 03 Outlet", address: "34/2, Flower Road, Colombo 03, Sri Lanka", hours: "Mon–Sat 10:00 AM – 9:00 PM · Sun 11:00 AM – 7:00 PM", color: "border-candy-purple", badge: "🏬" },
            ].map((store, i) => (
              <div key={i} className={`bg-white border-l-4 ${store.color} border-y border-r border-gray-100 hover:border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer space-y-3`}>
                <div className="text-2xl">{store.badge}</div>
                <h4 className="font-extrabold text-gray-900">{store.name}</h4>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-start gap-1.5"><MapPin className="h-3.5 w-3.5 text-candy-pink mt-0.5 flex-shrink-0" />{store.address}</div>
                  <div className="flex items-start gap-1.5"><span className="text-amber-500">🕐</span>{store.hours}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-candy-purple to-candy-purple-dark rounded-3xl p-10 text-center text-white space-y-5 shadow-2xl">
          <h2 className="text-3xl font-black">Ready to Try Candy World?</h2>
          <p className="text-sm text-purple-200 max-w-md mx-auto">Browse our full catalog of imported candy, chocolates, cosmetics and gourmet items. Delivered islandwide with COD.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-white text-candy-purple font-extrabold px-6 py-3 rounded-full hover:bg-gray-50 shadow-md transition-all hover:-translate-y-0.5 text-sm"
            >
              Shop All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-extrabold px-6 py-3 rounded-full hover:bg-white/30 transition-all text-sm"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
