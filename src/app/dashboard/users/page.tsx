"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  ShieldX,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { permissions } from "@/lib/permissions";

// GraphQL Query for fetching users with pagination
const GET_USERS = gql`
  query GetUsers($limit: Int, $offset: Int, $search: String) {
    getUsers(limit: $limit, offset: $offset, search: $search) {
      totalCount
      users {
        id
        name
        email
        profilePic
        fromSource
        location
        created_at
        updated_at
      }
    }
  }
`;

// User type matching backend AppUser
interface AppUser {
  id: string;
  name: string;
  email: string;
  profilePic: string | null;
  fromSource: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

interface GetUsersResponse {
  getUsers: {
    totalCount: number;
    users: AppUser[];
  };
}

const PAGE_SIZE = 10;

export default function UsersPage() {
  const { hasPermission, loading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Check if user has permission to view users
  const canViewUsers = hasPermission(permissions.USER_VIEW);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const offset = (currentPage - 1) * PAGE_SIZE;

  const { data, loading, error, refetch } = useQuery<GetUsersResponse>(
    GET_USERS,
    {
      variables: {
        limit: PAGE_SIZE,
        offset,
        search: debouncedSearch || undefined,
      },
      fetchPolicy: "cache-and-network",
      skip: !canViewUsers, // Skip query if no permission
    }
  );

  const totalCount = data?.getUsers?.totalCount || 0;
  const users = data?.getUsers?.users || [];
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  // Get platform display name
  const getPlatformLabel = (source: string | null): string => {
    if (!source) return "N/A";
    const sourceMap: Record<string, string> = {
      ios: "iOS",
      android: "Android",
      extension: "Extension",
      web: "Web",
    };
    return sourceMap[source.toLowerCase()] || source;
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading...</p>
      </div>
    );
  }

  // Show access denied if user doesn't have permission
  if (!canViewUsers) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Monitor and manage app users</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShieldX className="h-16 w-16 mb-4 text-destructive" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Access Denied
              </h2>
              <p className="text-center max-w-md">
                You do not have permission to view users. Please contact your
                administrator if you believe this is an error.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Monitor and manage app users
            {totalCount > 0 && (
              <span className="ml-2 text-foreground font-medium">
                ({totalCount.toLocaleString()} total)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
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
              Error loading users: {error.message}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          {loading && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm">
                {debouncedSearch
                  ? "Try adjusting your search query"
                  : "No users have registered yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        User
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Country
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Platform
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {user.profilePic ? (
                              <img
                                src={user.profilePic}
                                alt={user.name || "User"}
                                className="h-8 w-8 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  // Hide broken image and show fallback
                                  e.currentTarget.style.display = "none";
                                  e.currentTarget.nextElementSibling?.classList.remove(
                                    "hidden"
                                  );
                                }}
                              />
                            ) : null}
                            <div
                              className={`h-8 w-8 rounded-full bg-muted flex items-center justify-center ${user.profilePic ? "hidden" : ""}`}
                            >
                              <span className="text-xs font-medium text-muted-foreground">
                                {user.name?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>
                            <span className="font-medium">
                              {user.name || (
                                <span className="text-muted-foreground">
                                  N/A
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{user.email}</td>
                        <td className="py-3 px-4">
                          {user.location ? (
                            <Badge variant="outline">{user.location}</Badge>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">
                            {getPlatformLabel(user.fromSource)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {user.created_at
                            ? formatDateTime(user.created_at)
                            : "N/A"}
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
                    users
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
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
                      onClick={handleNextPage}
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
