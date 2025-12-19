export const typeDefs = `#graphql
  scalar DateTime
  scalar JSON

  # ==================== ENUMS ====================
  
  enum AdminRole {
    SUPER_ADMIN
    OPS
    MARKETING
    FINANCE
    TECH
  }

  enum CouponStatus {
    ACTIVE
    EXPIRED
    SUPPRESSED
    SCHEDULED
  }

  enum CouponType {
    PERCENTAGE
    FIXED_AMOUNT
    FREE_SHIPPING
    BUY_X_GET_Y
  }

  enum BannerStatus {
    ACTIVE
    INACTIVE
    SCHEDULED
  }

  enum ConversionStatus {
    PENDING
    CONFIRMED
    REJECTED
    PAID
  }

  # ==================== TYPES ====================

  type Admin {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: AdminRole!
    isActive: Boolean!
    lastLoginAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AuthPayload {
    token: String!
    admin: Admin!
  }

  type User {
    id: ID!
    email: String!
    phone: String
    firstName: String
    lastName: String
    country: String
    deviceId: String
    platform: String
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    clicksCount: Int
    conversionsCount: Int
  }

  type Country {
    id: ID!
    name: String!
    code: String!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    currencies: [Currency!]
    merchantsCount: Int
  }

  type Currency {
    id: ID!
    name: String!
    code: String!
    symbol: String!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    icon: String
    sortOrder: Int!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    merchantsCount: Int
  }

  type Merchant {
    id: ID!
    name: String!
    slug: String!
    description: String
    websiteUrl: String!
    logoUrl: String
    bannerUrl: String
    deepLink: String
    affiliateUrl: String
    priority: Int!
    isFeatured: Boolean!
    isActive: Boolean!
    country: Country
    categories: [Category!]
    couponsCount: Int
    clicksCount: Int
    conversionsCount: Int
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Coupon {
    id: ID!
    merchant: Merchant!
    code: String!
    title: String!
    description: String
    type: CouponType!
    discountValue: Float
    minPurchase: Float
    maxDiscount: Float
    status: CouponStatus!
    isPinned: Boolean!
    isExclusive: Boolean!
    isVerified: Boolean!
    usageCount: Int!
    successCount: Int!
    failureCount: Int!
    startDate: DateTime
    endDate: DateTime
    geoRules: [CouponGeoRule!]
    createdBy: Admin
    updatedBy: Admin
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type CouponGeoRule {
    id: ID!
    country: Country!
    isIncluded: Boolean!
  }

  type Deal {
    id: ID!
    merchant: Merchant!
    title: String!
    description: String
    imageUrl: String
    linkUrl: String
    discountText: String
    isFeatured: Boolean!
    isActive: Boolean!
    startDate: DateTime
    endDate: DateTime
    sortOrder: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Banner {
    id: ID!
    title: String!
    description: String
    imageUrl: String!
    linkUrl: String
    linkType: String
    linkId: String
    status: BannerStatus!
    platform: String
    country: Country
    sortOrder: Int!
    startDate: DateTime
    endDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Click {
    id: ID!
    user: User
    merchant: Merchant!
    coupon: Coupon
    source: String
    platform: String
    deviceInfo: JSON
    ipAddress: String
    userAgent: String
    referrer: String
    createdAt: DateTime!
  }

  type Conversion {
    id: ID!
    user: User
    merchant: Merchant!
    coupon: Coupon
    orderId: String
    orderAmount: Float
    commission: Float
    currency: String
    status: ConversionStatus!
    source: String
    platform: String
    transactionDate: DateTime
    confirmedAt: DateTime
    paidAt: DateTime
    metadata: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ExtensionSettings {
    id: ID!
    key: String!
    value: JSON!
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AuditLog {
    id: ID!
    admin: Admin
    action: String!
    entityType: String!
    entityId: String!
    oldValue: JSON
    newValue: JSON
    ipAddress: String
    userAgent: String
    createdAt: DateTime!
  }

  # ==================== PAGINATION ====================

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    totalCount: Int!
    totalPages: Int!
  }

  type AdminConnection {
    nodes: [Admin!]!
    pageInfo: PageInfo!
  }

  type UserConnection {
    nodes: [User!]!
    pageInfo: PageInfo!
  }

  type MerchantConnection {
    nodes: [Merchant!]!
    pageInfo: PageInfo!
  }

  type CouponConnection {
    nodes: [Coupon!]!
    pageInfo: PageInfo!
  }

  type DealConnection {
    nodes: [Deal!]!
    pageInfo: PageInfo!
  }

  type BannerConnection {
    nodes: [Banner!]!
    pageInfo: PageInfo!
  }

  type ClickConnection {
    nodes: [Click!]!
    pageInfo: PageInfo!
  }

  type ConversionConnection {
    nodes: [Conversion!]!
    pageInfo: PageInfo!
  }

  type AuditLogConnection {
    nodes: [AuditLog!]!
    pageInfo: PageInfo!
  }

  # ==================== ANALYTICS ====================

  type DashboardStats {
    totalUsers: Int!
    totalMerchants: Int!
    totalCoupons: Int!
    activeCoupons: Int!
    totalClicks: Int!
    totalConversions: Int!
    pendingConversions: Int!
    todayClicks: Int!
    todayConversions: Int!
  }

  type TopMerchant {
    merchant: Merchant!
    clicks: Int!
    conversions: Int!
    revenue: Float!
  }

  type ClicksOverTime {
    date: String!
    count: Int!
  }

  type ConversionsOverTime {
    date: String!
    count: Int!
    amount: Float!
  }

  # ==================== INPUTS ====================

  input AdminInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    role: AdminRole!
  }

  input AdminUpdateInput {
    email: String
    firstName: String
    lastName: String
    role: AdminRole
    isActive: Boolean
  }

  input MerchantInput {
    name: String!
    slug: String!
    description: String
    websiteUrl: String!
    logoUrl: String
    bannerUrl: String
    deepLink: String
    affiliateUrl: String
    priority: Int
    isFeatured: Boolean
    isActive: Boolean
    countryId: String
    categoryIds: [String!]
  }

  input CouponInput {
    merchantId: String!
    code: String!
    title: String!
    description: String
    type: CouponType!
    discountValue: Float
    minPurchase: Float
    maxDiscount: Float
    status: CouponStatus
    isPinned: Boolean
    isExclusive: Boolean
    isVerified: Boolean
    startDate: DateTime
    endDate: DateTime
    geoRules: [GeoRuleInput!]
  }

  input GeoRuleInput {
    countryId: String!
    isIncluded: Boolean!
  }

  input DealInput {
    merchantId: String!
    title: String!
    description: String
    imageUrl: String
    linkUrl: String
    discountText: String
    isFeatured: Boolean
    isActive: Boolean
    startDate: DateTime
    endDate: DateTime
    sortOrder: Int
  }

  input BannerInput {
    title: String!
    description: String
    imageUrl: String!
    linkUrl: String
    linkType: String
    linkId: String
    status: BannerStatus
    platform: String
    countryId: String
    sortOrder: Int
    startDate: DateTime
    endDate: DateTime
  }

  input CountryInput {
    name: String!
    code: String!
    isActive: Boolean
  }

  input CurrencyInput {
    name: String!
    code: String!
    symbol: String!
    isActive: Boolean
  }

  input CategoryInput {
    name: String!
    slug: String!
    description: String
    icon: String
    sortOrder: Int
    isActive: Boolean
  }

  input ExtensionSettingInput {
    key: String!
    value: JSON!
    description: String
  }

  input PaginationInput {
    page: Int = 1
    limit: Int = 20
  }

  input DateRangeInput {
    startDate: DateTime
    endDate: DateTime
  }

  # ==================== QUERIES ====================

  type Query {
    # Auth
    me: Admin

    # Dashboard
    dashboardStats: DashboardStats!
    topMerchants(limit: Int): [TopMerchant!]!
    clicksOverTime(days: Int): [ClicksOverTime!]!
    conversionsOverTime(days: Int): [ConversionsOverTime!]!

    # Admins
    admins(pagination: PaginationInput): AdminConnection!
    admin(id: ID!): Admin

    # Users
    users(pagination: PaginationInput, search: String): UserConnection!
    user(id: ID!): User

    # Countries & Currencies
    countries(pagination: PaginationInput): [Country!]!
    country(id: ID!): Country
    currencies(pagination: PaginationInput): [Currency!]!
    currency(id: ID!): Currency

    # Categories
    categories(pagination: PaginationInput): [Category!]!
    category(id: ID!): Category

    # Merchants
    merchants(
      pagination: PaginationInput
      search: String
      categoryId: String
      countryId: String
      isFeatured: Boolean
      isActive: Boolean
    ): MerchantConnection!
    merchant(id: ID!): Merchant
    merchantBySlug(slug: String!): Merchant

    # Coupons
    coupons(
      pagination: PaginationInput
      search: String
      merchantId: String
      status: CouponStatus
      isPinned: Boolean
      countryId: String
    ): CouponConnection!
    coupon(id: ID!): Coupon

    # Deals
    deals(
      pagination: PaginationInput
      merchantId: String
      isFeatured: Boolean
      isActive: Boolean
    ): DealConnection!
    deal(id: ID!): Deal

    # Banners
    banners(
      pagination: PaginationInput
      status: BannerStatus
      platform: String
      countryId: String
    ): BannerConnection!
    banner(id: ID!): Banner

    # Clicks
    clicks(
      pagination: PaginationInput
      merchantId: String
      couponId: String
      dateRange: DateRangeInput
    ): ClickConnection!

    # Conversions
    conversions(
      pagination: PaginationInput
      merchantId: String
      status: ConversionStatus
      dateRange: DateRangeInput
    ): ConversionConnection!
    conversion(id: ID!): Conversion

    # Extension
    extensionSettings: [ExtensionSettings!]!
    extensionSetting(key: String!): ExtensionSettings

    # Audit Log
    auditLogs(
      pagination: PaginationInput
      adminId: String
      entityType: String
      action: String
      dateRange: DateRangeInput
    ): AuditLogConnection!
  }

  # ==================== MUTATIONS ====================

  type Mutation {
    # Auth
    login(email: String!, password: String!): AuthPayload!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!

    # Admins
    createAdmin(input: AdminInput!): Admin!
    updateAdmin(id: ID!, input: AdminUpdateInput!): Admin!
    deleteAdmin(id: ID!): Boolean!

    # Countries
    createCountry(input: CountryInput!): Country!
    updateCountry(id: ID!, input: CountryInput!): Country!
    deleteCountry(id: ID!): Boolean!

    # Currencies
    createCurrency(input: CurrencyInput!): Currency!
    updateCurrency(id: ID!, input: CurrencyInput!): Currency!
    deleteCurrency(id: ID!): Boolean!

    # Categories
    createCategory(input: CategoryInput!): Category!
    updateCategory(id: ID!, input: CategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!

    # Merchants
    createMerchant(input: MerchantInput!): Merchant!
    updateMerchant(id: ID!, input: MerchantInput!): Merchant!
    deleteMerchant(id: ID!): Boolean!
    toggleMerchantFeatured(id: ID!): Merchant!

    # Coupons
    createCoupon(input: CouponInput!): Coupon!
    updateCoupon(id: ID!, input: CouponInput!): Coupon!
    deleteCoupon(id: ID!): Boolean!
    toggleCouponPinned(id: ID!): Coupon!
    expireCoupon(id: ID!): Coupon!
    suppressCoupon(id: ID!): Coupon!

    # Deals
    createDeal(input: DealInput!): Deal!
    updateDeal(id: ID!, input: DealInput!): Deal!
    deleteDeal(id: ID!): Boolean!

    # Banners
    createBanner(input: BannerInput!): Banner!
    updateBanner(id: ID!, input: BannerInput!): Banner!
    deleteBanner(id: ID!): Boolean!

    # Conversions
    updateConversionStatus(id: ID!, status: ConversionStatus!): Conversion!

    # Extension Settings
    upsertExtensionSetting(input: ExtensionSettingInput!): ExtensionSettings!
    deleteExtensionSetting(key: String!): Boolean!
  }
`;
