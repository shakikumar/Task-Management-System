# Deployment Diagram — Task Management System

---

## Development Architecture

```
Developer Machine
+-------------------------------------------------------------------+
|                                                                   |
|  Terminal 1                        Terminal 2                     |
|  +---------------------------+     +---------------------------+  |
|  | cd backend                |     | cd frontend               |  |
|  | npm run dev               |     | npm run dev               |  |
|  | (nodemon server.js)       |     | (vite dev server)         |  |
|  | http://localhost:5001     |     | http://localhost:5173     |  |
|  +---------------------------+     +---------------------------+  |
|           |                                    |                  |
|           | REST API + WebSocket               | Axios + socket.io|
|           |____________________________________| (to :5001)       |
|                                                                   |
+-------------------------------------------------------------------+
           |
           | DATABASE_URL (SSL / TLS)
           | SUPABASE_URL (HTTPS)
           v
+----------------------------------+
|         Supabase Cloud           |
|  +----------------------------+  |
|  | PostgreSQL 16              |  |
|  | (connection pooler / PG    |  |
|  |  Bouncer on :5432)         |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | Supabase Storage           |  |
|  | bucket: attachments        |  |
|  | (public URLs)              |  |
|  +----------------------------+  |
+----------------------------------+

           |
           | SMTP (port 587 / TLS)
           v
+----------------------------------+
|      Gmail SMTP Server           |
|  (or Mailtrap for dev/testing)   |
+----------------------------------+
```

---

## Docker Compose Architecture

```
docker compose up --build
(or --profile local-db for local PostgreSQL)

Host Machine
+--------------------------------------------------------------------+
|                         Docker Network: tms_network (bridge)       |
|                                                                    |
|   +------------------------+    +------------------------------+   |
|   |   tms_frontend         |    |   tms_backend                |   |
|   |   nginx:1.27-alpine    |    |   node:22-alpine             |   |
|   |   EXPOSE 80            |    |   EXPOSE 5000                |   |
|   |   Host: 3000:80        |    |   Host: 5000:5000            |   |
|   |                        |    |                              |   |
|   |  Vite build dist/      |    |  Express + Socket.IO         |   |
|   |  Nginx serves SPA      |    |  Prisma ORM                  |   |
|   |                        |    |  node-cron                   |   |
|   |  /api/* -> backend:5000|    |  Nodemailer                  |   |
|   |  (Docker internal DNS) |    |                              |   |
|   +----------+-------------+    +----------+-------------------+   |
|              |                             |                       |
|              | HTTP proxy /api/*           | (optional profile)    |
|              +-----------------------------+                       |
|                                            |                       |
|                          +-----------------+------------------+    |
|                          |  tms_postgres (profile: local-db) |    |
|                          |  postgres:16-alpine               |    |
|                          |  EXPOSE 5432                      |    |
|                          |  Volume: postgres_data            |    |
|                          +-----------------------------------+    |
|                                                                    |
+--------------------------------------------------------------------+
              |                         |
              | (production: skip db,   | SMTP
              |  use Supabase URL)      v
              v               Gmail/Mailtrap SMTP
   Supabase PostgreSQL
   Supabase Storage
```

---

## Component Descriptions

### Frontend Container (tms_frontend)

- **Base image:** `nginx:1.27-alpine`
- **Build stage:** `node:22-alpine` runs `npm run build` (Vite) producing static assets in `dist/`
- **Runtime stage:** Nginx serves the static `dist/` files
- **Port:** Container 80 → Host 3000
- **Configuration:** `nginx.conf` handles:
  - SPA fallback: all routes → `index.html`
  - `/api/*` proxy → `http://backend:5000` (Docker internal DNS)
  - Gzip compression on JS/CSS/JSON/SVG
  - Security headers: `X-Frame-Options`, `X-XSS-Protection`, `X-Content-Type-Options`, `Referrer-Policy`
  - Static asset caching: 1-year `Cache-Control: public, immutable`

### Backend Container (tms_backend)

