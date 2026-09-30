import whatsappClient from "../../../config/whatsapp.js";
import { normalizeNumber } from "../phone.js";

/**
 * WhatsApp Cloud API provider — a thin adapter over the existing
 * config/whatsapp.js client, kept here so the Business API can be turned
 * on later by setting MESSAGING_PROVIDER=cloud-api, with zero changes to
 * the callers in orderNotificationService.
 *
 * Not used while MESSAGING_PROVIDER is unset / "link".
 */
const cloudApiProvider = {
  name: "cloud-api",

  async send({ to, body }) {
    const toNumber = normalizeNumber(to);
    const result = await whatsappClient.sendTextMessage(toNumber, body);

    return {
      success: Boolean(result.success),
      provider: "cloud-api",
      to: toNumber,
      messageId: result.messageId,
      skipped: result.skipped,
      error: result.error,
    };
  },
};

export default cloudApiProvider;
