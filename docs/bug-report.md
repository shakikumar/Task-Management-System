# Bug Report — Task Management System (TMS)
## Phase 2 QA Report

**Project:** Task Management System  
**Author:** Member E (QA & Verification Lead)  
**Date:** 2026-06-16  
**Version:** Phase 2 Release  
**Environment:** Local Development

---

## Bug Report Template

Use the following structure to file new bugs. Each report below follows this format:

| Field              | Description                                        |
|--------------------|----------------------------------------------------|
| **Bug ID**         | Unique identifier (format: BUG-XXX)                |
| **Title**          | Short descriptive title                            |
| **Description**    | Detailed description of the problem                |
| **Severity**       | Critical / High / Medium / Low                     |
| **Priority**       | P1 (Immediate) / P2 (High) / P3 (Medium) / P4 (Low)|
| **Status**         | Open / In Progress / Resolved / Closed / Deferred  |
| **Reporter**       | Name / Member ID                                   |
| **Assigned To**    | Developer / Member responsible                     |
| **Environment**    | Browser, OS, Node version, etc.                    |
| **Steps to Reproduce** | Numbered steps to trigger the bug             |
| **Expected Result**| What should happen                                 |
| **Actual Result**  | What actually happens                              |
| **Attachments**    | Screenshots, logs, or API responses                |
| **Root Cause**     | (To be filled by developer)                        |
| **Fix Applied**    | (To be filled on resolution)                       |

---

## Severity Definitions

| Level    | Description                                                         |
|----------|---------------------------------------------------------------------|
| Critical | System crash, data loss, security breach, complete feature failure  |
| High     | Major feature broken, significant impact on usage                   |
| Medium   | Feature partially works, workaround available                       |
| Low      | Minor UI issue, typo, cosmetic problem                              |

---

## Bug Reports

---

### BUG-001 — Missing `url` field in Prisma datasource configuration

| Field            | Details                                                    |
|------------------|------------------------------------------------------------|
| **Bug ID**       | BUG-001                                                    |
| **Title**        | Prisma `schema.prisma` datasource missing `url` directive  |
| **Severity**     | Critical                                                   |
| **Priority**     | P1                                                         |
| **Status**       | Resolved                                                   |
| **Reporter**     | Member E                                                   |
| **Assigned To**  | Member A / Member B (Backend)                              |
| **Environment**  | Windows 11, Node.js 20, Prisma 7.8.0, Supabase PostgreSQL |

**Description:**  
The `schema.prisma` file contains a `datasource db` block that does not include a `url` field pointing to the `DATABASE_URL` environment variable. Without this, Prisma cannot connect to the PostgreSQL database, causing all API calls that interact with the database to fail with a connection error.

**Steps to Reproduce:**
1. Clone the repository.
2. Set up the `.env` file with a valid `DATABASE_URL`.
3. Run `npx prisma db push` or start the backend server.
4. Observe that Prisma throws a configuration error or connects to the wrong database.

**Expected Result:**  
`schema.prisma` should contain:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Actual Result:**  
```prisma
datasource db {
  provider = "postgresql"
 
}
```
The `url` field is absent, meaning Prisma has no connection string to use.

**Root Cause:**  
The `url` directive was accidentally omitted or deleted from the `datasource db` block in `schema.prisma`.

**Fix Applied:**  
Add `url = env("DATABASE_URL")` to the datasource block and ensure `DATABASE_URL` is correctly set in `backend/.env`.

---

### BUG-002 — JWT token not cleared on logout (Frontend)

| Field            | Details                                                      |
|------------------|--------------------------------------------------------------|
| **Bug ID**       | BUG-002                                                      |
| **Title**        | JWT token persists in localStorage after session logout      |
| **Severity**     | High                                                         |
| **Priority**     | P2                                                           |
| **Status**       | Open                                                         |
| **Reporter**     | Member E                                                     |
| **Assigned To**  | Frontend Developer                                           |
| **Environment**  | Chrome 126, Windows 11, React 18, Vite 6                    |

**Description:**  
When a user logs out, the JWT token stored in `localStorage` is not reliably cleared. This allows another user on the same machine to access protected pages without re-authenticating.

**Steps to Reproduce:**
1. Log in as any user.
2. Navigate to `/admin/tasks` (or any protected page).
3. Click "Logout" from the sidebar/menu.
4. Open browser DevTools → Application → Local Storage.
5. Observe that the token key may still be present.
6. Manually navigate to `http://localhost:5173/admin/tasks`.

**Expected Result:**  
After logout, all tokens are removed from storage and the user is redirected to `/login`. Any subsequent navigation to protected routes should require re-authentication.

