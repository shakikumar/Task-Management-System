# Swagger Review Report

**Date:** June 2026
**Swagger URL:** `http://localhost:5001/api/docs`

This document reviews the current state of the live Swagger API documentation compared to the actual `server.js` route implementation.

## 1. Coverage Overview
The Swagger documentation successfully covers the core functionality for Tasks, Projects, Users, and basic Auth. However, it is **missing several critical modules** that are actively implemented in the source code.

## 2. Missing Endpoints
The following route modules are fully implemented in the backend but are **completely undocumented** in Swagger:

- **Comments (`/api/comments`)**:
  - Expected: `POST /api/comments`, `GET /api/comments/task/:taskId`, `DELETE /api/comments/:id`
- **Attachments (`/api/attachments`)**:
  - Expected: `POST /api/attachments/upload`, `GET /api/attachments/:taskId`, `DELETE /api/attachments/:id`
- **Notifications (`/api/notifications`)**:
  - Expected: `GET /api/notifications`, `PUT /api/notifications/read/:id`, etc.
- **Auth Routes (Additional)**:
  - `POST /api/auth/reset-password`
  - `POST /api/auth/first-login` (if implemented)

## 3. Schema & Model Discrepancies
- The `Notification` schema exists in Swagger (`components.schemas.Notification`), but the endpoints to interact with it are missing from the `paths` object.
- The `Comment` schema exists, but its endpoints are not exposed.
- The `Attachment` schema is completely missing from Swagger.

## 4. Authentication Review
- The Swagger documentation correctly specifies `BearerAuth` security schemes for `Tasks` and `Projects`. 
- The `Users` endpoints (`GET /api/users`, `POST /api/users`) in Swagger **do not** explicitly require the `security: [{"BearerAuth": []}]` block, which is inaccurate since the actual `userRoutes.js` implementation protects these routes.

## 5. Tags Review
- **Tags Used**: `Tasks`, `Auth`, `Users`, `Projects`.
- **Missing Tags**: `Comments`, `Attachments`, `Notifications`.

## 6. Recommendations & Action Items
1. **Add Missing Routes**: Use `swagger-jsdoc` comments inside `commentRoutes.js`, `attachmentRoutes.js`, and `notificationRoutes.js` to automatically populate the Swagger UI.
2. **Fix Security Blocks**: Ensure all routes in `userRoutes.js` and `projectRoutes.js` have the `security: [{ BearerAuth: [] }]` definition.
3. **Complete Auth Definitions**: Document the password reset workflow in Swagger to match the live functionality.
