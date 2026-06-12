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

const taskService = require('../services/taskService');
const { validateProjectId, handleValidationErrors } = require('../validators/taskValidator');

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

/**
 * @swagger
 * /api/projects/{projectId}/tasks:
 *   get:
 *     summary: Get tasks belonging to a specific project (Project Isolation)
 *     tags: [Projects, Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of tasks for this project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.get('/:projectId/tasks', protect, validateProjectId, handleValidationErrors, async (req, res) => {
  try {
    const tasks = await taskService.getTasksByProjectId(req.params.projectId, req.user);
    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch project tasks'
    });
  }
});

module.exports = router;