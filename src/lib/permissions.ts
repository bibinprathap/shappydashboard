/**
 * Permission constants - matches backend permissions
 * @see backend: src/utils/permissions.js
 */
export const permissions = {
  USER_VIEW: "users:view",
  USER_CREATE: "users:create",
  USER_UPDATE: "users:update",
  USER_DELETE: "users:delete",

  ROLE_VIEW: "roles:view",
  ROLE_CREATE: "roles:create",
  ROLE_UPDATE: "roles:update",
  ROLE_DELETE: "roles:delete",

  COUPON_VIEW: "coupons:view",
  COUPON_CREATE: "coupons:create",
  COUPON_UPDATE: "coupons:update",
  COUPON_DELETE: "coupons:delete",
} as const;

export type Permission = (typeof permissions)[keyof typeof permissions];