**Actual Result:**  
The token may remain in localStorage, allowing re-access to protected routes without login.

**Root Cause:**  
Logout handler does not call `localStorage.removeItem('token')` or equivalent before redirect.

**Fix Applied:**  
*(Pending — to be fixed by Frontend team)*

---

### BUG-003 — No rate limiting on `POST /api/auth/login`

| Field            | Details                                                      |
|------------------|--------------------------------------------------------------|
| **Bug ID**       | BUG-003                                                      |
| **Title**        | Login endpoint vulnerable to brute-force attacks             |
| **Severity**     | High                                                         |
| **Priority**     | P2                                                           |
| **Status**       | Open                                                         |
| **Reporter**     | Member E                                                     |
| **Assigned To**  | Backend Developer                                            |
| **Environment**  | Local Dev, Node.js 20, Express 5                            |

**Description:**  
The `POST /api/auth/login` endpoint accepts unlimited login attempts without any throttling or rate-limiting. This makes the system vulnerable to credential-stuffing and brute-force attacks.

**Steps to Reproduce:**
1. Run the backend server (`npm run dev` in `/backend`).
2. Use a tool (e.g., Postman, cURL loop) to send 100 consecutive POST requests to `/api/auth/login` with incorrect passwords.
3. All requests are accepted and return `401` without any block.

**Expected Result:**  
After a threshold (e.g., 5 failed attempts within 5 minutes), the IP should receive a `429 Too Many Requests` response.

**Actual Result:**  
Unlimited requests accepted; no lockout mechanism.

**Root Cause:**  
No `express-rate-limit` or equivalent middleware configured on the auth routes.

**Fix Applied:**  
*(Pending — to be fixed by Backend team)*

---

### BUG-004 — `PUT /api/users/profile` route conflicts with `PUT /api/users/:id`

| Field            | Details                                                      |
|------------------|--------------------------------------------------------------|
| **Bug ID**       | BUG-004                                                      |
| **Title**        | Route order causes `/profile` to be shadowed by `/:id`       |
| **Severity**     | Medium                                                       |
| **Priority**     | P2                                                           |
| **Status**       | Open                                                         |
| **Reporter**     | Member E                                                     |
| **Assigned To**  | Backend Developer (Member B)                                 |
| **Environment**  | Node.js 20, Express 5, Windows 11                            |

**Description:**  
In `userRoutes.js`, the route `PUT /api/users/profile` is defined **after** `PUT /api/users/:id`. Express router may interpret "profile" as an `:id` parameter, causing the `updateProfile` handler to never be called.

**Steps to Reproduce:**
1. Log in as any authenticated user.
2. Send `PUT http://localhost:5000/api/users/profile` with a valid JWT and body `{ "name": "New Name" }`.
3. Observe the response — may return a 404 "User not found" because `"profile"` is treated as a UUID.

**Expected Result:**  
`PUT /api/users/profile` calls `updateProfile()` for the authenticated user.

**Actual Result:**  
Request is routed to `updateUser("profile")`, which fails to find a user with ID `"profile"`.

**Root Cause:**  
In `userRoutes.js`, the static route `/profile` is declared after the dynamic `/:id` route. Express matches routes in declaration order.

**Current Code (lines 62–63):**
```javascript
router.put('/profile', protect, updateProfile);
router.put('/:id', protect, restrictTo('ADMINISTRATOR'), updateUser);
```
> Note: In the actual file, `/profile` appears before `/:id`, which may work correctly depending on Express version. Verification required under Express v5.

**Fix Applied:**  
Ensure `/profile` is always declared **before** `/:id` in the route file.

---

### BUG-005 — Swagger docs not secured in production

| Field            | Details                                                      |
|------------------|--------------------------------------------------------------|
| **Bug ID**       | BUG-005                                                      |
| **Title**        | API documentation endpoint (`/api/docs`) publicly accessible |
| **Severity**     | Medium                                                       |
| **Priority**     | P3                                                           |
| **Status**       | Open                                                         |
| **Reporter**     | Member E                                                     |
| **Assigned To**  | Backend Developer                                            |
| **Environment**  | All environments                                             |

**Description:**  
The Swagger UI (`/api/docs`) and raw OpenAPI JSON (`/api/docs.json`) are exposed without any authentication. In a production deployment, this publicly reveals the full API surface, parameter schemas, and example payloads to unauthenticated users.

**Steps to Reproduce:**
1. Start the backend server.
2. Open `http://localhost:5000/api/docs` in an incognito browser tab (no login).
3. Full interactive API documentation is visible.

