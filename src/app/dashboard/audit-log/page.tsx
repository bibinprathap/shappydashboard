'use client';

import { Button } from '@/components/ui/button';
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
import { Search, Download, FileText, Filter } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { useState } from 'react';

// Placeholder data
const auditLogs = [
  {
    id: '1',
    action: 'CREATE',
    entityType: 'COUPON',
    entityId: 'coup_123',
    entityName: 'SUMMER20',
    oldValue: null,
    newValue: { code: 'SUMMER20', discount: '20%' },
    admin: { email: 'ops@shappy.com', firstName: 'Operations', lastName: 'Manager' },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    action: 'UPDATE',
    entityType: 'MERCHANT',
    entityId: 'merch_456',
    entityName: 'Amazon',
    oldValue: { priority: 5 },
    newValue: { priority: 1 },
    admin: { email: 'super@shappy.com', firstName: 'Super', lastName: 'Admin' },
    ipAddress: '192.168.1.2',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    action: 'DELETE',
    entityType: 'BANNER',
    entityId: 'banner_789',
    entityName: 'Old Promo Banner',
    oldValue: { title: 'Old Promo Banner', status: 'EXPIRED' },
    newValue: null,
    admin: { email: 'marketing@shappy.com', firstName: 'Marketing', lastName: 'Team' },
    ipAddress: '192.168.1.3',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '4',
    action: 'UPDATE',
    entityType: 'ADMIN',
    entityId: 'admin_001',
    entityName: 'finance@shappy.com',
    oldValue: { isActive: true },
    newValue: { isActive: false },
    admin: { email: 'super@shappy.com', firstName: 'Super', lastName: 'Admin' },
    ipAddress: '192.168.1.2',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '5',
    action: 'CREATE',
    entityType: 'DEAL',
    entityId: 'deal_321',
    entityName: 'Flash Sale',
    oldValue: null,
    newValue: { title: 'Flash Sale', merchant: 'Noon' },
    admin: { email: 'marketing@shappy.com', firstName: 'Marketing', lastName: 'Team' },
    ipAddress: '192.168.1.3',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
};

const entityTypeColors: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  COUPON: 'bg-orange-100 text-orange-800',
  MERCHANT: 'bg-cyan-100 text-cyan-800',
  BANNER: 'bg-pink-100 text-pink-800',
  DEAL: 'bg-yellow-100 text-yellow-800',
  COUNTRY: 'bg-indigo-100 text-indigo-800',
  CURRENCY: 'bg-teal-100 text-teal-800',
};

export default function AuditLogPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground">Track all changes made in the system</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by admin, entity, or action..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="COUPON">Coupon</SelectItem>
                <SelectItem value="MERCHANT">Merchant</SelectItem>
                <SelectItem value="BANNER">Banner</SelectItem>
                <SelectItem value="DEAL">Deal</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Last 7 days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Admin</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Entity Type</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Entity</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Changes</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                          {log.admin.firstName[0]}{log.admin.lastName[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {log.admin.firstName} {log.admin.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">{log.admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={actionColors[log.action]}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={entityTypeColors[log.entityType] || 'bg-gray-100 text-gray-800'}>
                        {log.entityType}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{log.entityName}</span>
                      <div className="text-xs text-muted-foreground">{log.entityId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm max-w-xs">
                        {log.action === 'CREATE' && log.newValue && (
                          <span className="text-green-600">
                            Created: {JSON.stringify(log.newValue).slice(0, 50)}...
                          </span>
                        )}
                        {log.action === 'UPDATE' && log.oldValue && log.newValue && (
                          <div className="space-y-1">
                            <div className="text-red-500 line-through">
                              {JSON.stringify(log.oldValue)}
                            </div>
                            <div className="text-green-600">
                              {JSON.stringify(log.newValue)}
                            </div>
                          </div>
                        )}
                        {log.action === 'DELETE' && log.oldValue && (
                          <span className="text-red-500">
                            Deleted: {JSON.stringify(log.oldValue).slice(0, 50)}...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 1-5 of 125 entries
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
