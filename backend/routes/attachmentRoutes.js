// ==============================
// routes/attachmentRoutes.js
// Defines the URLs for file attachments
// ==============================

const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  createAttachment,
  getTaskAttachments,
  deleteAttachment
} = require('../controllers/attachmentController');

// ==============================
// POST /api/tasks/:taskId/attachments
// Upload a file to a task
// 
// Flow: protect (check login) → upload.single('file') (Multer processes file)
//       → createAttachment (save info to database)
// ==============================
router.post(
  '/task/:taskId',
  protect,
  upload.single('file'), // 'file' = the field name the frontend must use
  createAttachment
);

// ==============================
// GET /api/tasks/:taskId/attachments
// List all files attached to a task
// ==============================
router.get(
  '/task/:taskId',
  protect,
  getTaskAttachments
);

// ==============================
// DELETE /api/attachments/:attachmentId
// Remove a file
// ==============================
router.delete(
  '/:attachmentId',
  protect,
  deleteAttachment
);


module.exports = router;