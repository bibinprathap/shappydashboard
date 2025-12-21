'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Store, 
  Ticket, 
  TrendingUp, 
  MousePointerClick, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// Placeholder stats - in production, this would come from GraphQL
const stats = [
  {
    name: 'Total Users',
    value: '12,345',
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: Users,
  },
  {
    name: 'Active Merchants',
    value: '234',
    change: '+4.2%',
    changeType: 'positive' as const,
    icon: Store,
  },
  {
    name: 'Active Coupons',
    value: '1,847',
    change: '-2.1%',
    changeType: 'negative' as const,
    icon: Ticket,
  },
  {
    name: 'Conversions',
    value: '892',
    change: '+18.7%',
    changeType: 'positive' as const,
    icon: TrendingUp,
  },
  {
    name: 'Today\'s Clicks',
    value: '4,521',
    change: '+8.3%',
    changeType: 'positive' as const,
    icon: MousePointerClick,
  },
  {
    name: 'Pending Conversions',
    value: '156',
    change: '0%',
    changeType: 'neutral' as const,
    icon: Clock,
  },
];

const topMerchants = [
  { name: 'Noon', clicks: 1234, conversions: 89, revenue: 12500 },
  { name: 'Amazon.ae', clicks: 987, conversions: 67, revenue: 9800 },
  { name: 'Namshi', clicks: 756, conversions: 45, revenue: 6700 },
  { name: 'Carrefour', clicks: 654, conversions: 38, revenue: 5400 },
  { name: 'SHEIN', clicks: 543, conversions: 32, revenue: 4200 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Shappy Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs">
                {stat.changeType === 'positive' && (
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                )}
                {stat.changeType === 'negative' && (
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                )}
                <span
                  className={
                    stat.changeType === 'positive'
                      ? 'text-green-500'
                      : stat.changeType === 'negative'
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                  }
                >
                  {stat.change}
                </span>
                <span className="ml-1 text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Merchants */}
      <Card>
        <CardHeader>
          <CardTitle>Top Merchants</CardTitle>
          <CardDescription>Best performing merchants by clicks and conversions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Merchant</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Clicks</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Conversions</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Revenue (AED)</th>
                </tr>
              </thead>
              <tbody>
                {topMerchants.map((merchant, index) => (
                  <tr key={merchant.name} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium">{merchant.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">{merchant.clicks.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{merchant.conversions}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {merchant.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
