const prisma = require('../config/prisma');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
  }
}

/**
 * Create a new task.
 * Restricted to ADMINISTRATOR and PROJECT_MANAGER.
 */
const createTask = async (data) => {
  const { title, description, priority, dueDate, projectId, assignedUserId, status } = data;

  // 1. Verify project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });
  if (!project) {
    throw new AppError('Project not found with the provided projectId', 404);
  }

  // 2. Verify assignee exists and is active
  const assignee = await prisma.user.findUnique({
    where: { id: assignedUserId }
  });
  if (!assignee) {
    throw new AppError('Assigned user not found with the provided assignedUserId', 404);
  }
  if (!assignee.isActive) {
    throw new AppError('Cannot assign task to a deactivated user', 400);
  }

  // 3. Create task
  const newTask = await prisma.task.create({
    data: {
      title,
      description,
      priority: priority || 'MEDIUM',
      status: status || 'TODO',
      dueDate: dueDate ? new Date(dueDate) : null,
      projectId,
      assignedUserId
    },
    include: {
      project: {
        select: { id: true, name: true }
      },
      assignedUser: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  });

  return newTask;
};

/**
 * Retrieve all tasks with sorting and filtering.
 * Role-based isolation applied for COLLABORATORs.
 */
const getAllTasks = async (filters, user) => {
  const where = {};

  // Apply basic filters
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.priority) {
    where.priority = filters.priority;
  }
  if (filters.projectId) {
    where.projectId = filters.projectId;
  }

  // Enforce Collaborator Isolation
  if (user.role === 'COLLABORATOR') {
    where.assignedUserId = user.id;
  } else if (filters.assignedUserId) {
    // Admins and PMs can filter by assigned user
    where.assignedUserId = filters.assignedUserId;
  }

  // Construct Sorting
  const orderBy = [];
  if (filters.sortBy) {
    const field = filters.sortBy;
    const order = filters.sortOrder === 'desc' ? 'desc' : 'asc';

    if (['dueDate', 'priority', 'createdAt'].includes(field)) {
      orderBy.push({ [field]: order });
    } else {
      orderBy.push({ createdAt: 'desc' });
    }
  } else {
    // Default sort
    orderBy.push({ createdAt: 'desc' });
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      project: {
        select: { id: true, name: true }
      },
      assignedUser: {
        select: { id: true, name: true, email: true, role: true }
      }
    },
    orderBy
  });

  return tasks;
};

/**
 * Get task by ID with role-based check for collaborators.
 */
const getTaskById = async (id, user) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      project: {
        select: { id: true, name: true }
      },
      assignedUser: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Enforce role-based access check
  if (user.role === 'COLLABORATOR' && task.assignedUserId !== user.id) {
    throw new AppError('Access denied. You can only view tasks assigned to you.', 403);
  }

  return task;
};

/**
 * Update task.
 * Administrators and Project Managers can update all fields.
 * Collaborators can only update 'status' for tasks assigned to them.
 */
const updateTask = async (id, updateData, user) => {
  // Retrieve current task details
  const task = await prisma.task.findUnique({
    where: { id }
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const dataToUpdate = {};

  if (user.role === 'COLLABORATOR') {
    // Check ownership/assignment
    if (task.assignedUserId !== user.id) {
      throw new AppError('Access denied. You can only update tasks assigned to you.', 403);
    }

    // Verify collaborator isn't attempting to modify other fields
    const requestedFields = Object.keys(updateData);
    const hasOtherFields = requestedFields.some(field => field !== 'status');
    if (hasOtherFields) {
      throw new AppError('Access denied. Collaborators can only update the status of their assigned tasks.', 403);
    }

    if (updateData.status) {
      dataToUpdate.status = updateData.status;
    }
  } else {
    // Administrator or Project Manager
    if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
    if (updateData.status !== undefined) dataToUpdate.status = updateData.status;
    if (updateData.priority !== undefined) dataToUpdate.priority = updateData.priority;
    if (updateData.dueDate !== undefined) {
      dataToUpdate.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
    }

    // Verify updated projectId exists
    if (updateData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: updateData.projectId }
      });
      if (!project) {
        throw new AppError('Project not found with the provided projectId', 404);
      }
      dataToUpdate.projectId = updateData.projectId;
    }

    // Verify updated assignedUserId exists and is active
    if (updateData.assignedUserId) {
      const assignee = await prisma.user.findUnique({
        where: { id: updateData.assignedUserId }
      });
      if (!assignee) {
        throw new AppError('Assigned user not found with the provided assignedUserId', 404);
      }
      if (!assignee.isActive) {
        throw new AppError('Cannot assign task to a deactivated user', 400);
      }
      dataToUpdate.assignedUserId = updateData.assignedUserId;
    }
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: dataToUpdate,
    include: {
      project: {
        select: { id: true, name: true }
      },
      assignedUser: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  });

  return updatedTask;
};

/**
 * Permanently delete task.
 * Restricted to ADMINISTRATOR and PROJECT_MANAGER.
 */
const deleteTask = async (id) => {
  const task = await prisma.task.findUnique({
    where: { id }
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  await prisma.task.delete({
    where: { id }
  });
};

/**
 * Assign task to a user.
 * Restricted to ADMINISTRATOR and PROJECT_MANAGER.
 */
const assignTask = async (id, assignedUserId) => {
  // 1. Verify task exists
  const task = await prisma.task.findUnique({
    where: { id }
  });
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // 2. Verify assignee exists and is active
  const assignee = await prisma.user.findUnique({
    where: { id: assignedUserId }
  });
  if (!assignee) {
    throw new AppError('Assigned user not found with the provided assignedUserId', 404);
  }
  if (!assignee.isActive) {
    throw new AppError('Cannot assign task to a deactivated user', 400);
  }

  // 3. Update task assignment
  const updatedTask = await prisma.task.update({
    where: { id },
    data: { assignedUserId },
    include: {
      project: {
        select: { id: true, name: true }
      },
      assignedUser: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  });

  return updatedTask;
};

/**
 * Get all tasks belonging to a specific project.
 * Restricts Collaborators to only view their assigned tasks in the project.
 */
const getTasksByProjectId = async (projectId, user) => {
  // 1. Verify project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // 2. Build where filter
  const where = { projectId };
  if (user.role === 'COLLABORATOR') {
    where.assignedUserId = user.id;
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      project: {
        select: { id: true, name: true }
      },
      assignedUser: {
        select: { id: true, name: true, email: true, role: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return tasks;
};

module.exports = {
  AppError,
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  getTasksByProjectId
};
