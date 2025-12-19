# Shappy Dashboard

A full-stack admin dashboard for managing the Shappy cashback and coupon platform. Built with Next.js, Node.js, GraphQL, and PostgreSQL.

## 🚀 Features

### Admin Management
- Role-based access control (Super Admin, Operations, Marketing, Finance, Tech)
- Admin user CRUD operations
- Activity tracking and audit logs

### Coupon Management
- Create, update, and delete coupons
- Geo-targeting rules per country
- Coupon status management (Active, Expired, Suppressed)
- Pin/unpin featured coupons
- Bulk operations support

### Merchant Management
- Merchant profiles with logos and categories
- Priority ordering
- Affiliate and deep link management
- Performance metrics (clicks, conversions, revenue)

### Monitoring & Analytics
- Click tracking by source and platform
- Conversion tracking with status management
- Top merchants analysis
- Error rate monitoring

### Additional Features
- Deal/Featured promo management
- App banner management
- Countries and currencies configuration
- Extension/app settings management
- Comprehensive audit logging

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **Apollo Client** for GraphQL
- **NextAuth.js** for authentication

### Backend
- **Node.js** with **Express**
- **Apollo Server 4** for GraphQL
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL** database
- **JWT** authentication
- **bcrypt** for password hashing

## 📁 Project Structure

```
shappydashboard/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   │   ├── dashboard/   # Dashboard pages
│   │   │   └── login/       # Authentication pages
│   │   ├── components/      # React components
│   │   │   ├── layout/      # Layout components
│   │   │   └── ui/          # UI components (shadcn/ui)
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utilities and Apollo client
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                  # Node.js GraphQL API
│   ├── src/
│   │   ├── graphql/         # GraphQL schema and resolvers
│   │   │   ├── resolvers/   # Query and mutation resolvers
│   │   │   ├── schema.ts    # GraphQL type definitions
│   │   │   └── context.ts   # Request context
│   │   ├── lib/             # Shared utilities
│   │   │   ├── auth.ts      # Authentication utilities
│   │   │   ├── auditLog.ts  # Audit logging
│   │   │   └── prisma.ts    # Prisma client
│   │   └── index.ts         # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Database seeding
│   └── package.json
│
└── .github/                  # GitHub configurations
    └── copilot-instructions.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your database connection:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/shappy_dashboard"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"
   PORT=4000
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Seed the database (optional):
   ```bash
   npx prisma db seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The GraphQL API will be available at `http://localhost:4000/graphql`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The dashboard will be available at `http://localhost:3000`

## 🔐 Authentication

### Default Admin Credentials (after seeding)
- **Email:** super@shappy.com
- **Password:** admin123

### Admin Roles & Permissions

| Role | Description | Permissions |
|------|-------------|-------------|
| SUPER_ADMIN | Full system access | All operations |
| OPS | Operations team | Merchants, Coupons, Deals, Banners |
| MARKETING | Marketing team | Coupons, Deals, Banners, Analytics |
| FINANCE | Finance team | View conversions, revenue reports |
| TECH | Technical team | Extension settings, system config |

## 📊 GraphQL API

### Key Queries
- `admins` - List all admins
- `coupons` - List coupons with filtering
- `merchants` - List merchants
- `conversions` - List conversions with status filter
- `clicks` - List click events
- `analytics` - Dashboard analytics data
- `auditLogs` - View audit trail

### Key Mutations
- `login` / `logout` - Authentication
- `createCoupon` / `updateCoupon` / `deleteCoupon`
- `createMerchant` / `updateMerchant`
- `createBanner` / `updateBanner`
- `updateExtensionSettings`

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Database Management
```bash
# View database in Prisma Studio
cd backend && npx prisma studio

# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name your_migration_name
```

### Code Quality
```bash
# Lint
npm run lint

# Format
npm run format
```

## 📦 Deployment

### Docker (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment

1. Build the frontend:
   ```bash
   cd frontend && npm run build
   ```

2. Build the backend:
   ```bash
   cd backend && npm run build
   ```

3. Run database migrations:
   ```bash
   cd backend && npx prisma migrate deploy
   ```

4. Start the servers with PM2 or similar process manager.

## 📝 Environment Variables

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | Required |
| JWT_SECRET | JWT signing secret | Required |
| JWT_EXPIRES_IN | Token expiration time | 7d |
| PORT | Server port | 4000 |

### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | GraphQL API endpoint | Required |
| NEXTAUTH_SECRET | NextAuth secret | Required |
| NEXTAUTH_URL | Application URL | Required |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 👥 Support

For support, email support@shappy.com or contact the development team.
