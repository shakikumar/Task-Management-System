const { body, param, validationResult } = require('express-validator');

// Create Task Validation rules
const validateTaskCreate = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .trim(),
  body('projectId')
    .notEmpty().withMessage('projectId is required')
    .isString().withMessage('projectId must be a string'),
  body('assignedUserId')
    .notEmpty().withMessage('assignedUserId is required')
    .isString().withMessage('assignedUserId must be a string'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Priority must be one of LOW, MEDIUM, HIGH'),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'COMPLETED']).withMessage('Status must be one of TODO, IN_PROGRESS, COMPLETED'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('dueDate must be a valid ISO8601 date')
];

// Update Task Validation rules
const validateTaskUpdate = [
  param('id')
    .isString().withMessage('Task ID must be a valid string'),
  body('title')
    .optional()
    .isString().withMessage('Title must be a string')
    .trim(),
  body('projectId')
    .optional()
    .isString().withMessage('projectId must be a string'),
  body('assignedUserId')
    .optional()
    .isString().withMessage('assignedUserId must be a string'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Priority must be one of LOW, MEDIUM, HIGH'),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'COMPLETED']).withMessage('Status must be one of TODO, IN_PROGRESS, COMPLETED'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('dueDate must be a valid ISO8601 date')
];

// Assign Task Validation rules
const validateAssignTask = [
  param('id')
    .isString().withMessage('Task ID must be a valid string'),
  body('assignedUserId')
    .notEmpty().withMessage('assignedUserId is required')
    .isString().withMessage('assignedUserId must be a string')
];

// ID Validation rules
const validateTaskId = [
  param('id')
    .isString().withMessage('Task ID must be a valid string')
];

const validateProjectId = [
  param('projectId')
    .isString().withMessage('Project ID must be a valid string')
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateTaskCreate,
  validateTaskUpdate,
  validateAssignTask,
  validateTaskId,
  validateProjectId,
  handleValidationErrors
};
