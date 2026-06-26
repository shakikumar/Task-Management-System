# Swagger Documentation Review

This document summarizes the state of the interactive API documentation available at `http://localhost:5001/api/docs`.

## Implementation Details
The project uses `swagger-jsdoc` to generate an OpenAPI 3.0.0 specification and `swagger-ui-express` to serve the interactive UI. The main configuration is located in `backend/config/swagger.js`, and it dynamically parses JSDoc comments containing `@swagger` tags from all route and controller files.

## Documented Endpoints

The following API groups are documented and active in the live Swagger UI:

### Authentication
- `POST /api/auth/login`: Authenticate and receive a JWT token.
- `POST /api/auth/onboard`: Onboard a new user with an auto-generated temporary password.
- `PUT /api/auth/change-password`: Change password, enforcing policy and clearing the `mustResetPassword` flag.

### Users
- `POST /api/users`: Create a new user (ADMINISTRATOR only).
- `GET /api/users`: Retrieve all users.
- `GET /api/users/{id}`: Retrieve a specific user by ID.
- `PUT /api/users/profile`: Update the authenticated user's profile.
- `PUT /api/users/{id}`: Update a user's role or status.
- `DELETE /api/users/{id}`: Delete a user permanently.

### Projects
- `POST /api/projects`: Create a new project.
- `GET /api/projects`: Retrieve all projects.
- `GET /api/projects/{id}`: Retrieve project details.
- `PUT /api/projects/{id}`: Update a project.
- `DELETE /api/projects/{id}`: Delete a project.
- `GET /api/projects/{projectId}/tasks`: Get all tasks for a project.

### Tasks
- `POST /api/tasks`: Create a new task.
- `GET /api/tasks`: Get all tasks (supports filtering, sorting, pagination).
- `GET /api/tasks/{id}`: Get task details.
- `PUT /api/tasks/{id}`: Update a task.
- `DELETE /api/tasks/{id}`: Delete a task.
- `PUT /api/tasks/{id}/assign`: Assign a task to a user.

### Comments
- `POST /api/comments/task/{taskId}`: Add a comment to a task.
- `GET /api/comments/task/{taskId}`: Get all comments for a task.
- `DELETE /api/comments/{id}`: Delete a comment.

### Attachments
- `POST /api/attachments/task/{taskId}`: Upload a file to a task (Supabase Storage).
- `GET /api/attachments/task/{taskId}`: Get all file attachments for a task.
- `DELETE /api/attachments/{id}`: Delete an attachment.

### Notifications
- `GET /api/notifications`: Retrieve user notifications.
- `PUT /api/notifications/{id}/read`: Mark a single notification as read.
- `PUT /api/notifications/read-all`: Mark all notifications as read.

## Discrepancies and Observations
- The `ProjectComment` model exists in `schema.prisma` but has **no API endpoints** associated with it, and thus it does not appear in the Swagger documentation.
- All endpoints correctly document their request bodies, response shapes, and required security schemes (`BearerAuth`).
