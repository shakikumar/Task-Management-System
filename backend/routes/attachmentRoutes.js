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

/**
 * @swagger
 * tags:
 *   name: Attachments
 *   description: Task file attachments management
 */

/**
 * @swagger
 * /api/attachments/task/{taskId}:
 *   post:
 *     summary: Upload an attachment to a task
 *     description: Uploads a file as an attachment to the specified task and saves its info in the database. Files are stored on Supabase Storage. Triggers a notification for the task assignee.
 *     tags: [Attachments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the task to attach the file to
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file binary data to upload (field name must be 'file')
 *     responses:
 *       201:
 *         description: File uploaded successfully
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
 *                   example: File uploaded successfully to Supabase Storage
 *                 attachment:
 *                   $ref: '#/components/schemas/Attachment'
 *       400:
 *         description: No file uploaded or invalid file format/size
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/task/:taskId',
  protect,
  upload.single('file'), // 'file' = the field name the frontend must use
  createAttachment
);

/**
 * @swagger
 * /api/attachments/task/{taskId}:
 *   get:
 *     summary: Retrieve attachments for a task
 *     description: Fetches all file attachments uploaded to the specified task, ordered by creation date descending.
 *     tags: [Attachments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the task to fetch attachments for
 *     responses:
 *       200:
 *         description: Attachments retrieved successfully
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
 *                 attachments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attachment'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/task/:taskId',
  protect,
  getTaskAttachments
);

/**
 * @swagger
 * /api/attachments/{attachmentId}:
 *   delete:
 *     summary: Delete an attachment by ID
 *     description: Permanently deletes an attachment from the database and removes its associated file from Supabase Storage. Only the owner, an administrator, or a project manager is allowed to delete it.
 *     tags: [Attachments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the attachment to delete
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
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
 *                   example: Attachment deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - No permission to delete this attachment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Attachment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  '/:attachmentId',
  protect,
  deleteAttachment
);


module.exports = router;