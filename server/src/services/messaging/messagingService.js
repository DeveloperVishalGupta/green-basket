import cloudApiProvider from "./providers/cloudApiProvider.js";
import linkProvider from "./providers/linkProvider.js";

/**
 * Messaging Service
 *
 * Single seam between the app and "how a WhatsApp message actually goes
 * out". Order/payment code depends only on `sendWhatsAppMessage(...)`;
 * the concrete mechanism is chosen by the MESSAGING_PROVIDER env var:
 *
 *   link      (default) — build a wa.me click-to-chat link; the sender's
 *                          phone sends it to the receiver. No API.
 *   cloud-api          — Meta WhatsApp Business Cloud API (future).
 *
 * Every provider implements the same contract and never throws:
 *   send({ from, to, body }) -> Promise<{
 *     success, provider, from?, to?, link?, messageId?, skipped?, error?
 *   }>
 *
 * Adding a new gateway later = drop a provider in ./providers and list it
 * here. No caller changes.
 */
const PROVIDERS = {
  link: linkProvider,
  "cloud-api": cloudApiProvider,
};

export function getActiveProviderName() {
  return process.env.MESSAGING_PROVIDER || "link";
}

function getActiveProvider() {
  return PROVIDERS[getActiveProviderName()] || linkProvider;
}

/**
 * The store/admin number that messages are sent *from*. This is the
 * device whose WhatsApp opens the click-to-chat link today, and the
 * Business number once the Cloud API is enabled.
 */
export function getSenderNumber() {
  return (
    process.env.WHATSAPP_SENDER_NUMBER ||
    process.env.ADMIN_WHATSAPP_NUMBER ||
    "919320206598"
  );
}

/**
 * Sends a plain-text WhatsApp message via the active provider. Resolves
 * (never rejects) with the provider result so callers can log/ignore
 * failures without risking the surrounding request.
 *
 * @param {{ from?: string, to: string, body: string }} params
 */
export async function sendWhatsAppMessage({ from, to, body }) {
  const provider = getActiveProvider();

  try {
    return await provider.send({
      from: from || getSenderNumber(),
      to,
      body,
    });
  } catch (error) {
    return {
      success: false,
      provider: provider.name,
      error: error.message,
    };
  }
}

export default { sendWhatsAppMessage, getSenderNumber, getActiveProviderName };
