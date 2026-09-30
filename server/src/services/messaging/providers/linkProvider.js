import { normalizeNumber } from "../phone.js";

/**
 * "Click-to-chat link" provider — the default while there is no
 * programmatic WhatsApp gateway wired up.
 *
 * It does NOT call any external API. Instead it builds a wa.me deep link
 * pre-addressed to the recipient and pre-filled with the message body.
 * Opening that link on the sender's phone (the store/admin device that
 * owns `from`) starts a WhatsApp chat *from the sender's number to the
 * receiver's number* — no Business API, no template approval.
 *
 * The link is logged and returned so it can be surfaced wherever it is
 * useful (server logs today, an admin dashboard button / order record
 * tomorrow). Swapping in a real gateway later means adding a sibling
 * provider and flipping MESSAGING_PROVIDER — callers do not change.
 */
const linkProvider = {
  name: "link",

  async send({ from, to, body }) {
    const toNumber = normalizeNumber(to);
    const fromNumber = normalizeNumber(from);

    if (!toNumber) {
      return {
        success: false,
        provider: "link",
        error: "Invalid or missing recipient phone number",
      };
    }

    const link = `https://wa.me/${toNumber}?text=${encodeURIComponent(body || "")}`;

    console.log(
      `📩 [messaging:link] WhatsApp message ready — from ${fromNumber || "unknown"} to ${toNumber}\n${link}`,
    );

    return {
      success: true,
      provider: "link",
      from: fromNumber,
      to: toNumber,
      body,
      link,
    };
  },
};

export default linkProvider;
