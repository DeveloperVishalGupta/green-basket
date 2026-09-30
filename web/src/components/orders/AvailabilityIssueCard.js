"use client";

import ReplaceProductModal from "@/components/orders/ReplaceProductModal";
import { useResolveOrderItem } from "@/hooks/useOrders";
import { App, Button } from "antd";
import { useState } from "react";

const ISSUE_COPY = {
  unavailable: {
    badge: "Out of stock",
    description: "This item is no longer available.",
  },
  partial_stock: {
    badge: "Limited stock",
    description: "There isn't enough stock to fulfill the full quantity.",
  },
  price_change: {
    badge: "Price changed",
    description: "The price of this item has changed since you ordered.",
  },
};

/**
 * One flagged order item (from the delivery-day/admin availability check)
 * with whichever resolution actions apply to its issue type — replace,
 * remove, accept the new price, or accept a reduced quantity.
 */
export default function AvailabilityIssueCard({ order, item }) {
  const { message } = App.useApp();
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const resolveItem = useResolveOrderItem();

  const issue = item.availabilityIssue;
  const copy = ISSUE_COPY[issue.issueType] || {
    badge: "Needs attention",
    description: "This item needs your attention.",
  };

  const resolve = async (data, successMessage) => {
    try {
      await resolveItem.mutateAsync({
        orderId: order._id,
        itemId: item._id,
        data,
      });
      message.success(successMessage);
      setReplaceModalOpen(false);
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Failed to update this item",
      );
    }
  };

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">{item.name}</span>
            {item.variant && (
              <span className="text-xs text-gray-500">({item.variant})</span>
            )}
          </div>
          <span className="mt-1 inline-block rounded bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-800">
            {copy.badge}
          </span>
          <p className="mt-2 text-sm text-gray-700">{copy.description}</p>
          {issue.issueType === "partial_stock" && (
            <p className="mt-1 text-xs text-gray-600">
              Ordered: {item.quantity} • Available: {issue.availableQty}
            </p>
          )}
          {issue.issueType === "price_change" && (
            <p className="mt-1 text-xs text-gray-600">
              Was ₹{item.price} • Now ₹{issue.newPrice}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {issue.issueType === "partial_stock" && (
          <Button
            size="small"
            type="primary"
            className="bg-emerald-600 hover:bg-emerald-700 border-0"
            loading={resolveItem.isPending}
            onClick={() =>
              resolve(
                { action: "accept_partial" },
                `Accepted ${issue.availableQty} available`,
              )
            }>
            Accept {issue.availableQty} available
          </Button>
        )}

        {issue.issueType === "price_change" && (
          <Button
            size="small"
            type="primary"
            className="bg-emerald-600 hover:bg-emerald-700 border-0"
            loading={resolveItem.isPending}
            onClick={() =>
              resolve({ action: "accept_price" }, "New price accepted")
            }>
            Accept new price (₹{issue.newPrice})
          </Button>
        )}

        <Button size="small" onClick={() => setReplaceModalOpen(true)}>
          Replace Product
        </Button>

        <Button
          size="small"
          danger
          loading={resolveItem.isPending}
          onClick={() => resolve({ action: "remove" }, "Item removed")}>
          Remove Item
        </Button>
      </div>

      <ReplaceProductModal
        open={replaceModalOpen}
        onClose={() => setReplaceModalOpen(false)}
        quantityNeeded={item.fulfilledQuantity ?? item.quantity}
        confirmLoading={resolveItem.isPending}
        onConfirm={({ replacementProductId, replacementVariant }) =>
          resolve(
            { action: "replace", replacementProductId, replacementVariant },
            "Item replaced",
          )
        }
      />
    </div>
  );
}
