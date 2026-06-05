# ============================================================
# Backend Dockerfile — Task Management System
# Multi-stage build: keeps the final image lean (~150 MB)
# Stage 1 (builder): installs all deps and generates Prisma client
# Stage 2 (runner):  copies only production artefacts
# ============================================================

# ── Stage 1: Builder ────────────────────────────────────────
FROM node:20-alpine AS builder

LABEL maintainer="TMS Team"
LABEL description="Task Management System — Backend API"

# Install OS packages needed by Prisma's query engine (OpenSSL, etc.)
RUN apk add --no-cache openssl

WORKDIR /app

# Copy manifests first so Docker can cache the npm install layer
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDeps for Prisma CLI)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Generate the Prisma client for the target platform
RUN npx prisma generate

# ── Stage 2: Runner ─────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy manifests and install PRODUCTION dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy generated Prisma client and application source from builder
COPY --from=builder /app/node_modules/.prisma  ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma  ./node_modules/@prisma
COPY --from=builder /app/config               ./config
COPY --from=builder /app/controllers          ./controllers
COPY --from=builder /app/middleware           ./middleware
COPY --from=builder /app/routes               ./routes
COPY --from=builder /app/prisma               ./prisma
COPY --from=builder /app/server.js            ./server.js

# Transfer ownership to the non-root user
RUN chown -R appuser:appgroup /app
USER appuser

# The port the Express server listens on (must match PORT env var)
EXPOSE 5000

# Health-check so Docker / orchestrators know when the container is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/ || exit 1

# Start the server
CMD ["node", "server.js"]
