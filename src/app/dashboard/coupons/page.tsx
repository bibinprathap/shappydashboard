'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Pin, Eye, EyeOff, Trash2, Edit, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Placeholder data - in production, this would come from GraphQL
const coupons = [
  {
    id: '1',
    code: 'SHAPPY10',
    title: '10% Off Everything',
    merchant: { name: 'Noon', slug: 'noon' },
    type: 'PERCENTAGE',
    discountValue: 10,
    status: 'ACTIVE',
    isPinned: true,
    isVerified: true,
    usageCount: 1234,
    successCount: 987,
  },
  {
    id: '2',
    code: 'SAVE50',
    title: 'AED 50 Off Orders Above 200',
    merchant: { name: 'Amazon.ae', slug: 'amazon-ae' },
    type: 'FIXED_AMOUNT',
    discountValue: 50,
    status: 'ACTIVE',
    isPinned: false,
    isVerified: true,
    usageCount: 567,
    successCount: 432,
  },
  {
    id: '3',
    code: 'FREESHIP',
    title: 'Free Shipping',
    merchant: { name: 'Namshi', slug: 'namshi' },
    type: 'FREE_SHIPPING',
    discountValue: null,
    status: 'EXPIRED',
    isPinned: false,
    isVerified: false,
    usageCount: 234,
    successCount: 156,
  },
];

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-red-100 text-red-800',
  SUPPRESSED: 'bg-yellow-100 text-yellow-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
};

export default function CouponsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-muted-foreground">Manage coupon codes and offers</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Coupon</DialogTitle>
              <DialogDescription>
                Add a new coupon code for a merchant
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input id="code" placeholder="e.g., SAVE20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merchant">Merchant</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select merchant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="noon">Noon</SelectItem>
                      <SelectItem value="amazon-ae">Amazon.ae</SelectItem>
                      <SelectItem value="namshi">Namshi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g., 20% Off Everything" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Discount Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                      <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Discount Value</Label>
                  <Input id="value" type="number" placeholder="e.g., 20" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch id="pinned" />
                  <Label htmlFor="pinned">Pinned</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="verified" />
                  <Label htmlFor="verified">Verified</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="exclusive" />
                  <Label htmlFor="exclusive">Exclusive</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateOpen(false)}>Create Coupon</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search coupons..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="SUPPRESSED">Suppressed</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Merchant</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Discount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Usage</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {coupon.code}
                        </code>
                        <button className="text-muted-foreground hover:text-foreground">
                          <Copy className="h-4 w-4" />
                        </button>
                        {coupon.isPinned && (
                          <Pin className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {coupon.title}
                        {coupon.isVerified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">{coupon.merchant.name}</td>
                    <td className="py-3 px-4">
                      {coupon.type === 'PERCENTAGE' && `${coupon.discountValue}%`}
                      {coupon.type === 'FIXED_AMOUNT' && `AED ${coupon.discountValue}`}
                      {coupon.type === 'FREE_SHIPPING' && 'Free Shipping'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={statusColors[coupon.status as keyof typeof statusColors]}>
                        {coupon.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-green-600">{coupon.successCount}</span>
                      <span className="text-muted-foreground"> / {coupon.usageCount}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          {coupon.status === 'SUPPRESSED' ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
