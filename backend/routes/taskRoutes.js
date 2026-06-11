const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middleware/authMiddleware');

const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask
} = require('../controllers/taskController');

const {
  validateTaskCreate,
  validateTaskUpdate,
  validateAssignTask,
  validateTaskId,
  handleValidationErrors
} = require('../validators/taskValidator');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management and tracking
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task (Admins/PMs only)
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - projectId
 *               - assignedUserId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Implement JWT"
 *               description:
 *                 type: string
 *                 example: "Secure endpoints using JWT auth tokens"
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *                 example: "HIGH"
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, COMPLETED]
 *                 example: "TODO"
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-30T12:00:00Z"
 *               projectId:
 *                 type: string
 *                 format: uuid
 *                 example: "p4444444-4444-4444-4444-444444444444"
 *               assignedUserId:
 *                 type: string
 *                 format: uuid
 *                 example: "c3333333-3333-3333-3333-333333333333"
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task created successfully"
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid input or validation errors
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (forbidden)
 *       404:
 *         description: Project or Assigned User not found
 */
router.post(
  '/',
  protect,
  restrictTo('ADMINISTRATOR', 'PROJECT_MANAGER'),
  validateTaskCreate,
  handleValidationErrors,
  createTask
);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Retrieve all tasks (Collaborators are isolated to assigned tasks)
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, COMPLETED]
 *         description: Filter tasks by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *         description: Filter tasks by priority
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter tasks by project
 *       - in: query
 *         name: assignedUserId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter tasks by assignee (ignored for Collaborators)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [dueDate, priority, createdAt]
 *         description: Sort tasks by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort ordering direction
 *     responses:
 *       200:
 *         description: Tasks fetched successfully
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
 *                   example: 1
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 */
router.get('/', protect, getAllTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Retrieve a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access Denied
 *       404:
 *         description: Task not found
 */
router.get('/:id', protect, validateTaskId, handleValidationErrors, getTaskById);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update task properties (Collaborators can only update 'status' if assigned)
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, COMPLETED]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               projectId:
 *                 type: string
 *                 format: uuid
 *               assignedUserId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Validation or parameter error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access Denied
 *       404:
 *         description: Task, Project, or Assignee not found
 */
router.put('/:id', protect, validateTaskUpdate, handleValidationErrors, updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Permanently delete a task (Admins/PMs only)
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access Denied
 *       404:
 *         description: Task not found
 */
router.delete('/:id', protect, restrictTo('ADMINISTRATOR', 'PROJECT_MANAGER'), validateTaskId, handleValidationErrors, deleteTask);

/**
 * @swagger
 * /api/tasks/{id}/assign:
 *   put:
 *     summary: Assign a task to a user (Admins/PMs only)
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignedUserId
 *             properties:
 *               assignedUserId:
 *                 type: string
 *                 format: uuid
 *                 example: "c3333333-3333-3333-3333-333333333333"
 *     responses:
 *       200:
 *         description: Task assignment updated successfully
 *       400:
 *         description: Validation error or inactive user assignment
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access Denied
 *       404:
 *         description: Task or User not found
 */
router.put('/:id/assign', protect, restrictTo('ADMINISTRATOR', 'PROJECT_MANAGER'), validateAssignTask, handleValidationErrors, assignTask);

module.exports = router;