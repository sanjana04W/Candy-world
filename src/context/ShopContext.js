"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getDBService } from "@/lib/firebase";
import CartToast from "@/components/CartToast";

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartToast, setCartToast] = useState(null);
  const dbService = getDBService();

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

    // Show cart toast notification
    setCartToast({
      id: Date.now(),
      name: product.name,
      image: product.images?.[0] || "/images/placeholder.jpg",
      price: product.salePrice || product.basePrice,
      quantity,
      variantName: variantId && product.variants
        ? product.variants.find(v => v.variantId === variantId)?.name || ""
        : "",
    });

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
      {/* Global cart-add notification toast */}
      <CartToast toast={cartToast} onDismiss={() => setCartToast(null)} />
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
