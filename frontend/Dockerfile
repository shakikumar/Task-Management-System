# ============================================================
# Frontend Dockerfile — Task Management System
# Multi-stage build:
#   Stage 1 (builder): Vite builds the optimised static bundle
#   Stage 2 (runner):  Nginx serves the bundle — tiny final image
# ============================================================

# ── Stage 1: Builder ────────────────────────────────────────
FROM node:20-alpine AS builder

LABEL maintainer="TMS Team"
LABEL description="Task Management System — React Frontend"

WORKDIR /app

# Copy manifests first so Docker caches the npm install layer
COPY package.json package-lock.json ./

# Install all dependencies (Vite, React, etc.)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the production bundle — outputs to /app/dist
RUN npm run build

# ── Stage 2: Runner ─────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove the default Nginx static assets and configuration
RUN rm -rf /usr/share/nginx/html/*

# Copy our Vite build output into the Nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration that:
#   - Serves the SPA correctly (all 404s → index.html for client-side routing)
#   - Enables gzip compression
#   - Forwards /api/* requests to the backend container
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx listens on port 80 inside the container
EXPOSE 80

# Health-check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
