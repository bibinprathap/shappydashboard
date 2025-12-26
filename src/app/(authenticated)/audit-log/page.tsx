"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Loader2, Eye } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";

// GraphQL Query
const GET_AUDIT_LOG = gql`
  query GetAuditLog(
    $limit: Int
    $offset: Int
    $action: String
    $entityType: String
    $startDate: String
    $endDate: String
  ) {
    getAuditLog(
      limit: $limit
      offset: $offset
      action: $action
      entityType: $entityType
      startDate: $startDate
      endDate: $endDate
    ) {
      totalCount
      logs {
        id
        action
        entityType
        entityId
        details
        ipAddress
        createdAt
        admin {
          id
          email
          first_name
          last_name
        }
      }
    }
  }
`;

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any> | null;
  ipAddress: string | null;
  createdAt: string;
  admin: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
}

const actionColors: Record<string, string> = {
  CREATE: "bg-green-100 text-green-800",
  UPDATE: "bg-blue-100 text-blue-800",
  DELETE: "bg-red-100 text-red-800",
  LOGIN: "bg-purple-100 text-purple-800",
};

const entityTypeColors: Record<string, string> = {
  STAFF_USER: "bg-purple-100 text-purple-800",
  COUPON: "bg-orange-100 text-orange-800",
  MERCHANT: "bg-cyan-100 text-cyan-800",
  BANNER: "bg-pink-100 text-pink-800",
  AUTH: "bg-indigo-100 text-indigo-800",
};

const ITEMS_PER_PAGE = 10;

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // Calculate date range values
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case "7":
        return {
          startDate: new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          endDate: now.toISOString(),
        };
      case "30":
        return {
          startDate: new Date(
            now.getTime() - 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          endDate: now.toISOString(),
        };
      case "90":
        return {
          startDate: new Date(
            now.getTime() - 90 * 24 * 60 * 60 * 1000
          ).toISOString(),
          endDate: now.toISOString(),
        };
      default:
        return { startDate: undefined, endDate: undefined };
    }
  };

  const { startDate, endDate } = getDateRange();

  const { data, loading, error, refetch } = useQuery(GET_AUDIT_LOG, {
    variables: {
      limit: ITEMS_PER_PAGE,
      offset: page * ITEMS_PER_PAGE,
      action: actionFilter,
      entityType: entityTypeFilter,
      startDate,
      endDate,
    },
    fetchPolicy: "cache-and-network",
  });

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [actionFilter, entityTypeFilter, dateRange]);

  const logs = data?.getAuditLog?.logs || [];
  const totalCount = data?.getAuditLog?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handlePrevious = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground">
            Track all changes made in the system
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by staff, entity, or action..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={entityTypeFilter}
              onValueChange={setEntityTypeFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="STAFF_USER">Staff</SelectItem>
                <SelectItem value="COUPON">Coupon</SelectItem>
                <SelectItem value="MERCHANT">Merchant</SelectItem>
                <SelectItem value="BANNER">Banner</SelectItem>
                <SelectItem value="AUTH">Auth</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
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
          {loading && !data ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-red-500">
              Failed to load audit log. Please try again.
            </div>
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              No audit log entries found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Timestamp
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Staff
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Action
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Entity Type
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Entity
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: AuditLogEntry) => (
                    <tr
                      key={log.id}
                      className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        {log.admin ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                              {log.admin.first_name?.[0] || "?"}
                              {log.admin.last_name?.[0] || ""}
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {log.admin.first_name} {log.admin.last_name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {log.admin.email}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">System</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            actionColors[log.action] ||
                            "bg-gray-100 text-gray-800"
                          }
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            entityTypeColors[log.entityType] ||
                            "bg-gray-100 text-gray-800"
                          }
                        >
                          {log.entityType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-muted-foreground">
                          {log.entityId}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {page * ITEMS_PER_PAGE + 1}-
          {Math.min((page + 1) * ITEMS_PER_PAGE, totalCount)} of {totalCount}{" "}
          entries
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={handlePrevious}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={handleNext}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Audit Log Details
              {selectedLog && (
                <Badge
                  className={
                    actionColors[selectedLog.action] ||
                    "bg-gray-100 text-gray-800"
                  }
                >
                  {selectedLog.action}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Timestamp
                  </label>
                  <p className="text-sm">
                    {formatDateTime(selectedLog.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    IP Address
                  </label>
                  <p className="text-sm">{selectedLog.ipAddress || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Entity Type
                  </label>
                  <div className="mt-1">
                    <Badge
                      className={
                        entityTypeColors[selectedLog.entityType] ||
                        "bg-gray-100 text-gray-800"
                      }
                    >
                      {selectedLog.entityType}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Entity ID
                  </label>
                  <p className="text-sm font-mono">{selectedLog.entityId}</p>
                </div>
              </div>

              {/* Admin Info */}
              {selectedLog.admin && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Performed By
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                      {selectedLog.admin.first_name?.[0] || "?"}
                      {selectedLog.admin.last_name?.[0] || ""}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {selectedLog.admin.first_name}{" "}
                        {selectedLog.admin.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedLog.admin.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Details JSON */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Details
                </label>
                {selectedLog.details ? (
                  <pre className="mt-1 p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    No details available
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
