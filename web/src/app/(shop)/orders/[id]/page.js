"use client";

import BottomNav from "@/components/layout/BottomNav";
import PageHeader from "@/components/layout/PageHeader";
import OrderActionRequiredBanner from "@/components/orders/OrderActionRequiredBanner";
import { useAddresses } from "@/hooks/useAddresses";
import {
  useCancelOrder,
  useOrder,
  useRefreshRefundStatus,
  useUpdateOrder,
} from "@/hooks/useOrders";
import { DELIVERY_SLOTS } from "@/lib/constants";
import { getTodayId, getTomorrowId } from "@/lib/delivery";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  MinusOutlined,
  PhoneOutlined,
  PlusOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { App, Button, Divider, Input, Modal, Spin } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

// Items/address/schedule can only be edited before the order enters
// processing; cancellation stays allowed a bit longer (matches the
// server's own cancelOrder check).
const EDITABLE_STATUSES = ["pending", "confirmed"];
const CANCELLABLE_STATUSES = ["pending", "confirmed", "processing"];

/**
 * Order Detail Page
 * Shows detailed order information with tracking
 */
export default function OrderDetailPage({ params }) {
  const router = useRouter();
  const { message } = App.useApp();

  const { id } = use(params);

  // State for refresh loading
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Editing items/address (its own Edit/Save/Cancel) — see "Order Items"
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState([]);
  const [editAddressId, setEditAddressId] = useState(null);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  // Editing delivery date/time/notes — its own Edit/Save/Cancel, independent
  // of the items edit above, see "Delivery Schedule"
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [editDeliveryDate, setEditDeliveryDate] = useState(null);
  const [editDeliveryTimeSlot, setEditDeliveryTimeSlot] = useState(null);
  const [editNotes, setEditNotes] = useState("");

  // Cancel order
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Fetch order from API. Always refetched fresh (not the app-wide 5-minute
  // staleTime) and polled while the order is still active, so an admin's
  // status change shows up here without the customer needing to know to
  // manually refresh.
  const {
    data: orderData,
    isLoading,
    error,
  } = useOrder(id, {
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      const isTerminal = ["delivered", "cancelled", "refunded"].includes(
        status,
      );
      return isTerminal ? false : 15000;
    },
  });
  const order = orderData?.data;

  // Saved addresses, only needed once the customer opens the address picker
  const { data: addressesData } = useAddresses({ enabled: showAddressPicker });
  const savedAddresses = addressesData?.data?.data || [];

  // Mutation for refreshing refund status
  const refreshRefundMutation = useRefreshRefundStatus();
  const updateOrderMutation = useUpdateOrder();
  const cancelOrderMutation = useCancelOrder();

  const isEditable = order && EDITABLE_STATUSES.includes(order.status);
  const isCancellable = order && CANCELLABLE_STATUSES.includes(order.status);

  // Local-date (not UTC) id, matching how the server's own toDateId()
  // reconstructs "YYYY-MM-DD" from a stored deliveryDate.
  const currentDeliveryDateId = (() => {
    if (!order?.deliveryDate) return getTodayId();
    const d = new Date(order.deliveryDate);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
  })();
  const currentSlotId =
    DELIVERY_SLOTS.find((s) => s.label === order?.deliveryTimeSlot)?.id || null;

  const handleStartEdit = () => {
    setEditItems(
      order.items.map((item) => ({
        _id: item._id,
        name: item.name,
        image: item.image,
        variant: item.variant,
        unit: item.unit,
        price: item.price,
        quantity: item.quantity,
      })),
    );
    setEditAddressId(null);
    setShowAddressPicker(false);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleEditQtyChange = (itemId, delta) => {
    setEditItems((prev) =>
      prev.map((item) =>
        item._id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const handleEditRemoveItem = (itemId) => {
    setEditItems((prev) => prev.filter((item) => item._id !== itemId));
  };

  const editSubtotal = editItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  const editShippingFee = editSubtotal > 199 ? 0 : 25;
  const editTotal = Math.max(
    0,
    editSubtotal - (order?.pricing?.discount || 0) + editShippingFee,
  );

  const handleSaveEdit = async () => {
    if (editItems.length === 0) {
      message.error(
        "An order must have at least one item — cancel the order instead of removing everything.",
      );
      return;
    }

    const originalById = new Map(order.items.map((i) => [i._id, i.quantity]));
    const changedItems = editItems
      .filter((i) => originalById.get(i._id) !== i.quantity)
      .map((i) => ({ _id: i._id, quantity: i.quantity }));
    const removedItems = order.items
      .filter((oi) => !editItems.some((ei) => ei._id === oi._id))
      .map((oi) => ({ _id: oi._id, quantity: 0 }));
    const items = [...changedItems, ...removedItems];

    const payload = {};
    if (items.length > 0) payload.items = items;
    if (editAddressId) payload.addressId = editAddressId;

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      await updateOrderMutation.mutateAsync({ orderId: id, data: payload });
      message.success("Order updated successfully");
      setIsEditing(false);
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to update order");
    }
  };

  const handleStartEditSchedule = () => {
    setEditDeliveryDate(currentDeliveryDateId);
    setEditDeliveryTimeSlot(currentSlotId);
    setEditNotes(order.notes || "");
    setIsEditingSchedule(true);
  };

  const handleCancelEditSchedule = () => {
    setIsEditingSchedule(false);
  };

  const handleSaveSchedule = async () => {
    const payload = {};
    if (editDeliveryDate && editDeliveryDate !== currentDeliveryDateId) {
      payload.deliveryDate = editDeliveryDate;
    }
    if (editDeliveryTimeSlot && editDeliveryTimeSlot !== currentSlotId) {
      payload.deliveryTimeSlot = DELIVERY_SLOTS.find(
        (s) => s.id === editDeliveryTimeSlot,
      )?.label;
    }
    if (editNotes !== (order.notes || "")) payload.notes = editNotes;

    if (Object.keys(payload).length === 0) {
      setIsEditingSchedule(false);
      return;
    }

    try {
      await updateOrderMutation.mutateAsync({ orderId: id, data: payload });
      message.success("Delivery schedule updated successfully");
      setIsEditingSchedule(false);
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Failed to update delivery schedule",
      );
    }
  };

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      message.error("Please provide a reason for cancellation");
      return;
    }
    cancelOrderMutation.mutate(
      { orderId: id, reason: cancelReason },
      {
        onSuccess: () => {
          message.success("Order cancelled successfully");
          setCancelModalOpen(false);
          setCancelReason("");
        },
        onError: (err) => {
          message.error(
            err?.response?.data?.message || "Failed to cancel order",
          );
        },
      },
    );
  };

  // Handle refresh refund status
  const handleRefreshRefund = async () => {
    setIsRefreshing(true);
    try {
      const response = await refreshRefundMutation.mutateAsync(id);
      message.success(
        response.message || "Refund status refreshed successfully",
      );
    } catch (err) {
      message.error("Failed to refresh refund status");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-below-header items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    const errorMessage =
      error?.response?.data?.message ||
      "This order doesn't exist or you don't have permission to view it.";
    const isAuthError =
      error?.response?.status === 401 || error?.response?.status === 403;

    return (
      <div className="flex min-h-below-header items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6 text-6xl">{isAuthError ? "🔒" : "📦"}</div>
          <h1 className="text-2xl font-bold mb-4">
            {isAuthError ? "Access Denied" : "Order Not Found"}
          </h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          {isAuthError && (
            <p className="text-sm text-gray-500 mb-6">
              Please make sure you&apos;re logged in with the correct account.
            </p>
          )}
          <div className="flex gap-3 justify-center">
            {isAuthError && (
              <Button type="default" onClick={() => router.push("/login")}>
                Login
              </Button>
            )}
            <Button type="primary" onClick={() => router.push("/orders")}>
              View All Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-below-header bg-gray-50 pb-20 lg:pb-0 ">
      <PageHeader
        title="Order Details"
        subtitle={`#${order.orderNumber || order._id?.slice(-8).toUpperCase()}`}
        rightContent={
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
              order.status === "delivered"
                ? "bg-green-100 text-green-700"
                : order.status === "cancelled"
                  ? "bg-red-100 text-red-700"
                  : order.status === "shipped"
                    ? "bg-blue-100 text-blue-700"
                    : order.status === "processing"
                      ? "bg-cyan-100 text-cyan-700"
                      : order.status === "confirmed"
                        ? "bg-indigo-100 text-indigo-700"
                        : order.status === "refunded"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-yellow-100 text-yellow-700"
            }`}>
            {order.status?.toUpperCase()}
          </div>
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-4">
        {/* Delivery-day (or admin) availability recheck found something
            that needs the customer's decision before the order is prepared */}
        <OrderActionRequiredBanner order={order} />

        {/* Order Items + Payment Summary (bill style) */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-2 gap-2">
            <h2 className="text-lg font-bold">
              Order Items ({order.items.length})
            </h2>
            <div className="flex items-center gap-2">
              {/* <div
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.payment.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : order.payment.status === "failed"
                      ? "bg-red-100 text-red-700"
                      : order.payment.status === "refunded"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-yellow-100 text-yellow-700"
                }`}>
                {order.payment.status === "completed"
                  ? "✓ PAID"
                  : order.payment.status === "failed"
                    ? "✗ FAILED"
                    : order.payment.status === "refunded"
                      ? "↩ REFUNDED"
                      : "⏳ PENDING"}
              </div> */}
              {isEditable && !isEditing && (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all">
                  <EditOutlined /> Edit Order
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <>
              {/* Editable item list */}
              <div>
                {editItems.map((item, index) => (
                  <div
                    key={item._id}
                    className={`flex items-center gap-3 py-3 ${
                      index < editItems.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}>
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover relative!"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                        {item.name}
                      </h3>
                      {item.variant && (
                        <span className="mt-1 inline-block px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-md">
                          {item.variant}
                        </span>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleEditQtyChange(item._id, -1)}
                          disabled={item.quantity <= 1}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 text-gray-600 disabled:opacity-40 hover:bg-gray-50">
                          <MinusOutlined className="text-[10px]" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleEditQtyChange(item._id, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50">
                          <PlusOutlined className="text-[10px]" />
                        </button>
                        <button
                          onClick={() => handleEditRemoveItem(item._id)}
                          aria-label={`Remove ${item.name}`}
                          className="ml-2 flex h-6 w-6 items-center justify-center rounded-md bg-red-50 text-red-500 hover:bg-red-100">
                          <DeleteOutlined className="text-xs" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-[#0F8A5F]">
                        ₹{item.price * item.quantity}
                      </p>
                      <p className="text-xs text-gray-500">
                        ₹{item.price} each
                      </p>
                    </div>
                  </div>
                ))}
                {editItems.length === 0 && (
                  <p className="py-4 text-center text-sm text-red-600">
                    No items left — cancel the order instead of removing
                    everything.
                  </p>
                )}
              </div>

              <Divider className="my-2" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{editSubtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">
                    {editShippingFee === 0 ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      `₹${editShippingFee}`
                    )}
                  </span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between text-base font-bold">
                  <span>New Total</span>
                  <span className="text-[#0F8A5F]">₹{editTotal}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 py-2.5 text-sm font-bold text-gray-600 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
                  <CloseOutlined className="mr-1" /> Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={updateOrderMutation.isPending}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-[#0F8A5F] rounded-xl hover:bg-[#0A6B47] disabled:opacity-50 transition-all">
                  {updateOrderMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Item list */}
              <div>
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 py-3 ${
                      index < order.items.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}>
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover relative!"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-gray-500">
                        {item.variant && (
                          <span className="px-2 py-0.5 font-semibold bg-blue-100 text-blue-700 rounded-md">
                            {item.variant}
                          </span>
                        )}
                        <span>
                          Qty: {item.quantity} {item.unit || ""}
                        </span>
                      </div>
                      {item.resolution?.action && (
                        <p className="mt-1 text-xs font-medium text-amber-700">
                          {item.resolution.action === "remove" &&
                            "Removed — out of stock at delivery time"}
                          {item.resolution.action === "replace" &&
                            `Replaced with ${item.resolution.replacement?.name} (${item.resolution.replacement?.variant})`}
                          {item.resolution.action === "accept_price" &&
                            `Price updated to ₹${item.availabilityIssue?.newPrice}`}
                          {item.resolution.action === "accept_partial" &&
                            `Reduced to ${item.fulfilledQuantity} available`}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-[#0F8A5F]">
                        ₹{item.subtotal || item.price * item.quantity}
                      </p>
                      <p className="text-xs text-gray-500">
                        ₹{item.price} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Divider className="my-2" />

              {/* Bill breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal ({order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"})
                  </span>
                  <span className="font-medium">₹{order.pricing.subtotal}</span>
                </div>
                {order.coupon?.code && (
                  <div className="flex justify-between items-center bg-green-50 -mx-2 px-2 py-2 rounded">
                    <div>
                      <span className="text-green-700 font-medium">
                        Coupon Discount
                      </span>
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">
                        {order.coupon.code}
                      </span>
                    </div>
                    <span className="font-semibold text-green-600">
                      −₹{order.pricing.discount || order.coupon.discount}
                    </span>
                  </div>
                )}
                {!order.coupon?.code && order.pricing.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">
                      −₹{order.pricing.discount}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">
                    {order.pricing.shippingFee === 0 ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      `₹${order.pricing.shippingFee}`
                    )}
                  </span>
                </div>
                {order.pricing.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">₹{order.pricing.tax}</span>
                  </div>
                )}
                <Divider className="my-2" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total Paid</span>
                  <span className="text-[#0F8A5F]">₹{order.pricing.total}</span>
                </div>
                {order.fulfillment?.originalTotal != null &&
                  Math.abs(
                    order.fulfillment.originalTotal - order.pricing.total,
                  ) >= 1 && (
                    <p className="text-xs text-amber-700 -mt-1">
                      Updated from the original ₹
                      {order.fulfillment.originalTotal} based on the item
                      changes above.
                    </p>
                  )}
                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-100">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium uppercase">
                    {order.payment.method}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Razorpay Refund Timeline (if applicable) */}
          {order.refund?.id && (
            <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  <h3 className="font-bold text-base">Refund Timeline</h3>
                </div>
                <Button
                  type="link"
                  size="small"
                  icon={<SyncOutlined spin={isRefreshing} />}
                  onClick={handleRefreshRefund}
                  loading={isRefreshing}
                  className="text-blue-600">
                  Refresh Status
                </Button>
              </div>

              {/* Refund Information Card */}
              <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircleOutlined className="text-green-500 text-lg" />
                      <span className="text-sm font-bold text-gray-900">
                        Refund{" "}
                        {order.refund.status === "processed"
                          ? "(Processed)"
                          : order.refund.status === "pending"
                            ? "(Pending)"
                            : order.refund.status === "failed"
                              ? "(Failed)"
                              : ""}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <div>
                        Amount:{" "}
                        <span className="font-semibold text-gray-900">
                          ₹{order.refund.amount?.toFixed(2)}
                        </span>
                      </div>
                      {order.refund.createdAt && (
                        <div>
                          Issued on{" "}
                          {new Date(order.refund.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {order.refund.status && (
                    <div
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        order.refund.status === "processed"
                          ? "bg-green-100 text-green-700"
                          : order.refund.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.refund.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                      }`}>
                      {order.refund.status.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Refund Process Steps */}
                <div className="border-l-2 border-gray-200 ml-2 pl-4 space-y-3 mt-4">
                  {/* Step 1: Refund Processing */}
                  <div className="relative">
                    <div className="absolute -left-5.25 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white"></div>
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">
                        Refund processing
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {order.refund.status === "processed"
                          ? "Completed - Takes 3-5 working days"
                          : "Takes 3-5 working days"}
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Refund Processed */}
                  <div className="relative">
                    <div
                      className={`absolute -left-5.25 w-3 h-3 rounded-full ${
                        order.refund.status === "processed"
                          ? "bg-green-500"
                          : "bg-gray-300"
                      } ring-4 ring-white`}></div>
                    <div className="text-sm">
                      <div
                        className={`font-semibold ${
                          order.refund.status === "processed"
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}>
                        Refund processed
                      </div>
                      <div
                        className={`text-xs mt-0.5 ${
                          order.refund.status === "processed"
                            ? "text-gray-500"
                            : "text-gray-400"
                        }`}>
                        [Amount will be credited to customer&apos;s bank account
                        within 5-7 working days after the refund has processed]
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                {order.refund.speed && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Processing Speed:</span>
                      <span className="font-semibold text-gray-900 capitalize">
                        {order.refund.speed}
                      </span>
                    </div>
                  </div>
                )}

                {order.refund.id && (
                  <div
                    className={`${order.refund.speed ? "mt-2" : "mt-4 pt-3 border-t border-gray-200"}`}>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Refund ID:</span>
                      <span className="font-mono text-gray-900 font-semibold">
                        {order.refund.id}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status-specific Messages */}
              {order.refund.status === "processed" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-800 mb-1">
                        Refund Successfully Processed
                      </p>
                      <p className="text-xs text-green-700">
                        Your refund has been processed by Razorpay. The amount
                        will be credited to your bank account within 5-7 working
                        days.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {order.refund.status === "pending" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <span className="text-blue-600 mt-0.5">ⓘ</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-800 mb-1">
                        Refund is Being Processed
                      </p>
                      <p className="text-xs text-blue-700">
                        Your refund is currently being processed. This typically
                        takes 3-5 working days. Please check back later for
                        updates.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {order.refund.status === "failed" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <span className="text-red-600 mt-0.5">⚠</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800 mb-2">
                        ⚠️ Refund Failed - Action Required
                      </p>
                      <p className="text-xs text-red-700 mb-3">
                        We apologize for the inconvenience. Your refund could
                        not be processed automatically. Please contact our
                        support team to manually process your refund.
                      </p>

                      {order.refund.failureReason && (
                        <div className="mb-3 p-2 bg-red-100 rounded text-xs text-red-800">
                          <span className="font-semibold">Reason: </span>
                          {order.refund.failureReason}
                        </div>
                      )}

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold text-gray-700">
                            📧 Email:
                          </span>
                          <a
                            href="mailto:support@greenbasket.com"
                            className="text-blue-600 hover:underline">
                            support@greenbasket.com
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold text-gray-700">
                            📞 Phone:
                          </span>
                          <a
                            href="tel:+918877665544"
                            className="text-blue-600 hover:underline">
                            +91 88776 65544
                          </a>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={`mailto:support@greenbasket.com?subject=Refund Failed - Order ${order.orderNumber || order._id?.slice(-8).toUpperCase()}&body=Hello,%0A%0AMy refund has failed for the following order:%0A%0AOrder Number: ${order.orderNumber || order._id?.slice(-8).toUpperCase()}%0AOrder ID: ${order._id}%0ARefund Amount: ₹${order.refund.amount}%0A%0APlease help me process the refund manually.%0A%0AThank you.`}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-lg text-center transition-colors">
                          📧 Email Support
                        </a>
                        <a
                          href="tel:+918877665544"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 px-3 rounded-lg text-center transition-colors">
                          📞 Call Support
                        </a>
                      </div>

                      <p className="text-xs text-gray-500 mt-2 italic">
                        💡 Tip: Our support team will manually process your
                        refund within 24-48 hours.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Razorpay Data Debug (only in development) */}
              {process.env.NODE_ENV === "development" &&
                order.refund.razorpayData && (
                  <details className="mt-3">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      View Raw Razorpay Data
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(order.refund.razorpayData, null, 2)}
                    </pre>
                  </details>
                )}
            </div>
          )}
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <EnvironmentOutlined className="text-xl text-[#0F8A5F]" />
              <h2 className="text-lg font-bold">Delivery Address</h2>
            </div>
            {isEditing && (
              <button
                onClick={() => setShowAddressPicker((v) => !v)}
                className="text-xs font-semibold text-emerald-700 hover:underline">
                {showAddressPicker ? "Cancel" : "Change"}
              </button>
            )}
          </div>
          <div>
            <p className="font-semibold">{order.shippingAddress.fullName}</p>
            <p className="text-gray-600">
              {order.shippingAddress.street}
              {order.shippingAddress.area
                ? ", " + order.shippingAddress.area
                : ""}
            </p>
            <p className="text-gray-600">
              {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
              {order.shippingAddress.zipCode}
            </p>
            {order.shippingAddress.phone && (
              <p className="text-gray-600 mt-1">
                <PhoneOutlined /> {order.shippingAddress.phone}
              </p>
            )}
          </div>

          {isEditing && showAddressPicker && (
            <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
              {savedAddresses.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No other saved addresses found.
                </p>
              ) : (
                savedAddresses.map((address) => {
                  const addressId = address.id || address._id;
                  const isSelected = editAddressId === addressId;
                  return (
                    <button
                      key={addressId}
                      onClick={() => setEditAddressId(addressId)}
                      className={`w-full text-left rounded-lg border-2 p-2.5 text-sm transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50"
                          : "border-gray-200 hover:border-emerald-300"
                      }`}>
                      <p className="font-semibold text-gray-900">
                        {address.fullName}{" "}
                        <span className="font-normal text-gray-500">
                          ({address.label || "Address"})
                        </span>
                      </p>
                      <p className="text-xs text-gray-600">
                        {address.street}, {address.city}, {address.state} -{" "}
                        {address.zipCode}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Delivery Schedule */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <h2 className="text-lg font-bold">Delivery Schedule</h2>
            </div>
            {isEditable && !isEditingSchedule && (
              <button
                onClick={handleStartEditSchedule}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all">
                <EditOutlined /> Edit
              </button>
            )}
          </div>

          {isEditingSchedule ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Delivery Date
                </p>
                <div className="flex gap-2">
                  {[
                    { id: getTodayId(), label: "Today" },
                    { id: getTomorrowId(), label: "Tomorrow" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setEditDeliveryDate(opt.id)}
                      className={`flex-1 rounded-lg border-2 py-2 text-sm font-semibold transition-all ${
                        editDeliveryDate === opt.id
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 text-gray-700 hover:border-emerald-300"
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Delivery Time
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {DELIVERY_SLOTS.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setEditDeliveryTimeSlot(slot.id)}
                      className={`rounded-lg border-2 py-2 px-2 text-xs font-medium transition-all ${
                        editDeliveryTimeSlot === slot.id
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 text-gray-700 hover:border-emerald-300"
                      }`}>
                      {slot.icon} {slot.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Delivery Instructions
                </p>
                <Input.TextArea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  maxLength={200}
                  placeholder="e.g., 'Leave at gate'"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelEditSchedule}
                  className="flex-1 py-2.5 text-sm font-bold text-gray-600 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
                  <CloseOutlined className="mr-1" /> Cancel
                </button>
                <button
                  onClick={handleSaveSchedule}
                  disabled={updateOrderMutation.isPending}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-[#0F8A5F] rounded-xl hover:bg-[#0A6B47] disabled:opacity-50 transition-all">
                  {updateOrderMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-600 space-y-1">
              <p>
                <span className="font-semibold text-gray-900">Date:</span>{" "}
                {order.deliveryDate
                  ? new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Not scheduled"}
              </p>
              {order.deliveryTimeSlot && (
                <p>
                  <span className="font-semibold text-gray-900">Time:</span>{" "}
                  {order.deliveryTimeSlot}
                </p>
              )}
              {order.notes && (
                <p>
                  <span className="font-semibold text-gray-900">
                    Instructions:
                  </span>{" "}
                  {order.notes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* <button className="flex-1 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors">
                        Need Help?
                    </button> */}
          {order.status === "delivered" && (
            <button className="flex-1 py-3 text-sm font-medium text-white bg-[#0F8A5F] rounded-xl hover:bg-[#0A6B47] transition-colors">
              Reorder
            </button>
          )}
          {isCancellable && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="ml-auto px-4 py-2 text-sm font-bold text-red-600 border-2 border-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">
              <CloseCircleOutlined className="mr-1" />
              Cancel Order
            </button>
          )}
        </div>
      </main>

      {/* Cancel Order Modal */}
      <Modal
        title="Cancel Order"
        open={cancelModalOpen}
        onOk={handleCancelOrder}
        onCancel={() => {
          setCancelModalOpen(false);
          setCancelReason("");
        }}
        okText="Confirm Cancellation"
        cancelText="Go Back"
        okButtonProps={{
          danger: true,
          loading: cancelOrderMutation.isPending,
        }}>
        <div className="py-4">
          <p className="mb-4 text-gray-700">
            Are you sure you want to cancel order{" "}
            <span className="font-semibold">
              #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
            </span>
            ?
          </p>
          <Input.TextArea
            placeholder="Please provide a reason for cancellation (required)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={4}
            maxLength={200}
            showCount
          />
        </div>
      </Modal>

      <BottomNav />
    </div>
  );
}
