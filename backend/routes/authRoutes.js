const express = require('express');
const router = express.Router();
const { login, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { createUserOnboarding } = require('../controllers/userController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user and receive a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@tms.local
 *               password:
 *                 type: string
 *                 example: SecurePassword123!
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Missing credentials
 *       500:
 *         description: Server error
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/onboard:
 *   post:
 *     summary: Onboard a new user (Member A - Phase 2)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: Test User
 *               email:
 *                 type: string
 *                 example: testuser@gmail.com
 *               role:
 *                 type: string
 *                 enum: [ADMINISTRATOR, PROJECT_MANAGER, COLLABORATOR]
 *                 example: COLLABORATOR
 *     responses:
 *       201:
 *         description: User onboarded successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal Server Error
 */
router.post('/onboard', createUserOnboarding);
router.put('/change-password', protect, changePassword);

module.exports = router;