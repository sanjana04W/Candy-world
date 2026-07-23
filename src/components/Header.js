"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, Search, Menu, X, ChevronDown, Sparkles, Tag, MapPin, User, LogOut } from "lucide-react";

const CATEGORY_EMOJIS = {
  candy: "🍬",
  chocolate: "🍫",
  gourmet: "🫙",
};

export default function Header() {
  const { getCartItemCount, categories } = useShop();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const cartCount = getCartItemCount();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchExpanded(false);
      setMobileMenuOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShopDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShopDropdownOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const mainCategories = categories.filter((c) => c.parentId === null && c.status === "active");
  const subCategoryMap = {};
  mainCategories.forEach((cat) => {
    subCategoryMap[cat.categoryId] = categories.filter(
      (c) => c.parentId === cat.categoryId && c.status === "active"
    );
  });

  const navLinkClass = (href) =>
    `text-sm font-semibold transition-colors ${
      pathname === href ? "text-candy-pink" : "text-gray-700 hover:text-candy-pink"
    }`;

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-candy-purple via-candy-pink to-candy-purple-dark text-white text-center text-xs font-bold py-2 px-4">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "3s" }} />
          🚀 Islandwide COD Delivery · Free delivery on orders above LKR 5,000 · New imports weekly!
          <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "3s" }} />
        </span>
      </div>

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-18 gap-4">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <span className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-candy-pink to-candy-purple text-transparent bg-clip-text group-hover:opacity-90 transition-opacity">
                🍬 CANDY WORLD
              </span>
            </Link>

            {/* Desktop Search & Nav Group */}
            <div className="hidden md:flex flex-1 items-center gap-6">
              <div className="flex-1 max-w-sm lg:max-w-md">
                <form onSubmit={handleSearchSubmit} className="relative w-full">
                  <input
                    type="text"
                    id="header-search"
                    placeholder="Search candy, chocolate, gourmet..."
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-full px-5 py-2.5 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple/50 focus:border-candy-purple focus:bg-white transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="absolute left-3.5 top-2.5 text-gray-400 hover:text-candy-pink transition-colors">
                    <Search className="h-5 w-5" />
                  </button>
                </form>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex space-x-5 items-center">
                <Link href="/" className={navLinkClass("/")}>Home</Link>
                {/* Shop dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                    className={`flex items-center gap-1 text-sm font-semibold transition-colors ${shopDropdownOpen ? "text-candy-pink" : "text-gray-700 hover:text-candy-pink"}`}
                  >
                    Shop All
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${shopDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Mega dropdown */}
                  {shopDropdownOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[520px] bg-white border border-gray-100 rounded-2xl shadow-2xl p-5 grid grid-cols-2 gap-5 z-50">
                      {mainCategories.map((cat) => (
                        <div key={cat.categoryId}>
                          <Link
                            href={`/category/${cat.slug}`}
                            onClick={() => setShopDropdownOpen(false)}
                            className="flex items-center gap-2 font-extrabold text-gray-800 hover:text-candy-pink text-sm mb-2 pb-1.5 border-b border-gray-50 transition-colors"
                          >
                            <span className="text-lg">{CATEGORY_EMOJIS[cat.categoryId] || "🛍️"}</span>
                            {cat.name}
                          </Link>
                          {subCategoryMap[cat.categoryId]?.map((sub) => (
                            <Link
                              key={sub.categoryId}
                              href={`/category/${cat.slug}?sub=${sub.categoryId}`}
                              onClick={() => setShopDropdownOpen(false)}
                              className="block text-xs font-medium text-gray-500 hover:text-candy-pink py-0.5 pl-6 transition-colors"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      ))}
                      <div className="col-span-2 border-t border-gray-50 pt-3">
                        <Link
                          href="/shop"
                          onClick={() => setShopDropdownOpen(false)}
                          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-candy-purple hover:text-candy-purple-dark"
                        >
                          View All Products →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/offers" className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" />
                  Offers
                </Link>
                <Link href="/about" className={navLinkClass("/about")}>About</Link>
                <Link href="/contact" className={navLinkClass("/contact")}>Contact</Link>
              </nav>
            </div>

            {/* Icons group (Cart, Login) pushed to right side */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              {/* Mobile search toggle */}
              <button
                onClick={() => setSearchExpanded(!searchExpanded)}
                className="md:hidden p-2 rounded-full text-gray-600 hover:text-candy-pink hover:bg-gray-50 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>


              {/* Cart */}
              <Link
                href="/cart"
                id="cart-icon-button"
                className="relative p-2 rounded-full text-gray-600 hover:text-candy-pink hover:bg-gray-50 transition-colors"
                aria-label={`Cart with ${cartCount} items`}
              >
                <ShoppingBag className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-candy-pink text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

              {/* User Session Profile / Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-gray-50 border border-gray-100 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-candy-purple to-candy-pink text-white flex items-center justify-center text-xs font-black uppercase shadow-xs">
                        {user.name.charAt(0)}
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-fade-in">
                        <div className="px-4 py-2 border-b border-gray-50">
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Signed In As</p>
                          <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
                        </div>
                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-50"
                        >
                          <User className="h-3.5 w-3.5" />
                          View Profile
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Log Out
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={`/login?redirect=${encodeURIComponent(pathname)}`}
                    className="p-2 rounded-full text-gray-600 hover:text-candy-pink hover:bg-gray-50 transition-colors flex items-center gap-1"
                    title="Sign In"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline text-xs font-bold pl-0.5">Sign In</span>
                  </Link>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-full text-gray-600 hover:text-candy-pink hover:bg-gray-50 transition-colors"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Expandable Search */}
        {searchExpanded && (
          <div className="md:hidden border-t border-gray-100 px-4 py-3 bg-white">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                autoFocus
                type="text"
                placeholder="Search sweets, chocolates, gourmet..."
                className="w-full bg-gray-50 border border-gray-200 rounded-full px-5 py-2.5 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
            </form>
          </div>
        )}
      </header>

      {/* ── MOBILE BOTTOM-SHEET NAV ── */}
      {/* Backdrop */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Bottom Sheet — slides up from 50vh */}
      <div
        className={`lg:hidden fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl overflow-y-auto transition-transform duration-300 ease-out ${
          mobileMenuOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ top: "50vh", maxHeight: "50vh" }}
      >
        {/* Drag handle pill */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Sheet content */}
        <div className="px-4 py-3 space-y-1 pb-8">
          <Link href="/" className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-gray-800 hover:bg-candy-purple/5 hover:text-candy-pink transition-all text-sm">
            🏠 Home
          </Link>
          <Link href="/shop" className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-gray-800 hover:bg-candy-purple/5 hover:text-candy-pink transition-all text-sm">
            🛍️ Shop All Products
          </Link>
          {mainCategories.map((cat) => (
            <Link
              key={cat.categoryId}
              href={`/category/${cat.slug}`}
              className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-gray-800 hover:bg-candy-purple/5 hover:text-candy-pink transition-all text-sm capitalize"
            >
              {CATEGORY_EMOJIS[cat.categoryId] || "🛍️"} {cat.name}
            </Link>
          ))}
          <Link href="/offers" className="flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-rose-500 hover:bg-rose-50 transition-all text-sm">
            <Tag className="h-4 w-4" /> Offers &amp; Sale
          </Link>
          <Link href="/about" className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-gray-800 hover:bg-candy-purple/5 hover:text-candy-pink transition-all text-sm">
            ℹ️ About Us
          </Link>
          <Link href="/contact" className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-gray-800 hover:bg-candy-purple/5 hover:text-candy-pink transition-all text-sm">
            📍 Contact &amp; Stores
          </Link>

          {/* Auth Section */}
          <div className="border-t border-gray-100 pt-2 mt-1 space-y-1">
            {user ? (
              <div className="px-3 py-3 rounded-xl bg-gray-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-candy-purple to-candy-pink text-white flex items-center justify-center text-xs font-black uppercase shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black uppercase text-gray-400 leading-tight">Signed In</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href="/profile" className="text-xs font-bold text-candy-purple bg-candy-purple/10 px-3 py-1.5 rounded-lg hover:bg-candy-purple/20 transition-colors">
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href={`/login?redirect=${encodeURIComponent(pathname)}`}
                className="flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-candy-purple hover:bg-candy-purple/5 hover:text-candy-pink transition-all text-sm"
              >
                <User className="h-4 w-4" /> Sign In / Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
