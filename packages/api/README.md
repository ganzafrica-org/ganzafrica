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

# Security
SESSION_SECRET=your_secure_random_string_at_least_32_chars
PASETO_SECRET=your_secure_random_string_at_least_32_chars
```

### 3. Set up the Database

First, make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE ganzafrica;
```

Then generate and run migrations:

```bash
# Generate migrations based on schema changes
pnpm db:generate

# Apply migrations to the database
pnpm db:migrate
```

### 4. Run the API (Development Mode)

```bash
pnpm dev
```

The API will be available at http://localhost:3001

## Key Features

- **Authentication & Authorization**
    - Secure authentication with PASETO tokens
    - HTTP-only cookies for secure token storage
    - Role-based access control
    - Protection against common security vulnerabilities

- **Database Integration**
    - Type-safe database access with Drizzle ORM
    - Automatic schema migrations
    - Indexing for optimal performance
    - Audit logging

- **API Layer**
    - Type-safe API with tRPC
    - Client can be generated for web and portal apps
    - End-to-end type safety from database to frontend

## API Structure

- `src/config` - Configuration and environment
- `src/db` - Database schema and client
- `src/modules` - Business logic modules
- `src/trpc` - API router and procedures

## Authentication

The API uses PASETO tokens stored in HTTP-only cookies for authentication. This provides:

1. **Security** - Tokens are not accessible to JavaScript, protecting against XSS attacks
2. **Convenience** - Tokens are automatically sent with each request
3. **Performance** - No client-side token management required

### Auth Flow

1. User registers or logs in
2. API issues two tokens:
    - Access token (short-lived)
    - Refresh token (long-lived)
3. Tokens are stored in HTTP-only cookies
4. When the access token expires, client calls `/refresh` endpoint
5. API issues new tokens if refresh token is valid

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
- `pnpm db:push` - Push schema changes directly to database (development only)