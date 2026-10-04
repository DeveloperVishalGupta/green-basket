"use client";

/**
 * Order summary pinned to the bottom of the cart's fixed-height flex column
 * (a shrink-0 sibling after the scrollable item list), so it — and the
 * checkout CTA — stay visible above the bottom nav no matter how long the
 * cart is, instead of requiring a scroll past every item to reach it.
 */

import { ShoppingOutlined, TagOutlined } from "@ant-design/icons";
import { Button } from "antd";
import FreeDeliveryNudge from "./FreeDeliveryNudge";

export default function OrderSummaryFooter({
  subtotal,
  discount,
  deliveryFee,
  total,
  canCheckout,
  onCheckout,
}) {
  return (
    <div className="shrink-0 border-t border-gray-200 bg-linear-to-r from-white to-emerald-50/30 px-4 py-4 shadow-2xl dark:border-border-default dark:from-surface dark:to-surface">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-text-secondary">
              Subtotal
            </span>
            <span className="font-semibold dark:text-text-primary">
              ₹{subtotal.toLocaleString()}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between font-semibold text-green-600 dark:text-green-400">
              <span className="flex items-center gap-1">
                <TagOutlined /> Discount
              </span>
              <span>-₹{discount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-text-secondary">
              Delivery Fee
            </span>
            <span className="font-semibold dark:text-text-primary">
              {deliveryFee === 0 ? (
                <span className="text-green-600 dark:text-green-400">FREE</span>
              ) : (
                `₹${deliveryFee}`
              )}
            </span>
          </div>

          <div className="flex justify-between border-t-2 border-dashed border-gray-300 pt-2 text-base dark:border-border-default">
            <span className="font-bold text-gray-900 dark:text-text-primary">
              Total
            </span>
            <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-xl font-bold text-transparent">
              ₹{total.toLocaleString()}
            </span>
          </div>
        </div>

        {deliveryFee > 0 && (
          <FreeDeliveryNudge subtotal={subtotal} className="mb-3" />
        )}

        {!canCheckout && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
            <span className="text-xl text-red-600" aria-hidden="true">
              ⚠️
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                Action Required
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Please select size for all items that require it
              </p>
            </div>
          </div>
        )}

        <Button
          type="primary"
          size="large"
          icon={<ShoppingOutlined />}
          onClick={onCheckout}
          disabled={!canCheckout}
          className="h-12 w-full rounded-xl border-0 bg-linear-to-r from-emerald-600 to-teal-600 text-base font-semibold shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50">
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
