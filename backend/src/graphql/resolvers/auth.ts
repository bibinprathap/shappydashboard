import { Context } from '../context.js';
import { comparePassword, generateToken, hashPassword } from '../../lib/auth.js';

export const authResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: Context) => {
      return context.admin;
    },
  },

  Mutation: {
    login: async (_: unknown, args: { email: string; password: string }, context: Context) => {
      const { email, password } = args;

      const admin = await context.prisma.admin.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!admin) {
        throw new Error('Invalid email or password');
      }

      if (!admin.isActive) {
        throw new Error('Account is disabled');
      }

      const isValidPassword = await comparePassword(password, admin.password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await context.prisma.admin.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() },
      });

      const token = generateToken(admin);

      return {
        token,
        admin,
      };
    },

    changePassword: async (
      _: unknown,
      args: { currentPassword: string; newPassword: string },
      context: Context
    ) => {
      const admin = context.requireAuth();

      const isValidPassword = await comparePassword(args.currentPassword, admin.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      const newPasswordHash = await hashPassword(args.newPassword);

      await context.prisma.admin.update({
        where: { id: admin.id },
        data: { password: newPasswordHash },
      });

      return true;
    },
  },
};
