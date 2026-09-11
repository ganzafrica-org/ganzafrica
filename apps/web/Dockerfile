# Multi-stage build for the `web` Next.js app in the pnpm/turbo monorepo.
# Build context is the repo ROOT (Coolify: base directory "/", dockerfile "/apps/web/Dockerfile").

FROM node:22-alpine AS base
RUN corepack enable
# libc compat for some native deps
RUN apk add --no-cache libc6-compat

# 1. Prune the monorepo to just what `web` needs.
FROM base AS pruner
WORKDIR /app
COPY . .
RUN pnpm dlx turbo@^2 prune web --docker

# 2. Install pruned deps and build.
FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ ./
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ ./
RUN pnpm dlx turbo@^2 run build --filter=web

# 3. Runtime — Next standalone output only.
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN apk add --no-cache curl
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
