'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

// Placeholder data
const clicks = [
  {
    id: '1',
    user: { email: 'user1@example.com' },
    merchant: { name: 'Noon' },
    coupon: { code: 'SHAPPY10' },
    source: 'extension',
    platform: 'chrome',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    user: { email: 'user2@example.com' },
    merchant: { name: 'Amazon.ae' },
    coupon: null,
    source: 'app',
    platform: 'ios',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    user: null,
    merchant: { name: 'Namshi' },
    coupon: { code: 'FASHION20' },
    source: 'web',
    platform: 'web',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export default function ClicksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clicks</h1>
        <p className="text-muted-foreground">Monitor user click activity</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10" />
            </div>
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
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="extension">Extension</SelectItem>
                <SelectItem value="app">App</SelectItem>
                <SelectItem value="web">Web</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clicks Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Merchant</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Coupon</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Source</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Platform</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {clicks.map((click) => (
                  <tr key={click.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm">
                      {click.user?.email || <span className="text-muted-foreground">Anonymous</span>}
                    </td>
                    <td className="py-3 px-4">{click.merchant.name}</td>
                    <td className="py-3 px-4">
                      {click.coupon ? (
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {click.coupon.code}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{click.source}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{click.platform}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {formatDateTime(click.createdAt)}
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
