"use client";

import {
  useAcceptOrder,
  useCollectCash,
  useConfirmUpiPayment,
  useCreateUpiQr,
  useDeliveryOrder,
  useUpdateDeliveryStatus,
} from "@/hooks/useDeliveryPartner";
import { getNavigationTarget } from "@/lib/navigation";
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CopyOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { Alert, App, Button, Input, Segmented, Skeleton, Tag } from "antd";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { use, useRef, useState } from "react";

const STATUS_COLORS = {
  processing: "blue",
  shipped: "orange",
  delivered: "green",
  cancelled: "red",
};

const money = (n) => `₹${Number(n ?? 0).toLocaleString("en-IN")}`;

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1 text-sm">
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{children}</span>
    </div>
  );
}

/**
 * Payment collection:
 * - Cash: partner confirms the cash was received.
 * - UPI: a QR for the exact total addressed to the business UPI ID. A plain
 *   UPI QR has no gateway callback, so the partner confirms once the money
 *   shows up in their UPI app / bank alert (optionally noting the UTR). The
 *   order is only shown as paid when the server says so.
 */
function PaymentPanel({ order }) {
  const { message, modal } = App.useApp();
  const [mode, setMode] = useState("cash");
  const collectCash = useCollectCash();
  const createQr = useCreateUpiQr();
  const confirmUpi = useConfirmUpiPayment();
  const [upi, setUpi] = useState(null);
  const referenceRef = useRef("");

  const paid = order.payment.status === "completed";

  if (paid) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-green-50 p-3 text-green-800">
        <CheckCircleFilled className="text-2xl text-green-600" />
        <div>
          <p className="m-0 font-semibold">
            Payment received{" "}
            {order.payment.collectedMethod
              ? `via ${order.payment.collectedMethod.toUpperCase()}`
              : ""}
          </p>
          <p className="m-0 text-sm">{money(order.pricing.total)}</p>
        </div>
      </div>
    );
  }

  if (!order.canCollectPayment) {
    return (
      <p className="m-0 text-sm text-gray-600">
        Payment is {order.payment.status}.
        {order.assignedToMe ? "" : " Accept this order to collect payment."}
      </p>
    );
  }

  const confirmCash = () =>
    modal.confirm({
      title: `Cash received: ${money(order.pricing.total)}?`,
      content: "Confirm only after you have collected the full amount.",
      okText: "Yes, received",
      okButtonProps: { className: "bg-emerald-600" },
      onOk: () =>
        collectCash
          .mutateAsync(order._id)
          .then(() => message.success("Cash payment recorded"))
          .catch((e) => message.error(e.message || "Couldn't record payment")),
    });

  const showQr = () =>
    createQr
      .mutateAsync(order._id)
      .then((res) => setUpi(res.data.data))
      .catch((e) =>
        message.error(e.message || "Couldn't generate the UPI QR code"),
      );

  const confirmUpiReceived = () => {
    referenceRef.current = "";
    modal.confirm({
      title: `UPI payment of ${money(order.pricing.total)} received?`,
      content: (
        <div className="space-y-2">
          <p className="m-0">
            Confirm only after the amount shows in your UPI app or bank alert.
          </p>
          <Input
            placeholder="UPI reference / UTR (optional)"
            maxLength={40}
            onChange={(e) => {
              referenceRef.current = e.target.value;
            }}
          />
        </div>
      ),
      okText: "Yes, received",
      okButtonProps: { className: "bg-emerald-600" },
      onOk: () =>
        confirmUpi
          .mutateAsync({
            id: order._id,
            reference: referenceRef.current.trim() || undefined,
          })
          .then(() => message.success("UPI payment recorded"))
          .catch((e) => message.error(e.message || "Couldn't record payment")),
    });
  };

  const copyUpiId = () =>
    navigator.clipboard
      ?.writeText(upi.upiId)
      .then(() => message.success("UPI ID copied"))
      .catch(() => message.error("Couldn't copy"));

  return (
    <div className="space-y-3">
      <Segmented
        block
        value={mode}
        onChange={setMode}
        options={[
          { label: "💵 Cash", value: "cash" },
          { label: "📱 UPI", value: "upi" },
        ]}
      />

      {mode === "cash" ? (
        <Button
          type="primary"
          block
          size="large"
          loading={collectCash.isPending}
          onClick={confirmCash}
          className="h-12 bg-emerald-600">
          Cash received · {money(order.pricing.total)}
        </Button>
      ) : !upi ? (
        <Button
          type="primary"
          block
          size="large"
          loading={createQr.isPending}
          onClick={showQr}
          className="h-12 bg-emerald-600">
          Show UPI QR · {money(order.pricing.total)}
        </Button>
      ) : (
        <div className="space-y-3 text-center">
          <div className="mx-auto inline-block rounded-xl border border-gray-200 bg-white p-3">
            <QRCodeSVG
              value={upi.upiLink}
              size={224}
              level="M"
              marginSize={1}
              title={`UPI payment of ${money(upi.amount)}`}
            />
          </div>
          <p className="m-0 text-lg font-bold text-gray-900">
            {money(upi.amount)}
          </p>
          <p className="m-0 text-sm text-gray-600">
            Pay to <span className="font-semibold">{upi.payeeName}</span>
            {" · "}
            <span className="font-semibold">{upi.upiId}</span>{" "}
            <Button
              size="small"
              type="text"
              icon={<CopyOutlined />}
              onClick={copyUpiId}
              aria-label="Copy UPI ID"
            />
          </p>
          <p className="m-0 text-xs text-gray-500">
            The customer scans this in any UPI app; the amount is filled in
            automatically. Once the money arrives, confirm below.
          </p>
          <Button
            type="primary"
            block
            size="large"
            loading={confirmUpi.isPending}
            onClick={confirmUpiReceived}
            className="h-12 bg-emerald-600">
            Payment received in my UPI app
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Limited view: shown for orders the partner hasn't accepted yet and for
 * completed ones. The API withholds customer, address and location data for
 * these, so there is nothing sensitive to render here.
 */
function LimitedOrderView({ order, accept, onAccept }) {
  const done = order.status === "delivered";
  const paid = order.payment.status === "completed";

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <Link href="/delivery/dashboard">
          <Button icon={<ArrowLeftOutlined />} aria-label="Back" />
        </Link>
        <h2 className="m-0 min-w-0 flex-1 truncate text-lg font-bold text-gray-900">
          Order #{order.orderNumber}
        </h2>
        <Tag color={STATUS_COLORS[order.status]} className="m-0 capitalize">
          {order.status}
        </Tag>
      </div>

      {order.availableToClaim && (
        <>
          <Button
            type="primary"
            block
            size="large"
            loading={accept.isPending}
            onClick={onAccept}
            className="h-12 bg-emerald-600">
            Accept this delivery
          </Button>
          <Alert
            type="info"
            showIcon
            message="Customer details, the full address and navigation are shown after you accept this order."
          />
        </>
      )}

      <Section title="Order summary">
        <Row label="Order ID">#{order.orderNumber}</Row>
        <Row label="Order date">
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </Row>
        {order.deliveryDate && (
          <Row label="Delivery date">
            {new Date(order.deliveryDate).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </Row>
        )}
        {order.deliveryTimeSlot && (
          <Row label="Time slot">{order.deliveryTimeSlot}</Row>
        )}
        {done && order.deliveredAt && (
          <Row label="Delivered at">
            {new Date(order.deliveredAt).toLocaleString("en-IN")}
          </Row>
        )}
        {order.area && (
          <Row label="Area">
            {order.area.city} - {order.area.zipCode}
          </Row>
        )}
        <Row label="Status">
          <Tag color={STATUS_COLORS[order.status]} className="m-0 capitalize">
            {order.status}
          </Tag>
        </Row>
      </Section>

      <Section title="Payment">
        <Row label="Amount">
          <span className="text-base font-bold text-emerald-700">
            {money(order.total)}
          </span>
        </Row>
        <Row label="Order method">
          <span className="uppercase">{order.payment.method}</span>
        </Row>
        <Row label="Status">
          <Tag color={paid ? "green" : "gold"} className="m-0 capitalize">
            {paid
              ? `Paid${order.payment.collectedMethod ? ` · ${order.payment.collectedMethod.toUpperCase()}` : ""}`
              : order.payment.status}
          </Tag>
        </Row>
      </Section>

      {order.itemsSummary?.length > 0 && (
        <Section title={`Items (${order.itemCount})`}>
          <ul className="m-0 list-none divide-y divide-gray-100 p-0">
            {order.itemsSummary.map((item, i) => (
              <li key={i} className="flex justify-between gap-3 py-2 text-sm">
                <span className="min-w-0 truncate">
                  {item.name}
                  {item.variant ? ` (${item.variant})` : ""}
                </span>
                <span className="shrink-0 font-medium">× {item.quantity}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

export default function DeliveryOrderPage({ params }) {
  const { id } = use(params);
  const { message, modal } = App.useApp();

  const { data: order, isLoading, error, refetch } = useDeliveryOrder(id);

  const accept = useAcceptOrder();
  const updateStatus = useUpdateDeliveryStatus();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton active />
        <Skeleton active />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-3">
        <Link href="/delivery/dashboard">
          <Button icon={<ArrowLeftOutlined />}>Back</Button>
        </Link>
        <Alert
          type="error"
          showIcon
          message={error?.message || "Order not found"}
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const run = (promise, success) =>
    promise
      .then(() => message.success(success))
      .catch((e) => message.error(e.message || "Something went wrong"));

  if (order.view === "limited") {
    return (
      <LimitedOrderView
        order={order}
        accept={accept}
        onAccept={() => run(accept.mutateAsync(order._id), "Order accepted")}
      />
    );
  }

  const addr = order.shippingAddress;
  const addressText =
    addr.formattedAddress ||
    `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
  const nav = getNavigationTarget(addr.location, addressText);
  const paid = order.payment.status === "completed";

  const confirmStatus = (status, title) =>
    modal.confirm({
      title,
      okText: "Confirm",
      okButtonProps: { className: "bg-emerald-600" },
      onOk: () =>
        run(
          updateStatus.mutateAsync({ id: order._id, status }),
          `Order marked as ${status}`,
        ),
    });

  const canShip = order.allowedNextStatuses.includes("shipped");
  const canDeliver = order.allowedNextStatuses.includes("delivered");

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <Link href="/delivery/dashboard">
          <Button icon={<ArrowLeftOutlined />} aria-label="Back" />
        </Link>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 truncate text-lg font-bold text-gray-900">
            Order #{order.orderNumber}
          </h2>
        </div>
        <Tag
          color={STATUS_COLORS[order.status]}
          className="m-0 capitalize">
          {order.status}
        </Tag>
      </div>

      {/* Primary actions */}
      <div className="space-y-2">
        {order.availableToClaim && (
          <Button
            type="primary"
            block
            size="large"
            loading={accept.isPending}
            onClick={() =>
              run(accept.mutateAsync(order._id), "Order accepted")
            }
            className="h-12 bg-emerald-600">
            Accept this delivery
          </Button>
        )}

        {nav.url ? (
          <>
            <Button
              block
              size="large"
              href={nav.url}
              target="_blank"
              rel="noopener noreferrer"
              icon={<EnvironmentOutlined />}
              className="h-12">
              Get Route / Navigate
            </Button>
            {!nav.exact && (
              <Alert
                type="warning"
                showIcon
                message="Exact location isn't available for this order. Navigation uses the address text and may be less accurate."
              />
            )}
          </>
        ) : (
          <Alert
            type="warning"
            showIcon
            message="Navigation unavailable: this order has no usable location or address."
          />
        )}

        {canShip && (
          <Button
            type="primary"
            block
            size="large"
            loading={updateStatus.isPending}
            onClick={() =>
              confirmStatus("shipped", "Start delivery (mark as shipped)?")
            }
            className="h-12 bg-emerald-600">
            Start Delivery · Mark Shipped
          </Button>
        )}

        {canDeliver && (
          <>
            <Button
              type="primary"
              block
              size="large"
              disabled={!paid}
              loading={updateStatus.isPending}
              onClick={() =>
                confirmStatus("delivered", "Mark this order as delivered?")
              }
              className="h-12 bg-emerald-600">
              Mark as Delivered
            </Button>
            {!paid && (
              <p className="m-0 text-center text-sm text-amber-700">
                Collect the payment below before marking as delivered.
              </p>
            )}
          </>
        )}
      </div>

      {/* Payment */}
      <Section title="Payment">
        <div className="mb-3 space-y-0.5">
          <Row label="Amount to collect">
            <span className="text-lg font-bold text-emerald-700">
              {paid ? money(0) : money(order.pricing.total)}
            </span>
          </Row>
          <Row label="Order method">
            <span className="uppercase">{order.payment.method}</span>
          </Row>
          <Row label="Status">
            <Tag
              color={paid ? "green" : "gold"}
              className="m-0 capitalize">
              {order.payment.status}
            </Tag>
          </Row>
        </div>
        <PaymentPanel order={order} />
      </Section>

      {/* Customer */}
      <Section title="Customer">
        <Row label="Name">{order.customer.name || "—"}</Row>
        <Row label="Phone">
          {order.customer.phone ? (
            <a
              href={`tel:${order.customer.phone}`}
              className="text-emerald-700">
              <PhoneOutlined /> {order.customer.phone}
            </a>
          ) : (
            "—"
          )}
        </Row>
        {order.customer.email && <Row label="Email">{order.customer.email}</Row>}
      </Section>

      {/* Address */}
      <Section title="Delivery address">
        <p className="m-0 text-sm text-gray-800">
          {addr.label && <Tag className="mr-2">{addr.label}</Tag>}
          {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
        </p>
        {addr.formattedAddress && (
          <p className="mt-1 mb-0 text-xs text-gray-500">
            {addr.formattedAddress}
          </p>
        )}
        {addr.location && (
          <p className="mt-1 mb-0 text-xs text-gray-400">
            {addr.location.lat.toFixed(5)}, {addr.location.lng.toFixed(5)}
          </p>
        )}
        <div className="mt-2 border-t border-gray-100 pt-2">
          {order.deliveryDate && (
            <Row label="Delivery date">
              {new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </Row>
          )}
          {order.deliveryTimeSlot && (
            <Row label="Time slot">{order.deliveryTimeSlot}</Row>
          )}
        </div>
        {order.notes && (
          <p className="mt-2 mb-0 rounded-lg bg-amber-50 p-2 text-sm text-amber-800">
            Note: {order.notes}
          </p>
        )}
      </Section>

      {/* Items */}
      <Section title={`Items (${order.items.filter((i) => !i.removed).length})`}>
        <ul className="m-0 list-none divide-y divide-gray-100 p-0">
          {order.items.map((item) => (
            <li
              key={item._id}
              className={`flex items-center gap-3 py-2 ${
                item.removed ? "opacity-50" : ""
              }`}>
              {item.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={`m-0 truncate text-sm font-medium ${
                    item.removed ? "line-through" : ""
                  }`}>
                  {item.name}
                </p>
                <p className="m-0 text-xs text-gray-500">
                  {item.variant ? `${item.variant} · ` : ""}
                  {money(item.price)} × {item.quantity}
                  {item.removed ? " (removed)" : ""}
                  {!item.removed && item.orderedQuantity !== item.quantity
                    ? ` (ordered ${item.orderedQuantity})`
                    : ""}
                </p>
              </div>
              <span className="text-sm font-semibold">
                {money(item.removed ? 0 : item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-2 border-t border-gray-100 pt-2">
          <Row label="Subtotal">{money(order.pricing.subtotal)}</Row>
          {order.pricing.discount > 0 && (
            <Row label="Discount">-{money(order.pricing.discount)}</Row>
          )}
          <Row label="Delivery fee">
            {order.pricing.shippingFee > 0
              ? money(order.pricing.shippingFee)
              : "Free"}
          </Row>
          <Row label="Total">
            <span className="text-base font-bold">
              {money(order.pricing.total)}
            </span>
          </Row>
        </div>
      </Section>

      {/* Timeline */}
      {order.statusHistory?.length > 0 && (
        <Section title="Status history">
          <ul className="m-0 list-none space-y-2 p-0">
            {[...order.statusHistory].reverse().map((h, i) => (
              <li key={h._id || i} className="text-sm">
                <span className="font-medium capitalize">{h.status}</span>{" "}
                <span className="text-xs text-gray-400">
                  {new Date(h.updatedAt).toLocaleString("en-IN")}
                </span>
                {h.note && <p className="m-0 text-xs text-gray-500">{h.note}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
