import { Context } from '../context.js';
import { createAuditLog, sanitizeForAudit } from '../../lib/auditLog.js';
import type { PaginationInput, MerchantInput } from './types.js';

export const merchantResolvers = {
  Query: {
    merchants: async (
      _: unknown,
      args: {
        pagination?: PaginationInput;
        search?: string;
        categoryId?: string;
        countryId?: string;
        isFeatured?: boolean;
        isActive?: boolean;
      },
      context: Context
    ) => {
      context.requirePermission('merchants:read');

      const page = args.pagination?.page || 1;
      const limit = args.pagination?.limit || 20;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};

      if (args.search) {
        where.OR = [
          { name: { contains: args.search, mode: 'insensitive' } },
          { slug: { contains: args.search, mode: 'insensitive' } },
        ];
      }

      if (args.countryId) where.countryId = args.countryId;
      if (args.isFeatured !== undefined) where.isFeatured = args.isFeatured;
      if (args.isActive !== undefined) where.isActive = args.isActive;

      if (args.categoryId) {
        where.categories = {
          some: { categoryId: args.categoryId },
        };
      }

      const [nodes, totalCount] = await Promise.all([
        context.prisma.merchant.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ priority: 'desc' }, { name: 'asc' }],
          include: {
            country: true,
            categories: {
              include: { category: true },
            },
            _count: {
              select: {
                coupons: true,
                clicks: true,
                conversions: true,
              },
            },
          },
        }),
        context.prisma.merchant.count({ where }),
      ]);

      return {
        nodes: nodes.map((node) => ({
          ...node,
          categories: node.categories.map((mc) => mc.category),
          couponsCount: node._count.coupons,
          clicksCount: node._count.clicks,
          conversionsCount: node._count.conversions,
        })),
        pageInfo: {
          hasNextPage: skip + nodes.length < totalCount,
          hasPreviousPage: page > 1,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    },

    merchant: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('merchants:read');

      const merchant = await context.prisma.merchant.findUnique({
        where: { id: args.id },
        include: {
          country: true,
          categories: {
            include: { category: true },
          },
          _count: {
            select: {
              coupons: true,
              clicks: true,
              conversions: true,
            },
          },
        },
      });

      if (!merchant) return null;

      return {
        ...merchant,
        categories: merchant.categories.map((mc) => mc.category),
        couponsCount: merchant._count.coupons,
        clicksCount: merchant._count.clicks,
        conversionsCount: merchant._count.conversions,
      };
    },

    merchantBySlug: async (_: unknown, args: { slug: string }, context: Context) => {
      context.requirePermission('merchants:read');

      const merchant = await context.prisma.merchant.findUnique({
        where: { slug: args.slug },
        include: {
          country: true,
          categories: {
            include: { category: true },
          },
        },
      });

      if (!merchant) return null;

      return {
        ...merchant,
        categories: merchant.categories.map((mc) => mc.category),
      };
    },
  },

  Mutation: {
    createMerchant: async (_: unknown, args: { input: MerchantInput }, context: Context) => {
      context.requirePermission('merchants:write');
      const admin = context.requireAuth();

      const { categoryIds, ...merchantData } = args.input;

      const merchant = await context.prisma.merchant.create({
        data: {
          ...merchantData,
          categories: categoryIds
            ? {
                create: categoryIds.map((categoryId) => ({ categoryId })),
              }
            : undefined,
        },
        include: {
          country: true,
          categories: {
            include: { category: true },
          },
        },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'CREATE',
        entityType: 'Merchant',
        entityId: merchant.id,
        newValue: sanitizeForAudit(merchant as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return {
        ...merchant,
        categories: merchant.categories.map((mc: { category: unknown }) => mc.category),
      };
    },

    updateMerchant: async (
      _: unknown,
      args: { id: string; input: MerchantInput },
      context: Context
    ) => {
      context.requirePermission('merchants:write');
      const admin = context.requireAuth();

      const existingMerchant = await context.prisma.merchant.findUnique({
        where: { id: args.id },
      });

      if (!existingMerchant) {
        throw new Error('Merchant not found');
      }

      const { categoryIds, ...merchantData } = args.input;

      // Delete existing category relations and create new ones
      if (categoryIds) {
        await context.prisma.merchantCategory.deleteMany({
          where: { merchantId: args.id },
        });
      }

      const merchant = await context.prisma.merchant.update({
        where: { id: args.id },
        data: {
          ...merchantData,
          categories: categoryIds
            ? {
                create: categoryIds.map((categoryId) => ({ categoryId })),
              }
            : undefined,
        },
        include: {
          country: true,
          categories: {
            include: { category: true },
          },
        },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'UPDATE',
        entityType: 'Merchant',
        entityId: merchant.id,
        oldValue: sanitizeForAudit(existingMerchant as unknown as Record<string, unknown>),
        newValue: sanitizeForAudit(merchant as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return {
        ...merchant,
        categories: merchant.categories.map((mc) => mc.category),
      };
    },

    deleteMerchant: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('merchants:write');
      const admin = context.requireAuth();

      const existingMerchant = await context.prisma.merchant.findUnique({
        where: { id: args.id },
      });

      if (!existingMerchant) {
        throw new Error('Merchant not found');
      }

      await context.prisma.merchant.delete({
        where: { id: args.id },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'DELETE',
        entityType: 'Merchant',
        entityId: args.id,
        oldValue: sanitizeForAudit(existingMerchant as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return true;
    },

    toggleMerchantFeatured: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('merchants:write');
      const admin = context.requireAuth();

      const merchant = await context.prisma.merchant.findUnique({
        where: { id: args.id },
      });

      if (!merchant) {
        throw new Error('Merchant not found');
      }

      const updatedMerchant = await context.prisma.merchant.update({
        where: { id: args.id },
        data: { isFeatured: !merchant.isFeatured },
        include: {
          country: true,
          categories: {
            include: { category: true },
          },
        },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'UPDATE',
        entityType: 'Merchant',
        entityId: args.id,
        oldValue: { isFeatured: merchant.isFeatured },
        newValue: { isFeatured: updatedMerchant.isFeatured },
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return {
        ...updatedMerchant,
        categories: updatedMerchant.categories.map((mc) => mc.category),
      };
    },
  },
};
