# Final Technical Documentation — Task Management System

---

## 1. Authentication

### Flow

1. Client sends `POST /api/auth/login` with `{ email, password }`.
2. `authController.login` queries the `User` table by email using Prisma.
3. If the user does not exist, returns `401 Invalid credentials` (deliberately vague to prevent user enumeration).
4. If `user.isActive === false`, returns `403` — account deactivated.
5. `bcryptjs.compare(password, user.password)` validates the hashed password.
6. On success, `jsonwebtoken.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })` generates a signed JWT.
7. Response includes the token and user object (`id`, `name`, `email`, `role`, `mustResetPassword`).

### JWT Structure

**Payload:**
```json
{
  "userId": "uuid",
  "role": "PROJECT_MANAGER",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Security:**
- Signed with `HS256` (default for `jsonwebtoken`)
- Secret from `JWT_SECRET` environment variable
- Expiry from `JWT_EXPIRES_IN` (configured as `24h` in production)

### protect Middleware

Every protected route runs `protect` (from `middleware/authMiddleware.js`) before the controller:

1. Reads `Authorization: Bearer <token>` from the request header.
2. If missing or malformed, returns `401 Access denied. No token provided.`
3. `jwt.verify(token, JWT_SECRET)` decodes and validates the token.
4. `TokenExpiredError` → `401 Your session has expired.`
5. `JsonWebTokenError` → `401 Invalid token.`
6. Loads the full user from the database (`id`, `name`, `email`, `role`, `isActive`).
7. If `user.isActive === false`, returns `403 Your account has been deactivated.`
8. Attaches the user object to `req.user`.
9. Calls `next()`.

### Change Password

`PUT /api/auth/change-password` (protected):
- Validates `currentPassword` matches the stored bcrypt hash.
- Enforces password policy: 8+ chars, uppercase, lowercase, digit, special character.
- Prevents setting the same password again.
- Hashes the new password with `bcrypt.hash(newPassword, 10)`.
- Sets `mustResetPassword: false` on success.

---

## 2. Role-Based Access Control (RBAC)

### restrictTo Middleware

```javascript
const restrictTo = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ ... });
  }
  next();
};
```

This middleware is chained after `protect` on routes requiring specific roles.

### Role Capabilities Matrix

| Action | ADMINISTRATOR | PROJECT_MANAGER | COLLABORATOR |
|---|---|---|---|
| Login | Yes | Yes | Yes |
| Change own password | Yes | Yes | Yes |
| Update own profile | Yes | Yes | Yes |
| Create user | Yes | No | No |
| Read all users | Yes | Yes (read-only) | No |
| Update user | Yes | No | No |
| Delete user | Yes | No | No |
| Create project | No | Yes | No |
| Read all projects | Yes | Yes (own only) | No |
| Update project | No | Yes (own only) | No |
| Delete project | No | Yes (own only) | No |
| Create task | No | Yes | No |
| Read all tasks | Yes | Yes (own projects) | Yes (own only) |
| Update task (all fields) | Yes | Yes | No |
| Update task (status only) | No | No | Yes (own only) |
| Delete task | No | Yes | No |
| Assign task | Yes | Yes | No |
| Create comment | No | Yes | Yes |
| Read comments | Yes | Yes | Yes |
| Delete own comment | No | Yes | Yes |
| Upload attachment | Yes | Yes | Yes |
| Read attachments | Yes | Yes | Yes |
| Delete attachment | Yes (any) | Yes (any) | Yes (own only) |
| Read notifications | Yes | Yes | Yes |
| Mark notifications read | Yes | Yes | Yes |

### Service-Level Isolation

Beyond the middleware `restrictTo`, additional checks are enforced in the service layer (`taskService.js`) and controllers:

- **COLLABORATORs:** `getAllTasks` adds `where.assignedUserId = user.id`; `getTaskById` returns 403 if task is not assigned to the requesting user; `updateTask` returns 403 if any field other than `status` is in the request body.
- **PROJECT_MANAGERs:** `getAllTasks` filters by project IDs owned by the PM; create/delete project and task are enforced at controller level with explicit role checks.
- **ADMINISTRATORs:** Cannot comment on tasks (checked in `commentController.createComment`).

---

## 3. User Management

### Creating Users

`POST /api/users` (ADMINISTRATOR only):
1. Validates name and email (format regex).
2. Checks uniqueness of email in the database.
3. Generates a random 12-character hex temporary password using `crypto.randomBytes(6).toString('hex')`.
4. Hashes the temporary password with `bcrypt.hash(temporaryPassword, 12)`.
5. Creates the user with `mustResetPassword: true`.
6. Sends an onboarding email via `mailerService.sendOnboardingEmail`.

### Onboarding via Auth Route

`POST /api/auth/onboard`:
- Open endpoint (no auth required).
- Same logic as `createUser` but accessible without a token.

### Profile Updates

`PUT /api/users/profile` (any authenticated user):
- Updates `name` and `email` for the currently authenticated user.
- No role restriction — self-service.

### Soft Deactivation

Admins can set `isActive: false` via `PUT /api/users/:id`. Deactivated users:
- Cannot log in (blocked at step 4 of auth flow).
- Cannot be assigned tasks (checked in `taskService.createTask` and `taskService.assignTask`).
- Existing tokens for deactivated users are rejected by the `protect` middleware.

---

## 4. Project Management

### CRUD Operations

| Operation | Route | Who |
|---|---|---|
| Create | `POST /api/projects` | PROJECT_MANAGER only (checked in controller) |
| Read all | `GET /api/projects` | ADMINISTRATOR (all); PROJECT_MANAGER (own) |
| Read one | `GET /api/projects/:id` | ADMINISTRATOR, PROJECT_MANAGER |
| Update | `PUT /api/projects/:id` | ADMINISTRATOR (name/description only); PROJECT_MANAGER (own, all fields) |
| Delete | `DELETE /api/projects/:id` | PROJECT_MANAGER (own only) |

### Business Rules

- Project name minimum 3 characters (controller-enforced).
- Only `PROJECT_MANAGER` can change `status` (enforced in `updateProject`).
- PM can only update and delete their own projects (checked via `existingProject.createdById !== req.user.id`).
- Deleting a project cascades to delete all tasks (Prisma cascade delete).
- Project creation with an explicit `ownerId` sends a project assignment email to the new owner.

### Progress Calculation

`getAllProjects` computes derived fields per project:
- `totalTasks` — count of all tasks in the project
- `completedTasks` — count where `status === 'COMPLETED'`
- `progress` — `Math.round((completedTasks / totalTasks) * 100)` (0 if no tasks)
- `membersCount` — count of unique `assignedUserId` values across tasks

---

## 5. Task Management

### CRUD Operations

| Operation | Route | Who |
|---|---|---|
| Create | `POST /api/tasks` | PROJECT_MANAGER only |
| Read all | `GET /api/tasks` | All roles (role-isolated) |
| Read one | `GET /api/tasks/:id` | All roles (COLLABORATOR isolation) |
| Update | `PUT /api/tasks/:id` | All roles (COLLABORATOR: status only) |
| Delete | `DELETE /api/tasks/:id` | PROJECT_MANAGER only |
| Assign | `PUT /api/tasks/:id/assign` | ADMINISTRATOR, PROJECT_MANAGER |

### Filtering and Pagination

`getAllTasks` in `taskService.js` supports:
- **status** filter: `where.status = filters.status`
- **priority** filter: `where.priority = filters.priority`
- **projectId** filter: `where.projectId = filters.projectId`
- **assignedUserId** filter: ignored for COLLABORATORs
- **search**: `where.title = { contains: search, mode: 'insensitive' }` (Prisma `insensitive` mode)
- **dueAfter / dueBefore**: `where.dueDate = { gte: ..., lte: ... }`
- **sortBy**: one of `dueDate`, `priority`, `createdAt`; defaults to `createdAt DESC`
- **page / limit**: offset pagination; limit capped at 100; returns pagination metadata

### Input Validation

`validators/taskValidator.js` uses `express-validator`:
- `validateTaskCreate`: title (required), projectId (required), assignedUserId (required), priority (enum), status (enum), dueDate (ISO8601)
- `validateTaskUpdate`: all optional; same enum constraints; param id must be string
- `validateAssignTask`: param id string; body assignedUserId required

### Notification on Task Events

When a task is created or assigned:
1. Creates a `Notification` record for the assignee.
2. Calls `getIO().to(assignedUserId).emit('newNotification', notification)` via Socket.IO.
3. Sends a task assignment email via `mailerService.sendTaskAssignmentEmail`.

When task `status` is updated:
1. Creates a `Notification` record for the assignee.
2. Emits `newNotification` via Socket.IO.

---

## 6. Task Comments

### Business Rules

- `ADMINISTRATOR` cannot post comments (returns 403).
- Comment `content` cannot be empty.
- Ordered newest-first in API responses.
- Only the original author can delete their own comment.
- Mention detection: `content.match(/@(\w+)/g)` logs mentions to the console (no further action implemented).

### Notification Routing

When a comment is created:
- If commenter is a `COLLABORATOR`: notification goes to `task.project.createdById` (the project's owner).
- If commenter is a `PROJECT_MANAGER`: notification goes to `task.assignedUserId` (the assignee).
- No notification is sent if the commenter and recipient are the same user.

---

## 7. File Attachments

### Upload Flow

1. Client sends `POST /api/attachments/task/:taskId` as `multipart/form-data` with field `file`.
2. `uploadMiddleware` (Multer, memory storage) validates file type (MIME + extension) and size (≤ 5 MB). Allowed types: PDF, PNG, JPG/JPEG.
3. Controller generates a random filename: `crypto.randomBytes(16).toString('hex') + extension`.
4. Uploads the file buffer to Supabase Storage bucket `attachments` using `supabase.storage.from(bucket).upload(safeFileName, buffer, { contentType, upsert: false })`.
5. Retrieves the public URL via `supabase.storage.from(bucket).getPublicUrl(safeFileName)`.
6. Creates an `Attachment` record in the database with `fileName` (original) and `fileUrl` (public URL).
7. Creates a notification for the task assignee and emits via Socket.IO.

### Delete Flow

1. Finds the attachment in the database.
2. Checks permission: owner, ADMINISTRATOR, or PROJECT_MANAGER.
3. Extracts filename from the public URL (`fileUrl.split('/').pop()`).
4. Calls `supabase.storage.from(bucket).remove([fileName])` to delete from Supabase Storage.
5. Deletes the `Attachment` record from the database (continues even if storage delete fails).

---

## 8. Notifications

### Storage

All notifications are persisted in the `Notification` table.

### Creation Triggers

Notifications are created programmatically in controllers and services:

| Trigger | Message Template | Recipient |
|---|---|---|
| Task created | `"You have been assigned task: {title}"` | `assignedUserId` |
| Task assigned | `"You have been assigned task: {title}"` | new `assignedUserId` |
| Task status updated | `"Task status changed to {status}"` | `assignedUserId` |
| Comment by COLLABORATOR | `"{name} commented on task: {title}"` | Project creator |
| Comment by PROJECT_MANAGER | `"{name} commented on task: {title}"` | Task assignee |
| File uploaded | `"{name} uploaded an attachment to task: {title}"` | `assignedUserId` |
| Due-date reminder (cron) | `"Task "{title}" is due tomorrow"` | `assignedUserId` |

### REST API

- `GET /api/notifications` — fetch all (ordered newest first)
- `PUT /api/notifications/:id/read` — mark one as read
- `PUT /api/notifications/read-all` — mark all as read for the authenticated user

---

## 9. Socket.IO

### Server Setup

`sockets/socketServer.js` initializes Socket.IO on the shared Node.js HTTP server:

```javascript
io = new Server(server, {
  cors: { origin: 'http://localhost:5173', credentials: true }
});
```

### Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `connection` | Server emits | — | New socket connected |
| `join` | Client emits | `userId` (string) | Client joins its own private room |
| `newNotification` | Server emits to room | Notification object | Pushed when a new notification is created |
| `disconnect` | Client emits | — | Socket disconnected |

### Room Strategy

Each authenticated user joins a room identified by their `userId`. The server uses `io.to(userId).emit(...)` to send targeted notifications to specific users without broadcasting to all connected clients.

### Frontend Integration

`frontend/src/components/Navbar.jsx`:
- Creates a Socket.IO client connection on mount: `io('http://localhost:5001')`.
- Reads `user.id` from `localStorage` and emits `join`.
- Listens for `newNotification`: prepends the notification to state and increments the unread badge counter.
- Disconnects the socket on component unmount.

`frontend/src/services/socket.js`:
- Creates a global socket instance: `io('http://localhost:5001', { transports: ['websocket'] })`.
- Used in `App.jsx` for the global connection listener.

---

## 10. Due-Date Cron Job

### Schedule

`jobs/dueDateChecker.js` uses `node-cron` to run at `0 9 * * *` (09:00 daily, server local time).

### Logic

1. Calculates tomorrow's date range (00:00 to 00:00 next day UTC).
2. Queries all `Task` records where:
   - `dueDate >= tomorrow AND dueDate < nextDay`
   - `status != 'COMPLETED'`
3. For each matching task:
   - Creates a `Notification` record for the assignee.
   - Emits `newNotification` via Socket.IO to the assignee's room.
   - Sends a due-date reminder email via `mailerService.sendDueDateReminderEmail`.

---

## 11. Email Service

`services/mailerService.js` uses Nodemailer with an SMTP transporter:

| Function | Subject | Trigger |
|---|---|---|
| `sendOnboardingEmail` | `Welcome to TMS - Your Temporary Account Credentials` | User created |
| `sendTaskAssignmentEmail` | `New Task Assigned` | Task created or assigned |
| `sendProjectAssignmentEmail` | `New Project Assigned` | Project created with ownerId override |
| `sendDueDateReminderEmail` | `Task Due Date Reminder` | Daily cron job |

SMTP configuration from environment variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`. Email failures are caught and logged — they do not interrupt the primary API response.

