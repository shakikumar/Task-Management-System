// ==============================
// controllers/projectController.js
// Handles everything related to PROJECTS
// Admin = full access
// Project Manager = can only edit/delete their own projects
// ==============================

const prisma = require('../config/prisma');

// ── CREATE PROJECT ───────────────────────────────────────────────────────────
// POST /api/projects
const createProject = async (req, res) => {
  try {
    const { name, description, status, ownerId } = req.body;
    
    console.log("STATUS RECEIVED:", status);

    // Name is required
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    // Name must be at least 3 characters
    if (name.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Project name must be at least 3 characters long'
      });
    }

    // Create the project — req.user.id records WHO created it
    const newProject = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        status: status || "PLANNING",
        createdById: ownerId || req.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: newProject
    });

  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
};

// ── GET ALL PROJECTS ─────────────────────────────────────────────────────────
// GET /api/projects
const getAllProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        // Count how many tasks each project has
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects: projects
    });

  } catch (error) {
    console.error('Get all projects error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
};

// ── GET ONE PROJECT ──────────────────────────────────────────────────────────
// GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        // Also show all tasks inside this project
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            assignedUser: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { tasks: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    return res.status(200).json({
      success: true,
      project: project
    });

  } catch (error) {
    console.error('Get project by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
};

// ── UPDATE PROJECT ───────────────────────────────────────────────────────────
// PUT /api/projects/:id
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: id }
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Project Managers can only update their OWN projects
    if (req.user.role === 'PROJECT_MANAGER' && existingProject.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update projects that you created'
      });
    }

    // Validate name if provided
    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Project name cannot be empty'
        });
      }
      if (name.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Project name must be at least 3 characters long'
        });
      }
    }

    // Only update fields that were actually sent
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();

    const updatedProject = await prisma.project.update({
      where: { id: id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        _count: { select: { tasks: true } }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    });

  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
};

// ── DELETE PROJECT ───────────────────────────────────────────────────────────
// DELETE /api/projects/:id
// WARNING: Deleting a project also deletes ALL tasks inside it!
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Check project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: id }
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Project Managers can only delete their OWN projects
    if (req.user.role === 'PROJECT_MANAGER' && existingProject.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete projects that you created'
      });
    }

    await prisma.project.delete({ where: { id: id } });

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject
};