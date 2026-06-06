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
} = require('../controllers/userController');

// POST /api/users → Create a new user
router.post('/', protect, restrictTo('ADMINISTRATOR'), createUser);

// GET /api/users → Get list of all users
router.get('/', protect, restrictTo('ADMINISTRATOR'), getAllUsers);

// GET /api/users/:id → Get one specific user
router.get('/:id', protect, restrictTo('ADMINISTRATOR'), getUserById);

// PUT /api/users/:id → Update a user
router.put('/:id', protect, restrictTo('ADMINISTRATOR'), updateUser);

// DELETE /api/users/:id → Delete a user
router.delete('/:id', protect, restrictTo('ADMINISTRATOR'), deleteUser);

module.exports = router;