const prisma = require('../config/prisma');
const { getIO } = require('../sockets/socketServer');
const {
  sendTaskAssignmentEmail
} = require("./mailerService");

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

  const notification = await prisma.notification.create({
    data: {
      userId: assignedUserId,
      message: `You have been assigned task: ${newTask.title}`
    }
  });

  getIO().to(assignedUserId).emit(
    "newNotification",
    notification
  );

  try {
  await sendTaskAssignmentEmail(
    newTask.assignedUser.email,
    newTask.title,
    newTask.project.name
  );
} catch (err) {
  console.log("Task assignment email failed:", err);
}

  return newTask;
};

/**
 * Retrieve all tasks with filtering, search, sorting and pagination.
 * Role-based isolation applied for COLLABORATORs.
 */
const getAllTasks = async (filters, user) => {
  const where = {};

  // ---- FILTER 1: Status ----
  // Example: ?status=TODO
  if (filters.status) {
    where.status = filters.status;
  }

  // ---- FILTER 2: Priority ----
  // Example: ?priority=HIGH
  if (filters.priority) {
    where.priority = filters.priority;
  }

  // ---- FILTER 3: Project ----
  // Example: ?projectId=abc-123
  if (filters.projectId) {
    where.projectId = filters.projectId;
  }

  // ---- FILTER 4: Role-based isolation ----
  // Collaborators can ONLY see tasks assigned to them
  // Admins and PMs can filter by any user
  if (user.role === 'COLLABORATOR') {
    where.assignedUserId = user.id;
  } else if (filters.assignedUserId) {
    where.assignedUserId = filters.assignedUserId;
  }
  if (user.role === "PROJECT_MANAGER") {
    const myProjects = await prisma.project.findMany({
      where: {
        createdById: user.id
      },
      select: {
        id: true
      }
    });

    where.projectId = {
      in: myProjects.map(project => project.id)
    };
  }

  // ---- FILTER 5: Search by title (NEW!) ----
  // Example: ?search=login
  // This finds any task whose title CONTAINS the word "login"
  // It works case-insensitively — "Login", "LOGIN", "login" all match
  if (filters.search) {
    where.title = {
      contains: filters.search,
      mode: 'insensitive'  // ignore uppercase/lowercase
    };
  }

  // ---- FILTER 6: Date range (NEW!) ----
  // Example: ?dueAfter=2026-01-01&dueBefore=2026-12-31
  // This finds tasks due between two dates
  if (filters.dueAfter || filters.dueBefore) {
    where.dueDate = {};

    // dueAfter means "due date must be after this date"
    if (filters.dueAfter) {
      where.dueDate.gte = new Date(filters.dueAfter); // gte = greater than or equal
    }

    // dueBefore means "due date must be before this date"
    if (filters.dueBefore) {
      where.dueDate.lte = new Date(filters.dueBefore); // lte = less than or equal
    }
  }

  // ---- SORTING ----
  // Example: ?sortBy=dueDate&sortOrder=asc
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
    // Default: show newest tasks first
    orderBy.push({ createdAt: 'desc' });
  }

  // ---- PAGINATION (NEW!) ----
  // Example: ?page=2&limit=10
  // page = which page you want (default: 1)
  // limit = how many tasks per page (default: 10, max: 100)

  const page = parseInt(filters.page) || 1;    // which page? default page 1
  const limit = Math.min(parseInt(filters.limit) || 10, 100); // how many per page? max 100
  const skip = (page - 1) * limit;             // how many to skip

  // Example: page=3, limit=10
  // skip = (3-1) * 10 = 20  → skip first 20 tasks, start from task 21

  // ---- GET TOTAL COUNT ----
  // We need to know the TOTAL number of matching tasks
  // so the frontend can show "Page 2 of 15" etc.
  const totalCount = await prisma.task.count({ where });

  // ---- GET THE ACTUAL TASKS ----
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
    orderBy,
    skip,   // jump over previous pages
    take: limit  // take only this many tasks
  });

  // ---- RETURN TASKS + PAGINATION INFO ----
  return {
    tasks,
    pagination: {
      totalCount,                                    // total matching tasks
      totalPages: Math.ceil(totalCount / limit),     // how many pages total
      currentPage: page,                             // which page we're on
      limit,                                         // tasks per page
      hasNextPage: page < Math.ceil(totalCount / limit),   // is there a next page?
      hasPrevPage: page > 1                          // is there a previous page?
    }
  };
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
        select: { id: true, name: true, createdById: true }
      },
      assignedUser: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  });
  if (updateData.status) {
    const isUpdaterAssignee = updatedTask.assignedUserId === user.id;
    const recipientId = isUpdaterAssignee 
      ? updatedTask.project.createdById 
      : updatedTask.assignedUserId;

    if (recipientId && recipientId !== user.id) {
      const notification = await prisma.notification.create({
        data: {
          userId: recipientId,
          message: `Task "${updatedTask.title}" status changed to ${updatedTask.status} by ${user.name}`
        }
      });

      getIO().to(recipientId).emit(
        "newNotification",
        notification
      );
    }
  }

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

  const notification = await prisma.notification.create({
    data: {
      userId: assignedUserId,
      message: `You have been assigned task: ${updatedTask.title}`
    }
  });

  getIO().to(assignedUserId).emit(
    "newNotification",
    notification
  );
  try {
  await sendTaskAssignmentEmail(
  updatedTask.assignedUser.email,
  updatedTask.title,
  updatedTask.project.name
);
} catch (err) {
  console.log("Task assignment email failed:", err);
}
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
