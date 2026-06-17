const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createComment,
  getTaskComments,
  deleteComment,
} = require("../controllers/commentController");

// Create Comment
router.post(
  "/task/:taskId",
  protect,
  createComment
);

// Get Comments of a Task
router.get(
  "/task/:taskId",
  protect,
  getTaskComments
);
// Delete Comment
router.delete(
  "/:commentId",
  protect,
  deleteComment
);

module.exports = router;