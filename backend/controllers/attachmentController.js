// ==============================
// controllers/attachmentController.js
// Handles saving, listing, and deleting file attachments
// ==============================

const prisma = require('../config/prisma');
const fs = require('fs');
const path = require('path');
const { getIO } = require('../sockets/socketServer');

// ==============================
// CREATE ATTACHMENT
// Called AFTER Multer has already saved the file to disk
// @route POST /api/tasks/:taskId/attachments
// ==============================
const createAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;

    // ---- STEP 1: Check that a file was actually uploaded ----
    // If Multer rejected the file (wrong type/too big) or no file was sent,
    // req.file will be undefined
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded, or file was rejected (check type/size).'
      });
    }

    // ---- STEP 2: Verify the task actually exists ----
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      // Clean up — delete the file we just saved since the task doesn't exist
      fs.unlinkSync(req.file.path);

      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // ---- STEP 3: Save the file info into the database ----
    // req.file.filename = the random name Multer generated (e.g. a8f3c21b.pdf)
    // req.file.originalname = the original name the user had (e.g. report.pdf)
    const attachment = await prisma.attachment.create({
      data: {
        fileName: req.file.originalname,   // what the user sees
        fileUrl: `/uploads/${req.file.filename}`, // where it's actually stored
        taskId: taskId,
        userId: req.user.id
      },
      include: {
        user: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    const notification = await prisma.notification.create({
  data: {
    userId: task.assignedUserId,
    message: `${req.user.name} uploaded an attachment to task: ${task.title}`
  }
});

getIO().to(task.assignedUserId).emit(
  "newNotification",
  notification
);

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      attachment
    });

  } catch (error) {
    console.error('Upload error:', error);

    // If something went wrong AFTER the file was saved, clean it up
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to upload file'
    });
  }
};

// ==============================
// GET ALL ATTACHMENTS FOR A TASK
// @route GET /api/tasks/:taskId/attachments
// ==============================
const getTaskAttachments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const attachments = await prisma.attachment.findMany({
      where: { taskId },
      include: {
        user: {
          select: { id: true, name: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      count: attachments.length,
      attachments
    });

  } catch (error) {
    console.error('Fetch attachments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch attachments'
    });
  }
};

// ==============================
// DELETE ATTACHMENT
// @route DELETE /api/attachments/:attachmentId
// ==============================
const deleteAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    // ---- STEP 1: Find the attachment ----
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId }
    });

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }



    // ---- STEP 2: Check permission ----
    // Only the uploader, Admin, or Project Manager can delete
    const isOwner = attachment.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMINISTRATOR';
    const isManager = req.user.role === 'PROJECT_MANAGER';

    if (!isOwner && !isAdmin && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this attachment'
      });
    }

    // ---- STEP 3: Delete the actual file from disk ----
    // attachment.fileUrl looks like "/uploads/a8f3c21b.pdf"
    // We need to turn that into a real file path on the server
    const filePath = path.join(__dirname, '..', attachment.fileUrl);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // delete the physical file
    }

    // ---- STEP 4: Delete the database record ----
    await prisma.attachment.delete({
      where: { id: attachmentId }
    });

    return res.status(200).json({
      success: true,
      message: 'Attachment deleted successfully'
    });

  } catch (error) {
    console.error('Delete attachment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete attachment'
    });
  }
};

module.exports = {
  createAttachment,
  getTaskAttachments,
  deleteAttachment
};