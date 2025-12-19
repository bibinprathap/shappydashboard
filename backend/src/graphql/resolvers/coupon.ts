import { Context } from '../context.js';
import { createAuditLog, sanitizeForAudit } from '../../lib/auditLog.js';
import { CouponStatus, CouponType } from '@prisma/client';
import type { PaginationInput } from './types.js';

interface CouponInput {
  merchantId: string;
  code: string;
  title: string;
  description?: string;
  type: CouponType;
  discountValue?: number;
  minPurchase?: number;
  maxDiscount?: number;
  status?: CouponStatus;
  isPinned?: boolean;
  isExclusive?: boolean;
  isVerified?: boolean;
  startDate?: Date;
  endDate?: Date;
  geoRules?: { countryId: string; isIncluded: boolean }[];
}

export const couponResolvers = {
  Query: {
    coupons: async (
      _: unknown,
      args: {
        pagination?: PaginationInput;
        search?: string;
        merchantId?: string;
        status?: CouponStatus;
        isPinned?: boolean;
        countryId?: string;
      },
      context: Context
    ) => {
      context.requirePermission('coupons:read');

      const page = args.pagination?.page || 1;
      const limit = args.pagination?.limit || 20;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};

      if (args.search) {
        where.OR = [
          { code: { contains: args.search, mode: 'insensitive' } },
          { title: { contains: args.search, mode: 'insensitive' } },
        ];
      }

      if (args.merchantId) where.merchantId = args.merchantId;
      if (args.status) where.status = args.status;
      if (args.isPinned !== undefined) where.isPinned = args.isPinned;

      const [nodes, totalCount] = await Promise.all([
        context.prisma.coupon.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          include: {
            merchant: true,
            createdBy: true,
            updatedBy: true,
            geoRules: {
              include: { country: true },
            },
          },
        }),
        context.prisma.coupon.count({ where }),
      ]);

      return {
        nodes,
        pageInfo: {
          hasNextPage: skip + nodes.length < totalCount,
          hasPreviousPage: page > 1,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    },

    coupon: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('coupons:read');

      return context.prisma.coupon.findUnique({
        where: { id: args.id },
        include: {
          merchant: true,
          createdBy: true,
          updatedBy: true,
          geoRules: {
            include: { country: true },
          },
        },
      });
    },
  },

  Mutation: {
    createCoupon: async (_: unknown, args: { input: CouponInput }, context: Context) => {
      context.requirePermission('coupons:write');
      const admin = context.requireAuth();

      const { geoRules, ...couponData } = args.input;

      const coupon = await context.prisma.coupon.create({
        data: {
          ...couponData,
          createdById: admin.id,
          geoRules: geoRules
            ? {
                create: geoRules.map((rule) => ({
                  countryId: rule.countryId,
                  isIncluded: rule.isIncluded,
                })),
              }
            : undefined,
        },
        include: {
          merchant: true,
          geoRules: {
            include: { country: true },
          },
        },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'CREATE',
        entityType: 'Coupon',
        entityId: coupon.id,
        newValue: sanitizeForAudit(coupon as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return coupon;
    },

    updateCoupon: async (
      _: unknown,
      args: { id: string; input: CouponInput },
      context: Context
    ) => {
      context.requirePermission('coupons:write');
      const admin = context.requireAuth();

      const existingCoupon = await context.prisma.coupon.findUnique({
        where: { id: args.id },
        include: { geoRules: true },
      });

      if (!existingCoupon) {
        throw new Error('Coupon not found');
      }

      const { geoRules, ...couponData } = args.input;

      // Delete existing geo rules and create new ones
      if (geoRules) {
        await context.prisma.couponGeoRule.deleteMany({
          where: { couponId: args.id },
        });
      }

      const coupon = await context.prisma.coupon.update({
        where: { id: args.id },
        data: {
          ...couponData,
          updatedById: admin.id,
          geoRules: geoRules
            ? {
                create: geoRules.map((rule) => ({
                  countryId: rule.countryId,
                  isIncluded: rule.isIncluded,
                })),
              }
            : undefined,
        },
        include: {
          merchant: true,
          geoRules: {
            include: { country: true },
          },
        },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'UPDATE',
        entityType: 'Coupon',
        entityId: coupon.id,
        oldValue: sanitizeForAudit(existingCoupon as unknown as Record<string, unknown>),
        newValue: sanitizeForAudit(coupon as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return coupon;
    },

    deleteCoupon: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('coupons:write');
      const admin = context.requireAuth();

      const existingCoupon = await context.prisma.coupon.findUnique({
        where: { id: args.id },
      });

      if (!existingCoupon) {
        throw new Error('Coupon not found');
      }

      await context.prisma.coupon.delete({
        where: { id: args.id },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'DELETE',
        entityType: 'Coupon',
        entityId: args.id,
        oldValue: sanitizeForAudit(existingCoupon as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return true;
    },

    toggleCouponPinned: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('coupons:write');
      const admin = context.requireAuth();

      const coupon = await context.prisma.coupon.findUnique({
        where: { id: args.id },
      });

      if (!coupon) {
        throw new Error('Coupon not found');
      }

      const updatedCoupon = await context.prisma.coupon.update({
        where: { id: args.id },
        data: {
          isPinned: !coupon.isPinned,
          updatedById: admin.id,
        },
        include: {
          merchant: true,
          geoRules: {
            include: { country: true },
          },
        },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'UPDATE',
        entityType: 'Coupon',
        entityId: args.id,
        oldValue: { isPinned: coupon.isPinned },
        newValue: { isPinned: updatedCoupon.isPinned },
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return updatedCoupon;
    },

    expireCoupon: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('coupons:write');
      const admin = context.requireAuth();

      const coupon = await context.prisma.coupon.update({
        where: { id: args.id },
        data: {
          status: 'EXPIRED',
          updatedById: admin.id,
        },
        include: {
          merchant: true,
          geoRules: {
            include: { country: true },
          },
        },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'UPDATE',
        entityType: 'Coupon',
        entityId: args.id,
        newValue: { status: 'EXPIRED' },
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return coupon;
    },

    suppressCoupon: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('coupons:write');
      const admin = context.requireAuth();

      const coupon = await context.prisma.coupon.update({
        where: { id: args.id },
        data: {
          status: 'SUPPRESSED',
          updatedById: admin.id,
        },
        include: {
          merchant: true,
          geoRules: {
            include: { country: true },
          },
        },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'UPDATE',
        entityType: 'Coupon',
        entityId: args.id,
        newValue: { status: 'SUPPRESSED' },
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return coupon;
    },
  },

  Coupon: {
    geoRules: (parent: { geoRules?: unknown[] }) => parent.geoRules || [],
  },
};
