import axios from "axios";

/**
 * WhatsApp Cloud API Client
 * Thin wrapper around Meta's WhatsApp Business Cloud API for sending
 * transactional text messages (order confirmations, admin alerts, etc.)
 * Mirrors the config/email.js and config/ship-rocket-config.js pattern:
 * a single client instance exported as the default.
 */
class WhatsAppClient {
  constructor() {
    this.apiVersion = process.env.WHATSAPP_API_VERSION || "v22.0";
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.baseURL = `https://graph.facebook.com/${this.apiVersion}`;
  }

  isConfigured() {
    return Boolean(this.phoneNumberId && this.accessToken);
  }

  /**
   * Normalizes a phone number to the digits-only, country-coded format
   * the WhatsApp Cloud API expects. Bare 10-digit numbers are assumed to
   * be Indian numbers (matches the store's existing +91 conventions).
   */
  normalizeNumber(rawNumber) {
    if (!rawNumber) return null;

    const digits = String(rawNumber).replace(/\D/g, "");

    if (!digits) return null;
    if (digits.length === 10) return `91${digits}`;

    return digits;
  }

  /**
   * Sends a plain-text WhatsApp message. Never throws — always resolves
   * with a { success, ... } result so callers can log/ignore failures
   * without risking the surrounding request flow.
   */
  async sendTextMessage(rawNumber, message) {
    if (!this.isConfigured()) {
      return {
        success: false,
        skipped: true,
        error:
          "WhatsApp API is not configured (missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN)",
      };
    }

    const to = this.normalizeNumber(rawNumber);

    if (!to) {
      return { success: false, error: "Invalid or missing recipient phone number" };
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { preview_url: false, body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );

      return {
        success: true,
        messageId: response.data?.messages?.[0]?.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Sends an approved WhatsApp template message. Required for any message
   * to a customer/vendor who hasn't messaged the business number within
   * the last 24 hours (order confirmations always fall into this bucket) —
   * free-form text messages get rejected outside that session window.
   * `components` follows Meta's template component format, e.g.
   * [{ type: "body", parameters: [...] }, { type: "button", ... }].
   */
  async sendTemplateMessage(rawNumber, { name, languageCode = "en", components = [] }) {
    if (!this.isConfigured()) {
      return {
        success: false,
        skipped: true,
        error:
          "WhatsApp API is not configured (missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN)",
      };
    }

    const to = this.normalizeNumber(rawNumber);

    if (!to) {
      return { success: false, error: "Invalid or missing recipient phone number" };
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name,
            language: { code: languageCode },
            components,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );

      return {
        success: true,
        messageId: response.data?.messages?.[0]?.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }
}

export default new WhatsAppClient();
