# Multi-stage build for the `internal` Next.js app in the pnpm/turbo monorepo.
# Build context is the repo ROOT (Coolify: base directory "/", dockerfile "/apps/internal/Dockerfile").

FROM node:22-alpine AS base
RUN corepack enable
RUN apk add --no-cache libc6-compat

FROM base AS pruner
WORKDIR /app
COPY . .
RUN pnpm dlx turbo@^2 prune internal --docker

FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ ./
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ ./
RUN pnpm dlx turbo@^2 run build --filter=internal

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3005
ENV HOSTNAME=0.0.0.0
RUN apk add --no-cache curl
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/apps/internal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/internal/.next/static ./apps/internal/.next/static
USER nextjs
EXPOSE 3005
CMD ["node", "apps/internal/server.js"]
