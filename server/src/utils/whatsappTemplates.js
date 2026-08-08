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
  buildVendorOrderNotificationTemplate,
  buildCustomerOrderStatusTemplate,
};
