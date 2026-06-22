const prisma = require('../config/prisma');

// Create Comment
const createComment = async (req, res) => {

  if (req.user.role === "ADMINISTRATOR") {
  return res.status(403).json({
    success: false,
    message: "Administrators cannot comment on tasks"
  });
}
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Detect mentions like @john
    const mentions = content.match(/@(\w+)/g) || [];

    console.log('Mentions Found:', mentions);

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }
const { getIO } = require("../sockets/socketServer");
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        taskId,
        userId: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });
    const notification = await prisma.notification.create({
  data: {
    userId: task.assignedUserId,
    message: `${req.user.name} commented on task: ${task.title}`
  }
});

getIO().to(task.assignedUserId).emit(
  "newNotification",
  notification
);

    res.status(201).json({
      success: true,
      comment
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to create comment'
    });
  }
};

// Get Task Comments
const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await prisma.comment.findMany({
      where: {
        taskId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments'
    });
  }
};

// Delete Comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId
      }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Owner OR Admin OR Project Manager
    const isOwner = comment.userId === req.user.id;
    
if (!isOwner) {
  return res.status(403).json({
    success: false,
    message: 'You can only delete your own comments'
  });
}

    await prisma.comment.delete({
      where: {
        id: commentId
      }
    });

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete comment'
    });
  }
};

module.exports = {
  createComment,
  getTaskComments,
  deleteComment
};