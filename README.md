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
- **Authentication:** jwt auth system
- **Styling:** Tailwind CSS + shadcn/ui
- **Deployment:**
  - Frontend & Baceknd: digital ocean
  - Storage: Digital Spaces
  - Database: DigitalOcean

## Prerequisites

- Node.js 18+
- pnpm 10+
- PostgreSQL (for local development)

## Project Structure

```
ganzafrica/
├── apps/
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

# Configure environment variables in packages/backend/.env
DATABASE_URL=postgres://username:password@localhost:5432/ganzafrica
SESSION_SECRET=your_secure_random_string_at_least_32_chars

# Generate and run migrations
cd packages/backend
pnpm drizzle-kit generate
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
cd  backend
pnpm run dev
```

Access the applications at:

- Website: http://localhost:3000
- Portal: http://localhost:3001
- API: http://localhost:3002

## Development Commands

- `pnpm dev` - Start all applications
- `pnpm build` - Build all applications
- `pnpm lint` - Lint all applications
- `pnpm clean` - Clean build outputs

### Database Commands

- `pnpm --filter backend db:generate` - Generate new migrations
- `pnpm --filter backend db:migrate` - Apply migrations to the database
- `pnpm --filter backend db:studio` - Launch Drizzle Studio (database UI)
- `pnpm --filter backend db:push` - Push schema changes directly (development only)

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

ISC

## About GanzAfrica

GanzAfrica is focused on empowering youth through sustainable land management, agriculture, and environmental initiatives in Rwanda. This platform serves as the digital foundation for our fellowship program and community engagement.
