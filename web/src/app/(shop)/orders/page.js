"use client";

import BottomNav from "@/components/layout/BottomNav";
import PageHeader from "@/components/layout/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { Badge, Button, Spin, Tabs, Tag } from "antd";
import { useRouter } from "next/navigation";

/**
 * Orders Page - Enhanced with API Integration
 * Shows user's order history with status tabs
 */
export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    data: ordersData,
    isLoading,
    error,
  } = useOrders({
    enabled: !!user,
  });

  const orders = ordersData?.data || [];

  const getStatusBadge = (status) => {
    const statusConfig = {
      delivered: {
        color: "success",
        text: "✓ Delivered",
        icon: <CheckCircleOutlined />,
      },
      out_for_delivery: {
        color: "processing",
        text: "🚚 Out for Delivery",
        icon: <ClockCircleOutlined />,
      },
      confirmed: {
        color: "cyan",
        text: "✓ Confirmed",
        icon: <CheckCircleOutlined />,
      },
      processing: {
        color: "blue",
        text: "⚙️ Processing",
        icon: <ClockCircleOutlined />,
      },
      shipped: {
        color: "purple",
        text: "🚚 Shipped",
        icon: <ClockCircleOutlined />,
      },
      pending: {
        color: "warning",
        text: "⏳ Pending",
        icon: <ClockCircleOutlined />,
      },
      cancelled: { color: "error", text: "✗ Cancelled", icon: null },
      refunded: { color: "default", text: "↩ Refunded", icon: null },
    };

    const config = statusConfig[status] || {
      color: "default",
      text: status,
      icon: null,
    };
    return (
      <Tag
        color={config.color}
        // icon={config.icon}
        className="font-semibold">
        <span className="p-1">{config.text}</span>
      </Tag>
    );
  };

  const OrderCard = ({ order }) => {
    const items = order.items || [];
    const visibleItems = items.slice(0, 3);
    const remainingCount = items.length - visibleItems.length;

    return (
      <div className="bg-white rounded-2xl p-5 shadow-md transition-all duration-300 mb-4 border-2 border-transparent">
        {/* Order Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-gray-500 shrink-0">
            #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
          </span>
          <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
            <span>
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span>|</span>
            <span>
              {new Date(order.createdAt).toLocaleString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
            {getStatusBadge(order.status)}
          </div>
        </div>

        {/* Order Items Preview */}
        <div className="mt-2 mb-4">
          <div className="space-y-2">
            {visibleItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <p className="flex-1 min-w-0 truncate font-medium text-gray-900 text-sm">
                  {item.name || "Product"}
                </p>
                <div className="flex shrink-0 items-center gap-1.5 text-xs text-gray-500">
                  {item.variant && (
                    <span className="px-2 py-0.5 font-medium bg-blue-100 text-blue-700 rounded-md">
                      {item.variant}
                    </span>
                  )}
                  <span>
                    Qty: {item.quantity} {item.unit || ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {remainingCount > 0 && (
            <p className="text-sm text-emerald-600 font-medium mt-2">
              +{remainingCount} more item{remainingCount !== 1 ? "s" : ""}
            </p>
          )}
          <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
            <span className="bg-gray-100 px-2 py-1 rounded-lg">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
            <span className="font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ₹{order.pricing?.total?.toLocaleString() || "0"}
            </span>
          </p>
        </div>

        {/* Delivery Info */}
        {order.status === "out_for_delivery" && (
          <div className="flex items-center gap-2 bg-linear-to-r from-blue-50 to-cyan-50 rounded-xl px-4 py-3 mb-3">
            <ClockCircleOutlined className="text-blue-600 text-lg" />
            <p className="text-sm text-blue-600 font-semibold">
              Expected delivery:{" "}
              {order.estimatedDelivery
                ? new Date(order.estimatedDelivery).toLocaleDateString()
                : "Soon"}
            </p>
          </div>
        )}

        {order.status === "delivered" && order.deliveredAt && (
          <div className="flex items-center gap-2 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl px-4 py-3 mb-3">
            <CheckCircleOutlined className="text-green-600 text-lg" />
            <p className="text-sm text-green-600 font-semibold">
              Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Refund Failed Alert */}
        {order.refund?.status === "failed" && (
          <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 mb-3">
            <span className="text-red-600 text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-sm text-red-700 font-bold">Refund Failed</p>
              <p className="text-xs text-red-600">
                Action required - Please contact support
              </p>
            </div>
            <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded">
              ₹{order.refund.amount}
            </span>
          </div>
        )}

        {/* Refund Processing Alert */}
        {order.refund?.status === "processing" && (
          <div className="flex items-center gap-2 bg-blue-50 border-2 border-blue-200 rounded-xl px-4 py-3 mb-3">
            <ClockCircleOutlined className="text-blue-600 text-lg" />
            <div className="flex-1">
              <p className="text-sm text-blue-700 font-bold">
                Refund Processing
              </p>
              <p className="text-xs text-blue-600">
                Will be credited in 5-7 business days
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
              ₹{order.refund.amount}
            </span>
          </div>
        )}

        {/* Refund Completed Alert */}
        {order.refund?.status === "completed" && (
          <div className="flex items-center gap-2 bg-green-50 border-2 border-green-200 rounded-xl px-4 py-3 mb-3">
            <CheckCircleOutlined className="text-green-600 text-lg" />
            <div className="flex-1">
              <p className="text-sm text-green-700 font-bold">
                Refund Completed
              </p>
              <p className="text-xs text-green-600">
                Amount has been credited to your account
              </p>
            </div>
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
              ₹{order.refund.amount}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3 border-t-2 border-gray-100">
          {/* Contact Support button for failed refunds */}
          {order.refund?.status === "failed" && (
            <a
              href={`mailto:support@greenbasket.com?subject=Refund Failed - Order ${order.orderNumber || order._id?.slice(-8).toUpperCase()}&body=Hello,%0A%0AMy refund has failed for the following order:%0A%0AOrder Number: ${order.orderNumber || order._id?.slice(-8).toUpperCase()}%0AOrder ID: ${order._id}%0ARefund Amount: ₹${order.refund.amount}%0A%0APlease help me process the refund manually.%0A%0AThank you.`}
              className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all text-center">
              📧 Contact Support for Refund
            </a>
          )}
          {order.status === "delivered" && !order.refund?.status && (
            <button className="flex-1 py-2.5 text-sm font-bold text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
              Buy Again
            </button>
          )}
          <button
            onClick={() => router.push(`/orders/${order._id}`)}
            className="ml-auto px-4 py-2 text-sm font-bold text-emerald-600 border-2 border-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">
            View
          </button>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-below-header items-center justify-center bg-white/95">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 font-medium">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-below-header items-center justify-center bg-white/95 px-4">
        <div className="text-center max-w-md">
          <div className="bg-linear-to-br from-red-100 to-orange-100 rounded-3xl p-12 inline-block mb-6">
            <div className="text-7xl">😞</div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Failed to Load Orders
          </h3>
          <p className="text-gray-600 mb-6">Please try again later</p>
          <Button
            type="primary"
            size="large"
            onClick={() => window.location.reload()}
            className="bg-linear-to-r from-emerald-600 to-teal-600 border-0 rounded-xl h-12 px-8 font-semibold">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter((o) =>
    ["pending", "confirmed", "processing", "out_for_delivery"].includes(
      o.status,
    ),
  );
  const completedOrders = orders.filter((o) =>
    ["delivered", "cancelled"].includes(o.status),
  );

  const tabItems = [
    {
      key: "active",
      label: (
        <span className="font-semibold flex items-center gap-2">
          🚀 Active
          {activeOrders.length > 0 && (
            <Badge
              count={activeOrders.length}
              showZero={false}
              // className="bg-emerald-500"
            />
          )}
        </span>
      ),
      children: (
        <div className="py-3">
          {activeOrders.length > 0 ? (
            activeOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))
          ) : (
            <div className="text-center py-20">
              <div className="bg-linear-to-br from-gray-100 to-gray-200 rounded-3xl p-12 inline-block mb-6">
                <div className="text-6xl">📦</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Active Orders
              </h3>
              <p className="text-gray-600 mb-6">
                Start shopping to see your orders here
              </p>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                onClick={() => router.push("/products")}
                className="bg-linear-to-r from-emerald-600 to-teal-600 border-0 rounded-xl h-12 px-8 font-semibold">
                Shop Now
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "completed",
      label: (
        <span className="font-semibold flex items-center gap-2">
          ✓ Completed
          {completedOrders.length > 0 && (
            <Badge
              count={completedOrders.length}
              showZero={false}
              className="bg-gray-500"
            />
          )}
        </span>
      ),
      children: (
        <div className="py-3">
          {completedOrders.length > 0 ? (
            completedOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))
          ) : (
            <div className="text-center py-20">
              <div className="bg-linear-to-br from-gray-100 to-gray-200 rounded-3xl p-12 inline-block mb-6">
                <div className="text-6xl">✓</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Completed Orders
              </h3>
              <p className="text-gray-600">
                Your completed orders will appear here
              </p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-below-header bg-white/95 pb-20 lg:pb-0 lg:pl-0">
      <PageHeader
        title="My Orders"
        subtitle={`${orders.length} total order${orders.length !== 1 ? "s" : ""}`}
      />

      <main className="mx-auto max-w-7xl px-4">
        <Tabs
          defaultActiveKey="active"
          items={tabItems}
          className="orders-tabs"
          size="large"
        />
      </main>

      <BottomNav />
    </div>
  );
}
