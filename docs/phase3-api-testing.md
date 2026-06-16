# Phase 3 API Testing Report

This document contains the execution and results for Phase 3 API testing, ensuring endpoints for users, projects, and tasks meet system specifications.

## 1. User Management API Tests

| Test Case ID | Description | Endpoint | Method | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| UM-01 | Create new user | `/api/users/register` | POST | 201 Created, returns user object | 201 Created, returns user object | PASS |
| UM-02 | Get user profile | `/api/users/:id` | GET | 200 OK, returns user profile data | 200 OK, returns user profile data | PASS |
| UM-03 | Update user profile | `/api/users/:id` | PUT | 200 OK, returns updated data | 200 OK, returns updated data | PASS |
| UM-04 | Delete user | `/api/users/:id` | DELETE | 204 No Content | 204 No Content | PASS |
| UM-05 | Create user with duplicate email | `/api/users/register` | POST | 409 Conflict | 409 Conflict | PASS |

## 2. Project Management API Tests

| Test Case ID | Description | Endpoint | Method | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| PM-01 | Create new project | `/api/projects` | POST | 201 Created, returns project data | 201 Created, returns project data | PASS |
| PM-02 | Get all projects | `/api/projects` | GET | 200 OK, returns array of projects | 200 OK, returns array of projects | PASS |
| PM-03 | Get project by ID | `/api/projects/:id` | GET | 200 OK, returns specific project | 200 OK, returns specific project | PASS |
| PM-04 | Update project details | `/api/projects/:id` | PUT | 200 OK, returns updated project | 200 OK, returns updated project | PASS |
| PM-05 | Delete project | `/api/projects/:id` | DELETE | 200 OK or 204 No Content | 200 OK | PASS |

## 3. Task Management API Tests

| Test Case ID | Description | Endpoint | Method | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TM-01 | Create new task in project | `/api/tasks` | POST | 201 Created, task added to project | 201 Created, task added | PASS |
| TM-02 | Get tasks for project | `/api/projects/:id/tasks` | GET | 200 OK, returns array of tasks | 200 OK, returns array of tasks | PASS |
| TM-03 | Update task details | `/api/tasks/:id` | PUT | 200 OK, returns updated task | 200 OK, returns updated task | PASS |
| TM-04 | Assign user to task | `/api/tasks/:id/assign` | POST | 200 OK, task assigned | 200 OK, task assigned | PASS |
| TM-05 | Change task status | `/api/tasks/:id/status` | PATCH | 200 OK, status updated | 200 OK, status updated | PASS |
| TM-06 | Delete task | `/api/tasks/:id` | DELETE | 204 No Content | 204 No Content | PASS |
