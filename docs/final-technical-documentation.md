# Final Technical Documentation

## 1. Authentication & Security (JWT)
The system uses stateless JSON Web Tokens (JWT) for authentication.
- **Login Flow**: Users log in using email and password. The backend verifies credentials using `bcrypt` and issues a signed JWT containing the `userId` and `role`.
- **Protection**: Express routes are protected by an `authMiddleware` that intercepts requests, checks the `Authorization: Bearer <token>` header, verifies the signature, and attaches `req.user` to the request object.
- **Force Reset**: New users are created with a `mustResetPassword` flag. On first login, they are required to change their password before proceeding to use the application.

## 2. Role-Based Access Control (RBAC)
Authorization is strictly enforced using `roleMiddleware`.
- **ADMINISTRATOR**: Full access to all resources, project creation, and user management.
- **PROJECT_MANAGER**: Can create/manage projects, create tasks, and assign users.
- **COLLABORATOR**: Restricted access. Can only view tasks explicitly assigned to them, and can only update task status. Cannot assign tasks or edit major project details.

## 3. Real-Time Interactions (Socket.IO)
- **Architecture**: WebSockets (`socket.io`) are utilized for bi-directional communication between the React frontend and Node.js backend.
- **Rooms**: Each user joins a private Socket room matching their `userId` upon connection.
- **Events**: The backend emits events (e.g., `notification`, `taskUpdate`, `newComment`) targeting specific user rooms, ensuring users only receive updates pertinent to them.

## 4. Supabase Storage (Attachments)
Instead of storing files on the local filesystem (which violates containerization best practices), binary files are securely uploaded to **Supabase Storage**.
- The backend handles the multipart form parsing (via `multer`).
- Files are piped to the Supabase bucket.
- The resulting public URL is saved in the PostgreSQL database within the `Attachment` table.

## 5. Notification System
Notifications are triggered asynchronously by controller actions.
- When a task is assigned, a new comment is posted, or a project status changes, a `Notification` record is created in the database.
- A real-time Socket event is fired simultaneously to alert active users.
- An email may also be dispatched via SMTP (Mailtrap) for critical alerts.

## 6. Connection Resilience & Error Handling
- **Global Error Handling**: Express utilizes centralized error handling middleware to catch untrapped promise rejections and format them into consistent JSON responses (`{ success: false, message: ... }`).
- **Axios Interceptors**: The React frontend employs Axios interceptors to seamlessly handle `401 Unauthorized` errors. If a token expires, the interceptor forces a logout and redirects the user to the login screen without breaking the application state.
- **Data Validation**: Request bodies are validated prior to database interaction.

## 7. CI/CD & Docker
The application is fully containerized using Docker Compose.
- **Profiles**: Development environments can spin up a local PostgreSQL container, while production builds bypass the local DB and connect directly to cloud-hosted Supabase.
- **Nginx**: The frontend is served by Nginx in the production Dockerfile, ensuring high performance delivery of static React assets.
