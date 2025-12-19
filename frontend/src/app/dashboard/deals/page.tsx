'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Trash2, Edit, Star, ArrowUp, ArrowDown } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { useState } from 'react';

// Placeholder data
const deals = [
  {
    id: '1',
    title: 'Summer Sale Special',
    merchant: 'Amazon',
    merchantLogo: 'https://logo.clearbit.com/amazon.com',
    startDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 23).toISOString(),
    priority: 1,
    isActive: true,
    countries: ['AE', 'SA', 'KW'],
    clicks: 1234,
    conversions: 89,
  },
  {
    id: '2',
    title: 'Tech Week Deals',
    merchant: 'Noon',
    merchantLogo: 'https://logo.clearbit.com/noon.com',
    startDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    priority: 2,
    isActive: true,
    countries: ['AE', 'SA'],
    clicks: 567,
    conversions: 45,
  },
  {
    id: '3',
    title: 'Fashion Flash Sale',
    merchant: 'Namshi',
    merchantLogo: 'https://logo.clearbit.com/namshi.com',
    startDate: new Date(Date.now() - 86400000 * 14).toISOString(),
    endDate: new Date(Date.now() - 86400000).toISOString(),
    priority: 3,
    isActive: false,
    countries: ['AE'],
    clicks: 890,
    conversions: 67,
  },
];

export default function DealsPage() {
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals</h1>
          <p className="text-muted-foreground">Manage featured promotions and deals</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Deal</DialogTitle>
              <DialogDescription>
                Create a featured promotion or deal
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Summer Sale Special" />
              </div>
              <div>
                <Label htmlFor="merchant">Merchant</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select merchant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amazon">Amazon</SelectItem>
                    <SelectItem value="noon">Noon</SelectItem>
                    <SelectItem value="namshi">Namshi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="datetime-local" />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="datetime-local" />
                </div>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input id="priority" type="number" min="1" placeholder="1" />
              </div>
              <div>
                <Label htmlFor="countries">Countries</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AE">UAE</SelectItem>
                    <SelectItem value="SA">Saudi Arabia</SelectItem>
                    <SelectItem value="KW">Kuwait</SelectItem>
                    <SelectItem value="BH">Bahrain</SelectItem>
                    <SelectItem value="OM">Oman</SelectItem>
                    <SelectItem value="QA">Qatar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch id="isActive" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateOpen(false)}>Create Deal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Deals</p>
                <p className="text-2xl font-bold">{deals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{deals.filter(d => d.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <ArrowUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">{deals.reduce((sum, d) => sum + d.clicks, 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <ArrowDown className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Conversions</p>
                <p className="text-2xl font-bold">{deals.reduce((sum, d) => sum + d.conversions, 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deals..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deals Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Deal</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Merchant</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Countries</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Duration</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Clicks</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Conversions</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{deal.priority}</Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{deal.title}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={deal.merchantLogo}
                          alt={deal.merchant}
                          className="w-6 h-6 rounded"
                          onError={(e) => { e.currentTarget.src = '/placeholder-logo.png'; }}
                        />
                        <span>{deal.merchant}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {deal.countries.map((country) => (
                          <Badge key={country} variant="secondary" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">
                          {new Date(deal.startDate).toLocaleDateString()} - {new Date(deal.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{deal.clicks.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-medium">{deal.conversions.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      {isExpired(deal.endDate) ? (
                        <Badge className="bg-gray-100 text-gray-800">Expired</Badge>
                      ) : deal.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">Inactive</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
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
