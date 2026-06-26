# Task Management System (TMS)

A production-ready, full-stack Task Management System built with **Node.js + Express**, **Prisma ORM**, **Supabase PostgreSQL**, **React + Vite**, and **Socket.IO**. The platform supports role-based access control, real-time notifications, file attachments via Supabase Storage, automated email delivery, and a daily due-date reminder cron job.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Docker](#docker)
- [Swagger API Documentation](#swagger-api-documentation)
- [Authentication](#authentication)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Socket.IO Real-Time Notifications](#socketio-real-time-notifications)
- [Deployment](#deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [License](#license)

---

## Project Overview

TMS is a collaborative platform that allows teams to manage projects, track tasks, attach files, and communicate via comments — all in real time. Administrators manage users; Project Managers own projects and tasks; Collaborators view and update their assigned work.

---

## Features

| Feature | Description |
|---|---|
| **JWT Authentication** | Stateless Bearer-token login with configurable expiry |
| **Role-Based Access Control** | Three roles: `ADMINISTRATOR`, `PROJECT_MANAGER`, `COLLABORATOR` |
| **User Management** | Create, read, update, deactivate, and delete users (Admin only) |
| **Forced Password Reset** | New accounts must change their temporary password on first login |
| **Project Management** | CRUD projects with status tracking and progress calculation |
| **Task Management** | CRUD tasks with filtering, sorting, pagination, and search |
| **Task Assignment** | Assign tasks to users; inactive users cannot be assigned |
| **Task Comments** | Project Managers and Collaborators can comment on tasks |
| **File Attachments** | Upload PDF/PNG/JPG files (5 MB max) to Supabase Storage |
| **Real-Time Notifications** | Socket.IO push notifications for task assignment, comments, and uploads |
| **Email Notifications** | Onboarding, task assignment, project assignment, and due-date reminder emails |
| **Due-Date Cron Job** | Daily 09:00 cron sends reminders for tasks due the following day |
| **XSS Protection** | All incoming string request body fields sanitized with `xss` |
| **Helmet Security** | HTTP security headers via `helmet` |
| **Input Validation** | `express-validator` chains on task create/update/assign routes |
| **Swagger UI** | Interactive OpenAPI 3.0 documentation at `/api/docs` |
| **Docker** | Multi-stage Dockerfiles for backend (Node 22) and frontend (Nginx) |
| **GitHub Actions CI** | Automated lint, build, Prisma validate, and Docker build on every push |

---

## Technology Stack

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 |
| Framework | Express 5 |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Database | PostgreSQL 16 (Supabase cloud) |
| Authentication | JSON Web Tokens (`jsonwebtoken`) |
| Password Hashing | `bcryptjs` |
| File Storage | Supabase Storage SDK |
| File Uploads | Multer (memory storage) |
| Real-Time | Socket.IO 4 |
| Email | Nodemailer (SMTP / Gmail) |
| Scheduler | node-cron |
| Validation | express-validator |
| Security | Helmet, `xss` |
| API Docs | swagger-jsdoc + swagger-ui-express |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router DOM 7 |
| HTTP Client | Axios |
| Real-Time | socket.io-client 4 |
| Icons | Lucide React |
| Styling | Tailwind CSS 4 |
| Web Server | Nginx 1.27 (production container) |

### Infrastructure

| Component | Technology |
|---|---|
| Containerization | Docker (multi-stage builds) |
| Orchestration | Docker Compose v2 |
| CI/CD | GitHub Actions |
| Cloud Database | Supabase PostgreSQL |
| File Storage | Supabase Storage |

---

## Architecture Overview

```
+-----------------------------------------------------+
|                   CLIENT BROWSER                    |
|           React 19 + Vite SPA (port 5173)           |
|  Axios HTTP requests   socket.io-client WebSocket   |
+-------------------+---------------------+-----------+
                    |                     |
        REST API    |                     | WebSocket
                    v                     v
+-----------------------------------------------------+
|           BACKEND  Node.js / Express 5              |
|                      port 5001                      |
|                                                     |
|  Routes -> Middleware -> Controllers                |
|            (protect,    authController              |
|             restrictTo  userMgmtController          |
|             sanitize    projectController           |
|             upload)     taskController              |
|                         commentController           |
|                         attachmentController        |
|                         notificationController      |
|                                                     |
|  socketServer           Services                    |
|  (Socket.IO rooms)      taskService                 |
|                         mailerService               |
|                                                     |
|  jobs/dueDateChecker (node-cron daily 09:00)        |
+---------------------------------------------+-------+
                                              |
               +------------------------------+
               |                              |
               v                              v
+------------------------+   +------------------------+
|  Supabase PostgreSQL   |   |   Supabase Storage     |
|  (Prisma ORM)          |   |   (File Attachments)   |
+------------------------+   +------------------------+
```

---

## Folder Structure

```
Task-Management-System/
|-- .env.example
|-- .gitignore
|-- docker-compose.yml
|-- package.json
|-- .github/
|   `-- workflows/
|       `-- ci.yml
|-- backend/
|   |-- Dockerfile
|   |-- .env
|   |-- server.js
|   |-- package.json
|   |-- config/
|   |   |-- db.js
|   |   |-- prisma.js
|   |   |-- supabase.js
|   |   `-- swagger.js
|   |-- controllers/
|   |   |-- authController.js
|   |   |-- userController.js
|   |   |-- userManagementController.js
|   |   |-- projectController.js
|   |   |-- taskController.js
|   |   |-- commentController.js
|   |   |-- attachmentController.js
|   |   `-- notificationController.js
|   |-- middleware/
|   |   |-- authMiddleware.js
|   |   |-- securityMiddleware.js
|   |   `-- uploadMiddleware.js
|   |-- routes/
|   |   |-- authRoutes.js
|   |   |-- userRoutes.js
|   |   |-- projectRoutes.js
|   |   |-- taskRoutes.js
|   |   |-- commentRoutes.js
|   |   |-- attachmentRoutes.js
|   |   `-- notificationRoutes.js
|   |-- services/
|   |   |-- taskService.js
|   |   `-- mailerService.js
|   |-- validators/
|   |   `-- taskValidator.js
|   |-- sockets/
|   |   `-- socketServer.js
|   |-- jobs/
|   |   `-- dueDateChecker.js
|   `-- prisma/
|       |-- schema.prisma
|       `-- seed.js
`-- frontend/
    |-- Dockerfile
    |-- nginx.conf
    |-- index.html
    |-- vite.config.js
    |-- package.json
    `-- src/
        |-- main.jsx
        |-- App.jsx
        |-- layouts/
        |   |-- AdminLayout.jsx
        |   `-- DashboardLayout.jsx
        |-- pages/
        |   |-- Login.jsx
        |   |-- AdminDashboard.jsx
        |   |-- Projects.jsx
        |   |-- Users.jsx
        |   |-- Tasks.jsx
        |   |-- Profile.jsx
        |   |-- ProfileSettings.jsx
        |   |-- ChangePassword.jsx
        |   `-- Settings.jsx
        |-- components/
        |   |-- Navbar.jsx
        |   |-- Sidebar.jsx
        |   |-- TaskDetailsModal.jsx
        |   `-- FileDropZone.jsx
        |-- services/
        |   |-- socket.js
        |   `-- notificationService.js
        |-- constants/
        |   `-- layout.js
        `-- assets/
            |-- hero.png
            `-- logo.png
```

---

## Installation

### Prerequisites

- Node.js 22+
- npm 10+
- A Supabase project (PostgreSQL + Storage bucket named `attachments`)
- SMTP credentials (Gmail App Password or Mailtrap)

### Backend Setup

```bash
cd backend
npm install
cp ../.env.example .env
# Fill in all values — see Environment Variables section
npx prisma generate
npx prisma db push
node prisma/seed.js   # optional
```

### Frontend Setup

```bash
cd frontend
npm install
```

---

## Environment Variables

All variables are set in `backend/.env`. The root `.env.example` is the template.

| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend server port | `5001` |
| `NODE_ENV` | Runtime environment | `development` |
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://...` |
| `DB_HOST` | Raw pg host | `localhost` |
| `DB_PORT` | Raw pg port | `5432` |
| `DB_USER` | Raw pg user | `your_db_user` |
| `DB_PASSWORD` | Raw pg password | `your_db_password` |
| `DB_NAME` | Database name | `task_manager_db` |
| `DB_POOL_MAX` | Max pg pool connections | `5` |
| `JWT_SECRET` | JWT signing secret | `mysupersecretkey` |
| `JWT_EXPIRES_IN` | JWT expiry | `24h` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `SMTP_HOST` | SMTP hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP sender address | `you@gmail.com` |
| `SMTP_PASS` | SMTP App Password | `your_app_password` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anon key | `eyJ...` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJ...` |
| `SUPABASE_BUCKET` | Supabase Storage bucket | `attachments` |

---

## Running the Project

### Development (Local)

**Backend:**

```bash
cd backend
npm run dev
```

API: `http://localhost:5001`
Swagger: `http://localhost:5001/api/docs`

**Frontend:**

```bash
cd frontend
npm run dev
```

SPA: `http://localhost:5173`

---

## Docker

### Docker Compose

The `docker-compose.yml` defines three services:

| Service | Image | Port |
|---|---|---|
| `backend` | Node 22 Alpine | `5000` |
| `frontend` | Nginx 1.27 Alpine | `3000` |
| `db` (optional profile) | PostgreSQL 16 Alpine | `5432` |

```bash
# Production (Supabase DB — no local DB):
docker compose up --build

# Development with local PostgreSQL:
docker compose --profile local-db up --build
```

The frontend Nginx container proxies `/api/*` requests to the backend container using Docker internal DNS (`http://backend:5000`).

---

## Swagger API Documentation

- **UI:** `http://localhost:5001/api/docs`
- **Raw JSON:** `http://localhost:5001/api/docs.json`

Authentication in Swagger:
1. Call `POST /api/auth/login` to get a token.
2. Click **Authorize** and enter the token.
3. All protected requests will include `Authorization: Bearer <token>`.

---

## Authentication

1. Client sends `POST /api/auth/login` with `{ email, password }`.
2. Server verifies against bcrypt-hashed password.
3. Checks `isActive` — deactivated accounts are rejected (403).
4. Returns signed JWT `{ userId, role }` with configurable expiry (default `24h`).
5. Client stores token in `localStorage` and attaches it as `Authorization: Bearer <token>`.
6. `protect` middleware verifies the token and populates `req.user` on every protected route.
7. Accounts with `mustResetPassword: true` must call `PUT /api/auth/change-password` first.

**Password Policy (change-password):**
- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 digit, 1 special character (`!@#$%^&*`)

---

## Role-Based Access Control (RBAC)

| Role | Key Capabilities |
|---|---|
| `ADMINISTRATOR` | Full user management; read all projects/users; cannot create projects, tasks, or comments |
| `PROJECT_MANAGER` | Create/update/delete own projects and tasks; comment on tasks |
| `COLLABORATOR` | View own assigned tasks only; update task `status` only; comment on assigned tasks |

Isolation rules (enforced in service layer):
- COLLABORATORs only see tasks assigned to them
- PROJECT_MANAGERs only see tasks in their own projects
- COLLABORATORs can only update the `status` field
- Comments can only be deleted by the original author
- Attachments can be deleted by owner, ADMINISTRATOR, or PROJECT_MANAGER

---

## Socket.IO Real-Time Notifications

**Backend Events:**

| Event | Direction | Description |
|---|---|---|
| `join` | Client to Server | Client sends `userId` to join its private room |
| `newNotification` | Server to Client | Pushed to user room when a notification is created |
| `disconnect` | Client to Server | Logged on disconnect |

**Notification Triggers:**

| Action | Recipient |
|---|---|
| Task created or assigned | Assigned user |
| Task status updated | Assigned user |
| Comment by COLLABORATOR | Project creator |
| Comment by PROJECT_MANAGER | Task assignee |
| File attachment uploaded | Task assignee |
| Due-date reminder (daily cron) | Task assignee |

---

## Deployment

1. Set up Supabase PostgreSQL and Storage (`attachments` bucket).
2. Configure SMTP credentials.
3. Build and push Docker images to a container registry.
4. Deploy backend (port 5000) and frontend (port 80) containers to your platform.
5. Set all environment variables on the platform.
6. Run `npx prisma db push` to sync the schema.

---

## CI/CD Pipeline

File: `.github/workflows/ci.yml`

Triggers: push to `main`, any `member*` branch, and pull requests to `main`.

| Job | Steps |
|---|---|
| `backend-ci` | Checkout, install, Prisma validate, Prisma generate, Swagger spec check, Docker build |
| `frontend-ci` | Checkout, install, ESLint, Vite build, upload dist artifact, Docker build |
| `compose-check` | Validate `docker-compose.yml` syntax |
| `ci-success` | Gate — fails if any prior job failed |

Images are built but not pushed (CI smoke-test only).

---

## License

MIT License.
