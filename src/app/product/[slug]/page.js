"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import { getDBService } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";
import { ShoppingCart, Heart, ShieldCheck, Tag, Info, ArrowLeft } from "lucide-react";
import { triggerPixelEvent } from "@/lib/integrations";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart, products } = useShop();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const dbService = getDBService();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const prod = await dbService.getProductBySlug(slug);
        setProduct(prod);
        if (prod) {
          triggerPixelEvent("ViewContent", {
            content_ids: [prod.productId],
            content_name: prod.name,
            content_category: prod.categoryId,
            value: prod.salePrice || prod.basePrice,
            currency: "LKR"
          });
          if (prod.variants && prod.variants.length > 0) {
            setSelectedVariantId(prod.variants[0].variantId);
          }
        }
      } catch (err) {
        console.error("Error loading product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-candy-pink border-t-transparent rounded-full mb-2"></div>
        <p className="text-sm text-gray-500 font-medium">Loading sweet details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <span className="text-4xl">🕵️‍♀️</span>
        <h2 className="text-2xl font-black text-gray-900">Product Not Found</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">The product you are trying to view does not exist or has been hidden.</p>
        <Link href="/shop" className="inline-block bg-candy-purple hover:bg-candy-purple-dark text-white font-extrabold text-xs px-6 py-2.5 rounded-full">
          Back to Shop
        </Link>
      </div>
    );
  }

  // Determine active price and stock level
  let activePrice = product.salePrice || product.basePrice;
  let activeStock = product.stockLevel;
  let activeVariantName = "";

  if (selectedVariantId && product.variants) {
    const activeVar = product.variants.find(v => v.variantId === selectedVariantId);
    if (activeVar) {
      activePrice = activeVar.price;
      activeStock = activeVar.stockLevel;
      activeVariantName = activeVar.name;
    }
  }

  const isSale = !selectedVariantId && product.salePrice && product.salePrice < product.basePrice;
  // stockStatus is the source of truth (set by admin).
  // For variants, fall back to qty since variants don't have their own stockStatus.
  const effectiveStatus = (!selectedVariantId && product.stockStatus) ||
    (activeStock === 0 ? "outofstock" :
     activeStock <= (product.lowStockThreshold || 5) ? "lowstock" : "instock");
  const isOutOfStock = effectiveStatus === "outofstock";
  const isLowStock   = effectiveStatus === "lowstock";


  // Related products (same category, excluding current product)
  const related = products
    .filter(p => p.categoryId === product.categoryId && p.productId !== product.productId && p.status === "active")
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Back to Shop link */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-gray-500 hover:text-candy-pink flex items-center gap-1"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to previous page
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* Left Column - Product Image */}
        <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center group">
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br from-candy-pink-light/20 to-candy-purple-light/20 flex items-center justify-center font-black text-gray-300 text-6xl`}>
              <span>{product.name.charAt(0)}</span>
            </div>
          )}
          
          {/* Sale and New badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
            {isSale && (
              <span className="flex items-center gap-1 bg-rose-500 text-white text-xs font-extrabold uppercase px-3 py-1.5 rounded-full shadow-sm">
                <Tag className="h-3.5 w-3.5" />
                Sale
              </span>
            )}
            {product.isNewArrival && (
              <span className={`text-xs font-extrabold uppercase px-3 py-1.5 rounded-full shadow-sm bg-candy-pink text-white`}>
                New Arrival
              </span>
            )}
          </div>
        </div>

        {/* Right Column - Product Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-extrabold tracking-widest text-candy-pink uppercase block">
              {product.categoryId}
            </span>
            <h1 className="text-3xl font-black text-gray-900 leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-gray-400 font-semibold">SKU: {product.productId}</p>
          </div>

          {/* Price details */}
          <div className="flex items-baseline gap-3 border-y border-gray-100 py-4">
            {isSale ? (
              <>
                <span className="text-3xl font-black text-rose-500">LKR {activePrice.toLocaleString()}</span>
                <span className="text-sm text-gray-400 line-through">LKR {product.basePrice.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-3xl font-black text-gray-900">LKR {activePrice.toLocaleString()}</span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-wider">Product Info</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-wider">Select Options</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.variantId}
                    onClick={() => setSelectedVariantId(v.variantId)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedVariantId === v.variantId
                        ? "bg-candy-purple border-candy-purple text-white shadow-xs"
                        : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    {v.name} - LKR {v.price.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Availability */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <span className="text-xs font-extrabold uppercase text-rose-500 bg-rose-50 px-3 py-1 rounded-md border border-rose-100">
                Out of Stock
              </span>
            ) : product.stockStatus === "madetoorder" ? (
              <span className="text-xs font-extrabold uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                ⏱️ Made to Order {product.leadDays ? `(${product.leadDays})` : ""}
              </span>
            ) : isLowStock ? (
              <span className="text-xs font-extrabold uppercase text-amber-500 bg-amber-50 px-3 py-1 rounded-md border border-amber-100 animate-pulse">
                Low Stock - Only {activeStock} left
              </span>
            ) : (
              <span className="text-xs font-extrabold uppercase text-emerald-500 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
                In Stock & Ready for Delivery
              </span>
            )}
          </div>

          {/* Add to Cart Actions */}
          <div className="flex gap-4 items-center pt-2">
            {!isOutOfStock && (
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-500 hover:bg-gray-50 font-bold"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(activeStock, q + 1))}
                  className="px-3 py-2 text-gray-500 hover:bg-gray-50 font-bold"
                >
                  +
                </button>
              </div>
            )}

            <button
              onClick={() => {
                if (!user) {
                  router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                  return;
                }
                addToCart(product, quantity, selectedVariantId);
              }}
              disabled={isOutOfStock}
              className={`flex-grow font-extrabold text-sm py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all border ${
                isOutOfStock
                  ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
                  : "bg-candy-purple hover:bg-candy-purple-dark text-white border-candy-purple"
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          </div>

          {/* Disclaimers & Info alerts */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-700 text-xs">
                <Info className="h-4.5 w-4.5 flex-shrink-0" />
                <p>
                  <strong>Allergen Notice:</strong> Processed in a facility that also handles nuts, dairy, soy, and wheat ingredients.
                </p>
              </div>
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {related.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-gray-100">
          <h2 className="text-2xl font-black text-gray-900">You Might Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((prod) => (
              <ProductCard key={prod.productId} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
