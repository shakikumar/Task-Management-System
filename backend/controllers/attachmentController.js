// ==============================
// controllers/attachmentController.js
// Handles file attachments using Supabase Storage
// Files are uploaded to Supabase bucket, not local disk
// ==============================

const prisma = require('../config/prisma');
const supabase = require('../config/supabase');
const path = require('path');
const crypto = require('crypto');

// ==============================
// CREATE ATTACHMENT
// @route POST /api/attachments/task/:taskId
// ==============================
const createAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;

    // ---- STEP 1: Check file was uploaded ----
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded or file was rejected (check type/size).'
      });
    }

    // ---- STEP 2: Check task exists ----
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // ---- STEP 3: Generate a random filename ----
    // This prevents attacks and name collisions
    // Example: a8f3c21b9e4d5f1a.pdf
    const randomName = crypto.randomBytes(16).toString('hex');
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const safeFileName = randomName + fileExtension;

    // ---- STEP 4: Upload file to Supabase Storage ----
    // req.file.buffer contains the file data in memory
    // (because we use memoryStorage() in uploadMiddleware.js)
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET) // 'attachments' bucket
      .upload(safeFileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false // don't overwrite if same name exists
      });

    // If Supabase upload failed, send error
    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload file to storage'
      });
    }

    // ---- STEP 5: Get the public URL of the uploaded file ----
    // This URL can be used by anyone to view/download the file
    const { data: urlData } = supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(safeFileName);

    const publicUrl = urlData.publicUrl;

    // ---- STEP 6: Save file info to database ----
    const attachment = await prisma.attachment.create({
      data: {
        fileName: req.file.originalname, // original name user sees
        fileUrl: publicUrl,              // Supabase public URL
        taskId: taskId,
        userId: req.user.id
      },
      include: {
        user: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully to Supabase Storage',
      attachment
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload file'
    });
  }
};

// ==============================
// GET ALL ATTACHMENTS FOR A TASK
// @route GET /api/attachments/task/:taskId
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

    // ---- STEP 1: Find the attachment in database ----
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
    const isOwner = attachment.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMINISTRATOR';
    const isManager = req.user.role === 'PROJECT_MANAGER';

    if (!isOwner && !isAdmin && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this attachment'
      });
    }

    // ---- STEP 3: Delete file from Supabase Storage ----
    // Extract just the filename from the full URL
    // URL looks like: https://xxx.supabase.co/storage/v1/object/public/attachments/a8f3c21b.pdf
    // We need just: a8f3c21b.pdf
    const fileUrl = attachment.fileUrl;
    const fileName = fileUrl.split('/').pop();

    const { error: storageError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .remove([fileName]); // remove takes an array

    if (storageError) {
      console.error('Supabase delete error:', storageError);
      // Continue anyway to delete database record
    }

    // ---- STEP 4: Delete database record ----
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