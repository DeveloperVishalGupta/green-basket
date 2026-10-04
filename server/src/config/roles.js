export const ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  VENDOR: "vendor",
  DELIVERY_PARTNER: "delivery_partner",
};

export const ALL_ROLES = Object.values(ROLES);

/** Roles that can sign up through the non-customer registration flow. */
export const STAFF_REGISTRATION_ROLES = [
  ROLES.ADMIN,
  ROLES.VENDOR,
  ROLES.DELIVERY_PARTNER,
];

/** Roles whose accounts stay "pending" until an admin approves them. */
export const APPROVAL_REQUIRED_ROLES = [ROLES.VENDOR, ROLES.DELIVERY_PARTNER];

export const APPROVAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};
