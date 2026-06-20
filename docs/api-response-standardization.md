# API Response Standardization Report

## Overview
This document outlines the inconsistencies found in the API responses during Phase 4 QA testing.

## 1. Success Response Format
**Status**: ❌ Inconsistent

**Findings**:
Different endpoints return different success structures.
- **Task Creation (`taskController.js`)**:
  ```json
  {
    "success": true,
    "message": "Task created successfully",
    "task": { ... }
  }
  ```
- **User Onboarding (`userController.js`)**:
  ```json
  {
    "message": "User account created successfully...",
    "user": { ... }
  }
  ```
- **Task Pagination (`taskController.js`)**:
  ```json
  {
    "success": true,
    "count": 10,
    "pagination": { ... },
    "tasks": [ ... ]
  }
  ```

**Recommendation**: All success responses should wrap the data in a `data` object and consistently include the `success: true` flag.

## 2. Error Response Format
**Status**: ❌ Inconsistent

**Findings**:
As noted in the Error Handling Review, error payloads lack a unified schema.
- Format A: `{ "success": false, "message": "..." }`
- Format B: `{ "error": "..." }`
- Format C: `{ "success": false, "errors": [...] }`

**Recommendation**: Adopt a standard error format that includes an error code, message, and optional details array for validation errors.
Example target format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": [
      { "field": "email", "message": "Must be a valid email" }
    ]
  }
}
```

## 3. General Inconsistencies
- Some endpoints return the created entity using the entity's name as the key (e.g., `"task": {}`), while others use standard naming like `"data": {}`. Using `"data"` makes frontend parsing more generic and reusable.
- Pagination metadata is included at the root level instead of inside a `meta` object, polluting the root response object.
