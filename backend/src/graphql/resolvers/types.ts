// Shared types for GraphQL resolvers
import { AdminRole } from '@prisma/client';

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface DateRangeInput {
  startDate?: string;
  endDate?: string;
}

export interface AdminInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
}

export interface AdminUpdateInput {
  firstName?: string;
  lastName?: string;
  role?: AdminRole;
  isActive?: boolean;
}

export interface CouponInput {
  code: string;
  title: string;
  description?: string;
  merchantId: string;
  type: string;
  discountValue?: number;
  affiliateLink?: string;
  startDate?: string;
  endDate?: string;
  priority?: number;
  isPinned?: boolean;
  geoRules?: GeoRuleInput[];
}

export interface GeoRuleInput {
  countryId: string;
  isActive: boolean;
}

export interface MerchantInput {
  name: string;
  slug: string;
  websiteUrl: string;
  logoUrl?: string;
  bannerUrl?: string;
  affiliateUrl?: string;
  deepLink?: string;
  description?: string;
  priority?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  countryId?: string;
  categoryIds?: string[];
}

export interface BannerInput {
  title: string;
  imageUrl: string;
  targetUrl: string;
  position: string;
  startDate: string;
  endDate: string;
  priority?: number;
  countryIds?: string[];
}

export interface DealInput {
  title: string;
  description?: string;
  merchantId: string;
  imageUrl?: string;
  targetUrl: string;
  startDate: string;
  endDate: string;
  priority?: number;
  countryIds?: string[];
}

export interface CountryInput {
  code: string;
  name: string;
  currencyId: string;
  isActive?: boolean;
}

export interface CurrencyInput {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isActive?: boolean;
}

export interface CategoryInput {
  name: string;
  slug: string;
  icon?: string;
  priority?: number;
}

export interface ExtensionSettingInput {
  key: string;
  value: unknown;
  description?: string;
}
