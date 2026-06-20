# Edge Case Testing Document

This document outlines the test cases designed to evaluate the system's resilience against edge cases and unexpected inputs.

## Test Scenarios & Expected Outcomes

### 1. Empty Request Body
**Scenario**: Sending a POST/PUT request without a payload.
**Target Endpoints**: `/api/tasks`, `/api/auth/login`, `/api/users/onboard`
**Expected Outcome**: The server should return a validation error (`400 Bad Request` or `422 Unprocessable Entity`) detailing that required fields are missing. It should not crash or return a generic `500 Internal Server Error`.

### 2. Missing Required Fields
**Scenario**: Sending a request payload with some required fields omitted.
**Target Endpoints**: `/api/tasks` (missing `title` or `projectId`)
**Expected Outcome**: `express-validator` should catch the missing fields and return a structured list of errors indicating exactly which fields are missing.

### 3. Invalid IDs
**Scenario**: Providing malformed or non-existent UUIDs in route parameters.
**Target Endpoints**: `/api/tasks/invalid-id-format`, `/api/tasks/12345678-1234-1234-1234-123456789012`
**Expected Outcome**: 
- Malformed IDs should be rejected by parameter validation (`400 Bad Request`).
- Valid UUIDs that do not exist in the database should return `404 Not Found`, not `500 Internal Server Error`.

### 4. Invalid JWT
**Scenario**: Sending a request with a malformed or fake JWT in the `Authorization` header.
**Target Endpoints**: All protected routes (e.g., `/api/tasks`)
**Expected Outcome**: The `authMiddleware` should intercept the request, fail the `jwt.verify` check, and return `401 Unauthorized` with a message like "Invalid token. Please log in again."

### 5. Expired JWT
**Scenario**: Sending a request with a token that has passed its expiration time.
**Target Endpoints**: All protected routes
**Expected Outcome**: The `authMiddleware` should catch the `TokenExpiredError` and return `401 Unauthorized` with a message prompting the user to re-authenticate.

### 6. Large Payloads
**Scenario**: Sending an excessively large string (e.g., 50MB) in a text field like `title` or `description`.
**Target Endpoints**: `/api/tasks`
**Expected Outcome**: The server should reject the request, either through the body parser limits (`express.json()`) or validation constraints, returning `413 Payload Too Large` or a validation error, preventing memory exhaustion.

### 7. Duplicate Records
**Scenario**: Attempting to onboard a user with an email that already exists.
**Target Endpoints**: `/api/auth/onboard`
**Expected Outcome**: The controller should catch the duplication before attempting a database insert, returning `400 Bad Request` with a user-friendly message such as "User with this email already exists."
