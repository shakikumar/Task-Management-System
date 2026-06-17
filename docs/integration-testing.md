# Integration Testing Report
## Task Management System (TMS) — Phase 2

**Report Author:** Member E  
**Date:** 2026-06-16  
**Scope:** End-to-End Integration Validation across Frontend → Backend → Database  
**Environment:** Local Development  
**Frontend:** React (Vite) on `http://localhost:5173`  
**Backend:** Node.js/Express on `http://localhost:5000`  
**Database:** PostgreSQL via Supabase (Prisma ORM)

---

## 1. Integration Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                  FRONTEND (React + Bootstrap)          │
│              http://localhost:5173                     │
│  Pages: Login, Dashboard, Users, Tasks, Projects      │
│         Profile, Settings, ChangePassword             │
└────────────────────────┬─────────────────────────────┘
                         │  HTTP/REST (CORS enabled)
                         │  Authorization: Bearer <JWT>
                         ▼
┌──────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express v5)        │
│              http://localhost:5000                     │
│  Routes: /api/auth, /api/users, /api/projects,        │
│          /api/tasks, /api/docs                         │
│  Middleware: JWT protect, restrictTo (RBAC)           │
└────────────────────────┬─────────────────────────────┘
                         │  Prisma Client
                         │  (connection pooling via pg)
                         ▼
┌──────────────────────────────────────────────────────┐
│          DATABASE (PostgreSQL on Supabase)            │
│  Tables: User, Project, Task, Comment,                │
│          Attachment, Notification                     │
└──────────────────────────────────────────────────────┘
```

---

## 2. Test Scope

| Integration Layer              | Description                                                |
|--------------------------------|------------------------------------------------------------|
| Frontend → Backend             | React components send HTTP requests; verify correct API calls |
| Backend → Database             | Prisma ORM correctly reads/writes to PostgreSQL            |
| Authentication Flow            | JWT issuance, verification, and role enforcement           |
| Data Flow Validation           | Data transformations and response consistency              |
| CORS & Network Layer           | Cross-origin requests allowed correctly                    |
| Error Propagation              | Errors in DB/ORM surfaced correctly to frontend            |

---

## 3. Frontend → Backend Integration

### 3.1 Login Flow

**Component:** `src/pages/Login.jsx`  
**API Call:** `POST /api/auth/login`  
**CORS Origin:** `http://localhost:5173` (configured in `server.js`)

#### Test Cases

| Test ID   | Description                              | Action                                          | Expected Outcome                              | Status |
|-----------|------------------------------------------|-------------------------------------------------|-----------------------------------------------|--------|
| INT-FE-01 | Login form submits to correct endpoint   | Submit form with valid credentials              | `POST /api/auth/login` called; 200 response   | ✅ PASS |
| INT-FE-02 | JWT token stored on successful login     | Valid login submitted                           | Token saved to localStorage/sessionStorage    | ✅ PASS |
| INT-FE-03 | User redirected after login              | Login succeeds                                  | Navigates to `/admin` dashboard               | ✅ PASS |
| INT-FE-04 | Error shown on invalid credentials       | Wrong password submitted                        | Error message displayed in UI                 | ✅ PASS |
| INT-FE-05 | Token attached to subsequent requests    | Navigate to protected page                      | `Authorization: Bearer <token>` header present| ✅ PASS |
| INT-FE-06 | `mustResetPassword` redirect            | Login with account requiring reset              | Redirected to `/admin/change-password`        | ✅ PASS |

---

### 3.2 Users Page

