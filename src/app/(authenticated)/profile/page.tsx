"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { gql, useMutation } from "@apollo/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Key,
  ArrowLeft,
  Pencil,
  Lock,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// Simple separator component
function Separator() {
  return <div className="border-t my-4" />;
}

const UPDATE_MY_PROFILE = gql`
  mutation UpdateMyProfile($input: UpdateMyProfileInput!) {
    updateMyProfile(input: $input) {
      success
      message
      staffUser {
        id
        email
        first_name
        last_name
        is_active
        role_id
        role {
          id
          name
          is_system_role
        }
        permissions
        created_at
        updated_at
      }
    }
  }
`;

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [updateMyProfile, { loading: updating }] =
    useMutation(UPDATE_MY_PROFILE);

  // Edit Profile Dialog State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Change Password Dialog State
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading user data...</p>
      </div>
    );
  }

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

  // Initialize edit form when dialog opens
  const handleEditDialogOpen = (open: boolean) => {
    if (open) {
      setEditForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
      setEditError("");
      setEditSuccess("");
    }
    setIsEditDialogOpen(open);
  };

  // Initialize password form when dialog opens
  const handlePasswordDialogOpen = (open: boolean) => {
    if (open) {
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setPasswordError("");
      setPasswordSuccess("");
    }
    setIsPasswordDialogOpen(open);
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");

    // Validate
    if (!editForm.first_name.trim()) {
      setEditError("First name is required");
      return;
    }
    if (!editForm.last_name.trim()) {
      setEditError("Last name is required");
      return;
    }
    if (!editForm.email.trim()) {
      setEditError("Email is required");
      return;
    }

    try {
      const result = await updateMyProfile({
        variables: {
          input: {
            first_name: editForm.first_name.trim(),
            last_name: editForm.last_name.trim(),
            email: editForm.email.trim(),
          },
        },
      });

      if (result.data?.updateMyProfile?.success) {
        // Check if email was changed - requires logout
        const emailChanged =
          editForm.email.trim().toLowerCase() !== user?.email?.toLowerCase();

        if (emailChanged) {
          setEditSuccess("Profile updated! Logging out for security...");
          setTimeout(() => {
            logout();
          }, 1500);
        } else {
          setEditSuccess("Profile updated successfully!");
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        setEditError(
          result.data?.updateMyProfile?.message || "Failed to update profile"
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setEditError(errorMessage || "Failed to update profile");
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validate
    if (!passwordForm.current_password) {
      setPasswordError("Current password is required");
      return;
    }
    if (!passwordForm.new_password) {
      setPasswordError("New password is required");
      return;
    }
    if (passwordForm.new_password.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      const result = await updateMyProfile({
        variables: {
          input: {
            current_password: passwordForm.current_password,
            new_password: passwordForm.new_password,
          },
        },
      });

      if (result.data?.updateMyProfile?.success) {
        setPasswordSuccess("Password changed! Logging out for security...");
        // Logout after password change for security
        setTimeout(() => {
          logout();
        }, 1500);
      } else {
        setPasswordError(
          result.data?.updateMyProfile?.message || "Failed to change password"
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setPasswordError(errorMessage || "Failed to change password");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">
              View and manage your account information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Edit Profile Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Update your personal information
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleProfileUpdate}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={editForm.first_name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, first_name: e.target.value })
                      }
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={editForm.last_name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, last_name: e.target.value })
                      }
                      placeholder="Enter last name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      placeholder="Enter email"
                    />
                  </div>
                  {editError && (
                    <p className="text-sm text-destructive">{editError}</p>
                  )}
                  {editSuccess && (
                    <p className="text-sm text-green-600">{editSuccess}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updating}>
                    {updating && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Change Password Dialog */}
          <Dialog
            open={isPasswordDialogOpen}
            onOpenChange={handlePasswordDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Lock className="h-4 w-4" />
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your current password and choose a new one
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePasswordChange}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          current_password: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          new_password: e.target.value,
                        })
                      }
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm_password">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirm_password: e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                    />
                  </div>
                  {passwordError && (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}
                  {passwordSuccess && (
                    <p className="text-sm text-green-600">{passwordSuccess}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPasswordDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updating}>
                    {updating && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Change Password
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
