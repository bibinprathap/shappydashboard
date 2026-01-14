"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  RefreshCw,
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useAuth } from "@/contexts/auth-context";
import { permissions } from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";

// GraphQL Query
const GET_COUPON_REPORTS = gql`
  query GetStaffCouponReports($limit: Int, $offset: Int, $search: String) {
    getStaffCouponReports(limit: $limit, offset: $offset, search: $search) {
      totalCount
      reports {
        id
        coupon_id
        coupon_name
        website_id
        website_name
        user_id
        user_name
        created_at
        report_count
      }
    }
  }
`;

// GraphQL Mutation
const DELETE_COUPON_REPORT = gql`
  mutation DeleteStaffCouponReport($id: ID!) {
    deleteStaffCouponReport(id: $id) {
      success
      message
    }
  }
`;

interface CouponReport {
  id: string;
  coupon_id: number;
  coupon_name: string;
  website_id: number;
  website_name: string;
  user_id: number;
  user_name: string;
  created_at: string;
  report_count: number;
}

const ITEMS_PER_PAGE = 10;

export default function CouponReportsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);
  const { hasPermission } = useAuth();
  const { toast } = useToast();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, refetch } = useQuery(GET_COUPON_REPORTS, {
    variables: {
      limit: ITEMS_PER_PAGE,
      offset: page * ITEMS_PER_PAGE,
      search: debouncedSearch || undefined,
    },
    fetchPolicy: "cache-and-network",
  });

  const [deleteReport, { loading: deleteLoading }] = useMutation(
    DELETE_COUPON_REPORT,
    {
      onCompleted: (data) => {
        if (data.deleteStaffCouponReport.success) {
          toast({
            title: "Report Deleted",
            description: "The coupon report has been successfully deleted.",
          });
          refetch();
        }
        setDeleteReportId(null);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to delete report",
          variant: "destructive",
        });
        setDeleteReportId(null);
      },
    }
  );

  const reports = data?.getStaffCouponReports?.reports || [];
  const totalCount = data?.getStaffCouponReports?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handlePrevious = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handleDelete = (id: string) => {
    deleteReport({ variables: { id } });
  };

  const canDelete = hasPermission(permissions.COUPON_REPORT_DELETE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            Coupon Reports
          </h1>
          <p className="text-muted-foreground">
            View coupons reported as not working by users
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by coupon code, website, or user..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardContent className="pt-6">
          {loading && !data ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-red-500">
              Failed to load coupon reports. Please try again.
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mb-4 opacity-50" />
              <p>No coupon reports found.</p>
              <p className="text-sm">
                Reports will appear here when users report non-working codes.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Reported At
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Coupon Code
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                      Total Reports
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Website
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Reported By
                    </th>
                    {canDelete && (
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report: CouponReport) => (
                    <tr
                      key={report.id}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDateTime(report.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="font-mono">
                          {report.coupon_name}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            report.report_count > 5
                              ? "destructive"
                              : report.report_count > 2
                                ? "secondary"
                                : "outline"
                          }
                          className="font-mono"
                        >
                          {report.report_count}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{report.website_name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {report.user_name}
                        </span>
                      </td>
                      {canDelete && (
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteReportId(report.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * ITEMS_PER_PAGE + 1}-
            {Math.min((page + 1) * ITEMS_PER_PAGE, totalCount)} of {totalCount}{" "}
            reports
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
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteReportId}
        onOpenChange={() => setDeleteReportId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon Report?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this report. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteReportId && handleDelete(deleteReportId)}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
