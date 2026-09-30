"use client";

import AvailabilityIssueCard from "@/components/orders/AvailabilityIssueCard";
import { useCancelOrder } from "@/hooks/useOrders";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { App, Button, Input, Modal } from "antd";
import { useState } from "react";

/**
 * Shown on the order-detail page whenever the delivery-day (or
 * admin-triggered) availability check found stock/price issues that
 * still need the customer's decision — see
 * server/src/services/orderFulfillmentService.js.
 */
export default function OrderActionRequiredBanner({ order }) {
  const { message } = App.useApp();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const cancelOrder = useCancelOrder();

  const flaggedItems = order.items.filter(
    (item) => item.availabilityIssue?.issueType && !item.resolution?.action,
  );

  if (flaggedItems.length === 0) return null;

  const handleCancelConfirm = () => {
    if (!cancelReason.trim()) {
      message.error("Please provide a reason for cancellation");
      return;
    }
    cancelOrder.mutate(
      { orderId: order._id, reason: cancelReason },
      {
        onSuccess: () => {
          message.success("Order cancelled");
          setCancelModalOpen(false);
        },
        onError: (err) =>
          message.error(
            err?.response?.data?.message || "Failed to cancel order",
          ),
      },
    );
  };

  return (
    <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border-2 border-amber-400">
      <div className="mb-3 flex items-center gap-2">
        <ExclamationCircleFilled className="text-xl text-amber-500" />
        <h2 className="text-lg font-bold text-gray-900">Action Needed</h2>
      </div>
      <p className="mb-4 text-sm text-gray-600">
        Since stock and prices can change for fresh produce, we recheck your
        order before it&apos;s prepared. {flaggedItems.length} item
        {flaggedItems.length !== 1 ? "s" : ""} need{flaggedItems.length === 1 ? "s" : ""} your
        decision below.
      </p>

      <div className="space-y-3">
        {flaggedItems.map((item) => (
          <AvailabilityIssueCard key={item._id} order={order} item={item} />
        ))}
      </div>

      <div className="mt-4 border-t border-gray-100 pt-3 text-right">
        <Button danger size="small" onClick={() => setCancelModalOpen(true)}>
          Cancel Entire Order Instead
        </Button>
      </div>

      <Modal
        title="Cancel Order"
        open={cancelModalOpen}
        onOk={handleCancelConfirm}
        onCancel={() => setCancelModalOpen(false)}
        okText="Cancel Order"
        okButtonProps={{ danger: true, loading: cancelOrder.isPending }}
        cancelText="Keep Order">
        <p className="mb-2 text-sm text-gray-600">
          Please tell us why you&apos;re cancelling:
        </p>
        <Input.TextArea
          rows={3}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Reason for cancellation"
        />
      </Modal>
    </div>
  );
}
