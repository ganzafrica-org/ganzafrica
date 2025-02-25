# GanzAfrica API

This package contains the shared backend API for the GanzAfrica web and portal applications.

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Create a `.env` file in the `packages/api` directory:

```env
# Database
DATABASE_URL=postgres://username:password@localhost:5432/ganzafrica

# General
NODE_ENV=development
PORT=3001
WEBSITE_URL=http://localhost:3000
PORTAL_URL=http://localhost:3001

# Auth
SESSION_SECRET=super_secret_development_key_at_least_32_chars
PASETO_SECRET=another_super_secret_development_key_at_least_32_chars

# Email
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@ganzafrica.org
```

### 3. Set up the Database

First, make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE ganzafrica;
```

Then generate and run migrations:

```bash
# Generate migrations based on schema changes
pnpm drizzle-kit generate

# Apply migrations to the database
pnpm db:migrate
```

### 4. Run the API (Development Mode)

```bash
pnpm dev
```

The API will be available at http://localhost:3001/api/trpc

## Key Features

- **Authentication & Authorization**
    - Secure authentication with PASETO tokens
    - HTTP-only cookies for secure token storage
    - Role-based access control
    - Protection against common security vulnerabilities
    - Two-factor authentication support

- **Database Integration**
    - Type-safe database access with Drizzle ORM
    - Automatic schema migrations
    - Database triggers for integrity and auditing
    - Optimized indexing for performance

- **API Layer**
    - Type-safe API with tRPC
    - End-to-end type safety from database to frontend
    - Automatic client generation for web and portal apps

## API Structure

```
src/
├── config/             # Configuration and environment
├── db/                 # Database schema and client
│   ├── schema/         # Database schema definitions
│   │   ├── users.ts    # User-related tables
│   │   ├── auth.ts     # Authentication tables
│   │   └── ...         # Other schema files
│   ├── client.ts       # Database client setup
│   ├── migrate.ts      # Migration runner
│   └── triggers.sql    # Database triggers
├── modules/            # Business logic modules
│   ├── auth/           # Authentication module
│   ├── email/          # Email sending module
│   └── ...             # Other modules
└── trpc/               # API router and procedures
    ├── context.ts      # Request context
    ├── trpc.ts         # tRPC initialization
    └── routers/        # API route handlers
```

## Authentication

The API uses PASETO tokens stored in HTTP-only cookies for authentication. This provides:

1. **Security** - Tokens are not accessible to JavaScript, protecting against XSS attacks
2. **Convenience** - Tokens are automatically sent with each request
3. **Performance** - No client-side token management required

### Auth Flow

1. User registers or logs in
2. API issues a PASETO token stored in HTTP-only cookie
3. When accessing protected resources, the token is automatically included
4. Server validates the token and retrieves the user session
5. For logout, the token is invalidated server-side

## Database Schema

The database schema is comprehensive, supporting:

- User management and authentication
- Fellowship program administration
- Project and content management
- Application and recruitment processes
- Event management
- Mentorship programs
- Communication systems

## Deployment

The API is designed to be deployed to Cloudflare Workers:

1. Build the API:
   ```bash
   pnpm build
   ```

2. Deploy using Cloudflare Wrangler:
   ```bash
   wrangler publish
   ```

## Available Scripts

- `pnpm build` - Build for production
- `pnpm dev` - Run development server
- `pnpm lint` - Lint code
- `pnpm db:generate` - Generate migrations
- `pnpm db:migrate` - Apply migrations
- `pnpm db:studio` - Launch Drizzle Studio (database UI)
- `pnpm db:push` - Push schema changes directly to database (development only)