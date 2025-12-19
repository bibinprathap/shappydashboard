import { PrismaClient, AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin users
  const passwordHash = await bcrypt.hash('admin123', 12);

  const superAdmin = await prisma.admin.upsert({
    where: { email: 'admin@shappy.com' },
    update: {},
    create: {
      email: 'admin@shappy.com',
      password: passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: AdminRole.SUPER_ADMIN,
    },
  });

  const opsAdmin = await prisma.admin.upsert({
    where: { email: 'ops@shappy.com' },
    update: {},
    create: {
      email: 'ops@shappy.com',
      password: passwordHash,
      firstName: 'Operations',
      lastName: 'Manager',
      role: AdminRole.OPS,
    },
  });

  const marketingAdmin = await prisma.admin.upsert({
    where: { email: 'marketing@shappy.com' },
    update: {},
    create: {
      email: 'marketing@shappy.com',
      password: passwordHash,
      firstName: 'Marketing',
      lastName: 'Manager',
      role: AdminRole.MARKETING,
    },
  });

  console.log('✅ Created admin users:', { superAdmin: superAdmin.email, opsAdmin: opsAdmin.email, marketingAdmin: marketingAdmin.email });

  // Create countries
  const countries = await Promise.all([
    prisma.country.upsert({
      where: { code: 'AE' },
      update: {},
      create: { name: 'United Arab Emirates', code: 'AE' },
    }),
    prisma.country.upsert({
      where: { code: 'SA' },
      update: {},
      create: { name: 'Saudi Arabia', code: 'SA' },
    }),
    prisma.country.upsert({
      where: { code: 'KW' },
      update: {},
      create: { name: 'Kuwait', code: 'KW' },
    }),
    prisma.country.upsert({
      where: { code: 'QA' },
      update: {},
      create: { name: 'Qatar', code: 'QA' },
    }),
    prisma.country.upsert({
      where: { code: 'BH' },
      update: {},
      create: { name: 'Bahrain', code: 'BH' },
    }),
    prisma.country.upsert({
      where: { code: 'OM' },
      update: {},
      create: { name: 'Oman', code: 'OM' },
    }),
  ]);

  console.log('✅ Created countries:', countries.map(c => c.code).join(', '));

  // Create currencies
  const currencies = await Promise.all([
    prisma.currency.upsert({
      where: { code: 'AED' },
      update: {},
      create: { name: 'UAE Dirham', code: 'AED', symbol: 'د.إ' },
    }),
    prisma.currency.upsert({
      where: { code: 'SAR' },
      update: {},
      create: { name: 'Saudi Riyal', code: 'SAR', symbol: '﷼' },
    }),
    prisma.currency.upsert({
      where: { code: 'KWD' },
      update: {},
      create: { name: 'Kuwaiti Dinar', code: 'KWD', symbol: 'د.ك' },
    }),
    prisma.currency.upsert({
      where: { code: 'USD' },
      update: {},
      create: { name: 'US Dollar', code: 'USD', symbol: '$' },
    }),
  ]);

  console.log('✅ Created currencies:', currencies.map(c => c.code).join(', '));

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'fashion' },
      update: {},
      create: { name: 'Fashion', slug: 'fashion', icon: '👗', sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: { name: 'Electronics', slug: 'electronics', icon: '📱', sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'food-delivery' },
      update: {},
      create: { name: 'Food & Delivery', slug: 'food-delivery', icon: '🍕', sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'travel' },
      update: {},
      create: { name: 'Travel', slug: 'travel', icon: '✈️', sortOrder: 4 },
    }),
    prisma.category.upsert({
      where: { slug: 'beauty' },
      update: {},
      create: { name: 'Beauty', slug: 'beauty', icon: '💄', sortOrder: 5 },
    }),
    prisma.category.upsert({
      where: { slug: 'home-garden' },
      update: {},
      create: { name: 'Home & Garden', slug: 'home-garden', icon: '🏠', sortOrder: 6 },
    }),
  ]);

  console.log('✅ Created categories:', categories.map(c => c.name).join(', '));

  // Create sample merchants
  const uaeCountry = countries.find(c => c.code === 'AE')!;
  
  const merchants = await Promise.all([
    prisma.merchant.upsert({
      where: { slug: 'noon' },
      update: {},
      create: {
        name: 'Noon',
        slug: 'noon',
        description: 'The Middle East\'s homegrown online marketplace',
        websiteUrl: 'https://www.noon.com',
        priority: 100,
        isFeatured: true,
        countryId: uaeCountry.id,
      },
    }),
    prisma.merchant.upsert({
      where: { slug: 'amazon-ae' },
      update: {},
      create: {
        name: 'Amazon.ae',
        slug: 'amazon-ae',
        description: 'Shop online for Electronics, Fashion, Home & more',
        websiteUrl: 'https://www.amazon.ae',
        priority: 95,
        isFeatured: true,
        countryId: uaeCountry.id,
      },
    }),
    prisma.merchant.upsert({
      where: { slug: 'namshi' },
      update: {},
      create: {
        name: 'Namshi',
        slug: 'namshi',
        description: 'Online Fashion Shopping',
        websiteUrl: 'https://www.namshi.com',
        priority: 80,
        isFeatured: false,
        countryId: uaeCountry.id,
      },
    }),
  ]);

  console.log('✅ Created merchants:', merchants.map(m => m.name).join(', '));

  // Create sample coupons
  const coupons = await Promise.all([
    prisma.coupon.create({
      data: {
        merchantId: merchants[0].id,
        code: 'SHAPPY10',
        title: '10% Off Everything',
        description: 'Get 10% off on all products',
        type: 'PERCENTAGE',
        discountValue: 10,
        isPinned: true,
        isVerified: true,
        createdById: superAdmin.id,
      },
    }),
    prisma.coupon.create({
      data: {
        merchantId: merchants[1].id,
        code: 'SAVE50',
        title: 'AED 50 Off',
        description: 'Save AED 50 on orders above AED 200',
        type: 'FIXED_AMOUNT',
        discountValue: 50,
        minPurchase: 200,
        isVerified: true,
        createdById: superAdmin.id,
      },
    }),
  ]);

  console.log('✅ Created coupons:', coupons.length);

  // Create extension settings
  await prisma.extensionSettings.upsert({
    where: { key: 'auto_apply_enabled' },
    update: {},
    create: {
      key: 'auto_apply_enabled',
      value: { enabled: true },
      description: 'Enable auto-apply coupons feature',
    },
  });

  await prisma.extensionSettings.upsert({
    where: { key: 'popup_delay_ms' },
    update: {},
    create: {
      key: 'popup_delay_ms',
      value: { delay: 2000 },
      description: 'Delay in milliseconds before showing extension popup',
    },
  });

  console.log('✅ Created extension settings');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