---

## 12. Input Validation

### express-validator (Tasks)

Applied as middleware chains in `validators/taskValidator.js`:
- `validateTaskCreate` — required: `title`, `projectId`, `assignedUserId`; optional with enum: `priority`, `status`; optional ISO8601: `dueDate`
- `validateTaskUpdate` — all optional with same constraints; validates param `id`
- `validateAssignTask` — param `id` string; body `assignedUserId` required
- `validateTaskId` / `validateProjectId` — path param validation

`handleValidationErrors` middleware collects errors from `validationResult(req)` and returns:
```json
{ "success": false, "errors": [{ "field": "title", "message": "Title is required" }] }
```

### Manual Validation (Other Routes)

- Auth: email/password present check; password policy regex in `changePassword`
- Users: email regex, role enum validation, email uniqueness check, password length
- Projects: name present, name length ≥ 3 chars
- Comments: content not empty
- Attachments: Multer file type filter (MIME + extension) + 5 MB size limit

---

## 13. Error Handling

### Pattern

All controllers follow a `try/catch` pattern. Errors return:
```json
{ "success": false, "message": "Description" }
```

### AppError Class

`taskService.js` defines:
```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
  }
}
```

`taskController.js` maps service errors using:
```javascript
const mapErrorResponse = (res, error, defaultMsg) => {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({ success: false, message: error.message || defaultMsg });
};
```

