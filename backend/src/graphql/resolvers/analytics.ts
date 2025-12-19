import { Context } from '../context.js';
import type { PaginationInput, DateRangeInput } from './types.js';

export const analyticsResolvers = {
  Query: {
    dashboardStats: async (_: unknown, __: unknown, context: Context) => {
      context.requireAuth();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        totalUsers,
        totalMerchants,
        totalCoupons,
        activeCoupons,
        totalClicks,
        totalConversions,
        pendingConversions,
        todayClicks,
        todayConversions,
      ] = await Promise.all([
        context.prisma.user.count(),
        context.prisma.merchant.count({ where: { isActive: true } }),
        context.prisma.coupon.count(),
        context.prisma.coupon.count({ where: { status: 'ACTIVE' } }),
        context.prisma.click.count(),
        context.prisma.conversion.count(),
        context.prisma.conversion.count({ where: { status: 'PENDING' } }),
        context.prisma.click.count({ where: { createdAt: { gte: today } } }),
        context.prisma.conversion.count({ where: { createdAt: { gte: today } } }),
      ]);

      return {
        totalUsers,
        totalMerchants,
        totalCoupons,
        activeCoupons,
        totalClicks,
        totalConversions,
        pendingConversions,
        todayClicks,
        todayConversions,
      };
    },

    topMerchants: async (_: unknown, args: { limit?: number }, context: Context) => {
      context.requireAuth();

      const limit = args.limit || 10;

      const merchants = await context.prisma.merchant.findMany({
        where: { isActive: true },
        take: limit,
        orderBy: { priority: 'desc' },
        include: {
          _count: {
            select: {
              clicks: true,
              conversions: true,
            },
          },
          conversions: {
            where: { status: 'CONFIRMED' },
            select: { orderAmount: true },
          },
        },
      });

      return merchants.map((merchant) => ({
        merchant,
        clicks: merchant._count.clicks,
        conversions: merchant._count.conversions,
        revenue: merchant.conversions.reduce((sum, c) => sum + (c.orderAmount || 0), 0),
      }));
    },

    clicksOverTime: async (_: unknown, args: { days?: number }, context: Context) => {
      context.requirePermission('clicks:read');

      const days = args.days || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const clicks = await context.prisma.click.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: startDate } },
        _count: true,
      });

      // Group by date
      const clicksByDate = new Map<string, number>();
      clicks.forEach((click) => {
        const date = click.createdAt.toISOString().split('T')[0];
        clicksByDate.set(date, (clicksByDate.get(date) || 0) + click._count);
      });

      // Fill in missing dates
      const result = [];
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          count: clicksByDate.get(dateStr) || 0,
        });
      }

      return result;
    },

    conversionsOverTime: async (_: unknown, args: { days?: number }, context: Context) => {
      context.requirePermission('conversions:read');

      const days = args.days || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const conversions = await context.prisma.conversion.findMany({
        where: { createdAt: { gte: startDate } },
        select: {
          createdAt: true,
          orderAmount: true,
        },
      });

      // Group by date
      const conversionsByDate = new Map<string, { count: number; amount: number }>();
      conversions.forEach((conversion) => {
        const date = conversion.createdAt.toISOString().split('T')[0];
        const existing = conversionsByDate.get(date) || { count: 0, amount: 0 };
        conversionsByDate.set(date, {
          count: existing.count + 1,
          amount: existing.amount + (conversion.orderAmount || 0),
        });
      });

      // Fill in missing dates
      const result = [];
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const data = conversionsByDate.get(dateStr) || { count: 0, amount: 0 };
        result.push({
          date: dateStr,
          count: data.count,
          amount: data.amount,
        });
      }

      return result;
    },
  },
};
