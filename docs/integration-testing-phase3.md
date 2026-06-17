# Phase 3 Integration Testing

This document covers integration testing across different layers of the Task Management System architecture.

## 1. Frontend → Backend Testing

| Test ID | Flow | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| FB-01 | User Registration | Submit registration form on Frontend -> Backend processes | User is created, redirect to login | User created, redirected | PASS |
| FB-02 | Dashboard Load | User navigates to dashboard -> Frontend fetches projects | Display assigned projects | Projects displayed | PASS |
| FB-03 | Task Creation | User creates task in UI -> Backend creates task | Task appears in UI instantly | Task appears in UI | PASS |
| FB-04 | Error Handling | Submit invalid data on Frontend | Proper error message from Backend displayed in UI | Error message displayed | PASS |

## 2. Backend → Database Testing

| Test ID | Flow | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| BD-01 | Create Record | Call API to create Project | Prisma creates record in Postgres | Record created successfully | PASS |
| BD-02 | Cascade Delete | Delete Project via API | All associated Tasks are deleted in DB | Tasks deleted | PASS |
| BD-03 | Unique Constraint | Attempt to register existing email | Database constraint violation handled cleanly | Prisma error handled, 409 returned | PASS |
| BD-04 | Transactions | Assign user and update task history | Both succeed or both fail | Transaction handled correctly | PASS |

## 3. Authentication Flow Testing

| Test ID | Flow | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| AUTH-01 | Login & Token Gen | Submit valid credentials | JWT generated and returned | JWT returned | PASS |
| AUTH-02 | Token Storage | Frontend receives token | Token stored in localStorage/cookies | Token stored | PASS |
| AUTH-03 | Authenticated Req | Send request with Bearer token | Backend validates token, returns 200 | Token validated | PASS |
| AUTH-04 | Logout | User clicks logout | Token removed from client | Token removed | PASS |

## 4. End-to-End Workflow Validation

**Workflow: Project Lifecycle**
1. **Admin** creates a Project and assigns a **Project Manager**.
2. **Project Manager** creates Tasks and assigns them to **Collaborators**.
3. **Collaborators** log in, view Tasks, and update Status to 'IN_PROGRESS'.
4. **Collaborators** complete the Task and update Status to 'DONE'.
5. **Project Manager** verifies and closes the Project.

**Result**: Workflow completed successfully. All state changes correctly reflected across Frontend, Backend, and Database.
**Status**: PASS
