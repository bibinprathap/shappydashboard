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
import { Plus, Search, Trash2, Edit, Image, Eye } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { useState } from 'react';

// Placeholder data
const banners = [
  {
    id: '1',
    title: 'Summer Sale Banner',
    imageUrl: 'https://via.placeholder.com/600x200?text=Summer+Sale',
    targetUrl: 'https://shappy.com/summer-sale',
    position: 'HOME_TOP',
    startDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 23).toISOString(),
    status: 'ACTIVE',
    priority: 1,
    impressions: 12500,
    clicks: 850,
    countries: ['AE', 'SA', 'KW'],
  },
  {
    id: '2',
    title: 'New User Welcome',
    imageUrl: 'https://via.placeholder.com/600x200?text=Welcome',
    targetUrl: 'https://shappy.com/welcome',
    position: 'HOME_MIDDLE',
    startDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 60).toISOString(),
    status: 'ACTIVE',
    priority: 2,
    impressions: 45000,
    clicks: 2100,
    countries: ['AE', 'SA', 'KW', 'BH', 'OM', 'QA'],
  },
  {
    id: '3',
    title: 'Flash Sale Alert',
    imageUrl: 'https://via.placeholder.com/600x200?text=Flash+Sale',
    targetUrl: 'https://shappy.com/flash-sale',
    position: 'HOME_TOP',
    startDate: new Date(Date.now() - 86400000 * 14).toISOString(),
    endDate: new Date(Date.now() - 86400000).toISOString(),
    status: 'EXPIRED',
    priority: 1,
    impressions: 8900,
    clicks: 620,
    countries: ['AE'],
  },
  {
    id: '4',
    title: 'Upcoming Promotion',
    imageUrl: 'https://via.placeholder.com/600x200?text=Coming+Soon',
    targetUrl: 'https://shappy.com/upcoming',
    position: 'CATEGORY_TOP',
    startDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 21).toISOString(),
    status: 'SCHEDULED',
    priority: 3,
    impressions: 0,
    clicks: 0,
    countries: ['AE', 'SA'],
  },
];

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
};

const positionLabels: Record<string, string> = {
  HOME_TOP: 'Home - Top',
  HOME_MIDDLE: 'Home - Middle',
  HOME_BOTTOM: 'Home - Bottom',
  CATEGORY_TOP: 'Category - Top',
  MERCHANT_PAGE: 'Merchant Page',
};

export default function BannersPage() {
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewBanner, setPreviewBanner] = useState<typeof banners[0] | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Banners</h1>
          <p className="text-muted-foreground">Manage app banners and promotions</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Banner</DialogTitle>
              <DialogDescription>
                Add a new banner to the app
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Banner title" />
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input id="imageUrl" placeholder="https://..." />
              </div>
              <div>
                <Label htmlFor="targetUrl">Target URL</Label>
                <Input id="targetUrl" placeholder="https://..." />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOME_TOP">Home - Top</SelectItem>
                    <SelectItem value="HOME_MIDDLE">Home - Middle</SelectItem>
                    <SelectItem value="HOME_BOTTOM">Home - Bottom</SelectItem>
                    <SelectItem value="CATEGORY_TOP">Category - Top</SelectItem>
                    <SelectItem value="MERCHANT_PAGE">Merchant Page</SelectItem>
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateOpen(false)}>Create Banner</Button>
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
                <Image className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Banners</p>
                <p className="text-2xl font-bold">{banners.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Image className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{banners.filter(b => b.status === 'ACTIVE').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Impressions</p>
                <p className="text-2xl font-bold">{banners.reduce((sum, b) => sum + b.impressions, 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Image className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">{banners.reduce((sum, b) => sum + b.clicks, 0).toLocaleString()}</p>
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
                placeholder="Search banners..."
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
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="HOME_TOP">Home - Top</SelectItem>
                <SelectItem value="HOME_MIDDLE">Home - Middle</SelectItem>
                <SelectItem value="HOME_BOTTOM">Home - Bottom</SelectItem>
                <SelectItem value="CATEGORY_TOP">Category - Top</SelectItem>
                <SelectItem value="MERCHANT_PAGE">Merchant Page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Banner Preview Dialog */}
      <Dialog open={!!previewBanner} onOpenChange={() => setPreviewBanner(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewBanner?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <img
              src={previewBanner?.imageUrl}
              alt={previewBanner?.title}
              className="w-full rounded-lg"
            />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Position:</span>{' '}
                {previewBanner && positionLabels[previewBanner.position]}
              </div>
              <div>
                <span className="text-muted-foreground">Priority:</span> #{previewBanner?.priority}
              </div>
              <div>
                <span className="text-muted-foreground">Impressions:</span>{' '}
                {previewBanner?.impressions.toLocaleString()}
              </div>
              <div>
                <span className="text-muted-foreground">Clicks:</span>{' '}
                {previewBanner?.clicks.toLocaleString()}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Banners Grid */}
      <div className="grid grid-cols-2 gap-6">
        {banners.map((banner) => (
          <Card key={banner.id} className="overflow-hidden">
            <div className="relative">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-40 object-cover"
              />
              <Badge className={`absolute top-2 right-2 ${statusColors[banner.status]}`}>
                {banner.status}
              </Badge>
            </div>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{banner.title}</h3>
                <Badge variant="outline">#{banner.priority}</Badge>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Position:</span>
                  <span>{positionLabels[banner.position]}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>
                    {new Date(banner.startDate).toLocaleDateString()} -{' '}
                    {new Date(banner.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Impressions / Clicks:</span>
                  <span>
                    {banner.impressions.toLocaleString()} / {banner.clicks.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>CTR:</span>
                  <span>
                    {banner.impressions > 0
                      ? ((banner.clicks / banner.impressions) * 100).toFixed(2)
                      : 0}%
                  </span>
                </div>
              </div>
              <div className="flex gap-1 mt-3 flex-wrap">
                {banner.countries.map((country) => (
                  <Badge key={country} variant="secondary" className="text-xs">
                    {country}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setPreviewBanner(banner)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
