'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import { Plus, Search, Star, Trash2, Edit, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Placeholder data
const merchants = [
  {
    id: '1',
    name: 'Noon',
    slug: 'noon',
    websiteUrl: 'https://www.noon.com',
    logoUrl: null,
    priority: 100,
    isFeatured: true,
    isActive: true,
    couponsCount: 45,
    clicksCount: 12345,
    conversionsCount: 567,
    country: { name: 'UAE', code: 'AE' },
    categories: [{ name: 'Electronics' }, { name: 'Fashion' }],
  },
  {
    id: '2',
    name: 'Amazon.ae',
    slug: 'amazon-ae',
    websiteUrl: 'https://www.amazon.ae',
    logoUrl: null,
    priority: 95,
    isFeatured: true,
    isActive: true,
    couponsCount: 32,
    clicksCount: 9876,
    conversionsCount: 432,
    country: { name: 'UAE', code: 'AE' },
    categories: [{ name: 'Electronics' }],
  },
  {
    id: '3',
    name: 'Namshi',
    slug: 'namshi',
    websiteUrl: 'https://www.namshi.com',
    logoUrl: null,
    priority: 80,
    isFeatured: false,
    isActive: true,
    couponsCount: 18,
    clicksCount: 5432,
    conversionsCount: 234,
    country: { name: 'UAE', code: 'AE' },
    categories: [{ name: 'Fashion' }],
  },
];

export default function MerchantsPage() {
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Merchants</h1>
          <p className="text-muted-foreground">Manage merchants and stores</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Merchant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Merchant</DialogTitle>
              <DialogDescription>
                Add a new merchant to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="e.g., Noon" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" placeholder="e.g., noon" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input id="website" placeholder="https://www.example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input id="priority" type="number" placeholder="0-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ae">UAE</SelectItem>
                      <SelectItem value="sa">Saudi Arabia</SelectItem>
                      <SelectItem value="kw">Kuwait</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch id="featured" />
                  <Label htmlFor="featured">Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="active" defaultChecked />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateOpen(false)}>Add Merchant</Button>
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
                placeholder="Search merchants..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="ae">UAE</SelectItem>
                <SelectItem value="sa">Saudi Arabia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Merchants Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {merchants.map((merchant) => (
          <Card key={merchant.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {merchant.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{merchant.name}</h3>
                      {merchant.isFeatured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <a
                      href={merchant.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      {merchant.websiteUrl.replace('https://', '')}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <Badge variant={merchant.isActive ? 'default' : 'secondary'}>
                  {merchant.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {merchant.categories.map((cat) => (
                  <Badge key={cat.name} variant="outline" className="text-xs">
                    {cat.name}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <div className="text-xl font-bold">{merchant.couponsCount}</div>
                  <div className="text-xs text-muted-foreground">Coupons</div>
                </div>
                <div>
                  <div className="text-xl font-bold">{merchant.clicksCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Clicks</div>
                </div>
                <div>
                  <div className="text-xl font-bold">{merchant.conversionsCount}</div>
                  <div className="text-xs text-muted-foreground">Conversions</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  Priority: {merchant.priority}
                </span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
