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
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand
- **Deployment:**
    - Frontend: Cloudflare Pages
    - Backend: Cloudflare Workers
    - Storage: Cloudflare R2
    - Database: DigitalOcean

## Prerequisites

- Node.js 18+
- pnpm 10+
- PostgreSQL (for local development)

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

3. Start development server:

For the main website:
```bash
pnpm --filter web dev
```

For the admin portal:
```bash
pnpm --filter portal dev
```

Access the applications at:
- Website: http://localhost:3000
- Portal: http://localhost:3001

## Project Structure

```
ganzafrica/
├── apps/
│   ├── web/              # Public website
│   └── portal/           # Admin portal
└── packages/
    ├── database/         # Database schema & migrations
    ├── ui/               # Shared UI components
    ├── eslint-config/    # ESLint configurations
    ├── typescript-config/# TypeScript configurations
    └── hooks/            # Shared React hooks
```

## Development Commands

- `pnpm dev` - Start all applications
- `pnpm build` - Build all applications
- `pnpm lint` - Lint all applications
- `pnpm clean` - Clean build outputs

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## Environment Setup

Create a `.env` file in each app directory (web and portal):

```env
# Database (coming soon)
DATABASE_URL=

# Cloudflare (coming soon)
CF_ACCOUNT_ID=
CF_API_TOKEN=
```

## License

ISC

## About GanzAfrica

GanzAfrica is focused on empowering youth through sustainable land management, agriculture, and environmental initiatives in Rwanda. This platform serves as the digital foundation for our fellowship program and community engagement.