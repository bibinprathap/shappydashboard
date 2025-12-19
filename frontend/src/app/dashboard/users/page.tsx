'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { useState } from 'react';

// Placeholder data
const users = [
  {
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    country: 'AE',
    platform: 'ios',
    isActive: true,
    clicksCount: 45,
    conversionsCount: 3,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    country: 'SA',
    platform: 'android',
    isActive: true,
    clicksCount: 89,
    conversionsCount: 7,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: '3',
    email: 'guest@example.com',
    firstName: null,
    lastName: null,
    country: 'KW',
    platform: 'extension',
    isActive: false,
    clicksCount: 12,
    conversionsCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
  },
];

export default function UsersPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Monitor and manage users</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by email..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Country</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Platform</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Clicks</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Conversions</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm">{user.email}</td>
                    <td className="py-3 px-4">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{user.country}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{user.platform}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">{user.clicksCount}</td>
                    <td className="py-3 px-4 text-right">{user.conversionsCount}</td>
                    <td className="py-3 px-4">
                      <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {formatDateTime(user.createdAt)}
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
