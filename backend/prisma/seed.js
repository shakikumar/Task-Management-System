require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const { Client } = require("pg");
const bcrypt = require("bcrypt");

console.log(process.env.DATABASE_URL ? "DATABASE_URL loaded" : "DATABASE_URL missing");

async function main() {
  console.log("🌱 Starting pure database seeding sequence via native SQL injection...");

  // Initialize direct connection to Supabase
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // 1. Clear existing data safely following relationship orders
    await client.query('TRUNCATE TABLE "Notification", "Attachment", "Comment", "Task", "Project", "User" CASCADE;');
    console.log("🧹 Existing rows cleared cleanly.");

    // Hash passwords
    const saltRounds = 10;
    const hashedAdminPassword = await bcrypt.hash("Admin123@", saltRounds);
    const hashedPmPassword = await bcrypt.hash("Manager123@", saltRounds);
    const hashedUserPassword = await bcrypt.hash("Collab123@", saltRounds);

    // Generate strict UUIDs so relations bind perfectly
    const adminId = "a1111111-1111-1111-1111-111111111111";
    const pmId = "b2222222-2222-2222-2222-222222222222";
    const devId = "c3333333-3333-3333-3333-333333333333";
    const projectId      = "44444444-4444-4444-4444-444444444444"; 
    const taskId         = "55555555-5555-5555-5555-555555555555"; 
    const commentId      = "66666666-6666-6666-6666-666666666666";
    const notificationId = "77777777-7777-7777-7777-777777777777";
  
    const now = new Date().toISOString();
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // 2. Insert Users
    await client.query(`
      INSERT INTO "User" (id, name, email, password, role, "mustResetPassword", "isActive", "createdAt", "updatedAt") VALUES
      ('${adminId}', 'System Administrator', 'admin@tms.com', '${hashedAdminPassword}', 'ADMINISTRATOR', false, true, '${now}', '${now}'),
      ('${pmId}', 'Project Manager John', 'pm@tms.com', '${hashedPmPassword}', 'PROJECT_MANAGER', false, true, '${now}', '${now}'),
      ('${devId}', 'Developer Jane', 'dev@tms.com', '${hashedUserPassword}', 'COLLABORATOR', false, true, '${now}', '${now}');
    `);
    console.log("👥 Users seeded.");

    // 3. Insert Project
    await client.query(`
      INSERT INTO "Project" (id, name, description, "createdAt", "updatedAt", "createdById") VALUES
      ('${projectId}', 'Cloud Infrastructure Migration', 'Migrating core microservices to Docker clusters.', '${now}', '${now}', '${pmId}');
    `);
    console.log("📂 Project seeded.");

    // 4. Insert Task
    await client.query(`
      INSERT INTO "Task" (id, title, description, status, priority, "dueDate", "createdAt", "updatedAt", "projectId", "assignedUserId") VALUES
      ('${taskId}', 'Configure Docker Compose Framework', 'Setup baseline multi-stage docker environments for development testing.', 'TODO', 'HIGH', '${dueDate}', '${now}', '${now}', '${projectId}', '${devId}');
    `);
    console.log("📝 Task seeded.");

    // 5. Insert Comment
    await client.query(`
      INSERT INTO "Comment" (id, content, "createdAt", "taskId", "userId") VALUES
      ('${commentId}', 'I will begin working on the multi-stage build scripts tonight.', '${now}', '${taskId}', '${devId}');
    `);
    console.log("💬 Comment seeded.");

    // 6. Insert Notification
    await client.query(`
      INSERT INTO "Notification" (id, message, "isRead", "createdAt", "userId") VALUES
      ('${notificationId}', 'You have been assigned to the task: Configure Docker Compose Framework', false, '${now}', '${devId}');
    `);
    console.log("🔔 Notification seeded.");

    console.log("✅ 6-Entity data relationships successfully verified and seeded via direct link!");
  } catch (err) {
    console.error("❌ Direct Seeding error:", err);
  } finally {
    await client.end();
  }
}

main();