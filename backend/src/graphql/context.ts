import { Admin, AdminRole } from '@prisma/client';
import { Request } from 'express';
import prisma from '../lib/prisma.js';
import { verifyToken, hasPermission } from '../lib/auth.js';

export interface Context {
  prisma: typeof prisma;
  admin: Admin | null;
  ipAddress: string | null;
  userAgent: string | null;
  hasPermission: (permission: string) => boolean;
  requireAuth: () => Admin;
  requirePermission: (permission: string) => void;
}

export async function createContext({ req }: { req: Request }): Promise<Context> {
  const authHeader = req.headers.authorization;
  let admin: Admin | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (payload) {
      admin = await prisma.admin.findUnique({
        where: { id: payload.adminId },
      });

      if (admin && !admin.isActive) {
        admin = null;
      }
    }
  }

  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
  const userAgent = req.headers['user-agent'] || null;

  return {
    prisma,
    admin,
    ipAddress,
    userAgent,
    hasPermission: (permission: string) => {
      if (!admin) return false;
      return hasPermission(admin.role, permission);
    },
    requireAuth: () => {
      if (!admin) {
        throw new Error('Authentication required');
      }
      return admin;
    },
    requirePermission: (permission: string) => {
      if (!admin) {
        throw new Error('Authentication required');
      }
      if (!hasPermission(admin.role, permission)) {
        throw new Error(`Permission denied: ${permission}`);
      }
    },
  };
}
