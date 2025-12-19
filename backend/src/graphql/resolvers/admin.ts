import { Context } from '../context.js';
import { hashPassword } from '../../lib/auth.js';
import { createAuditLog, sanitizeForAudit } from '../../lib/auditLog.js';
import { AdminRole } from '@prisma/client';
import type { AdminInput, AdminUpdateInput, PaginationInput } from './types.js';

export const adminResolvers = {
  Query: {
    admins: async (_: unknown, args: { pagination?: PaginationInput }, context: Context) => {
      context.requirePermission('admins:read');

      const page = args.pagination?.page || 1;
      const limit = args.pagination?.limit || 20;
      const skip = (page - 1) * limit;

      const [nodes, totalCount] = await Promise.all([
        context.prisma.admin.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        context.prisma.admin.count(),
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

    admin: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('admins:read');

      return context.prisma.admin.findUnique({
        where: { id: args.id },
      });
    },
  },

  Mutation: {
    createAdmin: async (_: unknown, args: { input: AdminInput }, context: Context) => {
      context.requirePermission('admins:write');
      const currentAdmin = context.requireAuth();

      const existingAdmin = await context.prisma.admin.findUnique({
        where: { email: args.input.email.toLowerCase() },
      });

      if (existingAdmin) {
        throw new Error('Email already exists');
      }

      const passwordHash = await hashPassword(args.input.password);

      const admin = await context.prisma.admin.create({
        data: {
          ...args.input,
          email: args.input.email.toLowerCase(),
          password: passwordHash,
        },
      });

      await createAuditLog({
        adminId: currentAdmin.id,
        action: 'CREATE',
        entityType: 'Admin',
        entityId: admin.id,
        newValue: sanitizeForAudit(admin as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return admin;
    },

    updateAdmin: async (
      _: unknown,
      args: { id: string; input: AdminUpdateInput },
      context: Context
    ) => {
      context.requirePermission('admins:write');
      const currentAdmin = context.requireAuth();

      const existingAdmin = await context.prisma.admin.findUnique({
        where: { id: args.id },
      });

      if (!existingAdmin) {
        throw new Error('Admin not found');
      }

      const admin = await context.prisma.admin.update({
        where: { id: args.id },
        data: args.input,
      });

      await createAuditLog({
        adminId: currentAdmin.id,
        action: 'UPDATE',
        entityType: 'Admin',
        entityId: admin.id,
        oldValue: sanitizeForAudit(existingAdmin as unknown as Record<string, unknown>),
        newValue: sanitizeForAudit(admin as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return admin;
    },

    deleteAdmin: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('admins:write');
      const currentAdmin = context.requireAuth();

      if (args.id === currentAdmin.id) {
        throw new Error('Cannot delete your own account');
      }

      const existingAdmin = await context.prisma.admin.findUnique({
        where: { id: args.id },
      });

      if (!existingAdmin) {
        throw new Error('Admin not found');
      }

      await context.prisma.admin.delete({
        where: { id: args.id },
      });

      await createAuditLog({
        adminId: currentAdmin.id,
        action: 'DELETE',
        entityType: 'Admin',
        entityId: args.id,
        oldValue: sanitizeForAudit(existingAdmin as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return true;
    },
  },
};
