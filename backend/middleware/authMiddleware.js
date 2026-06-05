// ==============================
// middleware/authMiddleware.js
// This file protects routes that require login
// Think of it as the security guard checking visitor passes
// ==============================

const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// ==============================
// MIDDLEWARE 1: protect
// Checks if the user is logged in at all
// Use this on ANY route that requires login
// ==============================

const protect = async (req, res, next) => {

  try {

    // ---- STEP 1: Look for the token in the request headers ----
    // When the frontend makes a request, it sends the token like this:
    // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    // We need to extract just the token part (remove the word "Bearer ")
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Split "Bearer eyJhbG..." into ["Bearer", "eyJhbG..."]
    // Take index [1] which is just the token
    const token = authHeader.split(' ')[1];

    // ---- STEP 2: Verify the token is real and not expired ----
    // jwt.verify checks:
    // 1. Was this token created by our server? (checks the secret key)
    // 2. Has it expired yet?
    // If either check fails, it throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded now looks like: { userId: "abc123", role: "COLLABORATOR" }

    // ---- STEP 3: Check the user still exists in database ----
    // The token might be valid but the user could have been deleted
    // This extra check makes sure the user is still real and active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated.'
      });
    }

    // ---- STEP 4: Attach user info to the request ----
    // We save the user details onto req.user
    // This means any route after this middleware can access req.user
    // Example: in a later controller you can do req.user.role or req.user.id
    req.user = user;

    // ---- STEP 5: Call next() to continue ----
    // next() means "this user passed the check, let them through"
    // Without calling next(), the request would just hang forever
    next();

  } catch (error) {

    // If jwt.verify fails (fake token or expired), it throws an error
    // We catch it here and send back a clear message
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }

};

// ==============================
// MIDDLEWARE 2: restrictTo
// Checks if the logged-in user has the RIGHT ROLE
// Use this AFTER protect on routes only certain roles can access
// 
// Example usage:
// router.delete('/users/:id', protect, restrictTo('ADMINISTRATOR'), deleteUser)
// Only admins can delete users
// ==============================

const restrictTo = (...allowedRoles) => {
  // This returns a middleware function
  // allowedRoles is the list of roles you pass in
  // Example: restrictTo('ADMINISTRATOR', 'PROJECT_MANAGER')
  return (req, res, next) => {

    // By this point, protect() has already run
    // So req.user exists and has the user's role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of these roles: ${allowedRoles.join(', ')}`
      });
    }

    // Role is allowed — let them through
    next();
  };
};

// Export both so routes can use them
module.exports = { protect, restrictTo };