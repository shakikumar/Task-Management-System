# Task Management System

![Project Banner](https://via.placeholder.com/1200x300.png?text=Task+Management+System)

## Project Overview
The **Task Management System (TMS)** is a comprehensive full-stack application designed to streamline team collaboration, project tracking, and task delegation. Built with a modern technology stack, it ensures robust security, real-time updates, and an intuitive user experience tailored for administrators, project managers, and collaborators.

## Features
- **Role-Based Access Control (RBAC)**: Secure access tailored to `ADMINISTRATOR`, `PROJECT_MANAGER`, and `COLLABORATOR` roles.
- **Project & Task Management**: Create, assign, and track projects and tasks.
- **Real-Time Collaboration**: Instant push notifications and live updates using Socket.IO.
- **File Attachments**: Secure document uploads directly linked to tasks, utilizing Supabase Storage.
- **Interactive Discussions**: Task-level and project-level comment threads.
- **Connection Resilience**: Seamless frontend handling of token expirations via Axios interceptors.
- **Dockerized Infrastructure**: Complete containerization for painless local development and production deployments.

---

## Technology Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS / Vanilla CSS
- **HTTP Client**: Axios (with interceptors)
- **Real-Time**: Socket.IO Client

### Backend
- **Framework**: Node.js & Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Storage**: Supabase Storage
- **Authentication**: JWT (JSON Web Tokens) & bcrypt
- **Real-Time**: Socket.IO Server
- **Email Delivery**: SMTP via Mailtrap

### DevOps & Tools
- **Containerization**: Docker & Docker Compose
- **API Documentation**: Swagger (OpenAPI)
- **Web Server**: Nginx

---

## Architecture Overview
The system follows a separated client-server model:
1. **Frontend SPA**: React application communicating strictly over HTTPS/WSS.
2. **Backend REST API**: Express.js server exposing RESTful endpoints and managing WebSockets.
3. **Database**: PostgreSQL, interfaced strictly through Prisma ORM for type-safe queries.
4. **Third-Party**: Supabase handles blob storage for attachments.

---

## Folder Structure
```
Task-Management-System/
├── backend/
│   ├── config/          # Configurations (Swagger, Supabase)
│   ├── controllers/     # Route logic
│   ├── middleware/      # Auth & Role validation
│   ├── prisma/          # Database schema & migrations
│   ├── routes/          # Express route definitions
│   ├── services/        # External logic (Email, Storage)
│   ├── sockets/         # WebSocket handlers
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI parts
│   │   ├── layouts/     # Page wrappers
│   │   ├── pages/       # Route views
│   │   ├── services/    # Axios API calls
│   │   └── App.jsx      # Main React component
├── docs/                # Comprehensive Markdown Documentation
└── docker-compose.yml   # Multi-container orchestration
```

---

## Installation & Setup

### Environment Variables
1. Copy the `.env.example` file in the root and in the `/backend` folder.
2. Rename them to `.env`.
3. Provide the necessary credentials for Supabase, JWT Secret, and Mailtrap.

### Running with Docker (Recommended)
You can spin up the entire stack using Docker Compose:

**For Production (Using Cloud Supabase DB):**
```bash
docker compose up --build
```

**For Local Development (Spins up Local PostgreSQL):**
```bash
docker compose --profile local-db up --build
```

### Running Locally without Docker

**Backend Setup:**
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

---

## API & Swagger Documentation
The interactive API documentation is automatically generated using Swagger.
With the backend running, visit:
👉 **[http://localhost:5001/api/docs](http://localhost:5001/api/docs)**

---

## Authentication & RBAC
- **JWT**: Obtain a token via `POST /api/auth/login`. Pass this token in the `Authorization: Bearer <token>` header for all protected routes.
- **Roles**:
  - `ADMINISTRATOR`: Global access.
  - `PROJECT_MANAGER`: Create projects, assign tasks.
  - `COLLABORATOR`: View assigned tasks, update statuses.

## Real-Time & Connection Resilience
- **Socket.IO**: Connects automatically. Users join rooms mapped to their specific `userId` to receive private, targeted notifications.
- **Axios Interceptors**: The frontend globally catches `401 Unauthorized` responses. If a token is expired, it forces a safe logout and redirects to `/login`.

## Deployment
The Docker setup compiles the React frontend into static files and serves them via Nginx on port `3000`. The backend runs on port `5000/5001`. The backend expects a valid `DATABASE_URL` pointing to your production PostgreSQL (e.g., Supabase).

## Testing & CI/CD
- **Unit & Integration Tests**: (Refer to project testing guidelines if configured).
- **CI/CD**: Docker serves as the foundation for CI/CD, allowing environments to be replicated exactly across automated testing pipelines.

---

## License
MIT License. See `LICENSE` for details.