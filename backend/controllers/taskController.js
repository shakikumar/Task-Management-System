const taskService = require('../services/taskService');

// Global error mapper helper
const mapErrorResponse = (res, error, defaultMsg) => {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: error.message || defaultMsg
  });
};

/**
 * @desc Create a new task
 * @route POST /api/tasks
 * @access Private (ADMINISTRATOR, PROJECT_MANAGER)
 */
const createTask = async (req, res) => {
  if (req.user.role !== "PROJECT_MANAGER") {
  return res.status(403).json({
    success: false,
    message:
      "Only Project Managers can create tasks"
  });
}
  try {
    const task = await taskService.createTask(req.body);
    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    return mapErrorResponse(res, error, 'Failed to create task');
  }
};

/**
 * @desc Get all tasks (with filters and sorting)
 * @route GET /api/tasks
 * @access Private
 */
const getAllTasks = async (req, res) => {
  try {
    const result = await taskService.getAllTasks(req.query, req.user);
    return res.status(200).json({
      success: true,
      count: result.tasks.length,
      pagination: result.pagination,
      tasks: result.tasks
    });
  } catch (error) {
    return mapErrorResponse(res, error, 'Failed to fetch tasks');
  }
};

/**
 * @desc Get details of a single task
 * @route GET /api/tasks/:id
 * @access Private
 */
const getTaskById = async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    return mapErrorResponse(res, error, 'Failed to fetch task');
  }
};

/**
 * @desc Update task details
 * @route PUT /api/tasks/:id
 * @access Private (Admins/PMs can update all; Collaborators can update status only)
 */
const updateTask = async (req, res) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user);
    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    return mapErrorResponse(res, error, 'Failed to update task');
  }
};

/**
 * @desc Permanently delete a task
 * @route DELETE /api/tasks/:id
 * @access Private (ADMINISTRATOR, PROJECT_MANAGER)
 */
const deleteTask = async (req, res) => {
  if (req.user.role !== "PROJECT_MANAGER") {
  return res.status(403).json({
    success: false,
    message:
      "Only Project Managers can delete tasks"
  });
}
  try {
    await taskService.deleteTask(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    return mapErrorResponse(res, error, 'Failed to delete task');
  }
};

/**
 * @desc Assign task to a user
 * @route PUT /api/tasks/:id/assign
 * @access Private (ADMINISTRATOR, PROJECT_MANAGER)
 */
const assignTask = async (req, res) => {
  try {
    const { assignedUserId } = req.body;
    const task = await taskService.assignTask(req.params.id, assignedUserId);
    return res.status(200).json({
      success: true,
      message: 'Task assigned successfully',
      task
    });
  } catch (error) {
    return mapErrorResponse(res, error, 'Failed to assign task');
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask
};