# Role-Based Access Control (RBAC) Verification

This document verifies the access levels and permissions for the different user roles defined in the Task Management System.

## Roles Defined
1. **Admin**: Full access to the system.
2. **Project Manager**: Access to manage assigned projects and related tasks.
3. **Collaborator**: Access to view projects and manage assigned tasks.

## 1. Admin Access Verification

| Scenario | Action | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| Create User | Admin attempts to create a new user | Success (201) | Success (201) | PASS |
| Delete Project | Admin attempts to delete any project | Success (204) | Success (204) | PASS |
| View All Projects | Admin attempts to list all projects | Success (200) | Success (200) | PASS |
| Assign Role | Admin attempts to change user role | Success (200) | Success (200) | PASS |

## 2. Project Manager Access Verification

| Scenario | Action | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| Create Project | PM attempts to create a project | Success (201) | Success (201) | PASS |
| Edit Assigned Project | PM edits a project they manage | Success (200) | Success (200) | PASS |
| Edit Unassigned Project| PM edits a project they do NOT manage | Denied (403) | Denied (403) | PASS |
| Delete User | PM attempts to delete a user | Denied (403) | Denied (403) | PASS |
| Assign Task | PM assigns task within their project | Success (200) | Success (200) | PASS |

## 3. Collaborator Access Verification

| Scenario | Action | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| View Assigned Task | Collaborator views a task assigned to them | Success (200) | Success (200) | PASS |
| Update Task Status | Collaborator updates status of assigned task | Success (200) | Success (200) | PASS |
| Create Project | Collaborator attempts to create a project | Denied (403) | Denied (403) | PASS |
| Assign Task | Collaborator attempts to assign a task | Denied (403) | Denied (403) | PASS |
| View Unassigned Project| Collaborator attempts to view private project | Denied (403) | Denied (403) | PASS |

## 4. Unauthorized Access Scenarios

| Scenario | Action | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| No Token Provided | Accessing protected route without JWT | Denied (401) | Denied (401) | PASS |
| Invalid Token | Accessing protected route with fake JWT | Denied (401) | Denied (401) | PASS |
| Expired Token | Accessing protected route with expired JWT | Denied (401) | Denied (401) | PASS |
