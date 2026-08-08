"use client";

import BottomNav from "@/components/layout/BottomNav";
import { useOrder, useRefreshRefundStatus } from "@/hooks/useOrders";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { App, Button, Divider, Spin, Steps } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

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

  // Fetch order from API
  const { data: orderData, isLoading, error } = useOrder(id);
  const order = orderData?.data;

  // Mutation for refreshing refund status
  const refreshRefundMutation = useRefreshRefundStatus();

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
      <div className="flex min-h-screen items-center justify-center">
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
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6 text-6xl">{isAuthError ? "🔒" : "📦"}</div>
          <h1 className="text-2xl font-bold mb-4">
            {isAuthError ? "Access Denied" : "Order Not Found"}
          </h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          {isAuthError && (
            <p className="text-sm text-gray-500 mb-6">
              Please make sure you're logged in with the correct account.
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

  // Define all possible order statuses with labels and descriptions
  const statusConfig = {
    pending: {
      title: "Order Placed",
      icon: "📦",
      color: "#faad14",
    },
    confirmed: {
      title: "Order Confirmed",
      icon: "✅",
      color: "#52c41a",
    },
    processing: {
      title: "Processing",
      icon: "⚙️",
      color: "#1890ff",
    },
    shipped: {
      title: "Shipped",
      icon: "🚚",
      color: "#1890ff",
    },
    delivered: {
      title: "Delivered",
      icon: "🎉",
      color: "#52c41a",
    },
    cancelled: {
      title: "Cancelled",
      icon: "❌",
      color: "#ff4d4f",
    },
    refunded: {
      title: "Refunded",
      icon: "💰",
      color: "#722ed1",
    },
  };

  // Build tracking steps from status history
  const trackingSteps =
    order.statusHistory?.map((history, index) => {
      const config = statusConfig[history.status] || {
        title: history.status.charAt(0).toUpperCase() + history.status.slice(1),
        icon: "📋",
        color: "#d9d9d9",
      };

      const dateStr = new Date(history.updatedAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        title: config.title,
        content: (
          <div>
            <div className="text-xs text-gray-500">{dateStr}</div>
            {history.note && (
              <div className="text-xs text-gray-600 mt-1 italic">
                {history.note}
              </div>
            )}
          </div>
        ),
        status: "finish", // All history items are completed
        icon: <span style={{ fontSize: "20px" }}>{config.icon}</span>,
      };
    }) || [];

  const currentStep = trackingSteps.length - 1;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0 ">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100">
            <ArrowLeftOutlined className="text-xl" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Order Details</h1>
            <p className="text-sm text-gray-600">
              #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-4">
        {/* Order Status */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Order Status</h2>
            <div
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                order.status === "delivered"
                  ? "bg-green-100 text-green-700"
                  : order.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : order.status === "shipped"
                      ? "bg-blue-100 text-blue-700"
                      : order.status === "processing"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
              }`}>
              {statusConfig[order.status]?.title || order.status.toUpperCase()}
            </div>
          </div>
          <Steps
            current={currentStep}
            items={trackingSteps}
            orientation="vertical"
            size="small"
          />
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h2 className="text-lg font-bold mb-4">
            Order Items ({order.items.length})
          </h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index}>
                <div className="flex gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover relative!"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {item.variant && (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-xs font-medium text-gray-500">
                            VARIANT:
                          </span>
                          <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-lg">
                            {item.variant}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">
                        <span className="font-semibold">Qty:</span>{" "}
                        {`${item.quantity} ${item.unit || ""}`}
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-lg text-[#0F8A5F]">
                          ₹{item.subtotal || item.price * item.quantity}
                        </span>
                        <p className="text-xs text-gray-500">
                          ₹{item.price} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {index < order.items.length - 1 && <Divider />}
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <EnvironmentOutlined className="text-xl text-[#0F8A5F]" />
            <h2 className="text-lg font-bold">Delivery Address</h2>
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
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Payment Summary</h2>
            <div
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
            </div>
          </div>

          {/* Razorpay Refund Timeline (if applicable) */}
          {order.refund?.id && (
            <div className="mb-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
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
                        [Amount will be credited to customer's bank account
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
                            href="mailto:support@iqrafashion.com"
                            className="text-blue-600 hover:underline">
                            support@iqrafashion.com
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
                          href={`mailto:support@iqrafashion.com?subject=Refund Failed - Order ${order.orderNumber || order._id?.slice(-8).toUpperCase()}&body=Hello,%0A%0AMy refund has failed for the following order:%0A%0AOrder Number: ${order.orderNumber || order._id?.slice(-8).toUpperCase()}%0AOrder ID: ${order._id}%0ARefund Amount: ₹${order.refund.amount}%0A%0APlease help me process the refund manually.%0A%0AThank you.`}
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
            <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-100">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium uppercase">
                {order.payment.method}
              </span>
            </div>
          </div>
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
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
