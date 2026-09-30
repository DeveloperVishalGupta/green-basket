"use client";

/**
 * One line item in the shopping cart: small image, name, variant pills,
 * price, and the quantity stepper with a running line total — laid out as a
 * compact list row (matching the item rows on the order details page).
 */

import { DeleteOutlined } from "@ant-design/icons";
import Image from "next/image";
import { useMemo } from "react";
import QuantityStepper from "./QuantityStepper";
import WeightPill from "./WeightPill";

export default function CartItemCard({
  item,
  onVariantChange,
  onIncrement,
  onDecrement,
  onRemove,
}) {
  const { comparePrice, savingsPerUnit, totalSavings } = useMemo(() => {
    const compare =
      item.compareAtPrice ?? item.selectedVariant?.compareAtPrice ?? null;
    const perUnit = compare && compare > item.price ? compare - item.price : 0;
    return {
      comparePrice: compare,
      savingsPerUnit: perUnit,
      totalSavings: perUnit * item.quantity,
    };
  }, [item.compareAtPrice, item.selectedVariant, item.price, item.quantity]);

  const hasVariants = Array.isArray(item.variants) && item.variants.length > 1;
  const selectedVariantId =
    item.selectedVariant?._id || item.selectedVariant?.id;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md sm:p-4 dark:border-border-default dark:bg-surface">
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 dark:border-border-default dark:bg-surface-muted">
          {item.images?.[0]?.url ? (
            <Image
              src={item.images[0].url}
              alt={item.name}
              fill
              className="object-contain p-1"
              sizes="56px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl">
              📦
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold capitalize text-gray-900 dark:text-text-primary">
            {item.name}
          </h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-text-muted">
            {!hasVariants && item.selectedVariant?.label && (
              <span className="rounded-md bg-gray-100 px-2 py-0.5 font-semibold text-gray-700 dark:bg-surface-muted dark:text-text-secondary">
                {item.selectedVariant.label}
              </span>
            )}
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              ₹{item.price.toLocaleString()}
            </span>
            {savingsPerUnit > 0 && (
              <span className="text-gray-400 line-through">
                ₹{comparePrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name} from cart`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-400 transition-all hover:bg-red-100 hover:text-red-600 dark:bg-red-950 dark:text-red-400">
          <DeleteOutlined className="text-sm" />
        </button>
      </div>

      {hasVariants && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.variants.map((v) => {
            const vId = v._id || v.id;
            return (
              <WeightPill
                key={vId}
                label={v.label}
                selected={selectedVariantId === vId}
                onClick={() => onVariantChange(item, v)}
              />
            );
          })}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-border-default">
        <QuantityStepper
          quantity={item.quantity}
          onIncrement={() => onIncrement(item.id)}
          onDecrement={() => onDecrement(item.id)}
          label={item.name}
        />
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900 sm:text-base dark:text-text-primary">
            ₹{(item.price * item.quantity).toLocaleString()}
          </p>
          {totalSavings > 0 && (
            <p className="text-xs font-semibold text-green-600 dark:text-green-400">
              You save ₹{totalSavings.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
