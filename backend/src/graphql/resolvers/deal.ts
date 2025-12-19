import { Context } from '../context.js';
import { createAuditLog, sanitizeForAudit } from '../../lib/auditLog.js';
import type { PaginationInput, DealInput } from './types.js';

export const dealResolvers = {
  Query: {
    deals: async (
      _: unknown,
      args: {
        pagination?: PaginationInput;
        merchantId?: string;
        isFeatured?: boolean;
        isActive?: boolean;
      },
      context: Context
    ) => {
      context.requirePermission('deals:read');

      const page = args.pagination?.page || 1;
      const limit = args.pagination?.limit || 20;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};

      if (args.merchantId) where.merchantId = args.merchantId;
      if (args.isFeatured !== undefined) where.isFeatured = args.isFeatured;
      if (args.isActive !== undefined) where.isActive = args.isActive;

      const [nodes, totalCount] = await Promise.all([
        context.prisma.deal.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          include: { merchant: true },
        }),
        context.prisma.deal.count({ where }),
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

    deal: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('deals:read');

      return context.prisma.deal.findUnique({
        where: { id: args.id },
        include: { merchant: true },
      });
    },
  },

  Mutation: {
    createDeal: async (_: unknown, args: { input: DealInput }, context: Context) => {
      context.requirePermission('deals:write');
      const admin = context.requireAuth();

      const deal = await context.prisma.deal.create({
        data: args.input,
        include: { merchant: true },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'CREATE',
        entityType: 'Deal',
        entityId: deal.id,
        newValue: sanitizeForAudit(deal as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return deal;
    },

    updateDeal: async (
      _: unknown,
      args: { id: string; input: DealInput },
      context: Context
    ) => {
      context.requirePermission('deals:write');
      const admin = context.requireAuth();

      const existingDeal = await context.prisma.deal.findUnique({
        where: { id: args.id },
      });

      if (!existingDeal) {
        throw new Error('Deal not found');
      }

      const deal = await context.prisma.deal.update({
        where: { id: args.id },
        data: args.input,
        include: { merchant: true },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'UPDATE',
        entityType: 'Deal',
        entityId: deal.id,
        oldValue: sanitizeForAudit(existingDeal as unknown as Record<string, unknown>),
        newValue: sanitizeForAudit(deal as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return deal;
    },

    deleteDeal: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('deals:write');
      const admin = context.requireAuth();

      const existingDeal = await context.prisma.deal.findUnique({
        where: { id: args.id },
      });

      if (!existingDeal) {
        throw new Error('Deal not found');
      }

      await context.prisma.deal.delete({
        where: { id: args.id },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'DELETE',
        entityType: 'Deal',
        entityId: args.id,
        oldValue: sanitizeForAudit(existingDeal as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return true;
    },
  },
};
