# Multi-stage build for the Express backend in the pnpm/turbo monorepo.
# Build context is the repo ROOT (Coolify: base directory "/", dockerfile "/backend/Dockerfile").

FROM node:22-alpine AS base
RUN corepack enable
RUN apk add --no-cache libc6-compat

# 1. Prune the monorepo to just what the backend needs.
FROM base AS pruner
WORKDIR /app
COPY . .
RUN pnpm dlx turbo@^2 prune ganzafrica-backend --docker

# 2. Install and compile (tsc -> dist).
FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ ./
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ ./
RUN pnpm --filter ganzafrica-backend build

# 3. Runtime — dist + prod deps + migrations + payslip assets.
FROM base AS runner
WORKDIR /app/backend
ENV NODE_ENV=production
RUN apk add --no-cache curl
COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/drizzle ./drizzle
COPY --from=builder /app/backend/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/backend/public ./public
EXPOSE 3002
# Apply pending migrations, then start. (drizzle-kit is a dependency in the image.)
CMD ["sh", "-c", "npx drizzle-kit migrate && node dist/server.js"]
