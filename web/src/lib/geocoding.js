/**
 * Geocoding helpers backed by OpenStreetMap's Nominatim API.
 * Free, no API key — used to power map-based address suggestions on the
 * Add Address page. Per Nominatim's usage policy: results are attributed
 * to OpenStreetMap contributors (see AddressMapPicker) and callers should
 * stay well under 1 request/second, which the debounced search UI does.
 */

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

/**
 * Turns a Nominatim address object into the fields our address form uses.
 * @param {Object} address - the `address` object from a Nominatim response
 * @returns {{street: string, area: string, city: string, state: string, zipCode: string}}
 */
export function parseNominatimAddress(address = {}) {
  const street = [address.house_number, address.road]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    street: street || address.neighbourhood || address.suburb || "",
    area: address.suburb || address.neighbourhood || address.quarter || "",
    city:
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      "",
    state: address.state || "",
    zipCode: address.postcode || "",
  };
}

/**
 * Free-text address search ("forward geocoding").
 * @param {string} query
 * @returns {Promise<Array<{label: string, lat: number, lon: number, address: Object}>>}
 */
export async function searchAddress(query) {
  if (!query || query.trim().length < 3) return [];

  const params = new URLSearchParams({
    format: "json",
    addressdetails: "1",
    countrycodes: "in",
    limit: "5",
    q: query.trim(),
  });

  const res = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error("Address search failed");

  const results = await res.json();
  return results.map((r) => ({
    label: r.display_name,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    address: r.address || {},
  }));
}

/**
 * Reverse geocoding — turns a lat/lng (e.g. from a dragged map pin) into
 * an address.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{label: string, address: Object}>}
 */
export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({
    format: "json",
    addressdetails: "1",
    lat: String(lat),
    lon: String(lon),
  });

  const res = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error("Reverse geocoding failed");

  const result = await res.json();
  return {
    label: result.display_name || "",
    address: result.address || {},
  };
}
