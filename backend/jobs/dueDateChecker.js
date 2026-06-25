const cron = require("node-cron");

const prisma = require("../config/prisma");

const {
  sendDueDateReminderEmail
} = require("../services/mailerService");

const { getIO } = require("../sockets/socketServer");

cron.schedule("0 9 * * *", async () => {

    console.log("CRON RUNNING", new Date());

  console.log(
    "Running Due Date Reminder Check..."
  );

  try {

    const tomorrow = new Date();

    tomorrow.setDate(
      tomorrow.getDate() + 1
    );

    tomorrow.setHours(0, 0, 0, 0);

    const nextDay = new Date(tomorrow);

    nextDay.setDate(
      nextDay.getDate() + 1
    );

    const tasks =
      await prisma.task.findMany({
        where: {
          dueDate: {
            gte: tomorrow,
            lt: nextDay
          },
          status: {
            not: "COMPLETED"
          }
        },

        include: {
          assignedUser: true
        }
      });

    for (const task of tasks) {

      const notification =
        await prisma.notification.create({
          data: {
            userId:
              task.assignedUserId,

            message:
              `Task "${task.title}" is due tomorrow`
          }
        });

      getIO()
        .to(task.assignedUserId)
        .emit(
          "newNotification",
          notification
        );

      await sendDueDateReminderEmail(
        task.assignedUser.email,
        task.title,
        task.dueDate
      );

      console.log(
        `Reminder sent for ${task.title}`
      );
    }

  } catch (error) {

    console.error(
      "Due Date Reminder Error:",
      error
    );

  }

});