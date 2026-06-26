# API Documentation

Based on the live Swagger documentation and current implementation.

## Base URL
`http://localhost:5001/api`

## Authentication
All protected routes require a **Bearer JWT token** in the `Authorization` header:
`Authorization: Bearer <token>`

---

## 1. Authentication
### `POST /auth/login`
Authenticate a user and receive a JWT token.
- **Request Body**: `email` (string), `password` (string)
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbG...",
    "user": {
      "id": "uuid",
      "name": "User Name",
      "email": "user@email.com",
      "role": "ADMINISTRATOR",
      "mustResetPassword": false
    }
  }
  ```

### `POST /auth/onboard`
Onboard a new user.
- **Request Body**: `name` (string), `email` (string), `role` (enum: ADMINISTRATOR, PROJECT_MANAGER, COLLABORATOR)
- **Response**: `201 Created`

---

## 2. Users
### `GET /users`
Retrieve all users.
- **Authentication**: Required (Admin only)
- **Response**: `200 OK` (Array of Users)

### `POST /users`
Create a user manually.
- **Authentication**: Required
- **Response**: `201 Created`

### `GET /users/{id}`
Retrieve a single user by ID.
- **Parameters**: `id` (path, uuid)
- **Response**: `200 OK`

### `PUT /users/{id}`
Update a user.
- **Parameters**: `id` (path, uuid)
- **Response**: `200 OK`

### `DELETE /users/{id}`
Delete a user.
- **Parameters**: `id` (path, uuid)
- **Response**: `200 OK`

---

## 3. Projects
### `GET /projects`
Retrieve all projects.
- **Authentication**: Required
- **Response**: `200 OK` (Array of Projects)

### `POST /projects`
Create a new project.
- **Authentication**: Required
- **Response**: `201 Created`

### `GET /projects/{id}`
Retrieve a specific project.
- **Parameters**: `id` (path, uuid)
- **Response**: `200 OK`

### `PUT /projects/{id}`
Update a project.
- **Parameters**: `id` (path, uuid)
- **Response**: `200 OK`

### `DELETE /projects/{id}`
Delete a project.
- **Parameters**: `id` (path, uuid)
- **Response**: `200 OK`

### `GET /projects/{projectId}/tasks`
Retrieve all tasks belonging to a specific project.
- **Authentication**: Required
- **Parameters**: `projectId` (path, uuid)
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 2,
    "tasks": [ ... ]
  }
  ```

---

## 4. Tasks
### `GET /tasks`
Retrieve all tasks. Collaborators only see tasks assigned to them.
- **Authentication**: Required
- **Query Parameters**: `status`, `priority`, `projectId`, `assignedUserId`, `sortBy`, `sortOrder`
- **Response**: `200 OK` (Array of Tasks)

### `POST /tasks`
Create a new task. (Admins and PMs only).
- **Authentication**: Required
- **Request Body**: `title`, `description`, `priority`, `status`, `dueDate`, `projectId`, `assignedUserId`
- **Response**: `201 Created`

### `GET /tasks/{id}`
Retrieve a single task.
- **Parameters**: `id` (path, uuid)
- **Response**: `200 OK`

### `PUT /tasks/{id}`
Update a task. Collaborators can only update the status of tasks assigned to them.
- **Parameters**: `id` (path, uuid)
- **Response**: `200 OK`

### `DELETE /tasks/{id}`
Permanently delete a task. (Admins/PMs only).
- **Parameters**: `id` (path, uuid)
- **Response**: `200 OK`

### `PUT /tasks/{id}/assign`
Assign a task to a user.
- **Authentication**: Required (Admins/PMs only)
- **Parameters**: `id` (path, uuid)
- **Request Body**: `assignedUserId` (uuid)
- **Response**: `200 OK`

---

*(Note: The `Comments`, `Attachments`, and `Notifications` endpoints are implemented in the code but are currently omitted from the Swagger UI definitions. See the Swagger Review document for details.)*