This allows the service layer to throw typed errors (404, 403, 400) that the controller correctly propagates to the HTTP response.

---

## 14. Security

### HTTP Headers — Helmet

`app.use(helmet())` sets the following headers:
- `Content-Security-Policy`
- `X-DNS-Prefetch-Control`
- `X-Frame-Options: SAMEORIGIN`
- `Strict-Transport-Security`
- `X-Download-Options`
- `X-Content-Type-Options: nosniff`
- `X-Permitted-Cross-Domain-Policies`
- `Referrer-Policy`
- Removes `X-Powered-By`

### XSS Sanitization

`middleware/securityMiddleware.js` uses the `xss` library to sanitize every string field in `req.body` before it reaches any route handler:

```javascript
Object.keys(req.body).forEach(key => {
  if (typeof req.body[key] === 'string') {
    req.body[key] = xss(req.body[key]);
  }
});
```

### CORS

Configured with `cors({ origin: CORS_ORIGIN, credentials: true })` — restricts cross-origin requests to the configured frontend origin.

### Password Security

- Passwords hashed with `bcryptjs` at cost factor 10 or 12.
- Temporary passwords generated with `crypto.randomBytes(6).toString('hex')` (12 random hex chars).
- Passwords are never returned in API responses.

### File Upload Security

- Multer validates MIME type and file extension.
- Random hex filenames prevent filename-based attacks and collisions.
- Files stored in Supabase Storage (not on local disk in production).
- Docker container runs as non-root user `appuser`.

