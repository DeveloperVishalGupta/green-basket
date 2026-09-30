import DeliveryCapacity from "../models/DeliveryCapacity.js";

/**
 * Delivery date/capacity helpers.
 * A "dateId" is always the canonical "YYYY-MM-DD" string used to key
 * capacity documents and to compare against the user's chosen date.
 */

function toDateId(date) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Midnight Date object for a given dateId, used as the Mongo key. */
function dateIdToDate(dateId) {
  const [year, month, day] = dateId.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getTodayId() {
  return toDateId(new Date());
}

function getTomorrowId() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toDateId(d);
}

function isTodayOrTomorrow(dateId) {
  return dateId === getTodayId() || dateId === getTomorrowId();
}

/**
 * @param {string[]} dateIds
 * @returns {Promise<Object<string, boolean>>} dateId -> available
 */
async function getAvailability(dateIds) {
  const dates = dateIds.map(dateIdToDate);
  const docs = await DeliveryCapacity.find({ date: { $in: dates } });
  const docsById = new Map(docs.map((doc) => [toDateId(doc.date), doc]));

  const result = {};
  for (const dateId of dateIds) {
    const doc = docsById.get(dateId);
    result[dateId] = doc ? doc.bookedCount < doc.maxOrders : true;
  }
  return result;
}

/**
 * Books one slot against a delivery date. Throws if the date is full.
 * @param {string} dateId
 */
async function reserveSlot(dateId) {
  const date = dateIdToDate(dateId);

  let doc = await DeliveryCapacity.findOne({ date });
  if (!doc) {
    doc = await DeliveryCapacity.create({ date });
  }

  if (doc.bookedCount >= doc.maxOrders) {
    throw new Error(`Delivery date ${dateId} is fully booked`);
  }

  await DeliveryCapacity.updateOne({ _id: doc._id }, { $inc: { bookedCount: 1 } });
}

/**
 * Releases one previously-booked slot for a delivery date (e.g. on cancellation).
 * @param {string|Date} date
 */
async function releaseSlot(date) {
  if (!date) return;
  const dateId = toDateId(date);
  const doc = await DeliveryCapacity.findOne({ date: dateIdToDate(dateId) });
  if (!doc || doc.bookedCount <= 0) return;

  await DeliveryCapacity.updateOne(
    { _id: doc._id },
    { $inc: { bookedCount: -1 } },
  );
}

export {
  toDateId,
  getTodayId,
  getTomorrowId,
  isTodayOrTomorrow,
  getAvailability,
  reserveSlot,
  releaseSlot,
};
