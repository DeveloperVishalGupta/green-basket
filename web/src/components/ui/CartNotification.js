"use client";

import { CheckCircleOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Cart Notification Component
 * Shows a temporary notification when product is added to cart
 * Displays for 10-15 seconds then auto-hides
 */
export default function CartNotification({ product, onClose }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);

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
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-emerald-500 overflow-hidden">
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