### Token Handling

- JWT tokens stored in browser `localStorage` (note: not HttpOnly cookies).
- Deactivated users are checked on every protected request (not just at login time).

---

## 15. Supabase Integration

### Database

Supabase provides a managed PostgreSQL 16 instance. Prisma connects via:
```javascript
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

The `DATABASE_URL` points to Supabase's connection pooler endpoint, ensuring pgBouncer compatibility.

### Storage

`config/supabase.js` creates a Supabase client using the **service role key** (not anon key) for full storage access:
```javascript
const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

Files are uploaded to the `attachments` bucket. Public URLs are constructed via `getPublicUrl()` and stored in the `Attachment.fileUrl` column.

---

## 16. Docker

### Backend Dockerfile (Multi-Stage)

**Stage 1 (builder):** `node:22-alpine`
- Installs `openssl` for Prisma query engine compatibility
- Runs `npm ci` (all deps including devDeps)
- Runs `npx prisma generate`

**Stage 2 (runner):** `node:22-alpine`
- Installs `openssl`
- Creates non-root user `appuser:appgroup`
- Copies only production deps (`npm ci --omit=dev`)
- Copies generated Prisma client and application source from builder
- Runs as `appuser`
- Exposes port 5000
- Health check: `wget -qO- http://localhost:5000/`

