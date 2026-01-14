/**
 * Permission constants - matches backend permissions
 * @see backend: src/utils/permissions.js
 */
export const permissions = {
  // App Users (mobile app users)
  USER_VIEW: "users:view",
  USER_UPDATE: "users:update",
  USER_DELETE: "users:delete",

  // Staff Users (dashboard users)
  STAFF_VIEW: "staff:view",
  STAFF_CREATE: "staff:create",
  STAFF_UPDATE: "staff:update",
  STAFF_DELETE: "staff:delete",

  // Coupons
  COUPON_VIEW: "coupons:view",
  COUPON_CREATE: "coupons:create",
  COUPON_UPDATE: "coupons:update",
  COUPON_DELETE: "coupons:delete",

  // Merchants
  MERCHANT_VIEW: "merchants:view",
  MERCHANT_CREATE: "merchants:create",
  MERCHANT_UPDATE: "merchants:update",
  MERCHANT_DELETE: "merchants:delete",

  // Banners
  BANNER_VIEW: "banners:view",
  BANNER_CREATE: "banners:create",
  BANNER_UPDATE: "banners:update",
  BANNER_DELETE: "banners:delete",

  // Audit Log
  AUDIT_LOG_VIEW: "audit_log:view",

  // Push Notifications
  PUSH_NOTIFICATION_VIEW: "push_notification:view",
  PUSH_NOTIFICATION_CREATE: "push_notification:create",
  PUSH_NOTIFICATION_UPDATE: "push_notification:update",
  PUSH_NOTIFICATION_DELETE: "push_notification:delete",

  // Coupon Reports
  COUPON_REPORT_VIEW: "coupon_report:view",
  COUPON_REPORT_DELETE: "coupon_report:delete",
} as const;

export type Permission = (typeof permissions)[keyof typeof permissions];
