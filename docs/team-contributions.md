# Team Contributions Summary

This document summarizes the contributions across the full-stack development of the Task Management System, based strictly on the final implemented features.

## Backend Engineering & Database Architecture
- Designed and deployed the relational database schema using **Prisma ORM** and **PostgreSQL**.
- Developed the RESTful API endpoints using **Express.js**, adhering to strict **JWT-based Authentication** and **Role-Based Access Control (RBAC)**.
- Engineered complex business logic for hierarchical task assignment, status progression, and project isolation.

## Frontend Development & UI/UX
- Built a responsive Single Page Application (SPA) using **React** and **Vite**.
- Implemented robust state management and connection resilience using **Axios interceptors** to handle token expiration gracefully.
- Developed dynamic dashboards tailored to user roles (Admins see all projects, Collaborators see specific assigned tasks).
- Integrated real-time UI updates seamlessly without requiring page refreshes.

## Real-Time Infrastructure
- Established WebSocket connections via **Socket.IO** to provide instant push notifications for task assignments and comments.
- Implemented isolated room-based architectures so users only receive relevant real-time events.

## Third-Party Integrations
- Configured and integrated **Supabase Storage** to handle secure file attachments.
- Implemented transactional email delivery pipelines using **SMTP/Mailtrap** for onboarding and system alerts.

## DevOps, Docker & Documentation
- Containerized the entire stack using **Docker** and **Docker Compose**, with Nginx serving the frontend and Express handling API requests.
- Maintained **Swagger OpenAPI** definitions for interactive API exploration.
- Generated comprehensive Markdown documentation encompassing ER Diagrams, UML Class Diagrams, and deployment typologies.
