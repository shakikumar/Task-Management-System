# Task Management System

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

A full-featured, role-based **Task Management System** built as a university group project.  
Manage projects, tasks, comments, attachments, and notifications — all with JWT-secured REST APIs.

</div>

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started (Local — No Docker)](#getting-started-local--no-docker)
- [Environment Variables](#environment-variables)
- [Docker Setup](#docker-setup)
- [API Documentation (Swagger)](#api-documentation-swagger)
- [CI/CD Pipeline](#cicd-pipeline)
- [Database Schema](#database-schema)
- [User Roles](#user-roles)
- [Team Members](#team-members)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser / Client                      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP
┌──────────────────────────▼──────────────────────────────────┐
│              Frontend  (React + Vite + TailwindCSS)          │
│                      Nginx  :80  →  :3000                    │
│            Proxies  /api/*  →  Backend :5000                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ /api/*
┌──────────────────────────▼──────────────────────────────────┐
│              Backend  (Node.js + Express)  :5000             │
│                                                              │
│  ┌──────────┐   ┌─────────────┐   ┌──────────────────────┐  │
│  │  Routes  │ → │ Controllers │ → │  Prisma ORM Client   │  │
│  └──────────┘   └─────────────┘   └──────────┬───────────┘  │
│                                              │               │
│  ┌──────────────────────────────────────┐    │               │
│  │   JWT Middleware  │  Auth Middleware │    │               │
│  └──────────────────────────────────────┘    │               │
│                                              │               │
│  ┌──────────────────────────────────────┐    │               │
│  │     Swagger UI  /api/docs            │    │               │
│  └──────────────────────────────────────┘    │               │
└─────────────────────────────────────────┬────┘               
                                          │ DATABASE_URL (SSL)
                              ┌───────────▼──────────┐
                              │   Supabase PostgreSQL │
                              │   (cloud-hosted)      │
                              └──────────────────────┘
```

---

## Tech Stack

| Layer          | Technology                          | Version  |
|----------------|-------------------------------------|----------|
| Frontend       | React                               | 19.x     |
| Bundler        | Vite                                | 8.x      |
| CSS            | TailwindCSS                         | 4.x      |
| Backend        | Node.js + Express                   | 20 / 5.x |
| ORM            | Prisma                              | 7.x      |
| Database       | PostgreSQL via Supabase             | 16       |
| Authentication | JWT (`jsonwebtoken` + `bcryptjs`)   | —        |
| API Docs       | Swagger (`swagger-jsdoc` + `swagger-ui-express`) | — |
| Containerisation | Docker + Docker Compose           | —        |
| CI/CD          | GitHub Actions                      | —        |

---

## Project Structure

```
Task-Management-System/
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI pipeline
│
├── backend/
│   ├── config/
│   │   ├── db.js                   # Raw PostgreSQL connection (pg)
│   │   ├── prisma.js               # Prisma client singleton
│   │   └── swagger.js              # Swagger / OpenAPI specification
│   ├── controllers/
│   │   └── authController.js       # Login logic
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT protect + role restrictTo
│   ├── prisma/
│   │   ├── schema.prisma           # Database models & relations
│   │   └── seed.js                 # Database seeder
│   ├── routes/
│   │   └── authRoutes.js           # Auth endpoints (+ Swagger JSDoc)
│   ├── .dockerignore
│   ├── Dockerfile                  # Multi-stage backend image
│   ├── package.json
│   └── server.js                   # Express entry point + Swagger UI mount
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .dockerignore
│   ├── Dockerfile                  # Multi-stage frontend image (Nginx)
│   ├── nginx.conf                  # Nginx SPA + reverse proxy config
│   ├── vite.config.js
│   └── package.json
│
├── .env.example                    # Template for all environment variables
├── docker-compose.yml              # Orchestrates backend + frontend (+ optional DB)
└── README.md
```

---

## Getting Started (Local — No Docker)

### Prerequisites

- Node.js ≥ 20 — [nodejs.org](https://nodejs.org)
- npm ≥ 10
- A **Supabase** project with a PostgreSQL connection string

### 1. Clone the repository

```bash
git clone https://github.com/shakikumar/Task-Management-System.git
cd Task-Management-System
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Open .env and fill in the required values (see table below)
```

### 3. Start the Backend

```bash
cd backend
npm install

# Push the Prisma schema to your Supabase database
npx prisma db push

# (Optional) Seed the database with sample data
node prisma/seed.js

# Start the development server
npm run dev
```

The API will be available at **http://localhost:5000**  
Swagger UI will be available at **http://localhost:5000/api/docs**

### 4. Start the Frontend

```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

The React app will be available at **http://localhost:5173**

---

## Environment Variables

Copy `.env.example` to `.env` in the **root** directory before running locally or with Docker.

| Variable         | Required | Description                                            | Example                                              |
|------------------|----------|--------------------------------------------------------|------------------------------------------------------|
| `PORT`           | No       | Express server port (default `5000`)                   | `5000`                                               |
| `NODE_ENV`       | No       | Runtime environment                                    | `development` / `production`                         |
| `DATABASE_URL`   | ✅ Yes   | Full Supabase PostgreSQL connection string             | `postgresql://user:pass@db.supabase.co:5432/postgres?sslmode=require` |
| `DB_HOST`        | No       | DB host (used by local pg pool only)                   | `localhost`                                          |
| `DB_PORT`        | No       | DB port                                                | `5432`                                               |
| `DB_USER`        | No       | DB username                                            | `tms_user`                                           |
| `DB_PASSWORD`    | No       | DB password                                            | `tms_password`                                       |
| `DB_NAME`        | No       | DB name                                                | `task_manager_db`                                    |
| `JWT_SECRET`     | ✅ Yes   | Secret key for signing JWT tokens (min 32 chars)       | `super-secret-key-change-me`                         |
| `JWT_EXPIRES_IN` | No       | JWT expiry duration                                    | `7d`                                                 |
| `CORS_ORIGIN`    | No       | Allowed CORS origin                                    | `http://localhost:3000`                              |
| `SMTP_HOST`      | No       | Email SMTP host (for notifications)                    | `smtp.mailtrap.io`                                   |
| `SMTP_PORT`      | No       | Email SMTP port                                        | `2525`                                               |
| `SMTP_USER`      | No       | SMTP username                                          | `your_smtp_username`                                 |
| `SMTP_PASSWORD`  | No       | SMTP password                                          | `your_smtp_password`                                 |

> **Security tip:** Never commit a real `.env` file. It is listed in `.gitignore`.

---

## Docker Setup

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose v2)

### Quick Start — Production Mode (Supabase database)

```bash
# 1. Configure your .env (DATABASE_URL must point to Supabase)
cp .env.example .env

# 2. Build images and start all services
docker compose up --build

# Services:
#   Frontend  →  http://localhost:3000
#   Backend   →  http://localhost:5000
#   Swagger   →  http://localhost:5000/api/docs
```

### With Local PostgreSQL (Dev / Testing)

```bash
# Starts an extra local postgres container alongside backend + frontend
docker compose --profile local-db up --build
```

### Individual Image Builds

```bash
# Backend only
docker build -t tms-backend ./backend

# Frontend only
docker build -t tms-frontend ./frontend
```

### Useful Docker Commands

```bash
# View running containers
docker compose ps

# Stream logs from all services
docker compose logs -f

# Stream logs from one service
docker compose logs -f backend

# Stop everything
docker compose down

# Stop and remove volumes (wipes local DB data)
docker compose down -v

# Rebuild a single service
docker compose up --build backend
```

### Docker Architecture

```
docker-compose.yml
├── frontend  (port 3000:80)
│     └── Nginx serves React SPA
│           /api/* → proxied to backend:5000
│
├── backend   (port 5000:5000)
│     └── Node.js Express API
│           → Prisma → Supabase PostgreSQL
│
└── db        (port 5432:5432)  ← only with --profile local-db
      └── postgres:16-alpine
```

---

## API Documentation (Swagger)

Interactive API documentation is automatically generated from JSDoc comments in the route files.

| URL | Description |
|-----|-------------|
| `http://localhost:5000/api/docs` | Swagger UI (interactive) |
| `http://localhost:5000/api/docs.json` | Raw OpenAPI 3.0 JSON spec |

### How to Use

1. Start the backend server.
2. Open **http://localhost:5000/api/docs** in your browser.
3. Click **POST /api/auth/login**, then **Try it out**.
4. Enter credentials and execute — copy the returned `token`.
5. Click the **Authorize 🔒** button at the top and paste the token.
6. All subsequent requests will include the `Authorization: Bearer <token>` header automatically.

### Adding Swagger docs to new routes

Add JSDoc annotations directly above your route definition:

```js
/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for the current user
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get('/', protect, getAllTasks);
```

---

## CI/CD Pipeline

The GitHub Actions workflow at [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs automatically on every push and pull request to `main`.

### Pipeline Jobs

```
Push / PR to main
       │
       ├─── backend-ci ──────────────────────────────────────────┐
       │     1. Install dependencies (npm ci)                    │
       │     2. Validate Prisma schema                           │
       │     3. Generate Prisma client                           │
       │     4. Validate Swagger spec                            │
       │     5. Build backend Docker image                       │
       │                                                         │
       ├─── frontend-ci ─────────────────────────────────────────┤
       │     1. Install dependencies (npm ci)                    │
       │     2. ESLint check                                     │
       │     3. Vite production build                            │
       │     4. Upload dist/ artifact                            │
       │     5. Build frontend Docker image                      │
       │                                                         │
       └─── compose-check ◄── (needs both above) ───────────────┘
             1. Generate minimal .env
             2. docker compose config --quiet
                    │
                    └─── ci-success ◄── (status gate for branch protection)
```

### Branch Protection Setup (recommended)

In your GitHub repository → **Settings → Branches → Add rule** for `main`:

- ✅ Require status checks to pass: **`✅ All CI checks passed`**
- ✅ Require branches to be up to date before merging
- ✅ Require pull request reviews before merging

---

## Database Schema

The Prisma schema defines 6 models connected through foreign key relations:

```
User ──────────── owns ──────────► Project
  │                                    │
  │                                    │ contains
  │                                    ▼
  └──── assigned to ───────────► Task
                                    │
                          ┌─────────┼─────────┐
                          ▼         ▼         ▼
                       Comment  Attachment  Notification
```

| Model          | Key Fields                                              |
|----------------|---------------------------------------------------------|
| `User`         | `id`, `name`, `email`, `password`, `role`, `isActive`  |
| `Project`      | `id`, `name`, `description`, `createdById`             |
| `Task`         | `id`, `title`, `status`, `priority`, `dueDate`, `assignedUserId` |
| `Comment`      | `id`, `content`, `taskId`, `userId`                    |
| `Attachment`   | `id`, `fileName`, `fileUrl`, `taskId`, `userId`        |
| `Notification` | `id`, `message`, `isRead`, `userId`                    |

---

## User Roles

| Role              | Permissions                                              |
|-------------------|----------------------------------------------------------|
| `ADMINISTRATOR`   | Full system access — manage users, projects, tasks       |
| `PROJECT_MANAGER` | Create and manage projects and tasks                     |
| `COLLABORATOR`    | View and update tasks assigned to them                   |

Role is enforced by the `restrictTo(...roles)` middleware in [`authMiddleware.js`](backend/middleware/authMiddleware.js).

---

## Team Members

| Member   | Responsibilities                                                     |
|----------|----------------------------------------------------------------------|
| Member A | Database schema design, User management (Admin panel)                |
| Member B | Project management features                                          |
| Member C | Task management features                                             |
| Member D | Comments, Attachments, Notifications                                 |
| **Member E** | **Swagger docs, Docker, docker-compose, GitHub Actions CI, README** |

---

<div align="center">

</div>