# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GanzAfrica Platform is a monorepo containing multiple applications for GanzAfrica's land management and fellowship program in Rwanda. The project uses Next.js 15, DrizzleORM with PostgreSQL, and PASETO-based authentication.

## Architecture

**Monorepo Structure:**
- `apps/web/` - Public website (Next.js) - runs on localhost:3000
- `apps/portal/` - Admin portal (Next.js) - runs on localhost:3001
- `apps/internal/` - Internal platform for HR, CRM, hiring (Next.js) - runs on localhost:3003
- `backend/` - Express.js API with DrizzleORM - runs on localhost:3002
- `packages/ui/` - Shared UI components (shadcn/ui)
- `packages/eslint-config/` - Shared ESLint configs
- `packages/typescript-config/` - Shared TypeScript configs

**Key Technologies:**
- Frontend: Next.js 15, Tailwind CSS, shadcn/ui, Zustand, React Query
- Backend: Express.js, DrizzleORM, PostgreSQL, PASETO authentication
- Package Management: pnpm with workspaces
- Build System: Turborepo
- Database: PostgreSQL with Drizzle migrations
- File Storage: AWS S3 (Digital Ocean Spaces)
- Deployment: Digital Ocean (all components)

## Development Commands

**Root level (uses Turborepo):**
- `pnpm dev` - Start all applications
- `pnpm build` - Build all applications
- `pnpm lint` - Lint all applications
- `pnpm format` - Format code with Prettier

**Backend specific:**
- `cd backend && pnpm run dev` - Start backend dev server
- `cd backend && pnpm build` - Build backend
- `cd backend && pnpm test` - Run backend tests

**Database commands (run from backend directory):**
- `pnpm db:generate` - Generate new migrations
- `pnpm db:migrate` - Apply migrations to database
- `pnpm db:studio` - Open Drizzle Studio for database viewing
- `pnpm db:push` - Push schema changes to database (development only)

**Individual app development:**
- `pnpm --filter web dev` - Website development server
- `pnpm --filter portal dev` - Admin portal development server
- `pnpm --filter internal dev` - Internal platform development server

## Database Setup

Environment variables needed in backend/.env:
```
DATABASE_URL=postgres://username:password@localhost:5432/ganzafrica
```

Database setup process:
1. Create PostgreSQL database: `createdb ganzafrica`
2. Navigate to backend: `cd backend`
3. Generate migrations: `pnpm db:generate`
4. Apply migrations: `pnpm db:migrate`

## Key Patterns

**Authentication:** PASETO-based authentication with HTTP-only cookies
**API Structure:** Express routes in `backend/src/routes/`, controllers in `backend/src/controllers/`
**Database:** DrizzleORM with schema in `backend/src/db/schema/`, migrations in `backend/drizzle/`
**Shared Components:** UI components in `packages/ui/` using shadcn/ui patterns
**File Uploads:** AWS S3-compatible storage with multer and multer-s3

## Package Manager

Uses pnpm with workspaces. Always use `pnpm` instead of npm. Workspace dependencies referenced with `workspace:*` protocol.