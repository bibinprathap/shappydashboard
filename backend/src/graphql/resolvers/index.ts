import { authResolvers } from './auth.js';
import { adminResolvers } from './admin.js';
import { couponResolvers } from './coupon.js';
import { merchantResolvers } from './merchant.js';
import { bannerResolvers } from './banner.js';
import { dealResolvers } from './deal.js';
import { referenceDataResolvers } from './referenceData.js';
import { userResolvers, clickResolvers, conversionResolvers } from './tracking.js';
import { extensionResolvers, auditLogResolvers } from './extension.js';
import { analyticsResolvers } from './analytics.js';
import { GraphQLScalarType, Kind } from 'graphql';

// Re-export types for external use
export * from './types.js';

// Custom scalar for DateTime
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw new Error('DateTime must be a Date object');
  },
  parseValue(value: unknown): Date {
    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(value);
    }
    throw new Error('DateTime must be a string or number');
  },
  parseLiteral(ast): Date | null {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return new Date(ast.kind === Kind.INT ? parseInt(ast.value, 10) : ast.value);
    }
    return null;
  },
});

// Custom scalar for JSON
const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: unknown): unknown {
    return value;
  },
  parseValue(value: unknown): unknown {
    return value;
  },
  parseLiteral(ast): unknown {
    if (ast.kind === Kind.STRING) {
      try {
        return JSON.parse(ast.value);
      } catch {
        return ast.value;
      }
    }
    if (ast.kind === Kind.INT) {
      return parseInt(ast.value, 10);
    }
    if (ast.kind === Kind.FLOAT) {
      return parseFloat(ast.value);
    }
    if (ast.kind === Kind.BOOLEAN) {
      return ast.value;
    }
    return null;
  },
});

// Merge all resolvers
export const resolvers = {
  DateTime: DateTimeScalar,
  JSON: JSONScalar,

  Query: {
    ...authResolvers.Query,
    ...adminResolvers.Query,
    ...couponResolvers.Query,
    ...merchantResolvers.Query,
    ...bannerResolvers.Query,
    ...dealResolvers.Query,
    ...referenceDataResolvers.Query,
    ...userResolvers.Query,
    ...clickResolvers.Query,
    ...conversionResolvers.Query,
    ...extensionResolvers.Query,
    ...auditLogResolvers.Query,
    ...analyticsResolvers.Query,
  },

  Mutation: {
    ...authResolvers.Mutation,
    ...adminResolvers.Mutation,
    ...couponResolvers.Mutation,
    ...merchantResolvers.Mutation,
    ...bannerResolvers.Mutation,
    ...dealResolvers.Mutation,
    ...referenceDataResolvers.Mutation,
    ...conversionResolvers.Mutation,
    ...extensionResolvers.Mutation,
  },

  // Type resolvers
  Coupon: couponResolvers.Coupon,
  Country: referenceDataResolvers.Country,
};
