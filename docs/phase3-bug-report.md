# Phase 3 Bug Report

This log tracks bugs identified during Phase 3 QA and Integration testing.

| Bug ID | Description | Severity | Reproduction Steps | Status |
|---|---|---|---|---|
| BUG-301 | Pagination on `/api/tasks` fails for page > 10 | Medium | 1. Send GET to `/api/tasks?page=11`.<br>2. Observe 500 Error. | Open |
| BUG-302 | Collaborator able to view 'Archive' button in UI | Low | 1. Login as Collaborator.<br>2. Navigate to Project details.<br>3. 'Archive' button is visible. | Open |
| BUG-303 | Token expiration not redirecting to login on specific routes | High | 1. Wait for token to expire.<br>2. Click 'My Profile'.<br>3. Page hangs instead of redirecting. | In Progress |
| BUG-304 | Duplicate project names allowed for same user | Medium | 1. Create project "Alpha".<br>2. Create another project "Alpha".<br>3. Both succeed. | Open |
| BUG-305 | Task assigned email notification missing | Low | 1. Assign task to user.<br>2. Check user's inbox.<br>3. No email received. | Pending |
