# API Documentation — Task Management System

**Base URL (Development):** `http://localhost:5001`
**OpenAPI Version:** 3.0.0
**Interactive Docs:** `http://localhost:5001/api/docs`

All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Projects](#projects)
- [Tasks](#tasks)
- [Comments](#comments)
- [Attachments](#attachments)
- [Notifications](#notifications)
- [Common Response Schemas](#common-response-schemas)

---

## Authentication

### POST /api/auth/login

Authenticate a user and receive a JWT token.

**Authentication required:** No

**Request Body:**
```json
{
  "email": "admin@tms.local",
  "password": "SecurePassword123!"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | User email address |
| `password` | string | Yes | User password |

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Alice Admin",
    "email": "admin@tms.local",
    "role": "ADMINISTRATOR",
    "mustResetPassword": false
  }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 400 | Missing email or password |
| 401 | Invalid credentials |
| 403 | Account deactivated |
| 500 | Server error |

---

### POST /api/auth/onboard

Onboard a new user (creates account with temporary password). Does not require authentication.

**Authentication required:** No

**Request Body:**
```json
{
  "name": "Test User",
  "email": "testuser@gmail.com",
  "role": "COLLABORATOR"
}
```

| Field | Type | Required | Values |
|---|---|---|---|
| `name` | string | Yes | Any string |
| `email` | string | Yes | Valid email |
| `role` | string | Yes | `ADMINISTRATOR`, `PROJECT_MANAGER`, `COLLABORATOR` |

**Success Response — 201 Created:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": { "id": "uuid", "name": "Test User", "email": "testuser@gmail.com", "role": "COLLABORATOR" }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 400 | Missing required fields or invalid email/role |
| 409 | Email already exists |
| 500 | Server error |

---

### PUT /api/auth/change-password

Change the authenticated user's password. Required for accounts with `mustResetPassword: true`.

**Authentication required:** Yes (any role)

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456@"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `currentPassword` | string | Yes | Current password for verification |
| `newPassword` | string | Yes | Must meet password policy (8+ chars, upper, lower, digit, special) |

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 400 | Missing fields; new password same as old; policy violation |
| 401 | Current password incorrect |
| 404 | User not found |
| 500 | Server error |

---

## Users

### POST /api/users

Create a new user account. Administrator only.

**Authentication required:** Yes — `ADMINISTRATOR`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "PROJECT_MANAGER"
}
```

| Field | Type | Required | Values |
|---|---|---|---|
| `name` | string | Yes | Any string |
| `email` | string | Yes | Valid email |
| `role` | string | No | `ADMINISTRATOR`, `PROJECT_MANAGER`, `COLLABORATOR` (default: `COLLABORATOR`) |

**Success Response — 201 Created:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "PROJECT_MANAGER",
    "mustResetPassword": true,
    "isActive": true,
    "createdAt": "2026-06-01T00:00:00.000Z"
  }
}
```

A temporary password is auto-generated and sent to the user via onboarding email.

**Error Responses:**

| Status | Condition |
|---|---|
| 400 | Missing name/email or invalid email/role |
| 401 | No token |
| 403 | Not ADMINISTRATOR |
| 409 | Email already exists |
| 500 | Server error |

---

### GET /api/users

Retrieve all users.

**Authentication required:** Yes — `ADMINISTRATOR` or `PROJECT_MANAGER`

**Success Response — 200 OK:**
```json
{
  "success": true,
  "count": 3,
  "users": [
    {
      "id": "uuid",
      "name": "Alice Admin",
      "email": "alice@tms.local",
      "role": "ADMINISTRATOR",
      "isActive": true,
      "mustResetPassword": false,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-06-01T00:00:00.000Z",
      "assignedProjects": 0,
      "lastActive": "2026-06-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /api/users/:id

Retrieve a single user by ID.

**Authentication required:** Yes — `ADMINISTRATOR` or `PROJECT_MANAGER`

**Path Parameter:** `id` — User UUID

**Success Response — 200 OK:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "PROJECT_MANAGER",
    "isActive": true,
    "mustResetPassword": false,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-06-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 401 | No token |
| 403 | Insufficient role |
| 404 | User not found |

---

### PUT /api/users/profile

Update the authenticated user's own profile (name and email).

**Authentication required:** Yes (any role)

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "name": "Updated Name",
    "email": "newemail@example.com",
    "role": "COLLABORATOR"
  }
}
```

---

### PUT /api/users/:id

Update a user by ID. Administrator only.

**Authentication required:** Yes — `ADMINISTRATOR`

**Path Parameter:** `id` — User UUID

**Request Body (all fields optional):**
```json
{
  "name": "New Name",
  "email": "new@example.com",
  "role": "COLLABORATOR",
  "isActive": false,
  "password": "NewTemp123!"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | No | Updated name |
| `email` | string | No | Updated email (must be unique) |
| `role` | string | No | `ADMINISTRATOR`, `PROJECT_MANAGER`, `COLLABORATOR` |
| `isActive` | boolean | No | Activate or deactivate account |
| `password` | string | No | New password (min 6 chars; sets mustResetPassword: true) |

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": { ... }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 400 | Invalid email format or password too short |
| 401 | No token |
| 403 | Not ADMINISTRATOR |
| 404 | User not found |
| 409 | Email in use by another user |

---

### DELETE /api/users/:id

Delete a user permanently. Administrator only. Cannot delete own account.

**Authentication required:** Yes — `ADMINISTRATOR`

**Path Parameter:** `id` — User UUID

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 400 | Attempting to delete own account |
| 401 | No token |
| 403 | Not ADMINISTRATOR |
| 404 | User not found |

---

## Projects

### POST /api/projects

Create a new project. Only `PROJECT_MANAGER` can create projects.

**Authentication required:** Yes — `ADMINISTRATOR` or `PROJECT_MANAGER` (enforced: only PROJECT_MANAGER)

**Request Body:**
```json
{
  "name": "Website Redesign",
  "description": "Revamp the company website",
  "status": "PLANNING",
  "ownerId": "optional-pm-uuid"
}
```

| Field | Type | Required | Values |
|---|---|---|---|
| `name` | string | Yes | Min 3 characters |
| `description` | string | No | Optional description |
| `status` | string | No | `PLANNING`, `IN_PROGRESS`, `ACTIVE`, `COMPLETED` (default: `PLANNING`) |
| `ownerId` | string (UUID) | No | Override project owner (triggers project assignment email) |

**Success Response — 201 Created:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "project": {
    "id": "uuid",
    "name": "Website Redesign",
    "description": "Revamp the company website",
    "status": "PLANNING",
    "createdById": "uuid",
    "createdAt": "2026-06-01T00:00:00.000Z",
    "updatedAt": "2026-06-01T00:00:00.000Z",
    "createdBy": {
      "id": "uuid",
      "name": "PM Name",
      "email": "pm@example.com",
      "role": "PROJECT_MANAGER"
    }
  }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 400 | Name missing or less than 3 chars |
| 401 | No token |
| 403 | Not PROJECT_MANAGER |
| 500 | Server error |

---

### GET /api/projects

Retrieve all projects.

**Authentication required:** Yes — `ADMINISTRATOR` or `PROJECT_MANAGER`

**Isolation:** PROJECT_MANAGERs only see projects they created. ADMINISTRATORs see all.

**Success Response — 200 OK:**
```json
{
  "success": true,
  "count": 2,
  "projects": [
    {
      "id": "uuid",
      "name": "Website Redesign",
      "description": "...",
      "status": "IN_PROGRESS",
      "createdAt": "2026-06-01T00:00:00.000Z",
      "updatedAt": "2026-06-01T00:00:00.000Z",
      "createdBy": { "id": "uuid", "name": "PM Name", "email": "pm@example.com", "role": "PROJECT_MANAGER" },
      "tasks": [ ... ],
      "totalTasks": 5,
      "completedTasks": 2,
      "progress": 40,
      "membersCount": 3
    }
  ]
}
```

---

### GET /api/projects/:id

Retrieve a single project with its tasks.

**Authentication required:** Yes — `ADMINISTRATOR` or `PROJECT_MANAGER`

**Path Parameter:** `id` — Project UUID

**Success Response — 200 OK:**
```json
{
  "success": true,
  "project": {
    "id": "uuid",
    "name": "Website Redesign",
    "description": "...",
    "status": "PLANNING",
    "createdById": "uuid",
    "createdAt": "...",
    "updatedAt": "...",
    "createdBy": { "id": "uuid", "name": "PM", "email": "pm@example.com", "role": "PROJECT_MANAGER" },
    "tasks": [
      {
        "id": "uuid",
        "title": "Design homepage",
        "status": "TODO",
        "priority": "HIGH",
        "dueDate": "2026-07-01T00:00:00.000Z",
        "assignedUser": { "id": "uuid", "name": "Collaborator", "email": "collab@example.com" }
      }
    ],
    "_count": { "tasks": 3 }
  }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 404 | Project not found |

---

### PUT /api/projects/:id

Update a project. PROJECT_MANAGERs can only update their own projects. Only PROJECT_MANAGER can change project `status`.

**Authentication required:** Yes — `ADMINISTRATOR` or `PROJECT_MANAGER`

**Path Parameter:** `id` — Project UUID

**Request Body (all fields optional):**
```json
{
  "name": "New Name",
  "description": "Updated description",
  "status": "IN_PROGRESS"
}
```

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "project": { ... }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 400 | Empty name or name too short |
| 403 | PM updating another PM's project; or non-PM changing status |
| 404 | Project not found |

---

### DELETE /api/projects/:id

Delete a project and all its tasks (cascade). Only PROJECT_MANAGER can delete. Can only delete own projects.

**Authentication required:** Yes — `ADMINISTRATOR` or `PROJECT_MANAGER` (enforced: only PROJECT_MANAGER)

**Path Parameter:** `id` — Project UUID

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 403 | Not PROJECT_MANAGER; or PM deleting another PM's project |
| 404 | Project not found |

---

### GET /api/projects/:projectId/tasks

Get all tasks belonging to a specific project. COLLABORATORs see only their assigned tasks.

**Authentication required:** Yes (any authenticated user)

**Path Parameter:** `projectId` — Project UUID

**Success Response — 200 OK:**
```json
{
  "success": true,
  "count": 3,
  "tasks": [
    {
      "id": "uuid",
      "title": "Design homepage",
      "description": "...",
      "status": "TODO",
      "priority": "HIGH",
      "dueDate": "2026-07-01T00:00:00.000Z",
      "projectId": "uuid",
      "assignedUserId": "uuid",
      "createdAt": "...",
      "updatedAt": "...",
      "project": { "id": "uuid", "name": "Website Redesign" },
      "assignedUser": { "id": "uuid", "name": "Collaborator", "email": "collab@example.com", "role": "COLLABORATOR" }
    }
  ]
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 400 | Invalid projectId parameter |
| 401 | No token |
| 404 | Project not found |

---

## Tasks

### POST /api/tasks

Create a new task. Only `PROJECT_MANAGER` can create tasks.

**Authentication required:** Yes — `ADMINISTRATOR` or `PROJECT_MANAGER` (enforced: only PROJECT_MANAGER)

**Request Body:**
```json
{
  "title": "Implement JWT",
  "description": "Secure endpoints using JWT auth tokens",
  "priority": "HIGH",
  "status": "TODO",
  "dueDate": "2026-06-30T12:00:00.000Z",
  "projectId": "project-uuid",
  "assignedUserId": "user-uuid"
}
```

| Field | Type | Required | Values |
|---|---|---|---|
| `title` | string | Yes | Non-empty string |
| `projectId` | string (UUID) | Yes | Must reference existing project |
| `assignedUserId` | string (UUID) | Yes | Must reference active user |
| `description` | string | No | Optional description |
| `priority` | string | No | `LOW`, `MEDIUM`, `HIGH` (default: `MEDIUM`) |
| `status` | string | No | `TODO`, `IN_PROGRESS`, `COMPLETED` (default: `TODO`) |
| `dueDate` | string (ISO8601) | No | Optional due date |

**Side Effects:** Creates an in-app notification for the assignee; emits `newNotification` Socket.IO event; sends task assignment email.

**Success Response — 201 Created:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "id": "uuid",
    "title": "Implement JWT",
    "description": "...",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2026-06-30T12:00:00.000Z",
    "projectId": "uuid",
    "assignedUserId": "uuid",
    "createdAt": "...",
    "updatedAt": "...",
    "project": { "id": "uuid", "name": "Website Redesign" },
    "assignedUser": { "id": "uuid", "name": "Collaborator", "email": "collab@example.com", "role": "COLLABORATOR" }
  }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 400 | Validation error; assigning to deactivated user |
| 403 | Not PROJECT_MANAGER |
| 404 | Project or assignee not found |

---

### GET /api/tasks

Retrieve all tasks with optional filtering, sorting, and pagination.

**Authentication required:** Yes (any role)

**Isolation:** COLLABORATORs see only their assigned tasks. PROJECT_MANAGERs see only tasks in their projects.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `status` | string | Filter by status: `TODO`, `IN_PROGRESS`, `COMPLETED` |
| `priority` | string | Filter by priority: `LOW`, `MEDIUM`, `HIGH` |
| `projectId` | UUID | Filter by project |
| `assignedUserId` | UUID | Filter by assignee (ignored for COLLABORATORs) |
| `search` | string | Case-insensitive title search |
| `dueAfter` | ISO8601 date | Tasks due on or after this date |
| `dueBefore` | ISO8601 date | Tasks due on or before this date |
| `sortBy` | string | Sort field: `dueDate`, `priority`, `createdAt` |
| `sortOrder` | string | `asc` or `desc` |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Tasks per page (default: 10, max: 100) |

**Success Response — 200 OK:**
```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "totalCount": 25,
    "totalPages": 3,
    "currentPage": 1,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "tasks": [ ... ]
}
```

---

### GET /api/tasks/:id

Retrieve a single task by ID.

**Authentication required:** Yes (any role)

**Path Parameter:** `id` — Task UUID

**Isolation:** COLLABORATORs can only view tasks assigned to them.

**Success Response — 200 OK:**
```json
{
  "success": true,
  "task": {
    "id": "uuid",
    "title": "Implement JWT",
    "description": "...",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2026-06-30T12:00:00.000Z",
    "projectId": "uuid",
    "assignedUserId": "uuid",
    "createdAt": "...",
    "updatedAt": "...",
    "project": { "id": "uuid", "name": "Website Redesign" },
    "assignedUser": { "id": "uuid", "name": "Collaborator", "email": "collab@example.com", "role": "COLLABORATOR" }
  }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 403 | COLLABORATOR accessing task not assigned to them |
| 404 | Task not found |

---

### PUT /api/tasks/:id

Update task properties. COLLABORATORs can only update `status` for tasks assigned to them.

**Authentication required:** Yes (any role)

**Path Parameter:** `id` — Task UUID

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "priority": "LOW",
  "dueDate": "2026-07-15T00:00:00.000Z",
  "projectId": "project-uuid",
  "assignedUserId": "user-uuid"
}
```

All fields are optional. COLLABORATORs may only include `status`.

**Side Effects:** When `status` is updated, creates an in-app notification and emits `newNotification` to the assigned user.

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "task": { ... }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 400 | Validation error; assigning to deactivated user |
| 403 | COLLABORATOR updating non-assigned task; or updating non-status fields |
| 404 | Task, project, or assignee not found |

---

### DELETE /api/tasks/:id

Permanently delete a task. Only `PROJECT_MANAGER` can delete tasks.

**Authentication required:** Yes — `ADMINISTRATOR` or `PROJECT_MANAGER` (enforced: only PROJECT_MANAGER)

**Path Parameter:** `id` — Task UUID

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 403 | Not PROJECT_MANAGER |
| 404 | Task not found |

---

### PUT /api/tasks/:id/assign

Assign a task to a user. ADMINISTRATOR or PROJECT_MANAGER only.

**Authentication required:** Yes — `ADMINISTRATOR` or `PROJECT_MANAGER`

**Path Parameter:** `id` — Task UUID

**Request Body:**
```json
{
  "assignedUserId": "user-uuid"
}
```

**Side Effects:** Creates in-app notification; emits `newNotification` Socket.IO event; sends task assignment email.

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Task assigned successfully",
  "task": { ... }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 400 | Assigning to deactivated user |
| 403 | Insufficient role |
| 404 | Task or user not found |

---

## Comments

### POST /api/comments/task/:taskId

Create a comment on a task. Administrators cannot comment.

**Authentication required:** Yes (`PROJECT_MANAGER` or `COLLABORATOR`)

**Path Parameter:** `taskId` — Task UUID

**Request Body:**
```json
{
  "content": "Great progress on this task!"
}
```

**Side Effects:** Creates in-app notification and emits `newNotification` to the appropriate recipient (project creator if COLLABORATOR comments; task assignee if PROJECT_MANAGER comments).

**Success Response — 201 Created:**
```json
{
  "success": true,
  "comment": {
    "id": "uuid",
    "content": "Great progress on this task!",
    "taskId": "uuid",
    "userId": "uuid",
    "createdAt": "2026-06-01T00:00:00.000Z",
    "user": {
      "id": "uuid",
      "name": "John PM",
      "role": "PROJECT_MANAGER"
    }
  }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 400 | Empty content |
| 403 | ADMINISTRATOR attempting to comment |
| 404 | Task not found |

---

### GET /api/comments/task/:taskId

Retrieve all comments for a task, ordered newest first.

**Authentication required:** Yes (any role)

**Path Parameter:** `taskId` — Task UUID

**Success Response — 200 OK:**
```json
{
  "success": true,
  "count": 2,
  "comments": [
    {
      "id": "uuid",
      "content": "Latest comment",
      "taskId": "uuid",
      "userId": "uuid",
      "createdAt": "2026-06-02T00:00:00.000Z",
      "user": { "id": "uuid", "name": "Jane", "role": "COLLABORATOR" }
    }
  ]
}
```

---

### DELETE /api/comments/:commentId

Delete a comment. Only the original author can delete their own comment.

**Authentication required:** Yes (any role — owner check enforced)

**Path Parameter:** `commentId` — Comment UUID

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 403 | Not the comment owner |
| 404 | Comment not found |

---

## Attachments

### POST /api/attachments/task/:taskId

Upload a file attachment to a task. Files are stored in Supabase Storage.

**Authentication required:** Yes (any role)

**Path Parameter:** `taskId` — Task UUID

**Content-Type:** `multipart/form-data`

**Form Field:** `file` (binary) — PDF, PNG, JPG/JPEG only. Maximum 5 MB.

**Side Effects:** Creates in-app notification and emits `newNotification` to the task assignee.

**Success Response — 201 Created:**
```json
{
  "success": true,
  "message": "File uploaded successfully to Supabase Storage",
  "attachment": {
    "id": "uuid",
    "fileName": "document.pdf",
    "fileUrl": "https://xxx.supabase.co/storage/v1/object/public/attachments/a8f3c21b.pdf",
    "taskId": "uuid",
    "userId": "uuid",
    "createdAt": "2026-06-01T00:00:00.000Z",
    "user": { "id": "uuid", "name": "Uploader", "role": "PROJECT_MANAGER" }
  }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 400 | No file uploaded; invalid file type or size |
| 401 | No token |
| 404 | Task not found |
| 500 | Supabase upload error |

---

### GET /api/attachments/task/:taskId

Retrieve all attachments for a task, ordered newest first.

**Authentication required:** Yes (any role)

**Path Parameter:** `taskId` — Task UUID

**Success Response — 200 OK:**
```json
{
  "success": true,
  "count": 1,
  "attachments": [
    {
      "id": "uuid",
      "fileName": "document.pdf",
      "fileUrl": "https://xxx.supabase.co/...",
      "taskId": "uuid",
      "userId": "uuid",
      "createdAt": "2026-06-01T00:00:00.000Z",
      "user": { "id": "uuid", "name": "Uploader", "role": "PROJECT_MANAGER" }
    }
  ]
}
```

---

### DELETE /api/attachments/:attachmentId

Delete an attachment. Deletes file from Supabase Storage and removes the database record.

**Authentication required:** Yes — owner, `ADMINISTRATOR`, or `PROJECT_MANAGER`

**Path Parameter:** `attachmentId` — Attachment UUID

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "Attachment deleted successfully"
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| 403 | Not the owner, ADMINISTRATOR, or PROJECT_MANAGER |
| 404 | Attachment not found |
| 500 | Storage or database error |

---

## Notifications

### GET /api/notifications

Retrieve all notifications for the authenticated user, ordered newest first.

**Authentication required:** Yes (any role)

**Success Response — 200 OK:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "uuid",
      "message": "You have been assigned task: Implement JWT",
      "isRead": false,
      "userId": "uuid",
      "createdAt": "2026-06-01T00:00:00.000Z",
      "reminderType": null
    }
  ]
}
```

---

### PUT /api/notifications/read-all

Mark all unread notifications for the authenticated user as read.

**Authentication required:** Yes (any role)

**Success Response — 200 OK:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### PUT /api/notifications/:id/read

Mark a single notification as read by ID.

**Authentication required:** Yes (any role)

**Path Parameter:** `id` — Notification UUID

**Success Response — 200 OK:**
```json
{
  "success": true,
  "notification": {
    "id": "uuid",
    "message": "...",
    "isRead": true,
    "userId": "uuid",
    "createdAt": "..."
  }
}
```

---

## Common Response Schemas

### ErrorResponse

```json
{
  "success": false,
  "message": "Description of the error"
}
```

### ValidationErrorResponse

```json
{
  "success": false,
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

### Standard HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | OK — Request succeeded |
| 201 | Created — Resource created |
| 400 | Bad Request — Validation or input error |
| 401 | Unauthorized — No or invalid token |
| 403 | Forbidden — Insufficient role or permissions |
| 404 | Not Found — Resource does not exist |
| 409 | Conflict — Duplicate resource (e.g., email already exists) |
| 500 | Internal Server Error |
