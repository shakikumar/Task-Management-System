// Set up Brevo Transporter using HTTP API and native fetch
const sendEmail = async (toEmail, subject, htmlContent) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "taskmanagementsystem2026@gmail.com";

  if (!apiKey) {
    console.error("[MailerService] BREVO_API_KEY is not defined in environment.");
    return false;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: "Task Management System",
          email: senderEmail
        },
        to: [
          {
            email: toEmail
          }
        ],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[MailerService] Brevo API error:", data);
      return false;
    }

    console.log(`[MailerService] Email sent successfully to ${toEmail}. Message ID:`, data.messageId);
    return true;
  } catch (error) {
    console.error("[MailerService] Failed to send email via Brevo API:", error);
    return false;
  }
};

const sendTaskAssignmentEmail = async (
  userEmail,
  taskTitle,
  projectName
) => {
  const subject = "New Task Assigned";
  const html = `
    <h2>New Task Assigned</h2>

    <p>You have been assigned a new task.</p>

    <p>
      <b>Task:</b> ${taskTitle}<br/>
      <b>Project:</b> ${projectName}
    </p>
  `;

  await sendEmail(userEmail, subject, html);
};

const sendProjectAssignmentEmail = async (
  userEmail,
  projectName
) => {
  const subject = "New Project Assigned";
  const html = `
    <h2>New Project Assigned</h2>

    <p>You have been assigned as Project Manager.</p>

    <p>
      <b>Project:</b> ${projectName}
    </p>
  `;

  await sendEmail(userEmail, subject, html);
};

/**
 * Asynchronous service to dispatch temporary credentials to a newly onboarded user.
 */
const sendOnboardingEmail = async (userEmail, temporaryPassword) => {
  console.log("MAILER CALLED (BREVO)");
  const subject = "Welcome to TMS - Your Temporary Account Credentials";
  const html = `
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
  `;

  return await sendEmail(userEmail, subject, html);
};

const sendDueDateReminderEmail = async (
  userEmail,
  taskTitle,
  dueDate
) => {
  const subject = "Task Due Date Reminder";
  const html = `
    <h2>Task Reminder</h2>

    <p>Your assigned task is approaching its due date.</p>

    <p>
      <b>Task:</b> ${taskTitle}<br/>
      <b>Due Date:</b> ${new Date(
        dueDate
      ).toLocaleDateString()}
    </p>

    <p>Please complete it before the deadline.</p>
  `;

  await sendEmail(userEmail, subject, html);
};

module.exports = {
  sendOnboardingEmail,
  sendTaskAssignmentEmail,
  sendProjectAssignmentEmail,
  sendDueDateReminderEmail,
};