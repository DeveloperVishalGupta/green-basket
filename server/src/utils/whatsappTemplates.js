/**
 * WhatsApp template payload builders for order notifications.
 *
 * These build the `{ name, languageCode, components }` shape that
 * config/whatsapp.js#sendTemplateMessage forwards to Meta's API — not
 * plain message strings. Template parameters can't contain newlines or
 * runs of spaces, so every value here is a single flat line, and the
 * template bodies themselves (name, wording, layout) live in Meta
 * Business Manager, not in this file — see WHATSAPP_TEMPLATES below for
 * the names this app expects to already be approved there.
 */

const WHATSAPP_TEMPLATES = {
  customerOrderConfirmation:
    process.env.WHATSAPP_TEMPLATE_ORDER_CONFIRMATION || "order_confirmation",
  vendorNewOrder:
    process.env.WHATSAPP_TEMPLATE_NEW_ORDER_VENDOR || "new_order_vendor",
  customerOrderConfirmed:
    process.env.WHATSAPP_TEMPLATE_ORDER_CONFIRMED || "order_confirmed_by_vendor",
  customerOrderRejected:
    process.env.WHATSAPP_TEMPLATE_ORDER_REJECTED || "order_rejected_by_vendor",
};

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const formatCustomerName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Customer";

const formatItemsSummary = (items = []) =>
  items.map((item) => `${item.quantity}x ${item.name}`).join(", ");

const textParam = (value) => ({ type: "text", text: String(value) });

/** Admin/business contact shown in customer messages ("+91 9320206598"). */
const ADMIN_CONTACT_NUMBER = process.env.ADMIN_CONTACT_NUMBER || "+91 9320206598";

const formatDeliveryDate = (date) => {
  if (!date) return "Not scheduled";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "Not scheduled";
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatItemLine = (item, index) => {
  const label = item.variant ? `${item.name} (${item.variant})` : item.name;
  return `${index + 1}. ${item.quantity} x ${label} — ${formatCurrency(
    item.price,
  )} x ${item.quantity} = ${formatCurrency(item.subtotal ?? item.price * item.quantity)}`;
};

/**
 * Full, human-readable order summary sent to the customer as a plain-text
 * WhatsApp message (not a template) right after checkout. Includes the
 * itemised list, the bill breakdown with any coupon/offer discount, the
 * delivery date + allotted time slot, and the delivery address.
 */
const buildCustomerOrderDetailsText = (order, user) => {
  const pricing = order.pricing || {};
  const addr = order.shippingAddress || {};

  const lines = [
    `Hi ${formatCustomerName(user)}, your Green Basket order is confirmed! 🧺`,
    "",
    `*Order No:* ${order.orderNumber}`,
    `*Placed on:* ${formatDeliveryDate(order.createdAt || new Date())}`,
    "",
    "*Items*",
    ...order.items.map(formatItemLine),
    "",
    "*Bill Details*",
    `Item total: ${formatCurrency(pricing.subtotal)}`,
  ];

  if (pricing.discount > 0) {
    const offerLabel = order.coupon?.code
      ? `Offer (${order.coupon.code})`
      : "Discount";
    lines.push(`${offerLabel}: -${formatCurrency(pricing.discount)}`);
  }

  lines.push(
    `Delivery fee: ${pricing.shippingFee > 0 ? formatCurrency(pricing.shippingFee) : "FREE"}`,
  );

  if (pricing.tax > 0) {
    lines.push(`Tax: ${formatCurrency(pricing.tax)}`);
  }

  lines.push(
    `*To pay (Cash on Delivery): ${formatCurrency(pricing.total)}*`,
    "",
    "*Delivery*",
    `Date: ${formatDeliveryDate(order.deliveryDate)}`,
    `Time slot: ${order.deliveryTimeSlot || "To be confirmed"}`,
    `Address: ${[addr.street, addr.city, addr.state, addr.zipCode]
      .filter(Boolean)
      .join(", ")}`,
    "",
    `Need help? Call or WhatsApp us at ${ADMIN_CONTACT_NUMBER}.`,
    "Thank you for shopping with Green Basket!",
  );

  return lines.join("\n");
};

/**
 * Compact new-order summary sent to the vendor/admin as a plain-text
 * WhatsApp message (used by the non-API "link" messaging provider, which
 * cannot carry the Confirm/Reject quick-reply buttons).
 */
const buildVendorOrderDetailsText = (order) => {
  const pricing = order.pricing || {};
  const addr = order.shippingAddress || {};

  return [
    `🛒 New order ${order.orderNumber}`,
    "",
    "*Items*",
    ...order.items.map(formatItemLine),
    "",
    `Item total: ${formatCurrency(pricing.subtotal)}`,
    pricing.discount > 0
      ? `Discount${order.coupon?.code ? ` (${order.coupon.code})` : ""}: -${formatCurrency(pricing.discount)}`
      : null,
    `Delivery fee: ${pricing.shippingFee > 0 ? formatCurrency(pricing.shippingFee) : "FREE"}`,
    `*Total (COD): ${formatCurrency(pricing.total)}*`,
    "",
    `Deliver on: ${formatDeliveryDate(order.deliveryDate)} — ${order.deliveryTimeSlot || "slot TBC"}`,
    `To: ${[addr.street, addr.city, addr.state, addr.zipCode].filter(Boolean).join(", ")}`,
    addr.phone ? `Phone: ${addr.phone}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n");
};

/**
 * Template sent to the customer confirming their order was placed.
 */
const buildCustomerOrderConfirmationTemplate = (order, user) => ({
  name: WHATSAPP_TEMPLATES.customerOrderConfirmation,
  languageCode: "en",
  components: [
    {
      type: "body",
      parameters: [
        textParam(formatCustomerName(user)),
        textParam(order.orderNumber),
        textParam(formatItemsSummary(order.items)),
        textParam(formatCurrency(order.pricing?.total)),
      ],
    },
  ],
});

/**
 * Template sent to the vendor/admin alerting them of a new order, with
 * Confirm/Reject quick-reply buttons. The payloads encode the order id
 * so the webhook handler knows which order a button tap refers to.
 */
const buildVendorOrderNotificationTemplate = (order) => ({
  name: WHATSAPP_TEMPLATES.vendorNewOrder,
  languageCode: "en",
  components: [
    {
      type: "body",
      parameters: [
        textParam(order.orderNumber),
        textParam(formatItemsSummary(order.items)),
        textParam(formatCurrency(order.pricing?.total)),
      ],
    },
    {
      type: "button",
      sub_type: "quick_reply",
      index: "0",
      parameters: [{ type: "payload", payload: `CONFIRM_${order._id}` }],
    },
    {
      type: "button",
      sub_type: "quick_reply",
      index: "1",
      parameters: [{ type: "payload", payload: `REJECT_${order._id}` }],
    },
  ],
});

/**
 * Template sent to the customer once the vendor has confirmed or rejected
 * their order.
 */
const buildCustomerOrderStatusTemplate = (order, user, vendorStatus) => ({
  name:
    vendorStatus === "confirmed"
      ? WHATSAPP_TEMPLATES.customerOrderConfirmed
      : WHATSAPP_TEMPLATES.customerOrderRejected,
  languageCode: "en",
  components: [
    {
      type: "body",
      parameters: [textParam(formatCustomerName(user)), textParam(order.orderNumber)],
    },
  ],
});

export {
  WHATSAPP_TEMPLATES,
  buildCustomerOrderConfirmationTemplate,
  buildCustomerOrderDetailsText,
  buildVendorOrderDetailsText,
  buildVendorOrderNotificationTemplate,
  buildCustomerOrderStatusTemplate,
};
