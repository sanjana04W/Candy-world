"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart, Eye, Tag, Sparkles, Check } from "lucide-react";

// Map product names/slugs to colorful emojis and gradient combos
const PRODUCT_VISUALS = {
  "sour-patch-kids-original": { emoji: "🍬", gradient: "from-green-300 via-yellow-200 to-red-300", textColor: "text-green-700" },
  "haribo-goldbears": { emoji: "🐻", gradient: "from-yellow-200 via-orange-200 to-yellow-300", textColor: "text-orange-600" },
  "giant-rainbow-lollipop": { emoji: "🍭", gradient: "from-pink-200 via-purple-200 to-blue-200", textColor: "text-purple-600" },
  "toblerone-swiss-milk": { emoji: "🍫", gradient: "from-amber-200 via-yellow-100 to-amber-300", textColor: "text-amber-700" },
  "ferrero-rocher-16": { emoji: "🎁", gradient: "from-yellow-200 via-amber-100 to-yellow-300", textColor: "text-yellow-700" },
  "cerave-hydrating-cleanser": { emoji: "✨", gradient: "from-blue-100 via-sky-50 to-cyan-100", textColor: "text-sky-600" },
  "maybelline-superstay-lip": { emoji: "💄", gradient: "from-rose-200 via-pink-100 to-rose-300", textColor: "text-rose-600" },
  "pringles-sour-cream-onion": { emoji: "🥔", gradient: "from-red-200 via-orange-100 to-yellow-200", textColor: "text-orange-600" },
  "nutella-hazelnut-spread": { emoji: "🫙", gradient: "from-amber-200 via-red-100 to-amber-300", textColor: "text-amber-800" },
};

const CATEGORY_VISUALS = {
  candy: { emoji: "🍬", gradient: "from-candy-pink/20 via-pink-50 to-candy-purple/10" },
  chocolate: { emoji: "🍫", gradient: "from-amber-100 via-yellow-50 to-amber-200/50" },
  cosmetics: { emoji: "🍬", gradient: "from-pink-100 via-rose-50 to-white" },
  gourmet: { emoji: "🫙", gradient: "from-orange-100 via-amber-50 to-yellow-100" },
};

export default function ProductCard({ product }) {
  const { addToCart } = useShop();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [justAdded, setJustAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isSale = product.salePrice && product.salePrice < product.basePrice;
  // stockStatus is the source of truth (set by admin).
  // Fall back to qty-based logic only when no explicit status is saved.
  const effectiveStatus = product.stockStatus ||
    (product.stockLevel === 0 ? "outofstock" :
     product.stockLevel <= (product.lowStockThreshold || 5) ? "lowstock" : "instock");
  const isOutOfStock = effectiveStatus === "outofstock";
  const isLowStock   = effectiveStatus === "lowstock";

  const baseFormatted = `LKR ${product.basePrice.toLocaleString()}`;
  const saleFormatted = isSale ? `LKR ${product.salePrice.toLocaleString()}` : null;

  const discountPercent = isSale
    ? Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)
    : 0;

  // Pick visuals from lookup or category fallback
  const visual =
    PRODUCT_VISUALS[product.slug] ||
    CATEGORY_VISUALS[product.categoryId] ||
    { emoji: "🛍️", gradient: "from-gray-100 to-gray-200" };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) {
      // Redirect to login, preserving current path
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const ctaColor = "bg-candy-purple hover:bg-candy-purple-dark text-white border-candy-purple";

  return (
    <div
      className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col ${
        "hover:border-candy-purple/30"
      }`}
    >
      {/* Product Image */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-square w-full overflow-hidden">
        {/* Rich gradient background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${visual.gradient} transition-transform group-hover:scale-105 duration-500`}
        />

        {/* Product Image */}
        {product.images && product.images.length > 0 && !imageError ? (
          <img
            src={encodeURI(product.images[0])}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110 duration-500 z-10"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 z-10">
            <span className="text-6xl sm:text-7xl select-none drop-shadow-md transition-transform group-hover:scale-110 duration-300">
              {visual.emoji}
            </span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${visual.textColor || "text-gray-500"} opacity-70`}>
              {product.categoryId}
            </span>
          </div>
        )}

        {/* Sale badge */}
        {isSale && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="flex items-center gap-0.5 bg-rose-500 text-white text-[10px] font-extrabold uppercase px-2 py-1 rounded-full shadow">
              <Tag className="h-2.5 w-2.5" />
              {discountPercent}% OFF
            </span>
          </div>
        )}

        {/* New Arrival badge */}
        {product.isNewArrival && !isSale && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span
              className={`flex items-center gap-0.5 text-[10px] font-extrabold uppercase px-2 py-1 rounded-full shadow ${
                "bg-candy-pink text-white"
              }`}
            >
              <Sparkles className="h-2.5 w-2.5" />
              New
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-white/90 text-gray-800 font-black text-xs uppercase px-4 py-2 rounded-full tracking-wider shadow">
              Out of Stock
            </span>
          </div>
        )}

        {/* Made to order ribbon */}
        {!isOutOfStock && product.stockStatus === "madetoorder" && (
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-blue-500/95 text-white text-[10px] font-black uppercase text-center py-1 tracking-wider">
            ⏱️ Made to Order
          </div>
        )}

        {/* Low stock ribbon */}
        {!isOutOfStock && product.stockStatus !== "madetoorder" && isLowStock && (
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-amber-400/90 text-white text-[10px] font-black uppercase text-center py-1 tracking-wider">
            🔥 Low Stock — Order Soon
          </div>
        )}

        {/* Quick view hover */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-3 pb-3 gap-2 z-10">
            <span className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-md text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
              <Eye className="h-3.5 w-3.5" />
              View
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <span className="text-[9px] font-black tracking-widest text-gray-400 uppercase block mb-1">
            {product.subCategoryId ? product.subCategoryId.split("-").slice(1).join(" ") : product.categoryId}
          </span>
          <Link href={`/product/${product.slug}`} className="hover:text-candy-pink transition-colors">
            <h3 className="font-bold text-gray-800 text-sm line-clamp-2 leading-snug">{product.name}</h3>
          </Link>
          <p className="text-[11px] text-gray-400 mt-1">{product.weight}g</p>
        </div>

        <div className="mt-3">
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            {isSale ? (
              <>
                <span className="text-base font-extrabold text-rose-500">{saleFormatted}</span>
                <span className="text-xs text-gray-400 line-through">{baseFormatted}</span>
              </>
            ) : (
              <span className="text-base font-extrabold text-gray-800">{baseFormatted}</span>
            )}
          </div>

          {/* Cart CTA */}
          {product.variants && product.variants.length > 0 ? (
            <Link
              href={`/product/${product.slug}`}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              Select Options
            </Link>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                isOutOfStock
                  ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
                  : justAdded
                  ? "bg-emerald-500 border-emerald-500 text-white scale-[0.97]"
                  : ctaColor
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Add to Cart
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
