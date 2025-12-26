"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useLazyQuery, gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Plus,
  Search,
  Pin,
  PinOff,
  Trash2,
  Edit,
  Copy,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TOGGLE_COUPON_PIN = gql`
  mutation ToggleCouponPin($id: ID!, $isPinned: Boolean!) {
    toggleCouponPin(id: $id, isPinned: $isPinned) {
      id
      is_pinned
    }
  }
`;

const SEARCH_MERCHANTS = gql`
  query SearchMerchants($query: String!) {
    searchMerchants(query: $query) {
      id
      website_name
      website_domain
      s3_website_logo
    }
  }
`;

const UPDATE_COUPON = gql`
  mutation UpdateCoupon($id: ID!, $input: UpdateCouponInput!) {
    updateCoupon(id: $id, input: $input) {
      id
      code
      shop_name
      title
      expiry_date
      health_score
      ranking_weight
      is_pinned
      country_valid_in
    }
  }
`;

const DELETE_COUPON = gql`
  mutation DeleteCoupon($id: ID!) {
    deleteCoupon(id: $id) {
      success
      message
    }
  }
`;

const CREATE_COUPON = gql`
  mutation CreateCoupon($input: CreateCouponInput!) {
    createCoupon(input: $input) {
      id
      code
      shop_name
      title
      expiry_date
      is_pinned
      country_valid_in
    }
  }
`;

const GET_STAFF_COUPONS = gql`
  query GetStaffCoupons($limit: Int, $offset: Int, $search: String) {
    getStaffCoupons(limit: $limit, offset: $offset, search: $search) {
      totalCount
      coupons {
        id
        code
        shop_name
        title
        expiry_date
        website_id
        Website {
          id
          website_name
          website_domain
          s3_website_logo
        }
        country_valid_in
        health_score
        ranking_weight
        is_pinned
        created_at
        updated_at
        total_attempts
        success_attempts
        failed_attempts
        copied_attempts
      }
    }
  }
`;

const PAGE_SIZE = 10;

