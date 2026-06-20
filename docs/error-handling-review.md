# Error Handling Review

## 1. Global Error Middleware
**Status**: ❌ Missing
**Finding**: The application currently lacks a centralized global error handling middleware in `server.js` (e.g., `app.use((err, req, res, next) => { ... })`).
**Impact**:
- Uncaught exceptions or unhandled promise rejections may crash the server.
- Error handling logic is currently duplicated across individual controllers inside `try/catch` blocks.
- There is no central place to log errors to an external monitoring service.

**Recommendation**: Implement a global error handler at the end of the middleware stack in `server.js` to catch any errors forwarded via `next(err)` and return a standardized response.

## 2. HTTP Status Codes
**Status**: ⚠️ Needs Improvement
**Finding**: The application uses standard HTTP status codes (200, 201, 400, 401, 403, 404, 500) correctly in most cases. However, there are areas for improvement:
- Validation errors currently return `400 Bad Request`. It is a best practice to return `422 Unprocessable Entity` for semantic validation errors.
- Some resources that are not found might return `400` or a generic `500` if the database query fails due to an invalid UUID format.

**Recommendation**: Standardize the use of `422` for validation errors and ensure `404` is returned consistently when a database record is not found.

## 3. Error Message Consistency
**Status**: ❌ Inconsistent
**Finding**: Error responses are not standardized across different controllers. 
- In `taskController.js` and `authController.js`, errors are returned as:
  ```json
  {
    "success": false,
    "message": "Error description"
  }
  ```
- In `userController.js`, errors are returned as:
  ```json
  {
    "error": "Error description"
  }
  ```
- In `taskValidator.js`, validation errors are returned as:
  ```json
  {
    "success": false,
    "errors": [
      { "field": "title", "message": "Title is required" }
    ]
  }
  ```

**Recommendation**: Create a centralized error response utility function to guarantee that every error returned by the API follows the exact same JSON schema.
