import Order from "../models/Order.js";
import orderFulfillmentService from "../services/orderFulfillmentService.js";
import orderNotificationService from "../services/orderNotificationService.js";
import { getTodayId, toDateId } from "../utils/deliveryCapacity.js";

/**
 * Daily delivery-day fulfillment check.
 *
 * A vegetables/fruits order placed for Today/Tomorrow is never a
 * guarantee of stock or price — only a placeholder (see
 * orderFulfillmentService). This job re-verifies every order scheduled
 * for delivery *today* that hasn't been checked yet today, flags any
 * stock/price issue, and notifies the customer so they can decide
 * (replace / remove / accept the new price / accept a partial quantity)
 * before their order is prepared.
 *
 * Self-scheduling with plain setTimeout/setInterval rather than a cron
 * dependency — see start() below.
 */
async function runDailyOrderVerification() {
  const todayId = getTodayId();

  // Match "delivery is today" in JS with the same YYYY-MM-DD comparison
  // used everywhere else (toDateId), rather than a Mongo date range —
  // deliveryDate was stored from a date-only string, so this sidesteps
  // any UTC/local parsing ambiguity around midnight.
  const candidates = await Order.find({
    status: { $in: ["pending", "confirmed", "processing"] },
    deliveryDate: { $ne: null },
  }).populate("user");

  const dueToday = candidates.filter((order) => {
    if (toDateId(order.deliveryDate) !== todayId) return false;
    // Already checked today (e.g. a restart re-running this job, or an
    // admin having already triggered it manually) — skip re-notifying.
    if (
      order.fulfillment?.lastVerifiedAt &&
      toDateId(order.fulfillment.lastVerifiedAt) === todayId
    ) {
      return false;
    }
    return true;
  });

  console.log(
    `🔍 Daily order verification: checking ${dueToday.length} order(s) scheduled for delivery today (${todayId})`,
  );

  for (const order of dueToday) {
    try {
      const { issues } =
        await orderFulfillmentService.verifyOrderAvailability(order);

      if (issues.length > 0) {
        console.log(
          `⚠️ Order ${order.orderNumber}: ${issues.length} item(s) need customer attention`,
        );
        await orderNotificationService.notifyCustomerOfAvailabilityIssues(
          order,
          order.user,
          issues,
        );
      }
    } catch (error) {
      console.error(
        `❌ Daily verification failed for order ${order.orderNumber || order._id}:`,
        error.message,
      );
    }
  }

  return dueToday.length;
}

const RUN_HOUR = 6; // 6:00 AM server-local time
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function msUntilNextRun() {
  const now = new Date();
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    RUN_HOUR,
    0,
    0,
    0,
  );
  if (next <= now) next.setTime(next.getTime() + ONE_DAY_MS);
  return next.getTime() - now.getTime();
}

/**
 * Schedules runDailyOrderVerification() for the next 6 AM, then every 24h
 * after that. No external cron dependency — just a self-rescheduling
 * setTimeout, which is all a single-instance Node server needs here.
 */
function start() {
  const delay = msUntilNextRun();
  console.log(
    `🗓️  Daily order verification job scheduled — next run in ${Math.round(delay / 60000)} minute(s)`,
  );

  setTimeout(function runAndReschedule() {
    runDailyOrderVerification().catch((error) =>
      console.error("❌ Daily order verification job crashed:", error.message),
    );
    setInterval(() => {
      runDailyOrderVerification().catch((error) =>
        console.error(
          "❌ Daily order verification job crashed:",
          error.message,
        ),
      );
    }, ONE_DAY_MS);
  }, delay);
}

export default { start, runDailyOrderVerification };
