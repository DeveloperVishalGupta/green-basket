"use client";

import FreeDeliveryNudge from "@/components/cart/FreeDeliveryNudge";
import { useCartStore } from "@/store/cartStore";
import { CheckCircleOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Cart Notification Component
 * Shows a temporary notification when product is added to cart
 * Displays for 10-15 seconds then auto-hides
 */
export default function CartNotification({ product, onClose }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const startPoint = useRef(null);
  const cartSubtotal = useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  );

  const SWIPE_THRESHOLD = 70;

  const dismiss = (x = 0, y = 0) => {
    // Fly the card off-screen in the swipe direction, then unmount
    setDrag({ x, y, active: false });
    setVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const handlePointerDown = (e) => {
    startPoint.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!startPoint.current) return;
    const dx = e.clientX - startPoint.current.x;
    // Only allow downward vertical movement (up is not a dismiss gesture)
    const dy = Math.max(0, e.clientY - startPoint.current.y);
    // Capture the pointer only once it's a real drag, so taps still reach
    // the buttons/links inside the card.
    if (!drag.active && (Math.abs(dx) > 5 || dy > 5)) {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    setDrag({ x: dx, y: dy, active: Math.abs(dx) > 5 || dy > 5 });
  };

  const handlePointerEnd = () => {
    if (!startPoint.current) return;
    startPoint.current = null;
    const { x, y } = drag;
    if (Math.abs(x) > SWIPE_THRESHOLD && Math.abs(x) >= y) {
      dismiss(x > 0 ? window.innerWidth : -window.innerWidth, 0);
    } else if (y > SWIPE_THRESHOLD) {
      dismiss(0, window.innerHeight);
    } else {
      setDrag({ x: 0, y: 0, active: false });
    }
  };

  useEffect(() => {
    if (!product) return;

    // Auto-hide after 12 seconds (middle of 10-15 second range)
    const duration = 12000;
    const interval = 50; // Update every 50ms for smooth animation
    const steps = duration / interval;
    const progressStep = 100 / steps;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - progressStep;
        if (next <= 0) {
          clearInterval(progressTimer);
          return 0;
        }
        return next;
      });
    }, interval);

    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300); // Wait for fade-out animation
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(hideTimer);
    };
  }, [product, onClose]);

  if (!product) return null;

  const imageUrl = product.images?.[0]?.url || product.images?.[0] || null;

  return (
    <div
      className={`fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ width: "calc(100% - 2rem)", maxWidth: "400px" }}>
      <div
        className="bg-white rounded-2xl shadow-2xl border-2 border-emerald-500 overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        style={{
          transform: `translate(${drag.x}px, ${drag.y}px)`,
          opacity: drag.active
            ? Math.max(0.4, 1 - Math.max(Math.abs(drag.x), drag.y) / 300)
            : undefined,
          transition: drag.active ? "none" : "transform 0.3s, opacity 0.3s",
          touchAction: "none",
        }}>
        {/* Progress Bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-emerald-500 transition-all duration-50"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Success Icon */}
            <div className="shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircleOutlined className="text-xl text-emerald-600" />
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-900 mb-1">
                Added to Cart!
              </h4>
              <div className="flex items-center gap-2">
                {imageUrl && (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 line-clamp-1 font-medium">
                    {product.name}
                    {product.selectedVariant?.label && (
                      <span className="text-gray-500 font-normal">
                        {" "}
                        ({product.selectedVariant.label})
                      </span>
                    )}
                  </p>
                  <p className="text-sm font-bold text-emerald-600">
                    ₹{product.price}
                  </p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setVisible(false);
                setTimeout(() => onClose?.(), 300);
              }}
              className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <FreeDeliveryNudge subtotal={cartSubtotal} className="mt-3" />

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                setVisible(false);
                setTimeout(() => onClose?.(), 300);
              }}
              className="flex-1 rounded-lg border-2 border-gray-300 bg-white py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Continue Shopping
            </button>
            <Link
              href="/cart"
              className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1">
              <ShoppingCartOutlined />
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