### Frontend Dockerfile (Multi-Stage)

**Stage 1 (builder):** `node:22-alpine`
- Runs `npm ci` then `npm run build` (Vite production bundle → `dist/`)

**Stage 2 (runner):** `nginx:1.27-alpine`
- Copies `dist/` to Nginx web root
- Copies custom `nginx.conf`
- Exposes port 80
- Health check: `wget -qO- http://localhost:80/`

### Docker Compose Services

| Service | Image | Port | Dependencies |
|---|---|---|---|
| `backend` | Node 22 Alpine | `5000` | `db` (optional, when local-db profile active) |
| `frontend` | Nginx 1.27 Alpine | `3000` | `backend` (health check) |
| `db` | PostgreSQL 16 Alpine | `5432` | — (profile: local-db) |

---

## 17. CI/CD Pipeline

### Workflow Triggers

- `push` to `main`, `memberE-phase1`, any `member*` branch
- `pull_request` to `main`

### Concurrency

Concurrent runs for the same ref/PR are cancelled using:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### Jobs

**backend-ci:**
1. Checkout repository
2. Setup Node.js 22
3. `npm ci` (with cache on `backend/package-lock.json`)
4. `npx prisma validate` — validates schema syntax
5. `npx prisma generate` — smoke-tests Prisma client generation
6. Node inline script — loads `config/swagger.js`, verifies spec has `info` field
7. Docker Buildx build of `tms-backend:ci-{sha}` (target: runner, no push)

**frontend-ci:**
1. Checkout repository
2. Setup Node.js 22
3. `npm ci` (with cache on `frontend/package-lock.json`)
4. `npm run lint` (ESLint)
5. `npm run build` (Vite production build)
6. Upload `frontend/dist/` as artifact (7-day retention)
7. Docker Buildx build of `tms-frontend:ci-{sha}` (target: runner, no push)

**compose-check** (needs both CI jobs):
1. Checkout repository
2. Write minimal stub `.env`
3. `docker compose config --quiet` — validates YAML syntax and variable interpolation

**ci-success** (gate, always runs):
- Fails the run if any of the three preceding jobs failed
- Required by branch protection rules
