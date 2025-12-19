import { Context } from '../context.js';
import { createAuditLog } from '../../lib/auditLog.js';
import { Prisma } from '@prisma/client';
import type { PaginationInput, DateRangeInput } from './types.js';

interface ExtensionSettingInput {
  key: string;
  value: unknown;
  description?: string;
}

export const extensionResolvers = {
  Query: {
    extensionSettings: async (_: unknown, __: unknown, context: Context) => {
      context.requirePermission('extension:read');

      return context.prisma.extensionSettings.findMany({
        orderBy: { key: 'asc' },
      });
    },

    extensionSetting: async (_: unknown, args: { key: string }, context: Context) => {
      context.requirePermission('extension:read');

      return context.prisma.extensionSettings.findUnique({
        where: { key: args.key },
      });
    },
  },

  Mutation: {
    upsertExtensionSetting: async (
      _: unknown,
      args: { input: ExtensionSettingInput },
      context: Context
    ) => {
      context.requirePermission('extension:write');
      const admin = context.requireAuth();

      const existing = await context.prisma.extensionSettings.findUnique({
        where: { key: args.input.key },
      });

      const setting = await context.prisma.extensionSettings.upsert({
        where: { key: args.input.key },
        update: {
          value: args.input.value as Prisma.InputJsonValue,
          description: args.input.description,
        },
        create: {
          key: args.input.key,
          value: args.input.value as Prisma.InputJsonValue,
          description: args.input.description,
        },
      });

      await createAuditLog({
        adminId: admin.id,
        action: existing ? 'UPDATE' : 'CREATE',
        entityType: 'ExtensionSettings',
        entityId: setting.id,
        oldValue: existing ? { key: existing.key, value: existing.value } : undefined,
        newValue: { key: setting.key, value: setting.value as Record<string, unknown> },
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return setting;
    },

    deleteExtensionSetting: async (_: unknown, args: { key: string }, context: Context) => {
      context.requirePermission('extension:write');
      const admin = context.requireAuth();

      const existing = await context.prisma.extensionSettings.findUnique({
        where: { key: args.key },
      });

      if (!existing) {
        throw new Error('Extension setting not found');
      }

      await context.prisma.extensionSettings.delete({
        where: { key: args.key },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'DELETE',
        entityType: 'ExtensionSettings',
        entityId: existing.id,
        oldValue: { key: existing.key, value: existing.value as Record<string, unknown> },
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return true;
    },
  },
};

export const auditLogResolvers = {
  Query: {
    auditLogs: async (
      _: unknown,
      args: {
        pagination?: PaginationInput;
        adminId?: string;
        entityType?: string;
        action?: string;
        dateRange?: DateRangeInput;
      },
      context: Context
    ) => {
      context.requirePermission('auditlog:read');

      const page = args.pagination?.page || 1;
      const limit = args.pagination?.limit || 50;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};

      if (args.adminId) where.adminId = args.adminId;
      if (args.entityType) where.entityType = args.entityType;
      if (args.action) where.action = args.action;

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
        context.prisma.auditLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { admin: true },
        }),
        context.prisma.auditLog.count({ where }),
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
