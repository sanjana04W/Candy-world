"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal, Search, RotateCcw, Tag, Sparkles } from "lucide-react";

const CATEGORY_EMOJIS = { candy: "🍬", chocolate: "🍫", giftbox: "💄", gourmet: "🫙" };

function ShopContent() {
  const { products, categories, loading } = useShop();
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedCategory = searchParams.get("category") || "all";
  const searchFilter = searchParams.get("search") || "";
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState("newest");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchFilter);

  const parentCategories = categories.filter((c) => c.parentId === null && c.status === "active");
  const subCategoryMap = {};
  parentCategories.forEach((cat) => {
    subCategoryMap[cat.categoryId] = categories.filter(
      (c) => c.parentId === cat.categoryId && c.status === "active"
    );
  });

  const handleResetFilters = () => {
    router.push("/shop");
    setMaxPrice(10000);
    setSortBy("newest");
    setOnSaleOnly(false);
    setInStockOnly(false);
    setLocalSearch("");
  };

  const handleCategorySelect = (catId) => {
    const params = new URLSearchParams(searchParams);
    if (catId === "all") params.delete("category");
    else params.set("category", catId);
    router.push(`/shop?${params.toString()}`);
  };

  const handleLocalSearch = (e) => {
    e.preventDefault();
    if (localSearch.trim()) {
      router.push(`/shop?search=${encodeURIComponent(localSearch.trim())}`);
    } else {
      router.push("/shop");
    }
  };

  // Sync local search with URL
  useEffect(() => {
    setLocalSearch(searchFilter);
  }, [searchFilter]);

  const filteredProducts = products.filter((prod) => {
    if (prod.status !== "active") return false;
    if (prod.stockStatus === "hidden") return false;   // Draft — hidden from storefront
    if (selectedCategory !== "all" && prod.categoryId !== selectedCategory) return false;
    if (searchFilter && !prod.name.toLowerCase().includes(searchFilter.toLowerCase()) &&
        !prod.description.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    const currentPrice = prod.salePrice || prod.basePrice;
    if (currentPrice > maxPrice) return false;
    if (onSaleOnly && !(prod.salePrice && prod.salePrice < prod.basePrice)) return false;
    if (inStockOnly && prod.stockStatus === "outofstock") return false;
    return true;
  });


  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.salePrice || a.basePrice;
    const priceB = b.salePrice || b.basePrice;
    if (sortBy === "price-asc") return priceA - priceB;
    if (sortBy === "price-desc") return priceB - priceA;
    if (sortBy === "sale") return (b.salePrice ? 1 : 0) - (a.salePrice ? 1 : 0);
    return b.isNewArrival - a.isNewArrival;
  });

  const activeFilterCount = [
    selectedCategory !== "all",
    maxPrice < 10000,
    onSaleOnly,
    inStockOnly,
    !!searchFilter
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                {selectedCategory === "all"
                  ? "🛍️ All Products"
                  : `${CATEGORY_EMOJIS[selectedCategory] || "🛍️"} ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {loading ? "Loading..." : `${sortedProducts.length} product${sortedProducts.length !== 1 ? "s" : ""} found`}
                {searchFilter && <span className="text-candy-pink font-bold"> · Search: &quot;{searchFilter}&quot;</span>}
              </p>
            </div>

            {/* Inline search */}
            <form onSubmit={handleLocalSearch} className="relative flex-shrink-0 w-full sm:w-72">
              <input
                type="text"
                id="shop-search"
                placeholder="Search products..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple/40 focus:border-candy-purple transition-all"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Mobile filter toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 shadow-sm"
            >
              <SlidersHorizontal className="h-4 w-4 text-candy-pink" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-candy-pink text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Sidebar Filters */}
          <aside className={`w-full md:w-56 flex-shrink-0 space-y-6 ${sidebarOpen ? "block" : "hidden md:block"}`}>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4 w-4 text-candy-pink" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-candy-pink text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center ml-0.5">
                      {activeFilterCount}
                    </span>
                  )}
                </span>
                {activeFilterCount > 0 && (
                  <button onClick={handleResetFilters} className="text-xs text-candy-purple font-bold hover:underline flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-gray-700 text-xs uppercase tracking-wider">Category</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => handleCategorySelect("all")}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      selectedCategory === "all" ? "bg-candy-purple text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    All Products
                  </button>
                  {parentCategories.map((cat) => (
                    <div key={cat.categoryId}>
                      <button
                        onClick={() => handleCategorySelect(cat.categoryId)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold capitalize transition-all flex items-center gap-2 ${
                          selectedCategory === cat.categoryId ? "bg-candy-purple text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span>{CATEGORY_EMOJIS[cat.categoryId] || "🛍️"}</span>
                        {cat.name}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-gray-700 text-xs uppercase tracking-wider">Max Price</h4>
                <input
                  type="range"
                  min="300"
                  max="10000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-candy-purple"
                />
                <div className="flex justify-between text-xs font-bold text-gray-400">
                  <span>LKR 300</span>
                  <span className="text-candy-pink font-black">LKR {maxPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Quick toggles */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-gray-700 text-xs uppercase tracking-wider">Quick Filters</h4>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => setOnSaleOnly(!onSaleOnly)}
                    className={`w-9 h-5 rounded-full transition-all relative ${onSaleOnly ? "bg-rose-500" : "bg-gray-200"}`}
                  >
                    <div className={`absolute top-0.5 h-4 w-4 bg-white rounded-full shadow transition-all ${onSaleOnly ? "left-4" : "left-0.5"}`} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5 text-rose-500" />
                    On Sale Only
                  </span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`w-9 h-5 rounded-full transition-all relative ${inStockOnly ? "bg-emerald-500" : "bg-gray-200"}`}
                  >
                    <div className={`absolute top-0.5 h-4 w-4 bg-white rounded-full shadow transition-all ${inStockOnly ? "left-4" : "left-0.5"}`} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                    In Stock Only
                  </span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-grow space-y-5 min-w-0">
            {/* Sort bar */}
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500 font-medium">
                <span className="font-bold text-gray-700">{sortedProducts.length}</span> results
              </p>
              <select
                value={sortBy}
                id="sort-select"
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-candy-purple/40 shadow-sm"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="sale">On Sale First</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="animate-pulse bg-white border border-gray-100 rounded-2xl h-80" />
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl space-y-4">
                <span className="text-4xl">🔍</span>
                <h3 className="font-extrabold text-gray-900 text-lg">No Products Found</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  Try adjusting your filters, price range, or search term.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 bg-candy-purple hover:bg-candy-purple-dark text-white font-extrabold text-xs px-6 py-2.5 rounded-full transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-candy-pink border-t-transparent rounded-full" />
          <p className="text-sm text-gray-500 font-medium">Loading catalog...</p>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
