"use client";

import { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export default function MerchantsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Merchant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Merchant</DialogTitle>
              <DialogDescription>
                Add a new merchant to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="e.g., Noon" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input id="domain" placeholder="e.g., noon.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input id="website" placeholder="https://www.example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input id="priority" type="number" placeholder="1-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" placeholder="e.g., Fashion" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateOpen(false)}>
                Add Merchant
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
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
