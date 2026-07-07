import React from "react";
import Link from "next/link";
import { Mail, MapPin, Phone, ExternalLink } from "lucide-react";

const SHOP_LINKS = [
  { href: "/category/candy", label: "🍬 Candy" },
  { href: "/category/chocolate", label: "🍫 Chocolate" },
  { href: "/category/gourmet", label: "🫙 Gourmet" },
  { href: "/offers", label: "🔥 Offers & Sale" },
  { href: "/shop", label: "View All Products" },
];

const INFO_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact & Stores" },
  { href: "/offers", label: "Deals & Promotions" },
  { href: "/cart", label: "Shopping Cart" },
  { href: "/checkout", label: "Checkout" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1 space-y-5">
            <Link href="/" className="inline-block">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-candy-pink to-candy-purple text-transparent bg-clip-text">
                🍬 CANDY WORLD
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Sri Lanka&apos;s leading importer of viral candies, premium chocolates, and gourmet groceries — delivered islandwide with COD.
            </p>

            {/* Social icons */}
            <div className="flex gap-2.5 pt-1">
              <a
                href="https://www.tiktok.com/@_candy_world_byp?_r=1&_t=ZS97iZ3h5DETC"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 bg-gray-800 hover:bg-candy-pink text-gray-400 hover:text-white rounded-xl transition-all"
                aria-label="TikTok"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.79 1.53V6.77a4.85 4.85 0 01-1.02-.08z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/94771234567"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 bg-gray-800 hover:bg-emerald-500 text-gray-400 hover:text-white rounded-xl transition-all"
                aria-label="WhatsApp"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M11.972 0C5.362 0 0 5.362 0 11.972c0 2.098.548 4.07 1.504 5.776L0 24l6.406-1.504a11.935 11.935 0 005.566 1.38c6.61 0 11.972-5.362 11.972-11.972C23.944 5.362 18.582 0 11.972 0zm0 21.87a9.88 9.88 0 01-5.043-1.38l-.36-.214-3.74.98.999-3.65-.237-.376a9.858 9.858 0 01-1.508-5.276c0-5.451 4.438-9.888 9.889-9.888 5.451 0 9.889 4.437 9.889 9.888 0 5.451-4.438 9.888-9.889 9.888z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 bg-gray-800 hover:bg-blue-600 text-gray-400 hover:text-white rounded-xl transition-all"
                aria-label="Facebook"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h3V1H13c-2.8 0-5 2.2-5 5v2z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 bg-gray-800 hover:bg-gradient-to-br hover:from-pink-500 hover:to-orange-400 text-gray-400 hover:text-white rounded-xl transition-all"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 group">
                    <span>{label}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              {INFO_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5 text-gray-500 hover:text-white transition-colors">
                <Phone className="h-4 w-4 text-candy-pink flex-shrink-0" />
                <a href="tel:+94771234567">+94 77 123 4567</a>
              </li>
              <li className="flex items-center gap-2.5 text-gray-500 hover:text-white transition-colors">
                <Mail className="h-4 w-4 text-candy-purple flex-shrink-0" />
                <a href="mailto:candyworld.lk23@gmail.com" className="break-all">
                  candyworld.lk23@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-gray-500">
                <MapPin className="h-4 w-4 text-candy-pink flex-shrink-0 mt-0.5" />
                <span>Thalawathugoda &amp; Colombo 03, Sri Lanka</span>
              </li>
            </ul>

            {/* COD badge */}
            <div className="mt-2 inline-flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400">
              🚀 Islandwide Cash on Delivery
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Candy World Sri Lanka. All Rights Reserved.</p>
          <div className="flex gap-5">
            <Link href="/about" className="hover:text-gray-400 transition-colors">About</Link>
            <Link href="/contact" className="hover:text-gray-400 transition-colors">Contact</Link>
            <Link href="/shop" className="hover:text-gray-400 transition-colors">Shop</Link>
            <Link href="/offers" className="hover:text-candy-pink transition-colors">Offers</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
