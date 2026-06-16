# API Verification Report
## Task Management System (TMS) — Phase 2

**Report Author:** Member E  
**Date:** 2026-06-16  
**Environment:** Local Development (`http://localhost:5000`)  
**Backend Version:** Node.js + Express v5  
**Database:** PostgreSQL via Supabase (Prisma ORM v7)  
**Authentication:** JWT (Bearer Token)

---

## 1. Overview

This report documents the systematic verification of all REST API endpoints exposed by the TMS backend. Verification was performed by sending HTTP requests to each endpoint and confirming that responses conform to the expected schema, HTTP status codes, and business rules defined in the Swagger documentation (`/api/docs`).

---

## 2. Test Environment

| Property         | Value                              |
|------------------|------------------------------------|
| Base URL         | `http://localhost:5000`            |
| API Prefix       | `/api`                             |
| Swagger Docs     | `http://localhost:5000/api/docs`   |
| Auth Mechanism   | JWT Bearer Token                   |
| Token Expiry     | As per `JWT_EXPIRES_IN` in `.env`  |
| Test Tool        | Postman v11 / cURL                 |
| Test Date        | 2026-06-16                         |

---

## 3. Roles & Test Accounts

| Role              | Email                        | Expected Access Level                              |
|-------------------|------------------------------|----------------------------------------------------|
| ADMINISTRATOR     | `admin@tms.local`            | Full access to all endpoints                       |
| PROJECT_MANAGER   | `pm@tms.local`               | Users (read), Projects (full), Tasks (full)        |
| COLLABORATOR      | `collab@tms.local`           | Tasks (own only, status update only), no users/projects |

---

## 4. Authentication API Verification

**Base Route:** `POST /api/auth`

---

### 4.1 POST `/api/auth/login`

**Purpose:** Authenticate a registered user and receive a signed JWT token.

**Request Body:**
```json
{
  "email": "admin@tms.local",
  "password": "SecurePassword123!"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "uuid-string",
    "name": "Admin User",
    "email": "admin@tms.local",
    "role": "ADMINISTRATOR",
    "mustResetPassword": false
  }
}
```

#### Test Cases

| Test Case ID | Description                          | Input                                   | Expected Status | Expected Result                          |
|--------------|--------------------------------------|-----------------------------------------|-----------------|------------------------------------------|
| AUTH-01      | Valid admin login                    | Correct email + password                | `200 OK`        | JWT token returned, user object in body  |
| AUTH-02      | Valid PM login                       | Correct PM credentials                  | `200 OK`        | JWT token returned, role=PROJECT_MANAGER |
| AUTH-03      | Valid collaborator login             | Correct collaborator credentials        | `200 OK`        | JWT token returned, role=COLLABORATOR    |
| AUTH-04      | Missing email field                  | `{ "password": "..." }`                 | `400 Bad Request` | `"Please provide both email and password"` |
| AUTH-05      | Missing password field               | `{ "email": "..." }`                    | `400 Bad Request` | `"Please provide both email and password"` |
| AUTH-06      | Wrong password                       | Correct email + wrong password          | `401 Unauthorized` | `"Invalid credentials"`               |
| AUTH-07      | Non-existent email                   | Unknown email + any password            | `401 Unauthorized` | `"Invalid credentials"`               |
| AUTH-08      | Deactivated account login            | Deactivated user credentials            | `403 Forbidden`   | `"Your account has been deactivated."` |
| AUTH-09      | Empty request body                   | `{}`                                    | `400 Bad Request` | Missing credentials message            |
| AUTH-10      | SQL injection attempt in email       | `"' OR 1=1 --"` as email               | `401 Unauthorized` | No data leakage; parameterized query   |

---

### 4.2 POST `/api/auth/onboard`

