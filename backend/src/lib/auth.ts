import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Admin, AdminRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  adminId: string;
  email: string;
  role: AdminRole;
}

export function generateToken(admin: Admin): string {
  const payload: TokenPayload = {
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Role-based permission checks
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: ['*'], // All permissions
  OPS: [
    'coupons:read', 'coupons:write',
    'merchants:read', 'merchants:write',
    'deals:read', 'deals:write',
    'banners:read', 'banners:write',
    'users:read',
    'clicks:read',
    'conversions:read',
    'auditlog:read',
  ],
  MARKETING: [
    'coupons:read', 'coupons:write',
    'merchants:read',
    'deals:read', 'deals:write',
    'banners:read', 'banners:write',
    'clicks:read',
    'conversions:read',
  ],
  FINANCE: [
    'coupons:read',
    'merchants:read',
    'conversions:read', 'conversions:write',
    'users:read',
    'clicks:read',
  ],
  TECH: [
    'coupons:read', 'coupons:write',
    'merchants:read', 'merchants:write',
    'deals:read', 'deals:write',
    'banners:read', 'banners:write',
    'users:read',
    'clicks:read',
    'conversions:read',
    'extension:read', 'extension:write',
    'auditlog:read',
    'admins:read',
  ],
};

export function hasPermission(role: AdminRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
}