**Component:** `src/pages/Users.jsx`  
**API Calls:** `GET /api/users`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`

| Test ID   | Description                              | Action                                          | Expected Outcome                              | Status |
|-----------|------------------------------------------|-------------------------------------------------|-----------------------------------------------|--------|
| INT-FE-07 | Users list loads on page mount           | Navigate to `/admin/users`                      | `GET /api/users` called; list renders         | ✅ PASS |
| INT-FE-08 | Create user form submits correctly       | Fill form and click Create                      | `POST /api/users` with correct body           | ✅ PASS |
| INT-FE-09 | Edit user updates form pre-populated     | Click Edit on a user row                        | Form pre-filled with existing data            | ✅ PASS |
| INT-FE-10 | Delete user triggers confirmation        | Click Delete on a user row                      | Confirmation dialog shown before deletion     | ✅ PASS |
| INT-FE-11 | 403 handled gracefully for PM/Collab     | PM accesses admin-only features                 | Error displayed; action blocked               | ✅ PASS |

---

### 3.3 Tasks Page

**Component:** `src/pages/Tasks.jsx`  
**API Calls:** `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`

| Test ID   | Description                              | Action                                          | Expected Outcome                              | Status |
|-----------|------------------------------------------|-------------------------------------------------|-----------------------------------------------|--------|
| INT-FE-12 | Tasks list loads on page mount           | Navigate to `/admin/tasks`                      | `GET /api/tasks` called; tasks rendered       | ✅ PASS |
| INT-FE-13 | Create task submits all required fields  | Fill task form and submit                       | `POST /api/tasks` with title, projectId, assignedUserId | ✅ PASS |
| INT-FE-14 | Collaborator task list is filtered       | Login as Collaborator, view tasks               | Only own assigned tasks visible               | ✅ PASS |
| INT-FE-15 | Status update dropdown for collaborator  | Collaborator changes task status                | `PUT /api/tasks/:id` with only status field   | ✅ PASS |
| INT-FE-16 | Task filters applied via query params    | Apply status/priority filter in UI             | API called with `?status=TODO&priority=HIGH`  | ✅ PASS |

---

### 3.4 Projects Page

**Component:** `src/pages/Projects.jsx`  
**API Calls:** `GET /api/projects`, `POST /api/projects`, `PUT /api/projects/:id`, `DELETE /api/projects/:id`

| Test ID   | Description                              | Action                                          | Expected Outcome                              | Status |
|-----------|------------------------------------------|-------------------------------------------------|-----------------------------------------------|--------|
| INT-FE-17 | Projects list loads on page mount        | Navigate to `/admin/projects`                   | `GET /api/projects` returns project list      | ✅ PASS |
| INT-FE-18 | Create project form works                | Fill and submit project form                    | `POST /api/projects` with name, description   | ✅ PASS |
| INT-FE-19 | Project task sub-list fetches correctly  | Expand project details                          | `GET /api/projects/:id/tasks` returns tasks   | ✅ PASS |

---

### 3.5 CORS Integration

| Test ID   | Description                                  | Expected Outcome                                    | Status |
|-----------|----------------------------------------------|-----------------------------------------------------|--------|
| INT-FE-20 | Preflight OPTIONS request accepted           | `Access-Control-Allow-Origin: http://localhost:5173` | ✅ PASS |
| INT-FE-21 | Credentials flag works correctly             | `credentials: true` in CORS + fetch/axios           | ✅ PASS |
| INT-FE-22 | Blocked origin rejected                      | Request from unauthorized origin returns CORS error | ✅ PASS |

---

## 4. Backend → Database Integration

### 4.1 Prisma ORM Connectivity

| Test ID    | Description                              | Verification Method                          | Expected Outcome                           | Status |
|------------|------------------------------------------|----------------------------------------------|--------------------------------------------|--------|
| INT-DB-01  | Prisma client connects to Supabase DB    | Server starts without Prisma error           | No connection error in logs                | ✅ PASS |
| INT-DB-02  | Schema applied to database               | `npx prisma db push` executed                | All tables created: User, Task, Project... | ✅ PASS |
| INT-DB-03  | Seed data populates correctly            | `node prisma/seed.js` runs                   | Seed users and projects present in DB      | ✅ PASS |
| INT-DB-04  | UUID generation on record creation       | Create a User/Task/Project via API           | `id` field is a valid UUID v4              | ✅ PASS |
| INT-DB-05  | `createdAt` / `updatedAt` auto-populated | Create and update a record                   | Timestamps reflect correct server time     | ✅ PASS |

---

### 4.2 User Model Integration

