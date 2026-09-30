/**
 * Serviceable delivery pincodes.
 *
 * Configurable via the SERVICEABLE_PINCODES env var (comma-separated),
 * so new areas can be enabled without touching frontend or backend code —
 * just update the env var and restart/redeploy.
 */
const DEFAULT_SERVICEABLE_PINCODES = ["400089"];

function getServiceablePincodes() {
  const raw = process.env.SERVICEABLE_PINCODES;
  if (!raw) return DEFAULT_SERVICEABLE_PINCODES;

  const pincodes = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  return pincodes.length ? pincodes : DEFAULT_SERVICEABLE_PINCODES;
}

function isPincodeServiceable(pincode) {
  if (!pincode) return false;
  return getServiceablePincodes().includes(String(pincode).trim());
}

const NON_SERVICEABLE_MESSAGE =
  "Sorry, we currently deliver only within select areas (Mumbai - 400089). This pincode is not serviceable yet.";

export { getServiceablePincodes, isPincodeServiceable, NON_SERVICEABLE_MESSAGE };
