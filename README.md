# GanzAfrica Platform

A modern web platform built to support GanzAfrica's mission in land management, agriculture, and environmental initiatives in Rwanda. The platform consists of a public website and an administrative portal built with Next.js 15, DrizzleORM, and shadcn/ui.

## Key Features

- 🌍 Public Website (`/apps/web`)
  - Fellowship program information
  - Impact showcase
  - Project highlights
  - Application process

- 🔐 Admin Portal (`/apps/portal`)
  - Fellow management
  - Application tracking
  - CRM system for:
    - Alumni
    - Applicants
    - Employees
    - Fellows
  - Administrative dashboard

## Tech Stack

- **Framework:** Next.js 15
- **Database:** PostgreSQL with DrizzleORM
- **Authentication:** jwtauth system
- **API:** tRPC with end-to-end type safety
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand & React Query
- **Deployment:**
  - Frontend: Digital Ocean
  - Backend: Digital Ocean
  - Storage: PostgreSQL on DigitalOcean
  - Database: DigitalOcean

## Prerequisites

- Node.js 18+
- pnpm 10+
- PostgreSQL (for local development)

## Project Structure

```
ganzafrica/
├── apps/
│   ├── internal/              # internal platform: hr, crm, hiring etc...
│   ├── web/              # Public website
│   └── portal/           # Admin portal
├── backend/
├── packages/
│   ├── ui/               # Shared UI components
│   ├── eslint-config/    # ESLint configurations
│   └── typescript-config/# TypeScript configurations
└── README.md
```

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/ganzafrica-org/ganzafrica.git
cd ganzafrica
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up your database:

```bash
# Create a PostgreSQL database
createdb ganzafrica

# Configure environment variables in packages/api/.env
DATABASE_URL=postgres://username:password@localhost:5432/ganzafrica


# Generate and run migrations
cd backend
pnpm db:generate
pnpm db:migrate
```

4. Start development server:

For the main website:

```bash
pnpm --filter web dev
```

For the admin portal:

```bash
pnpm --filter portal dev
```

For the backend API (if testing independently):

```bash
cd backend && pnpm run dev
```

Access the applications at:

- Website: http://localhost:3000
- Portal: http://localhost:3001
- Internal: http://localhost:3003
- API: http://localhost:3002

## Development Commands

- `pnpm dev` - Start all applications
- `pnpm build` - Build all applications
- `pnpm lint` - Lint all applications
- `pnpm clean` - Clean build outputs

### Database Commands

- `pnpm db:generate` - Generate new migrations
- `pnpm db:migrate` - Apply migrations to the database

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

ISC

## About GanzAfrica

GanzAfrica is focused on empowering youth through sustainable land management, agriculture, and environmental initiatives in Rwanda. This platform serves as the digital foundation for our fellowship program and community engagement.