- **Base image:** `node:22-alpine`
- **Build stage:** Installs all deps including devDeps for Prisma CLI; runs `npx prisma generate`
- **Runtime stage:** Production deps only; runs as non-root user `appuser`
- **Port:** Container 5000 → Host 5000
- **Health check:** `wget -qO- http://localhost:5000/`
- **Services running in-process:**
  - Express 5 REST API
  - Socket.IO 4 WebSocket server (same HTTP server)
  - node-cron job (daily 09:00 due-date checker)

### Local Database (optional — dev/CI only)

- **Image:** `postgres:16-alpine`
- **Profile:** `local-db` (only starts with `--profile local-db`)
- **Port:** 5432
- **Volume:** `postgres_data` (named volume, persists across restarts)
- **Health check:** `pg_isready`
- **Note:** Production uses Supabase PostgreSQL; this is for local development only

### Supabase (Cloud)

Two separate Supabase services are used:

| Service | Purpose | Access Method |
|---|---|---|
| Supabase PostgreSQL | Primary database | `DATABASE_URL` via `pg.Pool` → Prisma |
| Supabase Storage | File attachment storage | `@supabase/supabase-js` SDK with service role key |

### Email (SMTP)

Nodemailer dispatches transactional emails via SMTP:

| Email Type | Trigger |
|---|---|
| Onboarding | User created via `POST /api/users` or `POST /api/auth/onboard` |
| Task Assignment | Task created or task assigned via `POST /api/tasks` or `PUT /api/tasks/:id/assign` |
| Project Assignment | Project created with explicit `ownerId` different from creator |
| Due Date Reminder | Daily cron at 09:00 for tasks due the next day |

---

## GitHub Actions CI/CD

```
Developer
   |
   | git push (main or member* branch)
   v
GitHub Repository
   |
   v
GitHub Actions (ubuntu-latest runner)
   |
   +--- Job 1: backend-ci -----------------------------------------+
   |    1. Checkout                                                 |
   |    2. Setup Node 22                                            |
   |    3. npm ci (backend)                                         |
   |    4. npx prisma validate                                      |
   |    5. npx prisma generate                                      |
   |    6. Node -e "check Swagger spec"                             |
   |    7. Docker Buildx → build tms-backend:ci-{sha} (no push)    |
   |                                                                |
   +--- Job 2: frontend-ci ----------------------------------------+
   |    1. Checkout                                                 |
   |    2. Setup Node 22                                            |
   |    3. npm ci (frontend)                                        |
   |    4. npm run lint (ESLint)                                    |
   |    5. npm run build (Vite)                                     |
   |    6. Upload dist/ as artifact (7-day retention)              |
   |    7. Docker Buildx → build tms-frontend:ci-{sha} (no push)   |
   |                                                                |
   +--- Job 3: compose-check (needs jobs 1 & 2) -------------------+
   |    1. Checkout                                                 |
   |    2. Write minimal .env                                       |
   |    3. docker compose config --quiet                            |
   |                                                                |
   +--- Job 4: ci-success (gate — needs jobs 1, 2, 3) ------------+
        1. Verify all jobs == success
        2. Fail if any job failed
```

**Concurrency:** In-progress runs for the same ref/PR are cancelled when a new run starts.

**Docker caching:** `cache-from: type=gha` and `cache-to: type=gha,mode=max` use GitHub Actions layer cache for faster Docker builds.

**Images NOT pushed** to a registry in CI — builds are smoke tests only.

---

## Network Topology

```
Internet / Browser
     |
     | HTTPS (production) / HTTP (dev)
     v
+----------------+
| Nginx (port 80)|  <-- Frontend container
| or Vite (:5173)|  <-- Dev server
+----------------+
     |
     | /api/* proxy or direct
     v
+----------------+
| Express (:5000)|  <-- Backend container / dev server (:5001)
| Socket.IO WSS  |
+----------------+
     |
     +---------> Supabase PostgreSQL (DATABASE_URL)
     +---------> Supabase Storage (SUPABASE_URL)
     +---------> SMTP Server (SMTP_HOST:SMTP_PORT)
```

---

## Volume and Data Persistence

| Volume | Contents | When Used |
|---|---|---|
| `postgres_data` (Docker named volume) | Local PostgreSQL data directory | Dev / CI with `--profile local-db` |
| Supabase Storage | Uploaded attachment files | All environments (dev and production) |
| `localStorage` (browser) | JWT token + user object | Frontend client |