// Pin Button Component
function PinButton({
  couponId,
  isPinned,
  onToggle,
}: {
  couponId: string;
  isPinned: boolean;
  onToggle: () => void;
}) {
  const [togglePin, { loading }] = useMutation(TOGGLE_COUPON_PIN, {
    onCompleted: () => {
      onToggle();
    },
    onError: (error) => {
      console.error("Error toggling pin:", error);
    },
  });

  const handleToggle = () => {
    togglePin({
      variables: {
        id: couponId,
        isPinned: !isPinned,
      },
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
      title={isPinned ? "Unpin coupon" : "Pin coupon"}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPinned ? (
        <PinOff className="h-4 w-4 text-primary" />
      ) : (
        <Pin className="h-4 w-4" />
      )}
    </Button>
  );
}

// Coupon interface
interface CouponData {
  id: string;
  code: string;
  shop_name: string;
  title: string | null;
  expiry_date: string | null;
  website_id: number;
  is_pinned: boolean;
  health_score: number | null;
  ranking_weight: number | null;
  country_valid_in: string[] | null;
  total_attempts: number | null;
  success_attempts: number | null;
  failed_attempts: number | null;
  copied_attempts: number | null;
  Website: {
    id: string;
    website_name: string;
    website_domain: string | null;
    s3_website_logo: string | null;
  } | null;
}

export default function CouponsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Edit state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<CouponData | null>(null);
  const [editForm, setEditForm] = useState({
    code: "",
    shop_name: "",
    title: "",
    expiry_date: "",
    country_valid_in: "",
    website_id: "",
  });

  // Delete state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<CouponData | null>(null);

  // Create state
  const [createForm, setCreateForm] = useState({
    code: "",
    shop_name: "",
    title: "",
    expiry_date: "",
    country_valid_in: "",
    website_id: "",
  });

  // Merchant Search State
  const [merchantSearchQuery, setMerchantSearchQuery] = useState("");
  const [merchantResults, setMerchantResults] = useState<any[]>([]);
  const [showMerchantDropdown, setShowMerchantDropdown] = useState(false);

  // Debounce merchant search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (merchantSearchQuery.length >= 2) {
        searchMerchants({ variables: { query: merchantSearchQuery } });
      } else {
        setMerchantResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [merchantSearchQuery]);

  const [searchMerchants, { loading: isSearchingMerchants }] = useLazyQuery(
    SEARCH_MERCHANTS,
    {
      onCompleted: (data) => {
        setMerchantResults(data.searchMerchants || []);
        setShowMerchantDropdown(true);
      },
      fetchPolicy: "network-only",
    }
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, refetch } = useQuery(GET_STAFF_COUPONS, {
    variables: {
      limit: PAGE_SIZE,
      offset: (currentPage - 1) * PAGE_SIZE,
      search: debouncedSearch || undefined,
    },
    fetchPolicy: "cache-and-network",
  });

  const [updateCoupon, { loading: isUpdating }] = useMutation(UPDATE_COUPON, {
    onCompleted: () => {
      setIsEditOpen(false);
      setCouponToEdit(null);
      refetch();
    },
    onError: (error) => {
      console.error("Error updating coupon:", error);
    },
  });

  const [createCoupon, { loading: isCreating }] = useMutation(CREATE_COUPON, {
    onCompleted: () => {
      setIsCreateOpen(false);
      setCreateForm({
        code: "",
        shop_name: "",
        title: "",
        expiry_date: "",
        country_valid_in: "",
        website_id: "",
      });
      setMerchantSearchQuery("");
      setMerchantResults([]);
      refetch();
    },
    onError: (error) => {
      console.error("Error creating coupon:", error);
    },
  });

  const [deleteCoupon, { loading: isDeleting }] = useMutation(DELETE_COUPON, {
    onCompleted: () => {
      setIsDeleteOpen(false);
      setCouponToDelete(null);
      refetch();
    },
    onError: (error) => {
      console.error("Error deleting coupon:", error);
    },
  });

  const totalCount = data?.getStaffCoupons?.totalCount || 0;
  const coupons = data?.getStaffCoupons?.coupons || [];
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Check if coupon is expired
  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No expiry";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Copy coupon code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  // Handle create submit
  const handleCreateSubmit = () => {
    if (!createForm.code || !createForm.website_id) return;

    createCoupon({
      variables: {
        input: {
          code: createForm.code,
          shop_name: createForm.shop_name,
          title: createForm.title || null,
          expiry_date: createForm.expiry_date || null,
          website_id: parseInt(createForm.website_id),
          country_valid_in: createForm.country_valid_in
            ? createForm.country_valid_in
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean)
            : null,
          is_pinned: false,
        },
      },
    });
  };

  // Open edit dialog
  const handleEdit = (coupon: CouponData) => {
    setCouponToEdit(coupon);
    setEditForm({
      code: coupon.code,
      shop_name: coupon.shop_name,
      title: coupon.title || "",
      expiry_date: coupon.expiry_date
        ? new Date(coupon.expiry_date).toISOString().split("T")[0]
        : "",
      country_valid_in: coupon.country_valid_in?.join(", ") || "",
      website_id: coupon.website_id.toString(),
    });
    setIsEditOpen(true);
  };

  // Handle edit submit
  const handleEditSubmit = () => {
    if (!couponToEdit) return;

    updateCoupon({
      variables: {
        id: couponToEdit.id,
        input: {
          code: editForm.code,
          shop_name: editForm.shop_name,
          title: editForm.title || null,
          expiry_date: editForm.expiry_date || null,
          website_id: editForm.website_id
            ? parseInt(editForm.website_id)
            : parseInt(couponToEdit.website_id.toString()),
          country_valid_in: editForm.country_valid_in
            ? editForm.country_valid_in
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean)
            : null,
        },
      },
    });
  };

  // Open delete dialog
  const handleDelete = (coupon: CouponData) => {
    setCouponToDelete(coupon);
    setIsDeleteOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = () => {
    if (!couponToDelete) return;
    deleteCoupon({
      variables: {
        id: couponToDelete.id,
      },
    });
  };

  // Handle permission errors
  if (error) {
    const isForbidden = error.graphQLErrors?.some(
      (e) => e.extensions?.code === "FORBIDDEN"
    );
    if (isForbidden) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive">
              Access Denied
            </h2>
            <p className="text-muted-foreground mt-2">
              You don&apos;t have permission to view coupons.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">Error</h2>
          <p className="text-muted-foreground mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-muted-foreground">
            Manage coupon codes and offers
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Coupon</DialogTitle>
              <DialogDescription>
                Add a new coupon code for a merchant
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-code">Coupon Code *</Label>
                  <Input
                    id="create-code"
                    placeholder="e.g., SAVE20"
                    value={createForm.code}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, code: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="create-merchant">Merchant (Website) *</Label>
                  <Input
                    id="create-merchant"
                    placeholder="Search merchant..."
                    value={createForm.shop_name || merchantSearchQuery}
                    onChange={(e) => {
                      setMerchantSearchQuery(e.target.value);
                      if (
                        createForm.shop_name &&
                        e.target.value !== createForm.shop_name
                      ) {
                        setCreateForm({
                          ...createForm,
                          shop_name: "",
                          website_id: "",
                        });
                      }
                      setShowMerchantDropdown(true);
                    }}
                    onFocus={() => setShowMerchantDropdown(true)}
                  />
                  {showMerchantDropdown && merchantResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto">
                      {merchantResults.map((merchant: any) => (
                        <div
                          key={merchant.id}
                          className="flex items-center gap-3 p-2 hover:bg-accent cursor-pointer"
                          onClick={() => {
                            setCreateForm({
                              ...createForm,
                              shop_name: merchant.website_name,
                              website_id: merchant.id,
                            });
                            setMerchantSearchQuery("");
                            setShowMerchantDropdown(false);
                          }}
                        >
                          {merchant.s3_website_logo && (
                            <img
                              src={merchant.s3_website_logo}
                              alt={merchant.website_name}
                              className="h-6 w-6 object-contain rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {merchant.website_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {merchant.website_domain}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {isSearchingMerchants && (
                    <div className="absolute right-3 top-9">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-title">Title</Label>
                <Input
                  id="create-title"
                  placeholder="e.g., 20% Off Everything"
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, title: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-expiry">Expiry Date</Label>
                  <Input
                    id="create-expiry"
                    type="date"
                    value={createForm.expiry_date}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        expiry_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-countries">Countries</Label>
                  <Input
                    id="create-countries"
                    placeholder="AE, SA, KW (comma separated)"
                    value={createForm.country_valid_in}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        country_valid_in: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                * Note: Health Score and Rank Weight will be auto-calculated by
                the system.
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSubmit}
                disabled={
                  isCreating || !createForm.code || !createForm.shop_name
                }
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Coupon"
                )}
              </Button>
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
                placeholder="Search coupons by code, title, or shop..."
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

      {/* Coupons Table */}
      <Card>
        <CardContent className="pt-6">
          {loading && coupons.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No coupons found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1350px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Code
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Merchant
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Country
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Expiry
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                        Pinned
                      </th>
                      <th
                        className="text-center py-3 px-4 font-medium text-muted-foreground"
                        title="Total / Success / Failed / Copied"
                      >
                        Attempts
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        Health
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        Weight
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon: CouponData) => (
                      <tr
                        key={coupon.id}
                        className="border-b last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                              {coupon.code}
                            </code>
                            <button
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => copyToClipboard(coupon.code)}
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-[300px]">
                          <span
                            className="block truncate"
                            title={coupon.title || "N/A"}
                          >
                            {coupon.title || "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {coupon.Website?.s3_website_logo && (
                              <img
                                src={coupon.Website.s3_website_logo}
                                alt={coupon.Website.website_name}
                                className="h-6 w-6 rounded object-contain"
                              />
                            )}
                            <span>
                              {coupon.Website?.website_name || coupon.shop_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex flex-nowrap gap-1">
                            {coupon.country_valid_in &&
                            coupon.country_valid_in.length > 0 ? (
                              coupon.country_valid_in
                                .slice(0, 3)
                                .map((country: string) => (
                                  <Badge
                                    key={country}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {country}
                                  </Badge>
                                ))
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                All
                              </span>
                            )}
                            {coupon.country_valid_in &&
                              coupon.country_valid_in.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{coupon.country_valid_in.length - 3}
                                </Badge>
                              )}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {formatDate(coupon.expiry_date)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge
                            className={
                              isExpired(coupon.expiry_date)
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {isExpired(coupon.expiry_date)
                              ? "EXPIRED"
                              : "ACTIVE"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {coupon.is_pinned ? (
                            <Pin className="h-5 w-5 text-primary mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1 text-xs">
                            <span
                              title="Total Attempts"
                              className="font-medium"
                            >
                              {coupon.total_attempts || 0}
                            </span>
                            <span className="text-muted-foreground">/</span>
                            <span title="Success" className="text-green-600">
                              {coupon.success_attempts || 0}
                            </span>
                            <span className="text-muted-foreground">/</span>
                            <span title="Failed" className="text-red-600">
                              {coupon.failed_attempts || 0}
                            </span>
                            <span className="text-muted-foreground">/</span>
                            <span title="Copied" className="text-blue-600">
                              {coupon.copied_attempts || 0}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span className="text-sm">
                            {coupon.health_score?.toFixed(1) || "0"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span className="text-sm">
                            {coupon.ranking_weight || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <PinButton
                              couponId={coupon.id}
                              isPinned={coupon.is_pinned}
                              onToggle={refetch}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(coupon)}
                              title="Edit coupon"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDelete(coupon)}
                              title="Delete coupon"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
                  {Math.min(currentPage * PAGE_SIZE, totalCount)} of{" "}
                  {totalCount} coupons
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {/* Edit Coupon Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>
              Update the coupon details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-code" className="text-right">
                Code
              </Label>
              <Input
                id="edit-code"
                value={editForm.code}
                onChange={(e) =>
                  setEditForm({ ...editForm, code: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4 relative">
              <Label htmlFor="edit-merchant" className="text-right">
                Merchant
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="edit-merchant"
                  placeholder="Search merchant..."
                  value={editForm.shop_name || merchantSearchQuery}
                  onChange={(e) => {
                    setMerchantSearchQuery(e.target.value);
                    if (
                      editForm.shop_name &&
                      e.target.value !== editForm.shop_name
                    ) {
                      setEditForm({
                        ...editForm,
                        shop_name: "",
                        website_id: "",
                      });
                    }
                    setShowMerchantDropdown(true);
                  }}
                  onFocus={() => setShowMerchantDropdown(true)}
                />
                {showMerchantDropdown && merchantResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto left-0 top-10">
                    {merchantResults.map((merchant: any) => (
                      <div
                        key={merchant.id}
                        className="flex items-center gap-3 p-2 hover:bg-accent cursor-pointer"
                        onClick={() => {
                          setEditForm({
                            ...editForm,
                            shop_name: merchant.website_name,
                            website_id: merchant.id,
                          });
                          setMerchantSearchQuery("");
                          setShowMerchantDropdown(false);
                        }}
                      >
                        {merchant.s3_website_logo && (
                          <img
                            src={merchant.s3_website_logo}
                            alt={merchant.website_name}
                            className="h-6 w-6 object-contain rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {merchant.website_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {merchant.website_domain}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {isSearchingMerchants && (
                  <div className="absolute right-3 top-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title
              </Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-expiry" className="text-right">
                Expiry Date
              </Label>
              <Input
                id="edit-expiry"
                type="date"
                value={editForm.expiry_date}
                onChange={(e) =>
                  setEditForm({ ...editForm, expiry_date: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-countries" className="text-right">
                Countries
              </Label>
              <Input
                id="edit-countries"
                value={editForm.country_valid_in}
                onChange={(e) =>
                  setEditForm({ ...editForm, country_valid_in: e.target.value })
                }
                placeholder="AE, SA, KW (comma separated)"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
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

      {/* Delete Coupon Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this coupon? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {couponToDelete && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-mono text-sm">
                <strong>Code:</strong> {couponToDelete.code}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {couponToDelete.title || "No title"}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
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
                "Delete Coupon"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
