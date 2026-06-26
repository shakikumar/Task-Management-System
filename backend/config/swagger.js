// ==============================
// config/swagger.js
// Swagger API Documentation Configuration
// Uses swagger-jsdoc to read JSDoc comments and swagger-ui-express to serve the UI
// ==============================

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management System API',
      version: '1.0.0',
      description: `
## Task Management System — REST API

A full-featured task management platform built with **Node.js + Express**, **Prisma ORM**, and **Supabase PostgreSQL**.

### Authentication
All protected routes require a **Bearer JWT token** in the \`Authorization\` header:
\`\`\`
Authorization: Bearer <your_token>
\`\`\`

### Roles
| Role | Description |
|------|-------------|
| \`ADMINISTRATOR\` | Full system access |
| \`PROJECT_MANAGER\` | Manage projects and tasks |
| \`COLLABORATOR\` | View and update assigned tasks |
      `,
      contact: {
        name: 'TMS Support',
        email: 'support@tms.local',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://your-production-domain.com'
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from POST /api/auth/login',
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────────────────────────
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@tms.local',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'SecurePassword123!',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: { $ref: '#/components/schemas/UserSummary' },
          },
        },

        // ── User ─────────────────────────────────────────────────────────────
        UserSummary: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'c1a2b3d4-...' },
            name: { type: 'string', example: 'Alice Admin' },
            email: { type: 'string', format: 'email', example: 'alice@tms.local' },
            role: {
              type: 'string',
              enum: ['ADMINISTRATOR', 'PROJECT_MANAGER', 'COLLABORATOR'],
              example: 'ADMINISTRATOR',
            },
            mustResetPassword: { type: 'boolean', example: false },
          },
        },

        // ── Project ───────────────────────────────────────────────────────────
        Project: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Website Redesign' },
            description: { type: 'string', example: 'Revamp the company website' },
            createdById: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ── Task ──────────────────────────────────────────────────────────────
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Design landing page' },
            description: { type: 'string', example: 'Create wireframes and mockups' },
            status: {
              type: 'string',
              enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'],
              example: 'TODO',
            },
            priority: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH'],
              example: 'HIGH',
            },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            projectId: { type: 'string', format: 'uuid' },
            assignedUserId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ── Comment ───────────────────────────────────────────────────────────
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            content: { type: 'string', example: 'Great progress on this task!' },
            taskId: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // ── Attachment ────────────────────────────────────────────────────────
        Attachment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'e5f6g7h8-...' },
            fileName: { type: 'string', example: 'document.pdf' },
            fileUrl: { type: 'string', example: 'https://supabase.co/storage/v1/object/public/attachments/example.pdf' },
            taskId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
            userId: { type: 'string', format: 'uuid', example: 'u1v2w3x4-...' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // ── Notification ──────────────────────────────────────────────────────
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            message: { type: 'string', example: 'You have been assigned a new task.' },
            isRead: { type: 'boolean', example: false },
            userId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // ── Errors ────────────────────────────────────────────────────────────
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'An error occurred.' },
          },
        },
      },
    },
    // Apply Bearer auth globally — individual routes can opt out
    security: [{ BearerAuth: [] }],
  },
  // Glob patterns pointing to files that contain @swagger JSDoc comments
  apis: [
    './routes/*.js',
    './controllers/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
