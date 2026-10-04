"use client";

import { useAuth } from "@/hooks/useAuth";
import { useDeliveryOrders } from "@/hooks/useDeliveryPartner";
import { getNavigationTarget } from "@/lib/navigation";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Alert, Badge, Button, Empty, Skeleton, Tag } from "antd";
import Link from "next/link";
import { useState } from "react";

const TABS = [
  { key: "available", label: "Available" },
  { key: "active", label: "My Deliveries" },
  { key: "completed", label: "Completed" },
];

const STATUS_COLORS = {
  processing: "blue",
  shipped: "orange",
  delivered: "green",
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    : null;

const slotLine = (order) =>
  [
    formatDate(order.deliveryDate),
    order.deliveryTimeSlot,
  ]
    .filter(Boolean)
    .join(" · ");

const paymentLabel = (payment) => {
  if (payment.status === "completed") {
    return payment.collectedMethod
      ? `Paid · ${payment.collectedMethod.toUpperCase()}`
      : "Paid";
  }
  return `${payment.method === "cod" ? "COD" : payment.method} · ${payment.status}`;
};

/**
 * Card for orders without customer details: available orders (before
 * acceptance) and completed orders. Mirrors what the API releases — order
 * reference info only.
 */
function LimitedOrderCard({ order }) {
  const done = order.status === "delivered";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <Link href={`/delivery/orders/${order._id}`} className="block">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="m-0 font-bold text-gray-900">#{order.orderNumber}</p>
            <p className="m-0 text-xs text-gray-500">
              Ordered {formatDate(order.createdAt)}
            </p>
          </div>
          <Tag color={STATUS_COLORS[order.status]} className="m-0 capitalize">
            {order.status}
          </Tag>
        </div>

        {slotLine(order) && (
          <p className="mt-2 mb-0 flex items-center gap-1.5 text-sm text-gray-700">
            <ClockCircleOutlined />
            {slotLine(order)}
          </p>
        )}

        {done && order.deliveredAt && (
          <p className="mt-1 mb-0 text-xs text-gray-500">
            Delivered{" "}
            {new Date(order.deliveredAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        )}

        {order.area && (
          <p className="mt-1 mb-0 text-sm text-gray-600">
            <EnvironmentOutlined className="text-emerald-600" /> Area:{" "}
            {order.area.city} - {order.area.zipCode}
          </p>
        )}

        <p className="mt-2 mb-0 text-sm text-gray-600">
          {order.itemCount} item(s)
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-emerald-700">
            ₹{order.total}
          </span>
          <Tag
            color={order.payment.status === "completed" ? "green" : "gold"}
            className="m-0">
            {paymentLabel(order.payment)}
          </Tag>
        </div>
      </Link>

      <Link href={`/delivery/orders/${order._id}`} className="mt-3 block">
        <Button block type={done ? "default" : "primary"} className="h-10">
          {done ? "View Summary" : "View & Accept"}
        </Button>
      </Link>
    </div>
  );
}

/** Active delivery: full customer, address and navigation shortcuts */
function ActiveOrderCard({ order }) {
  const addr = order.shippingAddress;
  const nav = getNavigationTarget(
    addr.location,
    `${addr.street}, ${addr.city} ${addr.zipCode}`,
  );

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <Link href={`/delivery/orders/${order._id}`} className="block">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-gray-900">#{order.orderNumber}</p>
            <p className="truncate text-sm text-gray-600">
              {order.customer.name}
            </p>
          </div>
          <Tag color={STATUS_COLORS[order.status]} className="m-0 capitalize">
            {order.status}
          </Tag>
        </div>

        <p className="mt-2 flex items-start gap-1.5 text-sm text-gray-700">
          <EnvironmentOutlined className="mt-1 text-emerald-600" />
          <span>
            {addr.street}, {addr.city} - {addr.zipCode}
          </span>
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          {slotLine(order) && (
            <span className="flex items-center gap-1">
              <ClockCircleOutlined />
              {slotLine(order)}
            </span>
          )}
          <span>{order.itemCount} item(s)</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-emerald-700">
            ₹{order.total}
          </span>
          <Tag
            color={order.payment.status === "completed" ? "green" : "gold"}
            className="m-0">
            {paymentLabel(order.payment)}
          </Tag>
        </div>
      </Link>

      <div className="mt-3 flex gap-2">
        <Link href={`/delivery/orders/${order._id}`} className="flex-1">
          <Button block type="primary" className="h-10 bg-emerald-600">
            View Details
          </Button>
        </Link>
        {nav.url && (
          <Button
            className="h-10"
            href={nav.url}
            target="_blank"
            rel="noopener noreferrer"
            icon={<EnvironmentOutlined />}>
            Route
          </Button>
        )}
        {order.customer.phone && (
          <Button
            className="h-10"
            href={`tel:${order.customer.phone}`}
            icon={<PhoneOutlined />}
            aria-label="Call customer"
          />
        )}
      </div>
    </div>
  );
}

/**
 * Delivery Partner Dashboard
 * Lists processing orders available to accept, the partner's own active
 * deliveries and their completed ones. Everything comes from the backend.
 */
export default function DeliveryDashboardPage() {
  const { user } = useAuth();
  const [scope, setScope] = useState("available");
  const { data, isLoading, isFetching, error, refetch } =
    useDeliveryOrders(scope);

  const orders = data?.data || [];
  const counts = data?.counts || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="m-0 text-xl font-bold text-gray-900 md:text-2xl">
            Hi, {user?.firstName}!
          </h2>
          <p className="m-0 text-sm text-gray-500">Your deliveries</p>
        </div>
        <Button
          icon={<ReloadOutlined spin={isFetching} />}
          onClick={() => refetch()}
          aria-label="Refresh"
        />
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setScope(t.key)}
            className={`rounded-lg px-1 py-2 text-xs font-semibold transition-colors sm:text-sm ${
              scope === t.key
                ? "bg-white text-emerald-700 shadow"
                : "text-gray-600"
            }`}>
            {t.label}{" "}
            <Badge
              count={counts[t.key] || 0}
              showZero
              size="small"
              color={scope === t.key ? "#059669" : "#9ca3af"}
            />
          </button>
        ))}
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error.message || "Couldn't load orders"}
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white p-4">
              <Skeleton active paragraph={{ rows: 3 }} />
            </div>
          ))}
        </div>
      ) : orders.length === 0 && !error ? (
        <div className="rounded-2xl bg-white py-10">
          <Empty
            description={
              scope === "available"
                ? "No processing orders are waiting for a delivery partner"
                : scope === "active"
                  ? "You have no active deliveries"
                  : "No completed deliveries yet"
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {orders.map((order) =>
            order.view === "full" ? (
              <ActiveOrderCard key={order._id} order={order} />
            ) : (
              <LimitedOrderCard key={order._id} order={order} />
            ),
          )}
        </div>
      )}
    </div>
  );
}
