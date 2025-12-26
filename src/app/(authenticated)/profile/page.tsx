"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Key,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

// Simple separator component
function Separator() {
  return <div className="border-t my-4" />;
}

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading user data...</p>
      </div>
    );
  }

  const formatDate = (dateValue: string | number | null | undefined) => {
    if (!dateValue) return "N/A";

    let date: Date;

    // Handle timestamp (number) or string
    if (typeof dateValue === "number") {
      // If it's a Unix timestamp in seconds, convert to milliseconds
      date = new Date(dateValue < 10000000000 ? dateValue * 1000 : dateValue);
    } else {
      date = new Date(dateValue);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPermission = (permission: string) => {
    return permission
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Group permissions by category
  const groupedPermissions = user.permissions.reduce(
    (acc: Record<string, string[]>, permission: string) => {
      const [category] = permission.split("_");
      const formattedCategory =
        category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
      if (!acc[formattedCategory]) {
        acc[formattedCategory] = [];
      }
      acc[formattedCategory].push(permission);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            View your account information and permissions
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your personal details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar and Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {user.first_name?.charAt(0)}
                  {user.last_name?.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {user.first_name} {user.last_name}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
              </div>
            </div>

            <Separator />

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Account Status</span>
              <Badge
                variant={user.is_active ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {user.is_active ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    Inactive
                  </>
                )}
              </Badge>
            </div>

            {/* Role */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Role</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {user.role?.name?.replace(/_/g, " ")}
                {user.role?.is_system_role && (
                  <span className="text-xs opacity-70">(System)</span>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Permissions
            </CardTitle>
            <CardDescription>
              What you can access and manage in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.permissions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No permissions assigned yet.
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(
                  ([category, permissions]) => (
                    <div key={category}>
                      <h4 className="font-medium text-sm mb-2 text-muted-foreground uppercase tracking-wide">
                        {category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(permissions as string[]).map((permission) => (
                          <Badge
                            key={permission}
                            variant="outline"
                            className="text-xs"
                          >
                            {formatPermission(permission)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>
            Technical information about your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                {user.id}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Role ID</p>
              <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                {user.role_id}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
