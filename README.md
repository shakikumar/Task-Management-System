# 📋 Task Management System (TMS)

A modern full-stack **Task Management System** developed for collaborative project management. The system enables administrators, project managers, and collaborators to efficiently manage users, projects, tasks, comments, notifications and file attachments with real-time updates and secure authentication.

---

# 🚀 Project Overview

The Task Management System (TMS) is designed to improve project collaboration by providing secure role-based access, real-time communication, task assignment, project tracking, and centralized management.

The application follows a modern client-server architecture using **React**, **Node.js**, **Express**, **PostgreSQL**, **Prisma ORM**, **Supabase**, and **Socket.IO**.

---

# ✨ Features

### Authentication & Security
- JWT Authentication
- Role-Based Access Control (RBAC)
- Password Encryption (bcrypt)
- Protected Routes
- Axios JWT Interceptor
- Global Error Handling
- Input Validation
- Security Testing

### User Management
- Create Users
- Update Users
- Delete Users
- User Profile Management
- Role Management

### Project Management
- Create Projects
- Update Projects
- Delete Projects
- View Projects
- Project Assignment

### Task Management
- Create Tasks
- Update Tasks
- Delete Tasks
- Assign Tasks
- Change Task Status
- Due Date Management

### Collaboration
- Task Comments
- Notifications
- Real-Time Updates
- Socket.IO Integration

### File Management
- File Attachments
- Supabase Storage Integration

### Quality Assurance
- API Testing
- Integration Testing
- Edge Case Testing
- Validation Testing
- Security Testing
- Bug Reporting

### DevOps
- Docker Support
- Docker Compose
- GitHub Actions CI Pipeline
- Swagger Documentation

---

# 🛠 Technology Stack

## Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Socket.IO Client

## Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt
- Socket.IO
- Multer
- Supabase Storage
- Nodemailer

## DevOps

- Docker
- Docker Compose
- GitHub Actions
- Nginx

## Documentation

- Swagger (OpenAPI)
- Markdown Documentation

---

# 📂 Project Structure

```text
Task-Management-System/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── prisma/
│   ├── routes/
│   ├── services/
│   ├── sockets/
│   ├── validators/
│   ├── uploads/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docs/
│   ├── API_Documentation.md
│   ├── DB_Design.md
│   ├── Deployment_Diagram.md
│   ├── ER_Diagram.md
│   ├── team-contributions.md
│   ├── swagger-review.md
│   └── final-technical-documentation.md
│   
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
├── README.md
└── LICENSE
```

---

# ⚙ Installation & Setup

## 1. Clone Repository

```bash
git clone https://github.com/shakikumar/Task-Management-System.git
cd Task-Management-System
```

---

## 2. Backend Setup

```bash
cd backend
npm install
```

Generate Prisma Client

```bash
npx prisma generate
```

Run Prisma Migration

```bash
npx prisma db push
```

Start Backend

```bash
npm run dev
```

---

## 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# 🔐 Environment Variables

Create a `.env` file inside the **backend** directory.

Required variables include:

```env
DATABASE_URL=

JWT_SECRET=
JWT_EXPIRES_IN=

SUPABASE_URL=
SUPABASE_SERVICE_KEY=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

---

# 🐳 Docker

Build all services

```bash
docker compose up --build
```

Development with Local PostgreSQL

```bash
docker compose --profile local-db up --build
```

---

# 📘 API Documentation

Swagger UI

```
http://localhost:5001/api/docs
```

---

# 🔒 Authentication & RBAC

The system supports three user roles.

### Administrator

- Full system access
- Assign Users
- User Management
- Project view
- Task view
- Reports

### Project Manager

- Create Projects
- Create task
- Manage Tasks
- View Reports
- Comment on Tasks

### Collaborator

- View Assigned Tasks
- Update Task Status
- Comment on Tasks

---

# 🔄 Real-Time Features

Socket.IO provides:

- Real-Time Notifications
- Task Updates
- Project Updates
- Live Collaboration

---

# 🌐 Connection Resilience

The frontend implements:

- Axios Interceptors
- Automatic JWT Handling
- Exponential Backoff Reconnection
- Network Monitoring
- Connection Status Banner

---

# 🧪 Testing

Project testing includes:

- API Testing
- Integration Testing
- Validation Testing
- Security Testing
- Edge Case Testing
- Role-Based Access Testing
- End-to-End Testing

---

# 🚀 CI/CD

GitHub Actions pipeline performs:

- Backend Validation
- Prisma Validation
- Frontend Linting
- Production Build
- Docker Image Build
- Docker Compose Validation

---

# 📄 Documentation

The project includes:

- API Documentation
- Database Design
- Deployment Diagram
- ER_Diagram
- Swagger Review
- Final Technical Documentation
- Team Contributions


---

# 👥 Team Contributions

### Member A

- Database Schema & Prisma Setup
- Backend Core APIs
- Task Management Backend
- Socket.IO Server
- Deployment Infrastructure

### Member B

- Authentication & JWT
- User Management APIs
- Project Management APIs
- File Attachments
- Notifications

### Member C

- React Frontend
- Dashboards
- Kanban Board
- UI Components
- Notification Interface

### Member D

- RBAC
- Security
- Password Reset
- Validation
- User Guides

### Member E

- Quality Assurance
- API Verification
- Integration Testing
- Swagger Documentation Review
- Bug Reporting
- Validation Testing
- Security Testing
- Connection Resilience
- Technical Documentation
- README Documentation

---

# 🔗 Repository

GitHub Repository

https://github.com/shakikumar/Task-Management-System.git

---

# 📜 License

This project was developed for academic purposes as part of a Web Application Development Group Project.
