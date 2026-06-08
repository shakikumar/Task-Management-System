// ==============================
// routes/projectRoutes.js
// Defines all URL paths for Project Management
// Admin = full access
// Project Manager = create + view all + edit/delete own projects
// ==============================

const express = require('express');
const router = express.Router();

// Import security middlewares from Phase 1
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Import all 5 functions from projectController
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create project
 *     tags: [Projects]
 */
// POST /api/projects → Create a new project
router.post('/', protect, restrictTo('ADMINISTRATOR', 'PROJECT_MANAGER'), createProject);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 */
// GET /api/projects → Get all projects
router.get('/', protect, restrictTo('ADMINISTRATOR', 'PROJECT_MANAGER'), getAllProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 */
// GET /api/projects/:id → Get one project with its tasks
router.get('/:id', protect, restrictTo('ADMINISTRATOR', 'PROJECT_MANAGER'), getProjectById);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project
 *     tags: [Projects]
 */
// PUT /api/projects/:id → Update a project
router.put('/:id', protect, restrictTo('ADMINISTRATOR', 'PROJECT_MANAGER'), updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete project
 *     tags: [Projects]
 */
// DELETE /api/projects/:id → Delete a project and all its tasks
router.delete('/:id', protect, restrictTo('ADMINISTRATOR', 'PROJECT_MANAGER'), deleteProject);

module.exports = router;