**Expected Result:**  
Swagger docs should be restricted to authenticated users or disabled in production.

**Actual Result:**  
Fully accessible without any credentials.

**Fix Applied:**  
*(Pending — acceptable for development; must be secured before production deployment)*

---

### BUG-006 — Task `dueDate` accepts past dates

| Field            | Details                                                      |
|------------------|--------------------------------------------------------------|
| **Bug ID**       | BUG-006                                                      |
| **Title**        | Task creation allows `dueDate` in the past                   |
| **Severity**     | Low                                                          |
| **Priority**     | P3                                                           |
| **Status**       | Open                                                         |
| **Reporter**     | Member E                                                     |
| **Assigned To**  | Backend Developer                                            |
| **Environment**  | Node.js 20, Express 5, express-validator 7                  |

**Description:**  
When creating or updating a task, the `dueDate` field accepts any valid ISO date-time string, including dates in the past. This allows creating tasks with an already-expired deadline, which is logically incorrect.

**Steps to Reproduce:**
1. Authenticate as ADMINISTRATOR.
2. Send `POST /api/tasks` with body:
   ```json
   {
     "title": "Backdated Task",
     "projectId": "<valid-uuid>",
     "assignedUserId": "<valid-uuid>",
     "dueDate": "2020-01-01T00:00:00Z"
   }
   ```
3. Task is created successfully with a past due date.

**Expected Result:**  
Validation should reject `dueDate` values that are in the past.

**Actual Result:**  
Past dates accepted without error.

**Root Cause:**  
The `taskValidator.js` does not include a `.isAfter(new Date().toISOString())` check on the `dueDate` field.

**Fix Applied:**  
*(Pending — to be addressed in next sprint)*

---

### BUG-007 — Password strength not validated on change-password endpoint

| Field            | Details                                                      |
|------------------|--------------------------------------------------------------|
| **Bug ID**       | BUG-007                                                      |
| **Title**        | Weak passwords accepted by `PUT /api/auth/change-password`   |
| **Severity**     | Medium                                                       |
| **Priority**     | P2                                                           |
| **Status**       | Open                                                         |
| **Reporter**     | Member E                                                     |
| **Assigned To**  | Backend Developer                                            |
| **Environment**  | Node.js 20, Express 5                                        |

**Description:**  
The `changePassword` endpoint in `authController.js` only checks that `newPassword` is present. It does not enforce any minimum length, complexity, or strength requirements, allowing users to set trivially weak passwords like `"a"`.

**Steps to Reproduce:**
1. Login as any user.
2. Send `PUT /api/auth/change-password` with:
   ```json
   {
     "currentPassword": "<valid-current>",
     "newPassword": "a"
   }
   ```
3. Response returns `200 OK` with "Password updated successfully".

**Expected Result:**  
`newPassword` should be validated for minimum length (e.g., 8 characters) and complexity.

**Actual Result:**  
Single-character passwords accepted.

**Fix Applied:**  
*(Pending — add password strength validation in `authController.js` or a dedicated validator)*

---

## Bug Status Summary

| Bug ID  | Title                                               | Severity | Priority | Status      |
|---------|-----------------------------------------------------|----------|----------|-------------|
| BUG-001 | Missing `url` in Prisma datasource                  | Critical | P1       | ✅ Resolved  |
| BUG-002 | JWT token persists after logout                     | High     | P2       | 🔴 Open     |
| BUG-003 | No rate limiting on login endpoint                  | High     | P2       | 🔴 Open     |
| BUG-004 | Route shadowing on `/profile` vs `/:id`             | Medium   | P2       | 🟡 Open     |
| BUG-005 | Swagger docs publicly accessible                    | Medium   | P3       | 🟡 Open     |
| BUG-006 | Past `dueDate` accepted on task creation            | Low      | P3       | 🟡 Open     |
| BUG-007 | Weak passwords accepted on change-password          | Medium   | P2       | 🔴 Open     |

---

## New Bug Report Template (Blank)

Use this template to file new bugs during testing:

```
### BUG-XXX — [Short Title]

| Field            | Details |
|------------------|---------|
| **Bug ID**       | BUG-XXX |
| **Title**        |         |
| **Severity**     | Critical / High / Medium / Low |
| **Priority**     | P1 / P2 / P3 / P4 |
| **Status**       | Open |
| **Reporter**     |         |
| **Assigned To**  |         |
| **Environment**  |         |

**Description:**  

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**  

**Actual Result:**  

**Root Cause:**  

**Fix Applied:**  
```

---

*Report prepared by Member E — Bug Reporting Lead*  
*Task Management System — University Group Project, Phase 2*
