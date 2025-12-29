"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Trash2,
  XCircle,
  Loader2,
  Send,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { permissions } from "@/lib/permissions";
import { COUNTRIES, getCountryName, searchCountries } from "@/lib/countries";
import { useAuth } from "@/contexts/auth-context";

// GraphQL Query
const GET_NOTIFICATIONS = gql`
  query GetPushNotifications(
    $limit: Int
    $offset: Int
    $search: String
    $status: String
  ) {
    getPushNotifications(
      limit: $limit
      offset: $offset
      search: $search
      status: $status
    ) {
      totalCount
      notifications {
        id
        title
        body
        status
        scheduled_at
        sent_count
        failed_count
        created_at
        admin {
          first_name
          last_name
        }
      }
    }
  }
`;

const SCHEDULE_NOTIFICATION = gql`
  mutation ScheduleNotification(
    $title: String!
    $body: String!
    $scheduledAt: String!
    $location: String
  ) {
    scheduleNotification(
      title: $title
      body: $body
      scheduledAt: $scheduledAt
      location: $location
    ) {
      success
      message
      jobId
    }
  }
`;

const DELETE_NOTIFICATION = gql`
  mutation DeletePushNotification($id: ID!) {
    deletePushNotification(id: $id) {
      success
      message
    }
  }
`;

const PAGE_SIZE = 10;

export default function PushNotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const offset = (currentPage - 1) * PAGE_SIZE;

  // Form state
  const defaultDate = new Date(Date.now() + 5 * 60000);
  const defaultDateString = new Date(
    defaultDate.getTime() - defaultDate.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [scheduledAt, setScheduledAt] = useState(defaultDateString);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, loading, error, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: {
      limit: PAGE_SIZE,
      offset,
      search: search || undefined,
      status: statusFilter || undefined,
    },
    fetchPolicy: "network-only",
  });

  const notifications = data?.getPushNotifications?.notifications || [];
  const totalCount = data?.getPushNotifications?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const [scheduleNotification, { loading: scheduling }] = useMutation(
    SCHEDULE_NOTIFICATION,
    {
      onCompleted: () => {
        toast({ title: "Success", description: "Notification scheduled" });
        setDialogOpen(false);
        resetForm();
        refetch();
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      },
    }
  );

  const [deleteNotification] = useMutation(DELETE_NOTIFICATION, {
    onCompleted: () => {
      toast({ title: "Success", description: "Notification deleted" });
      refetch();
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setBody("");
    setScheduledAt(defaultDateString);
    setSelectedCountries([]);
    setCountrySearch("");
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (title.length < 5)
      newErrors.title = "Title must be at least 5 characters";
    if (title.length > 100)
      newErrors.title = "Title cannot exceed 100 characters";
    if (body.length < 10)
      newErrors.body = "Message must be at least 10 characters";
    if (body.length > 500)
      newErrors.body = "Message cannot exceed 500 characters";
    if (new Date(scheduledAt) < new Date(Date.now() - 60000)) {
      newErrors.scheduledAt = "Scheduled time cannot be in the past";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduling) return; // Prevent double submission
    if (!validate()) return;

    scheduleNotification({
      variables: {
        title,
        body,
        scheduledAt: new Date(scheduledAt).toISOString(),
        location:
          selectedCountries.length > 0 ? selectedCountries.join(",") : null,
      },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this log?")) {
      deleteNotification({ variables: { id } });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Completed
          </Badge>
        );
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canCreate = user?.permissions?.includes(
    permissions.PUSH_NOTIFICATION_CREATE
  );
  const canUpdate = user?.permissions?.includes(
    permissions.PUSH_NOTIFICATION_UPDATE
  );
  const canDelete = user?.permissions?.includes(
    permissions.PUSH_NOTIFICATION_DELETE
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Push Notifications</h1>
          <p className="text-muted-foreground">
            Manage and schedule push notifications for your mobile app users.
            {totalCount > 0 && (
              <span className="ml-2 text-foreground font-medium">
                ({totalCount.toLocaleString()} total)
              </span>
            )}
          </p>
        </div>
        {canCreate && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule Push Notification</DialogTitle>
                <DialogDescription>
                  Create a new notification to send to your app users.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Flash Sale!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Message Body</Label>
                  <Textarea
                    id="body"
                    placeholder="e.g. Get 50% off on all items..."
                    className="resize-none h-24"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                  {errors.body && (
                    <p className="text-sm text-red-500">{errors.body}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Scheduled Time</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={scheduledAt}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                  {errors.scheduledAt && (
                    <p className="text-sm text-red-500">{errors.scheduledAt}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Target Audience</Label>

                  {/* Selected badges */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedCountries.length === 0 ? (
                      <Badge variant="default" className="cursor-default">
                        🌍 All Users
                      </Badge>
                    ) : (
                      <>
                        {selectedCountries.map((code) => (
                          <Badge
                            key={code}
                            variant="secondary"
                            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() =>
                              setSelectedCountries((prev) =>
                                prev.filter((c) => c !== code)
                              )
                            }
                          >
                            {getCountryName(code)} ×
                          </Badge>
                        ))}
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => setSelectedCountries([])}
                        >
                          Clear → All Users
                        </Badge>
                      </>
                    )}
                  </div>

                  {/* Search input */}
                  <Input
                    placeholder="Search countries to add..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="mb-2"
                  />

                  {/* Country list - only show when searching */}
                  {countrySearch.trim() && (
                    <div className="max-h-32 overflow-y-auto border rounded-md">
                      {searchCountries(countrySearch)
                        .filter((c) => !selectedCountries.includes(c.code))
                        .slice(0, 20)
                        .map((country) => (
                          <div
                            key={country.code}
                            className="px-3 py-1.5 hover:bg-muted cursor-pointer text-sm flex justify-between items-center"
                            onClick={() => {
                              setSelectedCountries((prev) => [
                                ...prev,
                                country.code,
                              ]);
                              setCountrySearch("");
                            }}
                          >
                            <span>{country.name}</span>
                            <span className="text-muted-foreground text-xs">
                              {country.code}
                            </span>
                          </div>
                        ))}
                      {searchCountries(countrySearch).filter(
                        (c) => !selectedCountries.includes(c.code)
                      ).length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No countries found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={scheduling}>
                    {scheduling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Schedule
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search title or body..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Error loading notifications: {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Notifications Table */}
      <Card>
        <CardContent className="pt-6">
          {loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No notifications found</p>
              <p className="text-sm">
                {search || statusFilter
                  ? "Try adjusting your filters"
                  : "Schedule your first push notification"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Message
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Scheduled For
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Sent/Failed
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Created By
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((notification: any) => (
                      <tr
                        key={notification.id}
                        className="border-b last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-3 px-4 font-medium">
                          {notification.title}
                        </td>
                        <td
                          className="py-3 px-4 max-w-xs truncate text-sm"
                          title={notification.body}
                        >
                          {notification.body}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {format(
                            new Date(notification.scheduled_at),
                            "MMM d, yyyy h:mm a"
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(notification.status)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {notification.status === "COMPLETED" ? (
                            <span>
                              {notification.sent_count} /{" "}
                              {notification.failed_count}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {notification.admin
                            ? `${notification.admin.first_name} ${notification.admin.last_name}`
                            : "System"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(notification.id)}
                                title="Delete Log"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {offset + 1} to{" "}
                    {Math.min(offset + PAGE_SIZE, totalCount)} of {totalCount}{" "}
                    notifications
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages || loading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
