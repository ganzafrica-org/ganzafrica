# Multi-stage build for the `task` Next.js app in the pnpm/turbo monorepo.
# Build context is the repo ROOT (Coolify: base directory "/", dockerfile "/apps/task/Dockerfile").

FROM node:22-alpine AS base
RUN corepack enable
RUN apk add --no-cache libc6-compat

FROM base AS pruner
WORKDIR /app
COPY . .
RUN pnpm dlx turbo@^2 prune task --docker

FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ ./
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ ./
RUN pnpm dlx turbo@^2 run build --filter=task

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3003
ENV HOSTNAME=0.0.0.0
RUN apk add --no-cache curl
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/apps/task/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/task/.next/static ./apps/task/.next/static
USER nextjs
EXPOSE 3003
CMD ["node", "apps/task/server.js"]
