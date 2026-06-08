// ==============================
// routes/userRoutes.js
// Defines all URL paths for User Management
// ALL routes here require: Login token + ADMINISTRATOR role
// ==============================

const express = require('express');
const router = express.Router();

// Import security middlewares from Phase 1
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Import all 5 functions from userController
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userManagementController');

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create user
 *     tags: [Users]
 */
// POST /api/users → Create a new user
router.post('/', protect, restrictTo('ADMINISTRATOR'), createUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 */
// GET /api/users → Get list of all users
router.get('/', protect, restrictTo('ADMINISTRATOR'), getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 */
// GET /api/users/:id → Get one specific user
router.get('/:id', protect, restrictTo('ADMINISTRATOR'), getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 */
// PUT /api/users/:id → Update a user
router.put('/:id', protect, restrictTo('ADMINISTRATOR'), updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 */
// DELETE /api/users/:id → Delete a user
router.delete('/:id', protect, restrictTo('ADMINISTRATOR'), deleteUser);

module.exports = router;