# Arabic Sikhi — Production Dockerfile
# Multi-stage build for Next.js 16 standalone

# === Stage 1: Dependencies ===
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
COPY prisma ./prisma/

# Install dependencies using npm (Coolify compatibility)
RUN npm install --legacy-peer-deps

# === Stage 2: Build ===
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# === Stage 3: Production ===
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install only production dependencies
COPY package.json bun.lock* ./
COPY prisma ./prisma/
RUN npm install --omit=dev --legacy-peer-deps && npx prisma generate

# Copy built app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy prisma files for migrations
COPY prisma ./prisma

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run migrations and start the app
CMD npx prisma db push --accept-data-loss && node server.js
