// ==============================
// routes/authRoutes.js
// This file defines WHAT URLs exist and WHO handles them
// It does NOT contain the actual logic — that's in the controller
// ==============================

const express = require('express');

// A "router" is like a mini Express app just for these routes
const router = express.Router();

// Import the controller (we'll create this next)
// The controller is where the actual login logic lives
const { login } = require('../controllers/authController');

// ==============================
// DEFINE THE ROUTES
// ==============================

// POST /api/auth/login
// When someone sends a POST request to /api/auth/login,
// run the "login" function from authController
// 
// POST means "sending data to the server" (like submitting a form)
// GET means "asking the server for data" (like loading a page)
router.post('/login', login);

// Export so server.js can use it
module.exports = router;