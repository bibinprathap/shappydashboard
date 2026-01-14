"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
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
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { permissions } from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";

const GET_MERCHANTS = gql`
  query GetMerchants($limit: Int, $offset: Int, $search: String) {
    getMerchants(limit: $limit, offset: $offset, search: $search) {
      totalCount
      merchants {
        id
        website_name
        website_domain
        website_home
        s3_website_logo
        category_id
        category_name
        tags
        priority
        affiliate_link
        created_at
        updated_at
        coupons_count
        total_clicks
        success_count
      }
    }
  }
`;

const CREATE_MERCHANT = gql`
  mutation CreateMerchant($input: CreateMerchantInput!) {
    createMerchant(input: $input) {
      id
      website_name
      website_domain
      website_home
      category_name
      priority
      affiliate_link
      tags
    }
  }
`;

const UPDATE_MERCHANT = gql`
  mutation UpdateMerchant($id: ID!, $input: UpdateMerchantInput!) {
    updateMerchant(id: $id, input: $input) {
      id
      website_name
      website_domain
      website_home
      category_name
      priority
      affiliate_link
      tags
    }
  }
`;

const DELETE_MERCHANT = gql`
  mutation DeleteMerchant($id: ID!) {
    deleteMerchant(id: $id) {
      success
      message
      deletedCouponsCount
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

const PAGE_SIZE = 12;

// Merchant interface
interface MerchantData {
  id: string;
  website_name: string;
  website_domain: string | null;
  website_home: string | null;
  s3_website_logo: string | null;
  category_id: number | null;
  category_name: string | null;
  tags: string | null;
  priority: number;
  affiliate_link: string | null;
  created_at: string | null;
  updated_at: string | null;
  coupons_count: number | null;
  total_clicks: number | null;
  success_count: number | null;
}

// Create form interface
interface CreateMerchantForm {
  website_name: string;
  website_domain: string;
  website_home: string;
  category_name: string;
  priority: string;
  affiliate_link: string;
  tags: string;
  s3_website_logo: string;
}

const initialFormState: CreateMerchantForm = {
  website_name: "",
  website_domain: "",
  website_home: "",
  category_name: "",
  priority: "1",
  affiliate_link: "",
  tags: "",
  s3_website_logo: "",
};

export default function MerchantsPage() {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<MerchantData | null>(
    null
  );
  const [deletingMerchant, setDeletingMerchant] = useState<MerchantData | null>(
    null
  );
  const [formData, setFormData] =
    useState<CreateMerchantForm>(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Check permissions
  const canCreateMerchant = hasPermission(permissions.MERCHANT_CREATE);
  const canUpdateMerchant = hasPermission(permissions.MERCHANT_UPDATE);
  const canDeleteMerchant = hasPermission(permissions.MERCHANT_DELETE);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, refetch } = useQuery(GET_MERCHANTS, {
    variables: {
      limit: PAGE_SIZE,
      offset: (currentPage - 1) * PAGE_SIZE,
      search: debouncedSearch || undefined,
    },
    fetchPolicy: "cache-and-network",
  });

  const [createMerchant, { loading: createLoading }] = useMutation(
    CREATE_MERCHANT,
    {
      onCompleted: (data) => {
        setIsCreateOpen(false);
        setFormData(initialFormState);
        setFormError(null);
        refetch();
        toast({
          title: "Merchant Created",
          description: `"${data.createMerchant.website_name}" has been added successfully.`,
        });
      },
      onError: (err) => {
        setFormError(err.message);
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    }
  );

  const [updateMerchant, { loading: updateLoading }] = useMutation(
    UPDATE_MERCHANT,
    {
      onCompleted: (data) => {
        setIsEditOpen(false);
        setEditingMerchant(null);
        setFormData(initialFormState);
        setFormError(null);
        refetch();
        toast({
          title: "Merchant Updated",
          description: `"${data.updateMerchant.website_name}" has been updated successfully.`,
        });
      },
      onError: (err) => {
        setFormError(err.message);
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    }
  );

  const [uploadFile] = useMutation(UPLOAD_FILE);

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPEG, PNG, GIF, or WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingLogo(true);
    try {
      const { data } = await uploadFile({
        variables: { file, folder: "merchants/logos" },
      });

      if (data?.uploadFile?.success) {
        setFormData((prev) => ({
          ...prev,
          s3_website_logo: data.uploadFile.url,
        }));
        toast({
          title: "Logo Uploaded",
          description: "Logo uploaded successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, s3_website_logo: "" }));
  };

  const handleInputChange = (
    field: keyof CreateMerchantForm,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleCreateMerchant = async () => {
    // Validate required field
    if (!formData.website_name.trim()) {
      setFormError("Merchant name is required");
      return;
    }

    await createMerchant({
      variables: {
        input: {
          website_name: formData.website_name.trim(),
          website_domain: formData.website_domain.trim() || null,
          website_home: formData.website_home.trim() || null,
          category_name: formData.category_name.trim() || null,
          priority: parseInt(formData.priority) || 1,
          affiliate_link: formData.affiliate_link.trim() || null,
          tags: formData.tags.trim() || null,
          s3_website_logo: formData.s3_website_logo || null,
        },
      },
    });
  };

  const handleUpdateMerchant = async () => {
    if (!editingMerchant) return;

    // Validate required field
    if (!formData.website_name.trim()) {
      setFormError("Merchant name is required");
      return;
    }

    await updateMerchant({
      variables: {
        id: editingMerchant.id,
        input: {
          website_name: formData.website_name.trim(),
          website_domain: formData.website_domain.trim() || null,
          website_home: formData.website_home.trim() || null,
          category_name: formData.category_name.trim() || null,
          priority: parseInt(formData.priority) || 1,
          affiliate_link: formData.affiliate_link.trim() || null,
          tags: formData.tags.trim() || null,
          s3_website_logo: formData.s3_website_logo || null,
        },
      },
    });
  };

  const handleEditClick = (merchant: MerchantData) => {
    setEditingMerchant(merchant);
    setFormData({
      website_name: merchant.website_name || "",
      website_domain: merchant.website_domain || "",
      website_home: merchant.website_home || "",
      category_name: merchant.category_name || "",
      priority: String(merchant.priority || 1),
      affiliate_link: merchant.affiliate_link || "",
      tags: merchant.tags || "",
      s3_website_logo: merchant.s3_website_logo || "",
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const [deleteMerchant, { loading: deleteLoading }] = useMutation(
    DELETE_MERCHANT,
    {
      onCompleted: (data) => {
        setIsDeleteOpen(false);
        setDeletingMerchant(null);
        refetch();
        toast({
          title: "Merchant Deleted",
          description: data.deleteMerchant.message,
        });
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    }
  );

  const handleDeleteClick = (merchant: MerchantData) => {
    setDeletingMerchant(merchant);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingMerchant) return;

    await deleteMerchant({
      variables: {
        id: deletingMerchant.id,
      },
    });
  };

  const handleDeleteDialogClose = (open: boolean) => {
    setIsDeleteOpen(open);
    if (!open) {
      setDeletingMerchant(null);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) {
      setFormData(initialFormState);
      setFormError(null);
    }
  };

  const handleEditDialogClose = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) {
      setEditingMerchant(null);
      setFormData(initialFormState);
      setFormError(null);
    }
  };

  const totalCount = data?.getMerchants?.totalCount || 0;
  const merchants = data?.getMerchants?.merchants || [];
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
              You don&apos;t have permission to view merchants.
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
          <h1 className="text-3xl font-bold">Merchants</h1>
          <p className="text-muted-foreground">Manage merchants and stores</p>
        </div>
        {canCreateMerchant && (
          <Dialog open={isCreateOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Merchant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Merchant</DialogTitle>
                <DialogDescription>
                  Add a new merchant to the platform
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {formError && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {formError}
                  </div>
                )}
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4">
                    {formData.s3_website_logo ? (
                      <div className="relative">
                        <img
                          src={formData.s3_website_logo}
                          alt="Logo preview"
                          className="w-16 h-16 rounded-lg object-contain bg-muted border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={handleRemoveLogo}
                          disabled={createLoading || uploadingLogo}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted border border-dashed flex items-center justify-center text-muted-foreground">
                        <Upload className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        id="create-logo-upload"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={createLoading || uploadingLogo}
                      />
                      <label htmlFor="create-logo-upload">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                          disabled={createLoading || uploadingLogo}
                        >
                          <span className="cursor-pointer">
                            {uploadingLogo ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                {formData.s3_website_logo
                                  ? "Change Logo"
                                  : "Upload Logo"}
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG, GIF, WebP (max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Noon"
                      value={formData.website_name}
                      onChange={(e) =>
                        handleInputChange("website_name", e.target.value)
                      }
                      disabled={createLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain</Label>
                    <Input
                      id="domain"
                      placeholder="e.g., noon.com"
                      value={formData.website_domain}
                      onChange={(e) =>
                        handleInputChange("website_domain", e.target.value)
                      }
                      disabled={createLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    placeholder="https://www.example.com"
                    value={formData.website_home}
                    onChange={(e) =>
                      handleInputChange("website_home", e.target.value)
                    }
                    disabled={createLoading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority (1-10)</Label>
                    <Input
                      id="priority"
                      type="number"
                      placeholder="1-10"
                      min="1"
                      max="10"
                      value={formData.priority}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        const clamped = Math.min(Math.max(val, 1), 10);
                        handleInputChange("priority", String(clamped));
                      }}
                      disabled={createLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Fashion"
                      value={formData.category_name}
                      onChange={(e) =>
                        handleInputChange("category_name", e.target.value)
                      }
                      disabled={createLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affiliate">Affiliate Link</Label>
                  <Input
                    id="affiliate"
                    placeholder="https://affiliate.example.com/..."
                    value={formData.affiliate_link}
                    onChange={(e) =>
                      handleInputChange("affiliate_link", e.target.value)
                    }
                    disabled={createLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., electronics, fashion, deals"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                    disabled={createLoading}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleDialogClose(false)}
                  disabled={createLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateMerchant} disabled={createLoading}>
                  {createLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Merchant
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Merchant Dialog */}
        {canUpdateMerchant && (
          <Dialog open={isEditOpen} onOpenChange={handleEditDialogClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Merchant</DialogTitle>
                <DialogDescription>Update merchant details</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {formError && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {formError}
                  </div>
                )}
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4">
                    {formData.s3_website_logo ? (
                      <div className="relative">
                        <img
                          src={formData.s3_website_logo}
                          alt="Logo preview"
                          className="w-16 h-16 rounded-lg object-contain bg-muted border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={handleRemoveLogo}
                          disabled={updateLoading || uploadingLogo}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted border border-dashed flex items-center justify-center text-muted-foreground">
                        <Upload className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        id="edit-logo-upload"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={updateLoading || uploadingLogo}
                      />
                      <label htmlFor="edit-logo-upload">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                          disabled={updateLoading || uploadingLogo}
                        >
                          <span className="cursor-pointer">
                            {uploadingLogo ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                {formData.s3_website_logo
                                  ? "Change Logo"
                                  : "Upload Logo"}
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG, GIF, WebP (max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name *</Label>
                    <Input
                      id="edit-name"
                      placeholder="e.g., Noon"
                      value={formData.website_name}
                      onChange={(e) =>
                        handleInputChange("website_name", e.target.value)
                      }
                      disabled={updateLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-domain">Domain</Label>
                    <Input
                      id="edit-domain"
                      placeholder="e.g., noon.com"
                      value={formData.website_domain}
                      onChange={(e) =>
                        handleInputChange("website_domain", e.target.value)
                      }
                      disabled={updateLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-website">Website URL</Label>
                  <Input
                    id="edit-website"
                    placeholder="https://www.example.com"
                    value={formData.website_home}
                    onChange={(e) =>
                      handleInputChange("website_home", e.target.value)
                    }
                    disabled={updateLoading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Priority (1-10)</Label>
                    <Input
                      id="edit-priority"
                      type="number"
                      placeholder="1-10"
                      min="1"
                      max="10"
                      value={formData.priority}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        const clamped = Math.min(Math.max(val, 1), 10);
                        handleInputChange("priority", String(clamped));
                      }}
                      disabled={updateLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Input
                      id="edit-category"
                      placeholder="e.g., Fashion"
                      value={formData.category_name}
                      onChange={(e) =>
                        handleInputChange("category_name", e.target.value)
                      }
                      disabled={updateLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-affiliate">Affiliate Link</Label>
                  <Input
                    id="edit-affiliate"
                    placeholder="https://affiliate.example.com/..."
                    value={formData.affiliate_link}
                    onChange={(e) =>
                      handleInputChange("affiliate_link", e.target.value)
                    }
                    disabled={updateLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                  <Input
                    id="edit-tags"
                    placeholder="e.g., electronics, fashion, deals"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                    disabled={updateLoading}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleEditDialogClose(false)}
                  disabled={updateLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateMerchant} disabled={updateLoading}>
                  {updateLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        {canDeleteMerchant && (
          <Dialog open={isDeleteOpen} onOpenChange={handleDeleteDialogClose}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-destructive">
                  Delete Merchant
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this merchant?
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {deletingMerchant && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      {deletingMerchant.s3_website_logo ? (
                        <img
                          src={deletingMerchant.s3_website_logo}
                          alt={deletingMerchant.website_name}
                          className="w-10 h-10 rounded-lg object-contain bg-background"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {deletingMerchant.website_name[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">
                          {deletingMerchant.website_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {deletingMerchant.website_domain || "No domain"}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive font-medium">
                        ⚠️ Warning: This action cannot be undone!
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Deleting this merchant will also permanently delete{" "}
                        <strong className="text-foreground">
                          {deletingMerchant.coupons_count || 0} coupon(s)
                        </strong>{" "}
                        associated with it, along with all their click
                        statistics.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleDeleteDialogClose(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Delete Merchant
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
                placeholder="Search merchants by name, domain, or category..."
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
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && merchants.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : merchants.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No merchants found</p>
        </div>
      ) : (
        <>
          {/* Merchants Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {merchants.map((merchant: MerchantData) => (
              <Card key={merchant.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {merchant.s3_website_logo ? (
                        <img
                          src={merchant.s3_website_logo}
                          alt={merchant.website_name}
                          className="w-12 h-12 rounded-lg object-contain bg-muted"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                          {merchant.website_name[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">
                          {merchant.website_name}
                        </h3>
                        {merchant.website_home && (
                          <a
                            href={merchant.website_home}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            {merchant.website_domain ||
                              merchant.website_home
                                .replace("https://", "")
                                .replace("http://", "")
                                .split("/")[0]}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Priority: {merchant.priority}
                    </Badge>
                  </div>

                  {merchant.category_name && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      <Badge variant="outline" className="text-xs">
                        {merchant.category_name}
                      </Badge>
                      {merchant.tags &&
                        merchant.tags
                          .split(",")
                          .slice(0, 2)
                          .map((tag) => (
                            <Badge
                              key={tag.trim()}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag.trim()}
                            </Badge>
                          ))}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div>
                      <div className="text-xl font-bold">
                        {merchant.coupons_count || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Coupons
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-bold">
                        {(merchant.total_clicks || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Clicks
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-bold">
                        {(merchant.success_count || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Success
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-xs text-muted-foreground">
                      {merchant.affiliate_link
                        ? "Affiliate Active"
                        : "No Affiliate"}
                    </span>
                    <div className="flex gap-2">
                      {canUpdateMerchant && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(merchant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDeleteMerchant && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteClick(merchant)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
                {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount}{" "}
                merchants
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
