# Multi-stage build for the `portal` Next.js app in the pnpm/turbo monorepo.
# Build context is the repo ROOT (Coolify: base directory "/", dockerfile "/apps/portal/Dockerfile").

FROM node:22-alpine AS base
RUN corepack enable
RUN apk add --no-cache libc6-compat

FROM base AS pruner
WORKDIR /app
COPY . .
RUN pnpm dlx turbo@^2 prune portal --docker

FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ ./
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ ./
RUN pnpm dlx turbo@^2 run build --filter=portal

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
RUN apk add --no-cache curl
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/.next/static ./apps/portal/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/public ./apps/portal/public
USER nextjs
EXPOSE 3001
CMD ["node", "apps/portal/server.js"]
