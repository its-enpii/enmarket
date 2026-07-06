# ───── Stage 1: Install + Build ─────
FROM node:22-alpine AS builder

WORKDIR /app

# Build-time env — NEXT_PUBLIC_* di-bake ke bundle oleh Next.js
ARG NEXT_PUBLIC_API_URL=http://api:8000
ARG NEXT_PUBLIC_SITE_NAME="enpiistudio"
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME

# Copy manifests dulu untuk cache layer
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# Copy source
COPY . .

# Build
RUN npm run build

# ───── Stage 2: Runtime ─────
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy built artifacts + runtime deps
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000

CMD ["npm", "run", "start"]