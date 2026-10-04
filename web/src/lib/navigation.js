/**
 * Turn-by-turn navigation links for a delivery location.
 */

/** @returns {boolean} true when `location` has usable coordinates */
export const hasValidCoordinates = (location) =>
  !!location &&
  Number.isFinite(Number(location.lat)) &&
  Number.isFinite(Number(location.lng)) &&
  Math.abs(Number(location.lat)) <= 90 &&
  Math.abs(Number(location.lng)) <= 180 &&
  !(Number(location.lat) === 0 && Number(location.lng) === 0);

const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent);

/**
 * Navigation URL for the order's destination.
 * Coordinates are always preferred; the address text is only a fallback when
 * the order has no usable coordinates.
 *
 * @param {{lat:number,lng:number}|null} location
 * @param {string} [addressText]
 * @returns {{ url: string|null, exact: boolean }} url is null when there's
 *   nothing to navigate to
 */
export function getNavigationTarget(location, addressText) {
  if (hasValidCoordinates(location)) {
    const { lat, lng } = location;
    return {
      exact: true,
      // Apple Maps on iOS; Google Maps universal link elsewhere (opens the
      // Maps app on Android, the web app on desktop)
      url: isIOS()
        ? `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
        : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
    };
  }

  if (addressText?.trim()) {
    return {
      exact: false,
      url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`,
    };
  }

  return { exact: false, url: null };
}