| Test ID    | Description                              | DB Operation                 | Expected Outcome                           | Status |
|------------|------------------------------------------|------------------------------|--------------------------------------------|--------|
| INT-DB-06  | Create user writes to `User` table       | `prisma.user.create()`       | Row present in DB; `mustResetPassword=true`| ✅ PASS |
| INT-DB-07  | Find user by email (login)               | `prisma.user.findUnique()`   | Correct user row returned                  | ✅ PASS |
| INT-DB-08  | Update user fields                       | `prisma.user.update()`       | Changed fields reflect in DB               | ✅ PASS |
| INT-DB-09  | Delete user cascades correctly           | `prisma.user.delete()`       | Associated comments/attachments deleted    | ✅ PASS |
| INT-DB-10  | Email uniqueness constraint enforced     | Insert duplicate email       | DB throws unique constraint error          | ✅ PASS |
| INT-DB-11  | isActive default = true                  | Create user                  | `isActive: true` in record                 | ✅ PASS |

---

### 4.3 Task Model Integration

| Test ID    | Description                              | DB Operation                   | Expected Outcome                              | Status |
|------------|------------------------------------------|--------------------------------|-----------------------------------------------|--------|
| INT-DB-12  | Create task writes to `Task` table       | `prisma.task.create()`         | Row in Task table with correct FK references  | ✅ PASS |
| INT-DB-13  | Task linked to Project FK                | Create task with projectId     | `projectId` references valid Project row      | ✅ PASS |
| INT-DB-14  | Task linked to User FK                   | Create task with assignedUserId| `assignedUserId` references valid User row    | ✅ PASS |
| INT-DB-15  | Task status defaults to TODO             | Create task without status     | `status: "TODO"` in DB                        | ✅ PASS |
| INT-DB-16  | Task priority defaults to MEDIUM         | Create task without priority   | `priority: "MEDIUM"` in DB                    | ✅ PASS |
| INT-DB-17  | Delete project cascades to tasks         | Delete project                 | All linked tasks deleted (onDelete: Cascade)  | ✅ PASS |
| INT-DB-18  | DB index on projectId                    | Query tasks by projectId       | Indexed lookup; fast response                 | ✅ PASS |
| INT-DB-19  | DB index on assignedUserId               | Query tasks by user            | Indexed lookup; fast response                 | ✅ PASS |

---

### 4.4 Project Model Integration

| Test ID    | Description                              | DB Operation                   | Expected Outcome                          | Status |
|------------|------------------------------------------|--------------------------------|-------------------------------------------|--------|
| INT-DB-20  | Create project stores createdById        | `prisma.project.create()`      | `createdById` = requesting user's ID      | ✅ PASS |
| INT-DB-21  | Project status defaults to PLANNING      | Create project                 | `status: "PLANNING"` in DB               | ✅ PASS |
| INT-DB-22  | Delete project cascades tasks            | `prisma.project.delete()`      | Child tasks removed from DB              | ✅ PASS |

---

## 5. Authentication Flow Integration

### 5.1 End-to-End JWT Flow

```
User → Login Form → POST /api/auth/login
                         │
                    authController.login()
                         │
                    prisma.user.findUnique() ← PostgreSQL
                         │
                    bcrypt.compare(password, hash)
                         │
                    jwt.sign({ userId, role })
                         │
                    Response: { token, user }
                         │
                    Frontend: localStorage.setItem('token')
                         │
                    Subsequent Requests: Authorization: Bearer <token>
                         │
                    authMiddleware.protect()
                         │
                    jwt.verify(token, JWT_SECRET)
                         │
                    req.user = { id, role }
```

| Test ID    | Description                              | Expected Outcome                              | Status |
|------------|------------------------------------------|-----------------------------------------------|--------|
| INT-AUTH-01| Login returns valid JWT                  | Token decodes to correct `{ userId, role }`   | ✅ PASS |
| INT-AUTH-02| JWT_SECRET from `.env` used for signing  | Token fails on different secret               | ✅ PASS |
| INT-AUTH-03| Token expiry respected                   | Expired token returns 401                     | ✅ PASS |
| INT-AUTH-04| `protect` middleware decodes token       | `req.user` populated with id and role         | ✅ PASS |
| INT-AUTH-05| `restrictTo` enforces RBAC              | Wrong role returns 403                        | ✅ PASS |
| INT-AUTH-06| Deactivated user blocked                 | `isActive: false` → 403 on login             | ✅ PASS |
| INT-AUTH-07| `mustResetPassword` flag carried in JWT  | Frontend reads flag, redirects to password change | ✅ PASS |
| INT-AUTH-08| Tampered token rejected                  | Modified JWT → 401 Unauthorized               | ✅ PASS |

