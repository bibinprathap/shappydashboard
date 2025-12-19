import { Context } from '../context.js';
import { createAuditLog, sanitizeForAudit } from '../../lib/auditLog.js';
import { BannerStatus } from '@prisma/client';
import type { PaginationInput, BannerInput } from './types.js';

export const bannerResolvers = {
  Query: {
    banners: async (
      _: unknown,
      args: {
        pagination?: PaginationInput;
        status?: BannerStatus;
        platform?: string;
        countryId?: string;
      },
      context: Context
    ) => {
      context.requirePermission('banners:read');

      const page = args.pagination?.page || 1;
      const limit = args.pagination?.limit || 20;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};

      if (args.status) where.status = args.status;
      if (args.platform) where.platform = args.platform;
      if (args.countryId) where.countryId = args.countryId;

      const [nodes, totalCount] = await Promise.all([
        context.prisma.banner.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          include: { country: true },
        }),
        context.prisma.banner.count({ where }),
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

    banner: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('banners:read');

      return context.prisma.banner.findUnique({
        where: { id: args.id },
        include: { country: true },
      });
    },
  },

  Mutation: {
    createBanner: async (_: unknown, args: { input: BannerInput }, context: Context) => {
      context.requirePermission('banners:write');
      const admin = context.requireAuth();

      const banner = await context.prisma.banner.create({
        data: args.input,
        include: { country: true },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'CREATE',
        entityType: 'Banner',
        entityId: banner.id,
        newValue: sanitizeForAudit(banner as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return banner;
    },

    updateBanner: async (
      _: unknown,
      args: { id: string; input: BannerInput },
      context: Context
    ) => {
      context.requirePermission('banners:write');
      const admin = context.requireAuth();

      const existingBanner = await context.prisma.banner.findUnique({
        where: { id: args.id },
      });

      if (!existingBanner) {
        throw new Error('Banner not found');
      }

      const banner = await context.prisma.banner.update({
        where: { id: args.id },
        data: args.input,
        include: { country: true },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'UPDATE',
        entityType: 'Banner',
        entityId: banner.id,
        oldValue: sanitizeForAudit(existingBanner as unknown as Record<string, unknown>),
        newValue: sanitizeForAudit(banner as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return banner;
    },

    deleteBanner: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('banners:write');
      const admin = context.requireAuth();

      const existingBanner = await context.prisma.banner.findUnique({
        where: { id: args.id },
      });

      if (!existingBanner) {
        throw new Error('Banner not found');
      }

      await context.prisma.banner.delete({
        where: { id: args.id },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'DELETE',
        entityType: 'Banner',
        entityId: args.id,
        oldValue: sanitizeForAudit(existingBanner as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return true;
    },
  },
};
