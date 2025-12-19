import { Context } from '../context.js';
import { ConversionStatus } from '@prisma/client';
import type { PaginationInput, DateRangeInput } from './types.js';

export const userResolvers = {
  Query: {
    users: async (
      _: unknown,
      args: { pagination?: PaginationInput; search?: string },
      context: Context
    ) => {
      context.requirePermission('users:read');

      const page = args.pagination?.page || 1;
      const limit = args.pagination?.limit || 20;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};

      if (args.search) {
        where.OR = [
          { email: { contains: args.search, mode: 'insensitive' } },
          { firstName: { contains: args.search, mode: 'insensitive' } },
          { lastName: { contains: args.search, mode: 'insensitive' } },
        ];
      }

      const [nodes, totalCount] = await Promise.all([
        context.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                clicks: true,
                conversions: true,
              },
            },
          },
        }),
        context.prisma.user.count({ where }),
      ]);

      return {
        nodes: nodes.map((node) => ({
          ...node,
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

    user: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('users:read');

      const user = await context.prisma.user.findUnique({
        where: { id: args.id },
        include: {
          _count: {
            select: {
              clicks: true,
              conversions: true,
            },
          },
        },
      });

      if (!user) return null;

      return {
        ...user,
        clicksCount: user._count.clicks,
        conversionsCount: user._count.conversions,
      };
    },
  },
};

export const clickResolvers = {
  Query: {
    clicks: async (
      _: unknown,
      args: {
        pagination?: PaginationInput;
        merchantId?: string;
        couponId?: string;
        userId?: string;
        dateRange?: DateRangeInput;
      },
      context: Context
    ) => {
      context.requirePermission('clicks:read');

      const page = args.pagination?.page || 1;
      const limit = args.pagination?.limit || 50;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};

      if (args.merchantId) where.merchantId = args.merchantId;
      if (args.couponId) where.couponId = args.couponId;
      if (args.userId) where.userId = args.userId;

      if (args.dateRange) {
        where.createdAt = {};
        if (args.dateRange.startDate) {
          (where.createdAt as Record<string, unknown>).gte = args.dateRange.startDate;
        }
        if (args.dateRange.endDate) {
          (where.createdAt as Record<string, unknown>).lte = args.dateRange.endDate;
        }
      }

      const [nodes, totalCount] = await Promise.all([
        context.prisma.click.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: true,
            merchant: true,
            coupon: true,
          },
        }),
        context.prisma.click.count({ where }),
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
  },
};

export const conversionResolvers = {
  Query: {
    conversions: async (
      _: unknown,
      args: {
        pagination?: PaginationInput;
        merchantId?: string;
        couponId?: string;
        userId?: string;
        status?: ConversionStatus;
        dateRange?: DateRangeInput;
      },
      context: Context
    ) => {
      context.requirePermission('conversions:read');

      const page = args.pagination?.page || 1;
      const limit = args.pagination?.limit || 50;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};

      if (args.merchantId) where.merchantId = args.merchantId;
      if (args.couponId) where.couponId = args.couponId;
      if (args.userId) where.userId = args.userId;
      if (args.status) where.status = args.status;

      if (args.dateRange) {
        where.createdAt = {};
        if (args.dateRange.startDate) {
          (where.createdAt as Record<string, unknown>).gte = args.dateRange.startDate;
        }
        if (args.dateRange.endDate) {
          (where.createdAt as Record<string, unknown>).lte = args.dateRange.endDate;
        }
      }

      const [nodes, totalCount] = await Promise.all([
        context.prisma.conversion.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: true,
            merchant: true,
            coupon: true,
          },
        }),
        context.prisma.conversion.count({ where }),
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

    conversion: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('conversions:read');

      return context.prisma.conversion.findUnique({
        where: { id: args.id },
        include: {
          user: true,
          merchant: true,
          coupon: true,
        },
      });
    },
  },

  Mutation: {
    updateConversionStatus: async (
      _: unknown,
      args: { id: string; status: ConversionStatus },
      context: Context
    ) => {
      context.requirePermission('conversions:write');

      const updateData: Record<string, unknown> = { status: args.status };

      if (args.status === 'CONFIRMED') {
        updateData.confirmedAt = new Date();
      } else if (args.status === 'PAID') {
        updateData.paidAt = new Date();
      }

      return context.prisma.conversion.update({
        where: { id: args.id },
        data: updateData,
        include: {
          user: true,
          merchant: true,
          coupon: true,
        },
      });
    },
  },
};