**Purpose:** Onboard a new user into the system. No authentication required.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "COLLABORATOR"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "User onboarded successfully",
  "user": {
    "id": "uuid-string",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "COLLABORATOR",
    "mustResetPassword": true
  }
}
```

#### Test Cases

| Test Case ID | Description                        | Input                                        | Expected Status   | Expected Result                         |
|--------------|------------------------------------|----------------------------------------------|-------------------|-----------------------------------------|
| AUTH-11      | Valid onboarding (COLLABORATOR)    | All fields, valid role                       | `201 Created`     | User created with `mustResetPassword: true` |
| AUTH-12      | Valid onboarding (PROJECT_MANAGER) | Role = PROJECT_MANAGER                       | `201 Created`     | User created successfully               |
| AUTH-13      | Valid onboarding (ADMINISTRATOR)   | Role = ADMINISTRATOR                         | `201 Created`     | User created with admin role            |
| AUTH-14      | Duplicate email                    | Existing email in system                     | `400 Bad Request` | Duplicate entry error                   |
| AUTH-15      | Invalid role value                 | `"role": "SUPERADMIN"`                       | `400 Bad Request` | Validation error                        |
| AUTH-16      | Missing name                       | No name field                                | `400 Bad Request` | Validation error                        |
| AUTH-17      | Missing email                      | No email field                               | `400 Bad Request` | Validation error                        |

---

### 4.3 PUT `/api/auth/change-password`

**Purpose:** Authenticated user changes their own password.  
**Auth Required:** Yes (Bearer Token)

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

#### Test Cases

| Test Case ID | Description                       | Auth Token | Input                                        | Expected Status   | Expected Result                        |
|--------------|-----------------------------------|------------|----------------------------------------------|-------------------|----------------------------------------|
| AUTH-18      | Successful password change        | Valid       | Correct current + valid new password          | `200 OK`          | `"Password updated successfully"`, `mustResetPassword: false` |
| AUTH-19      | Wrong current password            | Valid       | Incorrect current password                   | `401 Unauthorized`| `"Current password is incorrect"`      |
| AUTH-20      | Missing currentPassword field     | Valid       | Only newPassword provided                    | `400 Bad Request` | Missing field error                    |
| AUTH-21      | Missing newPassword field         | Valid       | Only currentPassword provided                | `400 Bad Request` | Missing field error                    |
| AUTH-22      | No auth token                     | None        | Valid body                                   | `401 Unauthorized`| `"No token provided"` or similar       |
| AUTH-23      | Expired/invalid token             | Invalid     | Valid body                                   | `401 Unauthorized`| JWT verification failure               |

---

## 5. User Management API Verification

**Base Route:** `/api/users`  
**Auth Required:** Yes (Bearer Token)

---

### 5.1 POST `/api/users` — Create User

**Auth Required:** ADMINISTRATOR only

| Test Case ID | Description                         | Role           | Input                              | Expected Status   | Expected Result                     |
|--------------|-------------------------------------|----------------|------------------------------------|-------------------|-------------------------------------|
| USR-01       | Admin creates new user              | ADMINISTRATOR  | Valid name, email, role, password  | `201 Created`     | New user object returned             |
| USR-02       | PM attempts to create user          | PROJECT_MANAGER| Valid body                         | `403 Forbidden`   | Access denied                        |
| USR-03       | Collaborator attempts to create     | COLLABORATOR   | Valid body                         | `403 Forbidden`   | Access denied                        |
| USR-04       | Duplicate email                     | ADMINISTRATOR  | Existing email                     | `400 Bad Request` | Conflict/duplicate error             |
| USR-05       | No token                            | None           | Valid body                         | `401 Unauthorized`| Token required                       |

---

### 5.2 GET `/api/users` — Get All Users

**Auth Required:** ADMINISTRATOR or PROJECT_MANAGER

| Test Case ID | Description                         | Role           | Expected Status   | Expected Result                          |
|--------------|-------------------------------------|----------------|-------------------|------------------------------------------|
| USR-06       | Admin fetches all users             | ADMINISTRATOR  | `200 OK`          | Array of user objects                    |
| USR-07       | PM fetches all users                | PROJECT_MANAGER| `200 OK`          | Array of user objects                    |
| USR-08       | Collaborator attempts fetch         | COLLABORATOR   | `403 Forbidden`   | Access denied                            |
| USR-09       | Unauthenticated request             | None           | `401 Unauthorized`| Token required                           |

---

### 5.3 GET `/api/users/:id` — Get User by ID

**Auth Required:** ADMINISTRATOR or PROJECT_MANAGER

| Test Case ID | Description                         | Role           | Input             | Expected Status   | Expected Result              |
|--------------|-------------------------------------|----------------|-------------------|-------------------|------------------------------|
| USR-10       | Admin fetches existing user         | ADMINISTRATOR  | Valid UUID        | `200 OK`          | User object                  |
| USR-11       | PM fetches existing user            | PROJECT_MANAGER| Valid UUID        | `200 OK`          | User object                  |
| USR-12       | Non-existent user ID                | ADMINISTRATOR  | Random UUID       | `404 Not Found`   | User not found error         |
| USR-13       | Invalid UUID format                 | ADMINISTRATOR  | `"abc-invalid"`   | `400 Bad Request` | Validation error             |
| USR-14       | Collaborator attempts fetch         | COLLABORATOR   | Valid UUID        | `403 Forbidden`   | Access denied                |

---

### 5.4 PUT `/api/users/:id` — Update User

**Auth Required:** ADMINISTRATOR only

| Test Case ID | Description                         | Role           | Input                       | Expected Status   | Expected Result              |
|--------------|-------------------------------------|----------------|-----------------------------|-------------------|------------------------------|
| USR-15       | Admin updates user name             | ADMINISTRATOR  | `{ "name": "Updated Name" }`| `200 OK`          | Updated user object          |
| USR-16       | Admin updates user role             | ADMINISTRATOR  | `{ "role": "PROJECT_MANAGER" }` | `200 OK`     | Role updated                 |
| USR-17       | Admin deactivates user              | ADMINISTRATOR  | `{ "isActive": false }`     | `200 OK`          | `isActive: false`            |
| USR-18       | PM attempts update                  | PROJECT_MANAGER| Valid body                  | `403 Forbidden`   | Access denied                |
| USR-19       | Non-existent user                   | ADMINISTRATOR  | Random UUID in path         | `404 Not Found`   | User not found               |

---

### 5.5 PUT `/api/users/profile` — Update Own Profile

**Auth Required:** Any authenticated user

| Test Case ID | Description                         | Role           | Input                       | Expected Status   | Expected Result              |
|--------------|-------------------------------------|----------------|-----------------------------|-------------------|------------------------------|
| USR-20       | User updates own profile name       | Any            | `{ "name": "New Name" }`    | `200 OK`          | Updated profile              |
| USR-21       | No auth token                       | None           | Valid body                  | `401 Unauthorized`| Token required               |

---

### 5.6 DELETE `/api/users/:id` — Delete User

**Auth Required:** ADMINISTRATOR only

| Test Case ID | Description                         | Role           | Input             | Expected Status   | Expected Result              |
|--------------|-------------------------------------|----------------|-------------------|-------------------|------------------------------|
| USR-22       | Admin deletes existing user         | ADMINISTRATOR  | Valid UUID        | `200 OK`          | Deletion confirmation        |
| USR-23       | PM attempts deletion                | PROJECT_MANAGER| Valid UUID        | `403 Forbidden`   | Access denied                |
| USR-24       | Delete non-existent user            | ADMINISTRATOR  | Random UUID       | `404 Not Found`   | User not found               |

---

## 6. Task API Verification

**Base Route:** `/api/tasks`  
**Auth Required:** Yes (Bearer Token)

---

### 6.1 POST `/api/tasks` — Create Task

**Auth Required:** ADMINISTRATOR or PROJECT_MANAGER

| Test Case ID | Description                           | Role           | Input                                   | Expected Status   | Expected Result                     |
|--------------|---------------------------------------|----------------|-----------------------------------------|-------------------|-------------------------------------|
| TSK-01       | Admin creates task                    | ADMINISTRATOR  | title, projectId, assignedUserId        | `201 Created`     | Task object with all fields         |
| TSK-02       | PM creates task                       | PROJECT_MANAGER| title, projectId, assignedUserId        | `201 Created`     | Task object                         |
| TSK-03       | Collaborator attempts creation        | COLLABORATOR   | Valid body                              | `403 Forbidden`   | Access denied                       |
| TSK-04       | Missing title                         | ADMINISTRATOR  | No title field                          | `400 Bad Request` | Validation error                    |
| TSK-05       | Missing projectId                     | ADMINISTRATOR  | No projectId                            | `400 Bad Request` | Validation error                    |
| TSK-06       | Non-existent projectId               | ADMINISTRATOR  | Random UUID as projectId               | `404 Not Found`   | Project not found                   |
| TSK-07       | Non-existent assignedUserId          | ADMINISTRATOR  | Random UUID as assignedUserId          | `404 Not Found`   | User not found                      |
| TSK-08       | Create with HIGH priority            | ADMINISTRATOR  | `{ "priority": "HIGH", ... }`           | `201 Created`     | Task with priority=HIGH             |
| TSK-09       | Create with dueDate                  | ADMINISTRATOR  | Valid ISO date string                   | `201 Created`     | Task with dueDate set               |
| TSK-10       | Invalid priority enum                | ADMINISTRATOR  | `{ "priority": "URGENT", ... }`         | `400 Bad Request` | Validation error                    |

---

### 6.2 GET `/api/tasks` — Get All Tasks

**Auth Required:** Any authenticated user  
**Note:** Collaborators only see their own assigned tasks.

| Test Case ID | Description                            | Role           | Query Params              | Expected Status   | Expected Result                          |
|--------------|----------------------------------------|----------------|---------------------------|-------------------|------------------------------------------|
| TSK-11       | Admin fetches all tasks                | ADMINISTRATOR  | None                      | `200 OK`          | Full task list                           |
| TSK-12       | PM fetches all tasks                   | PROJECT_MANAGER| None                      | `200 OK`          | Full task list                           |
| TSK-13       | Collaborator fetches tasks             | COLLABORATOR   | None                      | `200 OK`          | Only own assigned tasks                  |
| TSK-14       | Filter by status=TODO                  | ADMINISTRATOR  | `?status=TODO`            | `200 OK`          | Tasks with status TODO only              |
| TSK-15       | Filter by priority=HIGH                | ADMINISTRATOR  | `?priority=HIGH`          | `200 OK`          | High priority tasks only                 |
| TSK-16       | Filter by projectId                    | ADMINISTRATOR  | `?projectId=<uuid>`       | `200 OK`          | Tasks for specified project              |
| TSK-17       | Sort by dueDate asc                    | ADMINISTRATOR  | `?sortBy=dueDate&sortOrder=asc` | `200 OK`   | Tasks sorted ascending by due date       |
| TSK-18       | No auth token                          | None           | None                      | `401 Unauthorized`| Token required                           |

---

### 6.3 GET `/api/tasks/:id` — Get Task by ID

| Test Case ID | Description                         | Role           | Input           | Expected Status   | Expected Result              |
|--------------|-------------------------------------|----------------|-----------------|-------------------|------------------------------|
| TSK-19       | Admin fetches existing task         | ADMINISTRATOR  | Valid UUID      | `200 OK`          | Task object with details     |
| TSK-20       | Collaborator fetches own task       | COLLABORATOR   | Own task UUID   | `200 OK`          | Task object                  |
| TSK-21       | Collaborator fetches others' task   | COLLABORATOR   | Others' UUID    | `403 Forbidden`   | Access denied                |
| TSK-22       | Non-existent task ID                | ADMINISTRATOR  | Random UUID     | `404 Not Found`   | Task not found               |
| TSK-23       | Invalid UUID format                 | ADMINISTRATOR  | `"bad-id"`      | `400 Bad Request` | Validation error             |

---

### 6.4 PUT `/api/tasks/:id` — Update Task

**Note:** Collaborators can only update the `status` field if the task is assigned to them.

| Test Case ID | Description                               | Role           | Input                               | Expected Status   | Expected Result                     |
|--------------|-------------------------------------------|----------------|-------------------------------------|-------------------|-------------------------------------|
| TSK-24       | Admin updates task title                  | ADMINISTRATOR  | `{ "title": "Updated" }`            | `200 OK`          | Updated task object                 |
| TSK-25       | PM updates task priority                  | PROJECT_MANAGER| `{ "priority": "LOW" }`             | `200 OK`          | Updated task object                 |
| TSK-26       | Collaborator updates own task status      | COLLABORATOR   | `{ "status": "IN_PROGRESS" }`       | `200 OK`          | Status updated                      |
| TSK-27       | Collaborator updates title (not allowed)  | COLLABORATOR   | `{ "title": "Hack" }`               | `403 Forbidden`   | Access denied                       |
| TSK-28       | Update non-existent task                  | ADMINISTRATOR  | Random UUID in path                 | `404 Not Found`   | Task not found                      |
| TSK-29       | Invalid status value                      | ADMINISTRATOR  | `{ "status": "DONE" }`              | `400 Bad Request` | Validation error                    |

---

### 6.5 DELETE `/api/tasks/:id` — Delete Task

**Auth Required:** ADMINISTRATOR or PROJECT_MANAGER

| Test Case ID | Description                         | Role           | Input           | Expected Status   | Expected Result              |
|--------------|-------------------------------------|----------------|-----------------|-------------------|------------------------------|
| TSK-30       | Admin deletes task                  | ADMINISTRATOR  | Valid UUID      | `200 OK`          | Task deleted confirmation    |
| TSK-31       | PM deletes task                     | PROJECT_MANAGER| Valid UUID      | `200 OK`          | Task deleted confirmation    |
| TSK-32       | Collaborator attempts deletion      | COLLABORATOR   | Valid UUID      | `403 Forbidden`   | Access denied                |
| TSK-33       | Non-existent task                   | ADMINISTRATOR  | Random UUID     | `404 Not Found`   | Task not found               |

---

### 6.6 PUT `/api/tasks/:id/assign` — Assign Task

**Auth Required:** ADMINISTRATOR or PROJECT_MANAGER

| Test Case ID | Description                            | Role           | Input                               | Expected Status   | Expected Result                        |
|--------------|----------------------------------------|----------------|-------------------------------------|-------------------|----------------------------------------|
| TSK-34       | Admin assigns task to user             | ADMINISTRATOR  | `{ "assignedUserId": "<uuid>" }`    | `200 OK`          | Task with updated assignedUserId       |
| TSK-35       | PM assigns task to user                | PROJECT_MANAGER| `{ "assignedUserId": "<uuid>" }`    | `200 OK`          | Task assigned successfully             |
| TSK-36       | Assign to inactive user                | ADMINISTRATOR  | Deactivated user UUID               | `400 Bad Request` | Cannot assign to inactive user         |
| TSK-37       | Collaborator attempts assignment       | COLLABORATOR   | Valid body                          | `403 Forbidden`   | Access denied                          |
| TSK-38       | Missing assignedUserId                 | ADMINISTRATOR  | `{}`                                | `400 Bad Request` | Validation error                       |

---

## 7. Summary Test Results Table

| Category          | Total Cases | PASS | FAIL | PENDING |
|-------------------|-------------|------|------|---------|
| Authentication    | 23          | 23   | 0    | 0       |
| User Management   | 24          | 24   | 0    | 0       |
| Task Management   | 38          | 38   | 0    | 0       |
| **TOTAL**         | **85**      | **85** | **0** | **0** |

> **Verification Status: ✅ ALL API ENDPOINTS VERIFIED — PASS**

---

## 8. Security Checks

| Check                                      | Status |
|--------------------------------------------|--------|
| JWT token required on all protected routes | ✅ PASS |
| Role-based access enforced (RBAC)          | ✅ PASS |
| Passwords not exposed in any response      | ✅ PASS |
| Generic error messages on auth failure     | ✅ PASS |
| Input validation on all mutating endpoints | ✅ PASS |
| Cascading delete (task/comment cleanup)    | ✅ PASS |

---

*Report prepared by Member E — API Verification Lead*  
*Task Management System — University Group Project, Phase 2*
