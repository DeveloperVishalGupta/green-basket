/**
 * Delivery slot helpers.
 * Orders store the slot as its display label (e.g. "8:00 - 9:00 AM",
 * "7:00 - 8:00 PM"). To order deliveries chronologically we derive the slot's
 * start time in minutes-from-midnight from that label rather than comparing
 * strings.
 */

const SLOT_PATTERN =
  /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i;

const to24h = (hour, meridiem) => {
  const h = hour % 12;
  return meridiem.toUpperCase() === "PM" ? h + 12 : h;
};

/**
 * @param {string} [label] - e.g. "11:00 - 12:00 PM"
 * @returns {number} start time in minutes since midnight; Infinity when the
 *   label can't be parsed (such orders sort after timed ones)
 */
export function slotStartMinutes(label) {
  const match = SLOT_PATTERN.exec(label || "");
  if (!match) return Infinity;

  const [, sh, sm = "0", sMeridiem, eh, em = "0", eMeridiem] = match;
  const endMinutes = to24h(Number(eh), eMeridiem) * 60 + Number(em);

  // "8:00 - 9:00 AM": the start shares the end's AM/PM unless that would put
  // it at/after the end (e.g. "11:00 - 12:00 PM" starts at 11 AM).
  let startMinutes =
    to24h(Number(sh), sMeridiem || eMeridiem) * 60 + Number(sm);
  if (!sMeridiem && startMinutes >= endMinutes) startMinutes -= 12 * 60;

  return startMinutes;
}

/**
 * Comparator: delivery date (calendar day) first, then slot start time, then
 * order creation time as a stable tie-breaker.
 */
export function compareByDeliverySchedule(a, b) {
  const dayKey = (o) => {
    if (!o.deliveryDate) return Infinity;
    const d = new Date(o.deliveryDate);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };

  const dayDiff = dayKey(a) - dayKey(b);
  if (dayDiff !== 0 && !Number.isNaN(dayDiff)) return dayDiff;

  const slotA = slotStartMinutes(a.deliveryTimeSlot);
  const slotB = slotStartMinutes(b.deliveryTimeSlot);
  if (slotA !== slotB) return slotA < slotB ? -1 : 1;

  return new Date(a.createdAt) - new Date(b.createdAt);
}
