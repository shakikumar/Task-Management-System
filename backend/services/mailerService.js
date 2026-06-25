const nodemailer = require('nodemailer');

// Set up the SMTP Transport pipeline using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com', 
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, 
  auth: {
    user: process.env.SMTP_USER, // Your team system sender email
    pass: process.env.SMTP_PASS, // Your secure App Password
  },
});

const sendTaskAssignmentEmail = async (
  userEmail,
  taskTitle,
  projectName
) => {

  const mailOptions = {
    from: `"Task Management System" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: "New Task Assigned",
    html: `
      <h2>New Task Assigned</h2>

      <p>You have been assigned a new task.</p>

      <p>
        <b>Task:</b> ${taskTitle}<br/>
        <b>Project:</b> ${projectName}
      </p>
    `
  };

  await transporter.sendMail(mailOptions);
};
const sendProjectAssignmentEmail = async (
  userEmail,
  projectName
) => {

  const mailOptions = {
    from: `"Task Management System" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: "New Project Assigned",
    html: `
      <h2>New Project Assigned</h2>

      <p>You have been assigned as Project Manager.</p>

      <p>
        <b>Project:</b> ${projectName}
      </p>
    `
  };

  await transporter.sendMail(mailOptions);
};
/**
 * Asynchronous service to dispatch temporary credentials to a newly onboarded user.
 */
const sendOnboardingEmail = async (userEmail, temporaryPassword) => {
  console.log("MAILER CALLED");
  console.log("SMTP_USER:", process.env.SMTP_USER);
  const mailOptions = {
    from: `"Task Management System" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: 'Welcome to TMS - Your Temporary Account Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to the Project Platform!</h2>
        <p>An administrative account has been provisioned for you inside our system.</p>
        <p>Please use the following credentials to access your workspace:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <strong>Username / Email:</strong> <code>${userEmail}</code><br/>
          <strong>Temporary Password:</strong> <code>${temporaryPassword}</code>
        </div>
        <p style="color: #e53e3e; font-weight: bold;">
          Note: You will be forced to change this password on your first login setup.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[MailerService] Onboarding email sent to ${userEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[MailerService] Failed to send onboarding email:', error);
    return false;
  }
};

const sendDueDateReminderEmail = async (
  userEmail,
  taskTitle,
  dueDate
) => {

  const mailOptions = {
    from: `"Task Management System" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: "Task Due Date Reminder",

    html: `
      <h2>Task Reminder</h2>

      <p>Your assigned task is approaching its due date.</p>

      <p>
        <b>Task:</b> ${taskTitle}<br/>
        <b>Due Date:</b> ${new Date(
          dueDate
        ).toLocaleDateString()}
      </p>

      <p>Please complete it before the deadline.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};



module.exports = {
  sendOnboardingEmail,
  sendTaskAssignmentEmail,
  sendProjectAssignmentEmail,
  sendDueDateReminderEmail,

};