---

## 6. Data Flow Validation

### 6.1 Request → Controller → DB → Response

| Test ID    | Scenario                                    | Data In                         | DB Operation          | Data Out                              | Status |
|------------|---------------------------------------------|---------------------------------|-----------------------|---------------------------------------|--------|
| INT-DF-01  | Create task end-to-end                      | `{ title, projectId, assignedUserId }` | `prisma.task.create()` | Task object with all fields     | ✅ PASS |
| INT-DF-02  | Login returns user without password hash    | Credentials                     | `findUnique()`        | User object without `password` field  | ✅ PASS |
| INT-DF-03  | Task list filtered by role (Collaborator)   | JWT with COLLABORATOR role      | `findMany()` with where | Only own tasks                     | ✅ PASS |
| INT-DF-04  | Sorting params passed to Prisma query       | `?sortBy=dueDate&sortOrder=asc` | `orderBy: { dueDate: 'asc' }` | Sorted response             | ✅ PASS |
| INT-DF-05  | Password hashed before storage              | Plain text password             | `bcrypt.hash()`       | Only hash stored in DB               | ✅ PASS |
| INT-DF-06  | `mustResetPassword` set to false on change  | Change password success         | `prisma.user.update()`| `mustResetPassword: false` in DB     | ✅ PASS |
| INT-DF-07  | New user from onboard gets temp password    | Onboard request                 | `prisma.user.create()`| `mustResetPassword: true`            | ✅ PASS |

---

## 7. Error Propagation Integration

| Test ID    | Error Scenario                             | Origin          | Propagates To        | Expected Frontend Response              | Status |
|------------|--------------------------------------------|-----------------|----------------------|-----------------------------------------|--------|
| INT-ERR-01 | DB connection failure                      | Supabase/pg     | Prisma → Controller  | 500 Internal Server Error in UI         | ✅ PASS |
| INT-ERR-02 | Prisma unique constraint violation         | PostgreSQL      | Controller → Route   | 400 with meaningful message             | ✅ PASS |
| INT-ERR-03 | Foreign key violation (invalid projectId)  | PostgreSQL      | Controller → Client  | 404 Project not found                   | ✅ PASS |
| INT-ERR-04 | JWT secret mismatch                        | authMiddleware  | Client               | 401 Unauthorized                        | ✅ PASS |
| INT-ERR-05 | Express validation error (express-validator)| Validator      | handleValidationErrors | 400 with error array                  | ✅ PASS |

---

## 8. Integration Test Results Summary

### ✅ PASS Section

| Integration Area              | Tests | Passed |
|-------------------------------|-------|--------|
| Frontend → Backend (HTTP/CORS)| 22    | 22     |
| Backend → Database (Prisma)   | 22    | 22     |
| Authentication Flow           | 8     | 8      |
| Data Flow Validation          | 7     | 7      |
| Error Propagation             | 5     | 5      |
| **TOTAL**                     | **64**| **64** |

### ❌ FAIL Section

No failures identified during integration testing of the production-deployed components.

> **Note:** The following areas are marked as **PENDING** pending full system load:
> - Real-time notifications (Notification model defined but WebSocket not yet implemented)
> - File attachment upload flow (Attachment model defined; file storage integration pending)

---

## 9. Recommendations

1. **Environment Variables:** Ensure `.env` is never committed to version control; verify `.gitignore` covers `backend/.env`.
2. **CORS Hardening:** For production, restrict `origin` to deployed frontend URL only.
3. **Connection Pooling:** Confirm `pg` pool settings are appropriate for Supabase's connection limits.
4. **Input Sanitization:** Confirm `express-validator` is applied consistently across all mutating endpoints.
5. **Cascade Delete Testing:** Verify orphan records are not left behind when parent entities are deleted.

---

*Report prepared by Member E — Integration Testing Lead*  
*Task Management System — University Group Project, Phase 2*
