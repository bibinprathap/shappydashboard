"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Image,
  Eye,
  RefreshCw,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Upload,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback, useEffect, useRef } from "react";
import { gql, useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { useAuth } from "@/contexts/auth-context";
import { permissions } from "@/lib/permissions";

// GraphQL Queries
const GET_BANNERS = gql`
  query GetBanners(
    $limit: Int
    $offset: Int
    $search: String
    $status: String
  ) {
    getBanners(
      limit: $limit
      offset: $offset
      search: $search
      status: $status
    ) {
      totalCount
      banners {
        id
        website_id
        headline
        details
        image
        expiry_date
        priority
        cashback_percentage
        cashback_text
        link
        coupon_id
        created_at
        updated_at
        Website {
          id
          website_name
          website_domain
          s3_website_logo
        }
      }
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

const SEARCH_COUPONS = gql`
  query SearchCoupons($query: String!) {
    searchCoupons(query: $query) {
      id
      code
      title
      shop_name
    }
  }
`;

const UPLOAD_FILE = gql`
  mutation UploadFile($file: Upload!, $folder: String) {
    uploadFile(file: $file, folder: $folder) {
      success
      url
      key
    }
  }
`;

const CREATE_BANNER = gql`
  mutation CreateBanner($input: CreateBannerInput!) {
    createBanner(input: $input) {
      id
      headline
      details
      image
      link
      priority
      cashback_percentage
      expiry_date
    }
  }
`;

const UPDATE_BANNER = gql`
  mutation UpdateBanner($id: ID!, $input: UpdateBannerInput!) {
    updateBanner(id: $id, input: $input) {
      id
      headline
      details
      image
      link
      priority
      cashback_percentage
      expiry_date
    }
  }
`;

const DELETE_BANNER = gql`
  mutation DeleteBanner($id: ID!) {
    deleteBanner(id: $id) {
      success
      message
    }
  }
`;

interface BannerData {
  id: string;
  website_id: number;
  headline: string;
  details: string;
  image: string;
  expiry_date: string | null;
  priority: number;
  cashback_percentage: string;
  cashback_text: string | null;
  link: string;
  coupon_id: number | null;
  created_at: string | null;
  updated_at: string | null;
  Website: {
    id: string;
    website_name: string;
    website_domain: string | null;
    s3_website_logo: string | null;
  } | null;
}

interface MerchantData {
  id: string;
  website_name: string;
  website_domain: string | null;
  s3_website_logo: string | null;
}

interface CouponData {
  id: string;
  code: string;
  title: string | null;
  shop_name: string;
}

interface BannerFormData {
  website_id: string;
  website_name: string;
  headline: string;
  details: string;
  image: string;
  link: string;
  expiry_date: string;
  priority: string;
  cashback_percentage: string;
  cashback_text: string;
  coupon_id: string;
  coupon_code: string;
}

const emptyForm: BannerFormData = {
  website_id: "",
  website_name: "",
  headline: "",
  details: "",
  image: "",
  link: "",
  expiry_date: "",
  priority: "1",
  cashback_percentage: "",
  cashback_text: "",
  coupon_id: "",
  coupon_code: "",
};

export default function BannersPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const { hasPermission } = useAuth();

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(emptyForm);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Search states
  const [merchantQuery, setMerchantQuery] = useState("");
  const [merchantResults, setMerchantResults] = useState<MerchantData[]>([]);
  const [showMerchantDropdown, setShowMerchantDropdown] = useState(false);

  const [couponQuery, setCouponQuery] = useState("");
  const [couponResults, setCouponResults] = useState<CouponData[]>([]);
  const [showCouponDropdown, setShowCouponDropdown] = useState(false);

  // Image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Queries
  const { data, loading, error, refetch, networkStatus } = useQuery(
    GET_BANNERS,
    {
      variables: {
        limit: pageSize,
        offset: currentPage * pageSize,
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      },
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
    }
  );

  // NetworkStatus.refetch === 4, so we show loading for both initial load and refetch
  const isRefetching = networkStatus === 4;

  const [searchMerchants, { loading: searchingMerchants }] = useLazyQuery(
    SEARCH_MERCHANTS,
    {
      onCompleted: (data) => {
        setMerchantResults(data.searchMerchants || []);
        setShowMerchantDropdown(true);
      },
      fetchPolicy: "network-only",
    }
  );

  const [searchCoupons, { loading: searchingCoupons }] = useLazyQuery(
    SEARCH_COUPONS,
    {
      onCompleted: (data) => {
        setCouponResults(data.searchCoupons || []);
        setShowCouponDropdown(true);
      },
      fetchPolicy: "network-only",
    }
  );

  // Mutations
  const { toast } = useToast();
  const [uploadFile] = useMutation(UPLOAD_FILE);

  const [createBanner, { loading: creating }] = useMutation(CREATE_BANNER, {
    onCompleted: () => {
      setIsFormOpen(false);
      setFormData(emptyForm);
      refetch();
      toast({
        title: "Success",
        description: "Banner created successfully",
      });
    },
    onError: (err) => {
      console.error("Create error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to create banner",
        variant: "destructive",
      });
    },
  });

  const [updateBanner, { loading: updating }] = useMutation(UPDATE_BANNER, {
    onCompleted: () => {
      setIsFormOpen(false);
      setFormData(emptyForm);
      setIsEditing(false);
      setEditingBannerId(null);
      refetch();
      toast({
        title: "Success",
        description: "Banner updated successfully",
      });
    },
    onError: (err) => {
      console.error("Update error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update banner",
        variant: "destructive",
      });
    },
  });

  const [deleteBanner, { loading: deleting }] = useMutation(DELETE_BANNER, {
    onCompleted: () => {
      setDeleteId(null);
      refetch();
      toast({
        title: "Success",
        description: "Banner deleted successfully",
      });
    },
    onError: (err) => {
      console.error("Delete error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete banner",
        variant: "destructive",
      });
    },
  });

  // Debounced merchant search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (merchantQuery.length >= 2) {
        searchMerchants({ variables: { query: merchantQuery } });
      } else {
        setMerchantResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [merchantQuery, searchMerchants]);

  // Debounced coupon search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (couponQuery.length >= 2) {
        searchCoupons({ variables: { query: couponQuery } });
      } else {
        setCouponResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [couponQuery, searchCoupons]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(0);
  }, []);

  const handleStatusFilter = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(0);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleOpenCreate = () => {
    setFormData(emptyForm);
    setIsEditing(false);
    setEditingBannerId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (banner: BannerData) => {
    setFormData({
      website_id: banner.website_id?.toString() || "",
      website_name: banner.Website?.website_name || "",
      headline: banner.headline || "",
      details: banner.details || "",
      image: banner.image || "",
      link: banner.link || "",
      expiry_date: banner.expiry_date
        ? new Date(banner.expiry_date).toISOString().split("T")[0]
        : "",
      priority: banner.priority?.toString() || "1",
      cashback_percentage: banner.cashback_percentage || "",
      cashback_text: banner.cashback_text || "",
      coupon_id: banner.coupon_id?.toString() || "",
      coupon_code: "",
    });
    setIsEditing(true);
    setEditingBannerId(banner.id);
    setIsFormOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { data } = await uploadFile({
        variables: { file, folder: "banners" },
      });
      if (data?.uploadFile?.success) {
        setFormData((prev) => ({ ...prev, image: data.uploadFile.url }));
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    // Headline and image are required for a banner to display content
    if (!formData.headline || !formData.image) return;

    const input = {
      website_id: formData.website_id ? parseInt(formData.website_id) : null,
      headline: formData.headline,
      details: formData.details,
      image: formData.image,
      link: formData.link,
      expiry_date: formData.expiry_date,
      priority: parseInt(formData.priority) || 1,
      cashback_percentage: formData.cashback_percentage,
      cashback_text: formData.cashback_text || null,
      coupon_id: formData.coupon_id ? parseInt(formData.coupon_id) : null,
    };

    if (isEditing && editingBannerId) {
      updateBanner({ variables: { id: editingBannerId, input } });
    } else {
      createBanner({ variables: { input } });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteBanner({ variables: { id: deleteId } });
    }
  };

  // Permission checks
  const canCreate = hasPermission(permissions.BANNER_CREATE);
  const canEdit = hasPermission(permissions.BANNER_UPDATE);
  const canDelete = hasPermission(permissions.BANNER_DELETE);

  // Check for forbidden error
  const isForbidden = error?.graphQLErrors?.some(
    (e) =>
      e.extensions?.code === "FORBIDDEN" ||
      e.message?.toLowerCase().includes("permission")
  );

  if (!hasPermission(permissions.BANNER_VIEW)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
        <p className="text-muted-foreground">
          You don&apos;t have permission to view banners.
        </p>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
        <p className="text-muted-foreground">
          You don&apos;t have permission to view banners.
        </p>
      </div>
    );
  }

  if (error && !isForbidden) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-bold">Error Loading Banners</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <Button onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  const banners = data?.getBanners?.banners || [];
  const totalCount = data?.getBanners?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const now = new Date();
  // Banners without expiry_date are considered active (never expires)
  const activeCount = banners.filter(
    (b: BannerData) => !b.expiry_date || new Date(b.expiry_date) > now
  ).length;
  const expiredCount = banners.filter(
    (b: BannerData) => b.expiry_date && new Date(b.expiry_date) <= now
  ).length;

  const getBannerStatus = (expiryDate: string | null) => {
    if (!expiryDate) return "ACTIVE";
    return new Date(expiryDate) < now ? "EXPIRED" : "ACTIVE";
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    EXPIRED: "bg-gray-100 text-gray-800",
  };

  const getImageSrc = (imageContent: string | null | undefined) => {
    if (!imageContent) return undefined;
    if (imageContent.startsWith("http") || imageContent.startsWith("https")) {
      return imageContent;
    }
    if (imageContent.startsWith("data:")) {
      return imageContent;
    }
    const cleanContent = imageContent.replace(/[\s\r\n]+/g, "");
    return `data:image/png;base64,${cleanContent}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Banners</h1>
          <p className="text-muted-foreground">
            Manage app banners and promotions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading || isRefetching}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading || isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {canCreate && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Banner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {isEditing ? "Edit Banner" : "Create New Banner"}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditing
                      ? "Update banner details"
                      : "Add a new banner to the app"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Merchant Search */}
                  <div className="space-y-2 relative">
                    <Label>Merchant (Website)</Label>
                    <Input
                      placeholder="Search merchant..."
                      value={formData.website_name || merchantQuery}
                      onChange={(e) => {
                        setMerchantQuery(e.target.value);
                        if (
                          formData.website_name &&
                          e.target.value !== formData.website_name
                        ) {
                          setFormData((prev) => ({
                            ...prev,
                            website_name: "",
                            website_id: "",
                          }));
                        }
                        setShowMerchantDropdown(true);
                      }}
                      onFocus={() => setShowMerchantDropdown(true)}
                    />
                    {showMerchantDropdown && merchantResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto">
                        {merchantResults.map((merchant) => (
                          <div
                            key={merchant.id}
                            className="flex items-center gap-3 p-2 hover:bg-accent cursor-pointer"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                website_name: merchant.website_name,
                                website_id: merchant.id,
                              }));
                              setMerchantQuery("");
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
                    {searchingMerchants && (
                      <div className="absolute right-3 top-9">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Headline */}
                  <div className="space-y-2">
                    <Label>Headline *</Label>
                    <Input
                      placeholder="Banner headline"
                      value={formData.headline}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          headline: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <Label>Details</Label>
                    <Textarea
                      placeholder="Banner details"
                      value={formData.details}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          details: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Image *</Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    {formData.image ? (
                      <div className="relative">
                        <img
                          src={getImageSrc(formData.image)}
                          alt="Preview"
                          className="h-32 w-full object-cover rounded border"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Upload className="h-4 w-4 mr-2" />
                            )}
                            Change Image
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Uploading...
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm font-medium">
                              Click to upload image
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Link */}
                  <div className="space-y-2">
                    <Label>Link</Label>
                    <Input
                      placeholder="https://..."
                      value={formData.link}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          link: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Priority and Expiry */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            priority: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <Input
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            expiry_date: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Cashback */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cashback %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="e.g., 10"
                        value={formData.cashback_percentage}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            cashback_percentage: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cashback Text</Label>
                      <Input
                        placeholder="Optional text"
                        value={formData.cashback_text}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            cashback_text: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Coupon Search */}
                  <div className="space-y-2 relative">
                    <Label>Link to Coupon (Optional)</Label>
                    <Input
                      placeholder="Search coupon code..."
                      value={formData.coupon_code || couponQuery}
                      onChange={(e) => {
                        setCouponQuery(e.target.value);
                        if (
                          formData.coupon_code &&
                          e.target.value !== formData.coupon_code
                        ) {
                          setFormData((prev) => ({
                            ...prev,
                            coupon_code: "",
                            coupon_id: "",
                          }));
                        }
                        setShowCouponDropdown(true);
                      }}
                      onFocus={() => setShowCouponDropdown(true)}
                    />
                    {showCouponDropdown && couponResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto">
                        {couponResults.map((coupon) => (
                          <div
                            key={coupon.id}
                            className="flex items-center gap-3 p-2 hover:bg-accent cursor-pointer"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                coupon_code: coupon.code,
                                coupon_id: coupon.id,
                              }));
                              setCouponQuery("");
                              setShowCouponDropdown(false);
                            }}
                          >
                            <code className="bg-muted px-2 py-1 rounded text-sm">
                              {coupon.code}
                            </code>
                            <span className="text-sm text-muted-foreground">
                              {coupon.title || coupon.shop_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchingCoupons && (
                      <div className="absolute right-3 top-9">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                    disabled={creating || updating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      creating ||
                      updating ||
                      !formData.headline ||
                      !formData.image
                    }
                  >
                    {creating || updating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isEditing ? "Updating..." : "Creating..."}
                      </>
                    ) : isEditing ? (
                      "Update Banner"
                    ) : (
                      "Create Banner"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Image className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Banners</p>
                <p className="text-2xl font-bold">
                  {loading ? "..." : totalCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Image className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {loading ? "..." : activeCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <Image className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold">
                  {loading ? "..." : expiredCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Page</p>
                <p className="text-2xl font-bold">
                  {loading ? "..." : banners.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search banners by headline..."
                className="pl-10"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading banners...</span>
        </div>
      )}

      {/* Banners Grid */}
      {!loading && banners.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Image className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No Banners Found</h3>
          <p className="text-muted-foreground">
            {search
              ? "Try adjusting your search criteria."
              : "Create your first banner to get started."}
          </p>
        </div>
      )}

      {!loading && banners.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          {banners.map((banner: BannerData) => {
            const status = getBannerStatus(banner.expiry_date);
            return (
              <Card key={banner.id} className="overflow-hidden">
                <div className="relative">
                  {banner.image ? (
                    <img
                      src={getImageSrc(banner.image)}
                      alt={banner.headline}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const fallback =
                          "https://placehold.co/600x200?text=No+Image";
                        if (target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-40 bg-muted flex items-center justify-center">
                      <Image className="h-8 w-8 text-muted-foreground opacity-50" />
                    </div>
                  )}
                  <Badge
                    className={`absolute top-2 right-2 ${statusColors[status]}`}
                  >
                    {status}
                  </Badge>
                </div>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold truncate">
                      {banner.headline}
                    </h3>
                    <Badge variant="outline">#{banner.priority}</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Merchant:</span>
                      <span className="truncate ml-2">
                        {banner.Website?.website_name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cashback:</span>
                      <span>{banner.cashback_percentage || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expiry:</span>
                      <span>
                        {banner.expiry_date
                          ? new Date(banner.expiry_date).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex gap-1 overflow-hidden">
                      <span className="shrink-0">Details:</span>
                      <span className="truncate min-w-0" title={banner.details}>
                        {banner.details}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(banner)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(banner.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {currentPage * pageSize + 1} to{" "}
            {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount}{" "}
            banners
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this banner? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
