# Shappy Dashboard - Copilot Instructions

## Project Overview
Full-stack Shappy Dashboard application with Next.js frontend, Node.js/GraphQL backend, and PostgreSQL database.

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, Apollo Client
- **Backend**: Node.js, Apollo Server, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js with JWT

## Project Structure
```
shappydashboard/
├── frontend/          # Next.js application
├── backend/           # Node.js GraphQL API
├── .github/           # GitHub configurations
└── README.md          # Project documentation
```

## Key Features
- Admin roles & permissions (ops, marketing, finance, tech)
- Offer/Coupons management (create, expire, pin, suppress, geo rules)
- Merchant management (priority, categories, logos, deep links)
- Monitoring views: clicks, conversions, top merchants, error rates
- User monitoring
- App banners management
- Audit log (who changed what and when)

## Development Guidelines
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use Prisma for database operations
- Implement role-based access control on all protected routes
- Log all data mutations to audit log
