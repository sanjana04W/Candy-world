"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getDBService } from "@/lib/firebase";
import { CheckCircle2, Package, Truck, Phone, Calendar } from "lucide-react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const dbService = getDBService();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const orders = await dbService.getOrders();
        const found = orders.find(o => o.orderId === orderId);
        setOrder(found || null);
      } catch (err) {
        console.error("Error loading order", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-candy-pink border-t-transparent rounded-full mb-2"></div>
        <p className="text-sm text-gray-500 font-medium">Retrieving order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-2xl font-black text-gray-900">Order Not Found</h2>
        <p className="text-sm text-gray-500">We couldn&apos;t locate details for this order. It may have been archived or cancelled.</p>
        <Link href="/shop" className="inline-block bg-candy-purple text-white px-6 py-2.5 rounded-full text-xs font-bold">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      
      {/* Thank you note */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 bg-emerald-50 text-emerald-500 rounded-full">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-black text-gray-900">Thank You For Your Order!</h1>
        <p className="text-sm text-gray-500">
          Your order has been received successfully. Below are your reference and shipping expectations.
        </p>
        <div className="inline-block bg-gray-100 rounded-2xl px-5 py-2 text-xs font-black text-gray-700 tracking-wider">
          ORDER NUMBER: {order.orderNumber}
        </div>
      </div>

      {/* Grid: Delivery Info and Item Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping address details */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-50 pb-2">
            <Truck className="h-4.5 w-4.5 text-candy-pink" />
            Shipping Details
          </h3>
          <div className="space-y-2 text-xs text-gray-600">
            <p><strong>Recipient Name:</strong> {order.customerInfo.name}</p>
            <p><strong>Mobile Contact:</strong> {order.customerInfo.phone}</p>
            <p><strong>District:</strong> {order.customerInfo.district}</p>
            <p className="leading-relaxed"><strong>Address:</strong> {order.customerInfo.address}</p>
            {order.requestedDeliveryDate && (
              <p className="flex items-center gap-1 mt-2 text-candy-purple font-semibold">
                <Calendar className="h-4 w-4" />
                Requested Delivery: {new Date(order.requestedDeliveryDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Expected Timeline & Payment */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-50 pb-2">
            <Package className="h-4.5 w-4.5 text-candy-purple" />
            Order Information
          </h3>
          <div className="space-y-3 text-xs text-gray-600">
            <p><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
            <p><strong>Fulfillment Status:</strong> <span className="bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-md text-[10px]">{order.orderStatus}</span></p>
            <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 border border-gray-100">
              <span className="font-bold text-gray-800 block">Expected Delivery:</span>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Colombo/Gampaha: 1-3 Business Days.<br />
                Outstations: 3-5 Business Days.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Item Summary Table */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider border-b border-gray-50 pb-2">
          Ordered Itemized Summary
        </h3>
        
        <div className="divide-y divide-gray-100">
          {order.items.map(item => (
            <div key={item.productId} className="flex justify-between items-center py-3 first:pt-0">
              <div>
                <span className="text-xs font-bold text-gray-800">{item.name}</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Qty: {item.quantity} @ LKR {item.price.toLocaleString()}</span>
              </div>
              <span className="text-xs font-black text-gray-800">
                LKR {(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>LKR {order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Delivery Fee</span>
            <span>{order.deliveryFee === 0 ? "FREE" : `LKR ${order.deliveryFee.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between font-black text-gray-900 border-t border-gray-50 pt-2 text-sm">
            <span>Total COD Payment</span>
            <span className="text-candy-pink">LKR {order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 text-center">
        <Link href="/shop" className="bg-candy-purple hover:bg-candy-purple-dark text-white font-extrabold text-xs px-8 py-3 rounded-full shadow-md">
          Continue Shopping
        </Link>
        <a
          href={`https://wa.me/94771234567?text=Hi%20Candy%20World,%20I%20just%20placed%20order%20${order.orderNumber}.%20Please%20confirm%20delivery!`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-8 py-3 rounded-full flex items-center justify-center gap-1.5 shadow-md"
        >
          <Phone className="h-4 w-4" />
          WhatsApp Support Follow-up
        </a>
      </div>

    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-gray-500">Loading order status...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
