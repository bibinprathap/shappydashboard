"use client";

import { useQuery, gql } from "@apollo/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { permissions } from "@/lib/permissions";
import Link from "next/link";
import {
  Users,
  Store,
  Ticket,
  Image,
  TrendingUp,
  MousePointerClick,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Activity,
  LucideIcon,
} from "lucide-react";

// GraphQL Query for Dashboard Stats
const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    getDashboardStats {
      usersStats {
        totalUsers
        newUsersToday
        newUsersThisMonth
        changePercentage
      }
      merchantsStats {
        totalMerchants
        activeMerchants
        changePercentage
        topMerchants {
          id
          name
          logo
          clicks
          success
        }
      }
      couponsStats {
        totalCoupons
        activeCoupons
        expiredCoupons
        todayClicks
        todayCopied
        todaySuccess
        todayFailed
        changePercentage
      }
      bannersStats {
        totalBanners
        activeBanners
        expiredBanners
      }
      recentActivity {
        id
        action
        entityType
        adminName
        createdAt
      }
    }
  }
`;

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  subtitle?: string;
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  subtitle,
}: StatCardProps) {
  const changeType =
    change === undefined
      ? "neutral"
      : change > 0
        ? "positive"
        : change < 0
          ? "negative"
          : "neutral";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <div className="flex items-center text-xs">
          {changeType === "positive" && (
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
          )}
          {changeType === "negative" && (
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
          )}
          <span
            className={
              changeType === "positive"
                ? "text-green-500"
                : changeType === "negative"
                  ? "text-red-500"
                  : "text-muted-foreground"
            }
          >
            {change !== undefined ? `${change > 0 ? "+" : ""}${change}%` : ""}
          </span>
          {subtitle && (
            <span className="ml-1 text-muted-foreground">{subtitle}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Quick Actions Component
interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: string;
}

function QuickActions({
  hasPermission,
}: {
  hasPermission: (p: string) => boolean;
}) {
  const actions: QuickAction[] = [
    {
      label: "Add Coupon",
      href: "/coupons",
      icon: Ticket,
      permission: permissions.COUPON_CREATE,
    },
    {
      label: "Add Merchant",
      href: "/merchants",
      icon: Store,
      permission: permissions.MERCHANT_CREATE,
    },
    {
      label: "Add Banner",
      href: "/banners",
      icon: Image,
      permission: permissions.BANNER_CREATE,
    },
    {
      label: "Add Staff",
      href: "/staff",
      icon: Users,
      permission: permissions.STAFF_CREATE,
    },
  ];

  const visibleActions = actions.filter((a) => hasPermission(a.permission));

  if (visibleActions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {visibleActions.map((action) => (
            <Button key={action.label} variant="outline" size="sm" asChild>
              <Link href={action.href}>
                <Plus className="mr-1 h-4 w-4" />
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const { data, loading, error } = useQuery(GET_DASHBOARD_STATS, {
    fetchPolicy: "cache-and-network",
  });

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-destructive">
            Error loading dashboard: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const stats = data?.getDashboardStats;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.first_name || "User"}!
        </h1>
        <p className="text-muted-foreground">
          You&apos;re logged in as{" "}
          <span className="font-medium">{user?.role?.name || "Staff"}</span>
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions hasPermission={hasPermission} />

      {/* Stats Grid - Only show cards user has permission to see */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Users Stats */}
        {stats?.usersStats && (
          <>
            <StatCard
              title="Total Users"
              value={stats.usersStats.totalUsers}
              change={stats.usersStats.changePercentage}
              icon={Users}
              subtitle="from last month"
            />
            <StatCard
              title="New Users Today"
              value={stats.usersStats.newUsersToday}
              icon={TrendingUp}
            />
          </>
        )}

        {/* Merchants Stats */}
        {stats?.merchantsStats && (
          <StatCard
            title="Active Merchants"
            value={stats.merchantsStats.activeMerchants}
            icon={Store}
            subtitle={`of ${stats.merchantsStats.totalMerchants} total`}
          />
        )}

        {/* Coupons Stats */}
        {stats?.couponsStats && (
          <>
            <StatCard
              title="Active Coupons"
              value={stats.couponsStats.activeCoupons}
              change={stats.couponsStats.changePercentage}
              icon={Ticket}
              subtitle="from last month"
            />
            <StatCard
              title="Today's Copied"
              value={stats.couponsStats.todayCopied}
              icon={MousePointerClick}
            />
            <StatCard
              title="Today's Success"
              value={stats.couponsStats.todaySuccess}
              icon={TrendingUp}
            />
            <StatCard
              title="Today's Failed"
              value={stats.couponsStats.todayFailed}
              icon={Clock}
            />
          </>
        )}

        {/* Banners Stats */}
        {stats?.bannersStats && (
          <StatCard
            title="Active Banners"
            value={stats.bannersStats.activeBanners}
            icon={Image}
            subtitle={`of ${stats.bannersStats.totalBanners} total`}
          />
        )}

        {/* Pending/Expired Items */}
        {stats?.couponsStats && stats.couponsStats.expiredCoupons > 0 && (
          <StatCard
            title="Expired Coupons"
            value={stats.couponsStats.expiredCoupons}
            icon={Clock}
          />
        )}
      </div>

      {/* Top Merchants - Only show if user has merchants:view permission */}
      {stats?.merchantsStats?.topMerchants &&
        stats.merchantsStats.topMerchants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Merchants</CardTitle>
              <CardDescription>
                Best performing merchants by clicks and success
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Merchant
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        Clicks
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        Success
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.merchantsStats.topMerchants.map(
                      (
                        merchant: {
                          id: string;
                          name: string;
                          logo?: string;
                          clicks: number;
                          success: number;
                        },
                        index: number
                      ) => (
                        <tr
                          key={merchant.id}
                          className="border-b last:border-0"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium overflow-hidden">
                                {merchant.logo ? (
                                  <img
                                    src={merchant.logo}
                                    alt={merchant.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              <span className="font-medium">
                                {merchant.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {merchant.clicks.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {merchant.success.toLocaleString()}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Recent Activity - Only show if user has audit_log:view permission */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.map(
                (activity: {
                  id: string;
                  action: string;
                  entityType: string;
                  adminName: string;
                  createdAt: string;
                }) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <span className="font-medium">{activity.adminName}</span>
                      <span className="text-muted-foreground"> performed </span>
                      <span className="font-medium text-primary">
                        {activity.action}
                      </span>
                      <span className="text-muted-foreground"> on </span>
                      <span className="font-medium">{activity.entityType}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleString()}
                    </span>
                  </div>
                )
              )}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/audit-log">View All Activity</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State - When user has no permissions */}
      {!stats?.usersStats &&
        !stats?.merchantsStats &&
        !stats?.couponsStats &&
        !stats?.bannersStats && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                You don&apos;t have permissions to view dashboard statistics.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Contact your administrator to request access.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
