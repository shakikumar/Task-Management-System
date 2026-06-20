const prisma = require("../config/prisma");

// ==============================
// GET USER NOTIFICATIONS
// ==============================
const getNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: req.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json({
            success: true,
            notifications,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
};

// ==============================
// MARK AS READ
// ==============================
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await prisma.notification.update({
            where: { id },
            data: {
                isRead: true,
            },
        });

        res.json({
            success: true,
            notification,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to update notification",
        });
    }
};

// ==============================
// MARK AS all  READ
// ==============================
const markAllAsRead = async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: {
                userId: req.user.id,
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        res.json({
            success: true,
            message: "All notifications marked as read"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to update notifications"
        });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};