"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldX,
  Users,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { permissions } from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";

// GraphQL Query for fetching staff users with pagination
const GET_STAFF_USERS = gql`
  query GetStaffUsers($limit: Int, $offset: Int, $search: String) {
    getStaffUsers(limit: $limit, offset: $offset, search: $search) {
      totalCount
      staffUsers {
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

// Query for fetching all available permissions
const GET_PERMISSIONS = gql`
  query GetPermissions {
    getPermissions {
      key
      label
      category
    }
  }
`;

// Mutation for creating staff user
const CREATE_STAFF_USER = gql`
  mutation CreateStaffUser($input: CreateStaffUserInput!) {
    createStaffUser(input: $input) {
      id
      email
      first_name
      last_name
      is_active
      role {
        id
        name
      }
      permissions
    }
  }
`;

// Mutation for deleting staff user
const DELETE_STAFF_USER = gql`
  mutation DeleteStaffUser($id: ID!) {
    deleteStaffUser(id: $id) {
      success
      message
    }
  }
`;

// Mutation for updating staff user
const UPDATE_STAFF_USER = gql`
  mutation UpdateStaffUser($id: ID!, $input: UpdateStaffUserInput!) {
    updateStaffUser(id: $id, input: $input) {
      id
      email
      first_name
      last_name
      is_active
      role {
        id
        name
        is_system_role
      }
      permissions
    }
  }
