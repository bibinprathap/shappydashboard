'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Filter } from 'lucide-react';
import { formatDateTime, formatCurrency } from '@/lib/utils';

// Placeholder data
const conversions = [
  {
    id: '1',
    orderId: 'ORD-12345',
    user: { email: 'user1@example.com' },
    merchant: { name: 'Noon' },
    coupon: { code: 'SHAPPY10' },
    orderAmount: 450.00,
    commission: 22.50,
    status: 'CONFIRMED',
    source: 'extension',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    orderId: 'ORD-12346',
    user: { email: 'user2@example.com' },
    merchant: { name: 'Amazon.ae' },
    coupon: { code: 'SAVE50' },
    orderAmount: 890.00,
    commission: 44.50,
    status: 'PENDING',
    source: 'app',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    orderId: 'ORD-12347',
    user: { email: 'user3@example.com' },
    merchant: { name: 'Namshi' },
    coupon: null,
    orderAmount: 320.00,
    commission: 16.00,
    status: 'PAID',
    source: 'extension',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  PAID: 'bg-blue-100 text-blue-800',
};

export default function ConversionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Conversions</h1>
          <p className="text-muted-foreground">Track and manage conversions</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED 125,430</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED 6,271</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED 1,245</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by order ID or email..." className="pl-10" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Merchant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Merchants</SelectItem>
                <SelectItem value="noon">Noon</SelectItem>
                <SelectItem value="amazon">Amazon.ae</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Conversions Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Merchant</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Coupon</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Commission</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Source</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {conversions.map((conversion) => (
                  <tr key={conversion.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <code className="text-sm">{conversion.orderId}</code>
                    </td>
                    <td className="py-3 px-4 text-sm">{conversion.user.email}</td>
                    <td className="py-3 px-4">{conversion.merchant.name}</td>
                    <td className="py-3 px-4">
                      {conversion.coupon ? (
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {conversion.coupon.code}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(conversion.orderAmount)}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600">
                      {formatCurrency(conversion.commission)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={statusColors[conversion.status as keyof typeof statusColors]}>
                        {conversion.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{conversion.source}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {formatDateTime(conversion.createdAt)}
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
