"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import ProductCard from "@/components/ProductCard";
import { ArrowLeft } from "lucide-react";

function CategoryContent() {
  const { slug } = useParams();
  const { products, categories, loading } = useShop();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeSubCat, setActiveSubCat] = useState("all");

  // Resolve parent category
  const parentCategory = categories.find(
    (c) => c.slug === slug && c.parentId === null && c.status === "active"
  );

  // Load sub-categories
  const subCategories = categories.filter(
    (c) => parentCategory && c.parentId === parentCategory.categoryId && c.status === "active"
  );

  // Set default active tab or use sub param from URL
  useEffect(() => {
    const subParam = searchParams.get("sub");
    if (subParam) {
      setActiveSubCat(subParam);
    } else {
      setActiveSubCat("all");
    }
  }, [slug, searchParams]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-candy-pink border-t-transparent rounded-full mb-2"></div>
        <p className="text-sm text-gray-500">Loading category menu...</p>
      </div>
    );
  }

  if (!parentCategory) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <span className="text-4xl">🍬</span>
        <h2 className="text-2xl font-black text-gray-900">Category Not Found</h2>
        <p className="text-sm text-gray-500">We couldn&apos;t find any active collection under this name.</p>
        <button onClick={() => router.push("/shop")} className="bg-candy-purple text-white px-6 py-2.5 rounded-full text-xs font-bold">
          View All Products
        </button>
      </div>
    );
  }

  // Filter products matching parent category & active sub-category tab
  const categoryProducts = products.filter((prod) => {
    if (prod.status !== "active") return false;
    
    // Must belong to parent category
    if (prod.categoryId !== parentCategory.categoryId) return false;

    // Sub-category tab filter
    if (activeSubCat !== "all" && prod.subCategoryId !== activeSubCat) return false;

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header breadcrumb */}
      <div>
        <button
          onClick={() => router.push("/shop")}
          className="text-xs font-bold text-gray-400 hover:text-candy-pink flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop Catalog
        </button>
      </div>

      {/* Category Banner Title */}
      <div className="bg-gradient-to-r from-candy-pink/10 via-white to-candy-purple/10 border border-gray-100 text-gray-950 p-8 md:p-12 rounded-3xl text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-black capitalize tracking-tight">
          {parentCategory.name} Selection
        </h1>
        <p className="text-xs md:text-sm text-gray-500 max-w-md mx-auto">
          Shop the best imported {parentCategory.name.toLowerCase()} items. Quick-filter options below.
        </p>
      </div>

      {/* Sub-category tabs */}
      {subCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center border-b border-gray-100 pb-5">
          <button
            onClick={() => setActiveSubCat("all")}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              activeSubCat === "all"
                ? "bg-candy-purple text-white"
                : "bg-gray-50 hover:bg-gray-100 text-gray-600"
            }`}
          >
            All {parentCategory.name}
          </button>
          {subCategories.map((sub) => (
            <button
              key={sub.categoryId}
              onClick={() => setActiveSubCat(sub.categoryId)}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                activeSubCat === sub.categoryId
                  ? "bg-candy-purple text-white"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-600"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {categoryProducts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl p-8 space-y-3">
          <span className="text-2xl">🍬</span>
          <h3 className="font-extrabold text-gray-900 text-base">Collection Coming Soon</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">New imports are currently clearing inspections. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryProducts.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-gray-500">Loading collection...</div>}>
      <CategoryContent />
    </Suspense>
  );
}