`;

// Types
interface StaffUserRole {
  id: string;
  name: string;
  is_system_role: boolean;
}

interface StaffUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  role_id: string;
  role: StaffUserRole;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

interface Permission {
  key: string;
  label: string;
  category: string;
}

interface GetStaffUsersResponse {
  getStaffUsers: {
    totalCount: number;
    staffUsers: StaffUser[];
  };
}

interface GetPermissionsResponse {
  getPermissions: Permission[];
}

const PAGE_SIZE = 10;

// Helper to check if a staff user is a super admin (protected from edit/delete)
const isSuperAdmin = (staff: StaffUser): boolean => {
  return (
    staff.role?.name === "super_admin" || staff.role?.is_system_role === true
  );
};

// Generate a color based on permission count (for visual variety)
const getPermissionCountColor = (count: number): string => {
  if (count >= 15) return "bg-purple-100 text-purple-800";
  if (count >= 10) return "bg-blue-100 text-blue-800";
  if (count >= 5) return "bg-green-100 text-green-800";
  return "bg-gray-100 text-gray-800";
};

// Group permissions by category
const groupPermissionsByCategory = (
  perms: Permission[]
): Record<string, Permission[]> => {
  return perms.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>
  );
};

export default function StaffPage() {
  const { user, hasPermission, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state for create dialog
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roleName: "",
    selectedPermissions: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<StaffUser | null>(null);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    isActive: true,
    selectedPermissions: [] as string[],
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Check permissions
  const canViewStaff = hasPermission(permissions.STAFF_VIEW);
  const canCreateStaff = hasPermission(permissions.STAFF_CREATE);
  const canUpdateStaff = hasPermission(permissions.STAFF_UPDATE);
  const canDeleteStaff = hasPermission(permissions.STAFF_DELETE);
  const hasAnyActionPermission = canUpdateStaff || canDeleteStaff;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const offset = (currentPage - 1) * PAGE_SIZE;

  // Fetch staff users
  const { data, loading, error, refetch } = useQuery<GetStaffUsersResponse>(
    GET_STAFF_USERS,
    {
      variables: {
        limit: PAGE_SIZE,
        offset,
        search: debouncedSearch || undefined,
      },
      fetchPolicy: "network-only", // Don't use cached data to avoid showing stale data on permission errors
      skip: !canViewStaff,
    }
  );

  // Fetch permissions for checkboxes
  const { data: permissionsData, error: permissionsError } =
    useQuery<GetPermissionsResponse>(GET_PERMISSIONS, {
      skip: !canViewStaff,
      fetchPolicy: "network-only", // Don't use cached data on permission errors
    });

  // Create staff user mutation
  const [createStaffUser] = useMutation(CREATE_STAFF_USER, {
    onCompleted: () => {
      toast({
        title: "Staff user created",
        description: "The staff user has been created successfully.",
      });
      setIsCreateOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete staff user mutation
  const [deleteStaffUser] = useMutation(DELETE_STAFF_USER, {
    onCompleted: () => {
      toast({
        title: "Staff user deleted",
        description: "The staff user has been deleted successfully.",
      });
      setDeleteConfirmOpen(false);
      setStaffToDelete(null);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update staff user mutation
  const [updateStaffUser] = useMutation(UPDATE_STAFF_USER, {
    onCompleted: () => {
      toast({
        title: "Staff user updated",
        description: "The staff user has been updated successfully.",
      });
      setIsEditOpen(false);
      setStaffToEdit(null);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const totalCount = data?.getStaffUsers?.totalCount || 0;
  const staffUsers = data?.getStaffUsers?.staffUsers || [];
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const allPermissions = permissionsData?.getPermissions || [];
  const groupedPermissions = groupPermissionsByCategory(allPermissions);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      roleName: "",
      selectedPermissions: [],
    });
  };

  const handlePermissionToggle = (permissionKey: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permissionKey)
        ? prev.selectedPermissions.filter((p) => p !== permissionKey)
        : [...prev.selectedPermissions, permissionKey],
    }));
  };

  const handleSelectAllInCategory = (category: string, perms: Permission[]) => {
    const categoryKeys = perms.map((p) => p.key);
    const allSelected = categoryKeys.every((k) =>
      formData.selectedPermissions.includes(k)
    );

    if (allSelected) {
      // Deselect all in category
      setFormData((prev) => ({
        ...prev,
        selectedPermissions: prev.selectedPermissions.filter(
          (p) => !categoryKeys.includes(p)
        ),
      }));
    } else {
      // Select all in category
      setFormData((prev) => ({
        ...prev,
        selectedPermissions: [
          ...new Set([...prev.selectedPermissions, ...categoryKeys]),
        ],
      }));
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.roleName
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.selectedPermissions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one permission for this user.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createStaffUser({
        variables: {
          input: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            password: formData.password,
            role_name: formData.roleName,
            permissions: formData.selectedPermissions,
          },
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (staff: StaffUser) => {
    // Double-check super admin protection on client side
    if (isSuperAdmin(staff)) {
      toast({
        title: "Action Not Allowed",
        description: "Super admin accounts cannot be deleted.",
        variant: "destructive",
      });
      return;
    }
    setStaffToDelete(staff);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!staffToDelete) return;

    setIsDeleting(true);
    try {
      await deleteStaffUser({
        variables: { id: staffToDelete.id },
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (staff: StaffUser) => {
    // Double-check super admin protection on client side
    if (isSuperAdmin(staff)) {
      toast({
        title: "Action Not Allowed",
        description: "Super admin accounts cannot be edited.",
        variant: "destructive",
      });
      return;
    }
    setStaffToEdit(staff);
    setEditFormData({
      firstName: staff.first_name || "",
      lastName: staff.last_name || "",
      email: staff.email || "",
      password: "", // Don't pre-fill password
      isActive: staff.is_active,
      selectedPermissions: staff.permissions || [],
    });
    setIsEditOpen(true);
  };

  const handleEditPermissionToggle = (permissionKey: string) => {
    setEditFormData((prev) => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permissionKey)
        ? prev.selectedPermissions.filter((p) => p !== permissionKey)
        : [...prev.selectedPermissions, permissionKey],
    }));
  };

  const handleEditSelectAllInCategory = (
    category: string,
    perms: Permission[]
  ) => {
    const categoryKeys = perms.map((p) => p.key);
    const allSelected = categoryKeys.every((k) =>
      editFormData.selectedPermissions.includes(k)
    );

    if (allSelected) {
      setEditFormData((prev) => ({
        ...prev,
        selectedPermissions: prev.selectedPermissions.filter(
          (p) => !categoryKeys.includes(p)
        ),
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        selectedPermissions: [
          ...new Set([...prev.selectedPermissions, ...categoryKeys]),
        ],
      }));
    }
  };

  const handleEditSubmit = async () => {
    if (!staffToEdit) return;

    if (
      !editFormData.firstName ||
      !editFormData.lastName ||
      !editFormData.email
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editFormData.selectedPermissions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one permission for this user.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      // Build input, only include password if provided
      const input: {
        first_name: string;
        last_name: string;
        email: string;
        is_active: boolean;
        permissions: string[];
        password?: string;
      } = {
        first_name: editFormData.firstName,
        last_name: editFormData.lastName,
        email: editFormData.email,
        is_active: editFormData.isActive,
        permissions: editFormData.selectedPermissions,
      };

      if (editFormData.password) {
        input.password = editFormData.password;
      }

      await updateStaffUser({
        variables: {
          id: staffToEdit.id,
          input,
        },
      });
    } finally {
      setIsUpdating(false);
    }
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
  if (!canViewStaff) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Staff Users</h1>
          <p className="text-muted-foreground">Manage staff users and roles</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShieldX className="h-16 w-16 mb-4 text-destructive" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Access Denied
              </h2>
              <p className="text-center max-w-md">
                You do not have permission to view staff users. Please contact
                your administrator if you believe this is an error.
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
          <h1 className="text-3xl font-bold">Staff Users</h1>
          <p className="text-muted-foreground">
            Manage staff users and their permissions
            {totalCount > 0 && (
              <span className="ml-2 text-foreground font-medium">
                ({totalCount.toLocaleString()} total)
              </span>
            )}
          </p>
        </div>
        {canCreateStaff && (
          <Dialog
            open={isCreateOpen}
            onOpenChange={(open) => {
              setIsCreateOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Staff User</DialogTitle>
                <DialogDescription>
                  Add a new staff user with specific permissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@shappy.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="roleName">Role Name *</Label>
                  <Input
                    id="roleName"
                    placeholder="e.g., Marketing Manager, Content Editor"
                    value={formData.roleName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        roleName: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    A descriptive name for this user&apos;s role
                  </p>
                </div>

                {/* Permissions Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-base font-semibold">
                      Permissions *
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {formData.selectedPermissions.length} selected
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select the permissions for this staff user.
                  </p>
                  <div className="space-y-4 border rounded-lg p-4 max-h-72 overflow-y-auto">
                    {Object.entries(groupedPermissions).map(
                      ([category, perms]) => {
                        const categoryKeys = perms.map((p) => p.key);
                        const allSelected = categoryKeys.every((k) =>
                          formData.selectedPermissions.includes(k)
                        );
                        const someSelected = categoryKeys.some((k) =>
                          formData.selectedPermissions.includes(k)
                        );

                        return (
                          <div key={category}>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">
                                {category}
                              </h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() =>
                                  handleSelectAllInCategory(category, perms)
                                }
                              >
                                {allSelected ? "Deselect All" : "Select All"}
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {perms.map((perm) => (
                                <div
                                  key={perm.key}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={perm.key}
                                    checked={formData.selectedPermissions.includes(
                                      perm.key
                                    )}
                                    onCheckedChange={() =>
                                      handlePermissionToggle(perm.key)
                                    }
                                  />
                                  <label
                                    htmlFor={perm.key}
                                    className="text-sm cursor-pointer"
                                  >
                                    {perm.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Staff User"
                  )}
                </Button>
              </DialogFooter>
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
                placeholder="Search staff by name or email..."
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

      {/* Error State - Check for permission errors specifically */}
      {(error || permissionsError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            {error?.message?.includes("Insufficient permissions") ||
            permissionsError?.message?.includes("Insufficient permissions") ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ShieldX className="h-16 w-16 mb-4 text-destructive" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Access Denied
                </h2>
                <p className="text-center max-w-md">
                  You do not have permission to access this resource. Please
                  contact your administrator to request the necessary
                  permissions.
                </p>
              </div>
            ) : (
              <>
                <p className="text-destructive">
                  Error loading staff users:{" "}
                  {error?.message || permissionsError?.message}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Staff Users Table - Only show when there are no errors */}
      {!error && !permissionsError && (
        <Card>
          <CardContent className="pt-6">
            {loading && staffUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Loading staff users...</p>
              </div>
            ) : staffUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">No staff users found</p>
                <p className="text-sm">
                  {debouncedSearch
                    ? "Try adjusting your search query"
                    : "No staff users have been created yet"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Staff User
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Role
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Created
                        </th>
                        {hasAnyActionPermission && (
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {staffUsers.map((staff) => (
                        <tr
                          key={staff.id}
                          className="border-b last:border-0 hover:bg-muted/50"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                {staff.first_name?.[0] || ""}
                                {staff.last_name?.[0] || ""}
                              </div>
                              <span className="font-medium">
                                {staff.first_name} {staff.last_name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">{staff.email}</td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {staff.role?.name || "No Role"}
                                </span>
                                {isSuperAdmin(staff) && (
                                  <Badge className="bg-amber-100 text-amber-800 text-xs">
                                    Protected
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {staff.permissions?.length || 0} permissions
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                staff.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {staff.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {staff.created_at
                              ? formatDateTime(staff.created_at)
                              : "N/A"}
                          </td>
                          {hasAnyActionPermission && (
                            <td className="py-3 px-4 text-right">
                              <div
                                className={`flex items-center justify-end gap-2 ${
                                  staff.id === user?.id || isSuperAdmin(staff)
                                    ? "opacity-50 grayscale pointer-events-none"
                                    : ""
                                }`}
                              >
                                {canUpdateStaff && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={
                                      staff.id === user?.id ||
                                      isSuperAdmin(staff)
                                    }
                                    title={
                                      isSuperAdmin(staff)
                                        ? "Super admin accounts cannot be edited"
                                        : undefined
                                    }
                                    onClick={() => handleEditClick(staff)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                {canDeleteStaff && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={
                                      staff.id === user?.id ||
                                      isSuperAdmin(staff)
                                    }
                                    title={
                                      isSuperAdmin(staff)
                                        ? "Super admin accounts cannot be deleted"
                                        : undefined
                                    }
                                    onClick={() => handleDeleteClick(staff)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          )}
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
                      staff users
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
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staff User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {staffToDelete?.first_name} {staffToDelete?.last_name}
              </strong>
              ? This action cannot be undone and will also delete their
              associated role and permissions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setStaffToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff User Modal */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setStaffToEdit(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff User</DialogTitle>
            <DialogDescription>
              Update details for{" "}
              <strong>
                {staffToEdit?.first_name} {staffToEdit?.last_name}
              </strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFirstName">First Name *</Label>
                <Input
                  id="editFirstName"
                  placeholder="John"
                  value={editFormData.firstName}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="editLastName">Last Name *</Label>
                <Input
                  id="editLastName"
                  placeholder="Doe"
                  value={editFormData.lastName}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editEmail">Email *</Label>
              <Input
                id="editEmail"
                type="email"
                placeholder="staff@shappy.com"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="editPassword">
                New Password{" "}
                <span className="text-muted-foreground">
                  (leave blank to keep current)
                </span>
              </Label>
              <Input
                id="editPassword"
                type="password"
                placeholder="••••••••"
                value={editFormData.password}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />
            </div>

            {/* Active/Inactive Toggle */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="editIsActive"
                checked={editFormData.isActive}
                onCheckedChange={(checked) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    isActive: checked === true,
                  }))
                }
              />
              <label
                htmlFor="editIsActive"
                className="text-sm font-medium cursor-pointer"
              >
                Account Active
              </label>
              <Badge
                className={
                  editFormData.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {editFormData.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            {/* Permissions Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-semibold">Permissions *</Label>
                <span className="text-sm text-muted-foreground">
                  {editFormData.selectedPermissions.length} selected
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Update permissions for this staff user.
              </p>
              <div className="space-y-4 border rounded-lg p-4 max-h-72 overflow-y-auto">
                {Object.entries(groupedPermissions).map(([category, perms]) => {
                  const categoryKeys = perms.map((p) => p.key);
                  const allSelected = categoryKeys.every((k) =>
                    editFormData.selectedPermissions.includes(k)
                  );

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{category}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() =>
                            handleEditSelectAllInCategory(category, perms)
                          }
                        >
                          {allSelected ? "Deselect All" : "Select All"}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {perms.map((perm) => (
                          <div
                            key={perm.key}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`edit-${perm.key}`}
                              checked={editFormData.selectedPermissions.includes(
                                perm.key
                              )}
                              onCheckedChange={() =>
                                handleEditPermissionToggle(perm.key)
                              }
                            />
                            <label
                              htmlFor={`edit-${perm.key}`}
                              className="text-sm cursor-pointer"
                            >
                              {perm.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false);
                setStaffToEdit(null);
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
