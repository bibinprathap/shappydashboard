import prisma from './prisma.js';
import { Admin, AdminRole, Prisma } from '@prisma/client';

interface AuditLogInput {
  adminId?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: input.adminId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldValue: input.oldValue ? (input.oldValue as Prisma.InputJsonValue) : Prisma.JsonNull,
        newValue: input.newValue ? (input.newValue as Prisma.InputJsonValue) : Prisma.JsonNull,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break main operations
  }
}

export function sanitizeForAudit(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...obj };
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.token;
  return sanitized;
}
