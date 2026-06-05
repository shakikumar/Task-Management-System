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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints — login and session management
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user and receive a JWT token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             admin:
 *               summary: Administrator login
 *               value:
 *                 email: admin@tms.local
 *                 password: SecurePassword123!
 *             collaborator:
 *               summary: Collaborator login
 *               value:
 *                 email: user@tms.local
 *                 password: UserPassword456!
 *     responses:
 *       200:
 *         description: Login successful — returns JWT token and user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Please provide both email and password
 *       401:
 *         description: Invalid credentials (wrong email or password)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Invalid credentials
 *       403:
 *         description: Account deactivated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Your account has been deactivated. Contact your administrator.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// POST /api/auth/login
// When someone sends a POST request to /api/auth/login,
// run the "login" function from authController
// 
// POST means "sending data to the server" (like submitting a form)
// GET means "asking the server for data" (like loading a page)
router.post('/login', login);

// Export so server.js can use it
module.exports = router;