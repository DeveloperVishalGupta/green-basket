/**
 * Central role configuration for the web app.
 * Mirrors server/src/config/roles.js. To add a role: add it here, give it a
 * home route, and (if it has a portal) a route group + layout guarded with
 * useRoleGuard(ROLES.<ROLE>).
 */
export const ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  VENDOR: "vendor",
  DELIVERY_PARTNER: "delivery_partner",
};

/** Where each role lands after login (and is sent when it hits a foreign area). */
export const ROLE_HOME = {
  [ROLES.CUSTOMER]: "/",
  [ROLES.ADMIN]: "/admin/dashboard",
  [ROLES.VENDOR]: "/vendor/dashboard",
  [ROLES.DELIVERY_PARTNER]: "/delivery/dashboard",
};

export const ROLE_LABELS = {
  [ROLES.CUSTOMER]: "Customer",
  [ROLES.ADMIN]: "Admin",
  [ROLES.VENDOR]: "Vendor",
  [ROLES.DELIVERY_PARTNER]: "Delivery Partner",
};

/** Roles available in the non-customer registration flow. */
export const STAFF_REGISTRATION_ROLES = [
  ROLES.VENDOR,
  ROLES.DELIVERY_PARTNER,
  ROLES.ADMIN,
];

export const getRoleHome = (role) => ROLE_HOME[role] || "/";

/** True for any role that has its own portal instead of the shop. */
export const isPortalRole = (role) => !!role && role !== ROLES.CUSTOMER;
