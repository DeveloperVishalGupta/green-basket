/**
 * Shared phone-number normalisation for the messaging layer.
 * Produces the digits-only, country-coded form (e.g. "919320206598").
 * Bare 10-digit numbers are treated as Indian (+91), matching the rest
 * of the app's conventions.
 */
export function normalizeNumber(rawNumber) {
  if (!rawNumber) return null;

  const digits = String(rawNumber).replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `91${digits}`;

  return digits;
}
