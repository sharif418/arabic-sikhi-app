# Arabic Sikhi — Production Dockerfile
# Multi-stage build for Next.js 16 standalone

# === Stage 1: Dependencies ===
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json bun.lock* ./
COPY prisma ./prisma/

RUN npm install --include=dev --legacy-peer-deps

# === Stage 2: Build ===
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npx prisma generate
RUN npm run build

# === Stage 3: Production ===
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json bun.lock* ./
COPY prisma ./prisma/
RUN npm install --omit=dev --legacy-peer-deps && npx prisma generate

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the app — prisma db push runs first, but doesn't block startup on failure
CMD sh -c "npx prisma db push --accept-data-loss 2>&1 || true; node server.js"
