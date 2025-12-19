import { Context } from '../context.js';
import { createAuditLog, sanitizeForAudit } from '../../lib/auditLog.js';
import type { PaginationInput, CountryInput, CurrencyInput, CategoryInput } from './types.js';

export const referenceDataResolvers = {
  Query: {
    // Countries
    countries: async (_: unknown, args: { pagination?: PaginationInput }, context: Context) => {
      context.requireAuth();

      return context.prisma.country.findMany({
        orderBy: { name: 'asc' },
        include: {
          currencies: {
            include: { currency: true },
          },
          _count: {
            select: { merchants: true },
          },
        },
      });
    },

    country: async (_: unknown, args: { id: string }, context: Context) => {
      context.requireAuth();

      const country = await context.prisma.country.findUnique({
        where: { id: args.id },
        include: {
          currencies: {
            include: { currency: true },
          },
        },
      });

      if (!country) return null;

      return {
        ...country,
        currencies: country.currencies.map((cc) => cc.currency),
      };
    },

    // Currencies
    currencies: async (_: unknown, args: { pagination?: PaginationInput }, context: Context) => {
      context.requireAuth();

      return context.prisma.currency.findMany({
        orderBy: { name: 'asc' },
      });
    },

    currency: async (_: unknown, args: { id: string }, context: Context) => {
      context.requireAuth();

      return context.prisma.currency.findUnique({
        where: { id: args.id },
      });
    },

    // Categories
    categories: async (_: unknown, args: { pagination?: PaginationInput }, context: Context) => {
      context.requireAuth();

      const categories = await context.prisma.category.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: {
            select: { merchants: true },
          },
        },
      });

      return categories.map((cat) => ({
        ...cat,
        merchantsCount: cat._count.merchants,
      }));
    },

    category: async (_: unknown, args: { id: string }, context: Context) => {
      context.requireAuth();

      return context.prisma.category.findUnique({
        where: { id: args.id },
      });
    },
  },

  Mutation: {
    // Countries
    createCountry: async (_: unknown, args: { input: CountryInput }, context: Context) => {
      context.requirePermission('admins:write');
      const admin = context.requireAuth();

      const country = await context.prisma.country.create({
        data: args.input,
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'CREATE',
        entityType: 'Country',
        entityId: country.id,
        newValue: sanitizeForAudit(country as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return country;
    },

    updateCountry: async (
      _: unknown,
      args: { id: string; input: CountryInput },
      context: Context
    ) => {
      context.requirePermission('admins:write');
      const admin = context.requireAuth();

      const existingCountry = await context.prisma.country.findUnique({
        where: { id: args.id },
      });

      if (!existingCountry) {
        throw new Error('Country not found');
      }

      const country = await context.prisma.country.update({
        where: { id: args.id },
        data: args.input,
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'UPDATE',
        entityType: 'Country',
        entityId: country.id,
        oldValue: sanitizeForAudit(existingCountry as unknown as Record<string, unknown>),
        newValue: sanitizeForAudit(country as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return country;
    },

    deleteCountry: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('admins:write');
      const admin = context.requireAuth();

      await context.prisma.country.delete({
        where: { id: args.id },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'DELETE',
        entityType: 'Country',
        entityId: args.id,
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return true;
    },

    // Currencies
    createCurrency: async (_: unknown, args: { input: CurrencyInput }, context: Context) => {
      context.requirePermission('admins:write');
      const admin = context.requireAuth();

      const currency = await context.prisma.currency.create({
        data: args.input,
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'CREATE',
        entityType: 'Currency',
        entityId: currency.id,
        newValue: sanitizeForAudit(currency as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return currency;
    },

    updateCurrency: async (
      _: unknown,
      args: { id: string; input: CurrencyInput },
      context: Context
    ) => {
      context.requirePermission('admins:write');
      const admin = context.requireAuth();

      const existingCurrency = await context.prisma.currency.findUnique({
        where: { id: args.id },
      });

      if (!existingCurrency) {
        throw new Error('Currency not found');
      }

      const currency = await context.prisma.currency.update({
        where: { id: args.id },
        data: args.input,
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'UPDATE',
        entityType: 'Currency',
        entityId: currency.id,
        oldValue: sanitizeForAudit(existingCurrency as unknown as Record<string, unknown>),
        newValue: sanitizeForAudit(currency as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return currency;
    },

    deleteCurrency: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('admins:write');
      const admin = context.requireAuth();

      await context.prisma.currency.delete({
        where: { id: args.id },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'DELETE',
        entityType: 'Currency',
        entityId: args.id,
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return true;
    },

    // Categories
    createCategory: async (_: unknown, args: { input: CategoryInput }, context: Context) => {
      context.requirePermission('merchants:write');
      const admin = context.requireAuth();

      const category = await context.prisma.category.create({
        data: args.input,
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'CREATE',
        entityType: 'Category',
        entityId: category.id,
        newValue: sanitizeForAudit(category as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return category;
    },

    updateCategory: async (
      _: unknown,
      args: { id: string; input: CategoryInput },
      context: Context
    ) => {
      context.requirePermission('merchants:write');
      const admin = context.requireAuth();

      const existingCategory = await context.prisma.category.findUnique({
        where: { id: args.id },
      });

      if (!existingCategory) {
        throw new Error('Category not found');
      }

      const category = await context.prisma.category.update({
        where: { id: args.id },
        data: args.input,
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'UPDATE',
        entityType: 'Category',
        entityId: category.id,
        oldValue: sanitizeForAudit(existingCategory as unknown as Record<string, unknown>),
        newValue: sanitizeForAudit(category as unknown as Record<string, unknown>),
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return category;
    },

    deleteCategory: async (_: unknown, args: { id: string }, context: Context) => {
      context.requirePermission('merchants:write');
      const admin = context.requireAuth();

      await context.prisma.category.delete({
        where: { id: args.id },
      });

      await createAuditLog({
        adminId: admin.id,
        action: 'DELETE',
        entityType: 'Category',
        entityId: args.id,
        ipAddress: context.ipAddress ?? undefined,
        userAgent: context.userAgent ?? undefined,
      });

      return true;
    },
  },

  Country: {
    currencies: async (parent: { id: string }, _: unknown, context: Context) => {
      const countryCurrencies = await context.prisma.countryCurrency.findMany({
        where: { countryId: parent.id },
        include: { currency: true },
      });
      return countryCurrencies.map((cc) => cc.currency);
    },
    merchantsCount: async (parent: { id: string }, _: unknown, context: Context) => {
      return context.prisma.merchant.count({
        where: { countryId: parent.id },
      });
    },
  },
};
