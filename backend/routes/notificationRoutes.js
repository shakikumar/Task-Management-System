const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");

// Get all notifications
router.get("/", protect, getNotifications);


// Mark notification as read
router.put("/read-all", protect, markAllAsRead);
router.put("/:id/read", protect, markAsRead);

module.exports = router;