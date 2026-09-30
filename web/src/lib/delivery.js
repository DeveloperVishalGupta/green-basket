/**
 * Shared "today/tomorrow" delivery date helpers.
 * Dates are represented as canonical "YYYY-MM-DD" ids throughout the app.
 */

function toDateId(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export function getTodayId() {
  return toDateId(new Date());
}

export function getTomorrowId() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toDateId(d);
}

/**
 * @param {string} dateId - "YYYY-MM-DD"
 * @returns {string} "Today" / "Tomorrow" / formatted date
 */
export function formatDeliveryLabel(dateId) {
  if (!dateId) return "";
  if (dateId === getTodayId()) return "Today";
  if (dateId === getTomorrowId()) return "Tomorrow";

  const [year, month, day] = dateId.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
