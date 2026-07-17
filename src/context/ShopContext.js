"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getDBService } from "@/lib/firebase";

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dbService = getDBService();

  const triggerToast = (productName, quantity, image) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, productName, quantity, image }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Load products & categories from DB service
  const refreshCatalog = async () => {
    try {
      const prods = await dbService.getProducts();
      const cats = await dbService.getCategories();
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCatalog();
    
    // Load cart from localStorage
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("candy_world_cart");
      if (storedCart) {
        try {
          setCart(JSON.parse(storedCart));
        } catch (e) {
          console.error("Failed to parse cart", e);
        }
      }
    }

    // Listen for admin panel catalog changes in same tab
    const handleCatalogUpdate = (e) => {
      if (e.detail?.key === "products" || e.detail?.key === "categories") {
        refreshCatalog();
      }
    };
    window.addEventListener("candy_catalog_updated", handleCatalogUpdate);

    // Listen for cross-tab sync (admin panel in another tab)
    const handleStorageSync = (e) => {
      if (e.key === "candy_world_sync_signal") {
        try {
          const signal = JSON.parse(e.newValue || "{}");
          if (signal.key === "products" || signal.key === "categories") {
            refreshCatalog();
          }
        } catch (_) {}
      }
    };
    window.addEventListener("storage", handleStorageSync);

    return () => {
      window.removeEventListener("candy_catalog_updated", handleCatalogUpdate);
      window.removeEventListener("storage", handleStorageSync);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("candy_world_cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Cart operations
  const addToCart = (product, quantity = 1, variantId = null) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.productId === product.productId && item.variantId === variantId
      );

      // Extract price based on variant or sale status
      let itemPrice = product.salePrice || product.basePrice;
      let variantName = "";

      if (variantId && product.variants) {
        const variant = product.variants.find((v) => v.variantId === variantId);
        if (variant) {
          itemPrice = variant.price;
          variantName = variant.name;
        }
      }

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        return [
          ...prevCart,
          {
            productId: product.productId,
            name: product.name,
            slug: product.slug,
            image: product.images[0] || "/images/placeholder.jpg",
            price: itemPrice,
            weight: product.weight,
            variantId,
            variantName,
            quantity,
          },
        ];
      }
    });

    // Trigger success notification
    triggerToast(product.name, quantity, product.images?.[0] || "/images/placeholder.jpg");

    // Fire AddToCart pixel trigger (Pixel tracking mock calls)
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "AddToCart", {
        content_ids: [product.productId],
        content_type: "product",
        value: product.salePrice || product.basePrice,
        currency: "LKR",
      });
    }
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.track("AddToCart", {
        contents: [{ id: product.productId, name: product.name, quantity }],
        value: product.salePrice || product.basePrice,
        currency: "LKR",
      });
    }
  };

  const removeFromCart = (productId, variantId = null) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.productId === productId && item.variantId === variantId))
    );
  };

  const updateQuantity = (productId, quantity, variantId = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const getCartSubtotal = () => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const getCartTotalWeight = () => {
    return cart.reduce((acc, item) => acc + (item.weight || 0) * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        categories,
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartSubtotal,
        getCartTotalWeight,
        getCartItemCount,
        refreshCatalog,
      }}
    >
      {children}

      {/* Global animated success notifications for Add to Cart */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-4 bg-white/95 backdrop-blur-md border border-gray-100 border-l-4 border-l-candy-pink rounded-2xl p-4 shadow-xl shadow-candy-pink/5 animate-slide-in pointer-events-auto transition-all duration-300"
          >
            {t.image && (
              <img
                src={t.image}
                alt={t.productName}
                className="w-11 h-11 rounded-xl object-cover border border-gray-100 flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-candy-pink uppercase tracking-widest flex items-center gap-1">
                <span>🍬 Added to Cart!</span>
              </p>
              <h5 className="text-sm font-bold text-gray-900 truncate mt-0.5">{t.productName}</h5>
              <p className="text-[10px] text-gray-400 mt-0.5">Quantity: {t.quantity}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
