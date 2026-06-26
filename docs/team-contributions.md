# Team Contributions

The development timeline for the Task Management System (TMS) was systematically organized into 6 core execution sprints (phases). Each team member held clear ownership metrics during each phase to ensure balanced execution across database development, secure authentication engineering, interface construction, real-time networking, platform security auditing, and cloud infrastructure deployment.

---

## High-Level Phase Responsibility Matrix

| Phase | Focus Domain | Member A | Member B | Member C | Member D | Member E |
|---|---|---|---|---|---|---|
| **Phase 1** | 6-Entity DB, Auth Engine & Base Infra | 6-Entity Physical Schema & Prisma Setup | Secure Auth API & JWT Issuance | Tailwind Router & Layout Forms | Authorization Guards & CORS | Multi-stage Docker & Swagger Init |
| **Phase 2** | User Onboarding & Project Spaces | SMTP Mailer & Forced Reset Logics | Admin User Management & PM Project APIs | Admin & Project Allocation Dashboard UI | Security Reset View & Input Validation | 6-Entity UML ERD / Class Diagram Models |
| **Phase 3** | Core Task Engine & Kanban Boards | Task CRUD Lifecycle & Project Isolations | Advanced Analytics Query Filters | Interactive Tailwind Kanban | Tabular Task Grids & Inspectors | Interceptor Modules & API Testing |
| **Phase 4** | Collaborations & Security Auditing | Task Comments & Mention API | Secure Attachment File Handlers | Comment UI Threads & Drag-and-Drop | OWASP Vulnerability Remediations | Structured Error Mappings & QA Suite |
| **Phase 5** | Real-Time Streams & WebSockets | Socket.IO Instance & Auth Handshake | Lifecycle Event Emitter Hub | Navbar Notification Dropdowns | DB Offline Queue Storage Engine | Backoff Manager & Network Monitors |
| **Phase 6** | Cloud Deployments & Documentation | Multi-Service Edge Production Infrastructure | Production Monitoring & Data Masking | Topography Diagrams & Main README | Platform User Manuals & Demo Media | Compliance Reviews & Swagger Audit |

---

## Granular Task Breakdowns per Phase

### 🏁 Phase 1: Database Schema, Base Security & Authentication Setup
*Focus: Implementing cloud-relational storage layers mapping 6 core entities, JWT engines, responsive utility styling with Tailwind, secure CORS definitions, and automated dockerized builds.*

- **Member A — Database & ORM Engine:** Draft primary Prisma schema map defining relations for the expanded 6 entities: User, Project, Task, Comment, Notification, and Attachment. Provision Supabase PostgreSQL instances, write migrations enforcing cascading relational integrity, configure database pool parameters, and establish secure seeders for system roles (`Admin`, `Project Manager`, `Collaborator`).
- **Member B — Authentication Backend:** Create `/api/auth/login` routes. Integrate bcrypt modules for hashing. Code signed JSON Web Token (JWT) delivery routines storing payload constraints, setting expiration parameters, and mapping response schemas.
- **Member C — Layout Structure & Forms:** Configure React single page workspace running Tailwind CSS styling layers. Set up `react-router-dom` containing shared public layouts. Build clean user login interfaces using Tailwind utility cards and responsive layout form blocks.
- **Member D — Authorization Infrastructure & CORS:** Engineer custom backend middleware handlers to parse client authorization headers and check token validity. Formulate role permission injectors to restrict access using explicit metadata rules. Configure CORS setups for edge communication.
- **Member E — DevOps Container Pipeline & Docs:** Author production-grade multi-stage Dockerfiles for React and Node applications. Set up a local orchestrator file (`docker-compose.yml`). Set up Swagger framework paths within the backend routing structure.

### 👤 Phase 2: User Onboarding, Project Management Spaces, and Administration Features
*Focus: Developing administrative user provisioning engines, high-level project container endpoints, onboarding automation pipelines, secure credential reset guards, and unified architectural designs.*

- **Member A — Onboarding Mailer Service:** Code asynchronous email service pipelines linked to SMTP delivery providers. Construct automation tools to trigger temporary system credentials dispatching to newly invited profiles. Implement mandatory password verification flags (`mustResetPassword: true`) inside database schemas.
- **Member B — Administrative Portal & Project APIs:** Program secure administrative user control controllers (`/api/users` CRUD). Build the core `/api/projects` endpoint models enabling Project Managers to initialize, monitor, and configure project containers.
- **Member C — Administrative & Project Workspace UI:** Build administrative dashboard component blocks including user lists, profile creation dialog modals, role modification panels using responsive layout forms, and project management workspaces.
- **Member D — Password Recovery & Profile Panels UI:** Construct custom redirection views capturing forced credentials modification inputs. Code visual meter displays calculating real-time password complexity compliance rules. Build secure interactive profile configuration settings tabs.
- **Member E — System Modeling Documentation:** Produce precise physical Entity-Relationship Diagrams (ERD) defining relationships across all 6 core data models. Model system Architecture and Unified Class Diagrams tracking clean controller-to-service structures.

### 📋 Phase 3: Core Project & Task Management (REST Engine & Kanban Board)
*Focus: Structuring functional task workflows bound inside projects, responsive multi-column visual boards, data filter components, and end-to-end endpoint integration passes.*

- **Member A — Task Management API Lifecycle:** Deliver core task endpoint CRUD operations (`/api/tasks`), ensuring all tasks map to their parent Project containers. Integrate strict backend validations and implement route interceptors ensuring only Project Managers execute write/delete calls.
- **Member B — Complex Analytic Search Builders:** Build robust query parsers supporting layered search attributes (sorting by priority levels, deadlines, statuses, project containers, or assignees). Implement strict database text search indexing along with server-side pagination layouts.
- **Member C — Responsive Board Layout UI:** Build interactive Tailwind Kanban multi-column project environments (To Do, In Progress, Completed states) utilizing custom utility configurations, state transition logic, and color-coded status badges on elements.
- **Member D — List Management Views & Editing Modals UI:** Construct alternative searchable tabular grid components. Design complex Task Modification dialog boxes providing input areas for title, assignees, dates, and clear Tailwind dropdowns. Block modification buttons via conditional checks based on user role assignments.
- **Member E — Network Interceptors & Route QA Integration:** Set up unified client communication Axios layouts. Program request interceptors to seamlessly attach active JWT tokens to all outgoing header packages. Author integration test code verification routines.

### 🔒 Phase 4: Collaboration Features, Attachment Handlers & Platform Defense
*Focus: Introducing user engagement tools, multi-format file processing storage engines, sanitizing parameters, and implementing defensive protections mapping to OWASP security guidelines.*

- **Member A — Task Comments API Service:** Code collaborative message routing modules (`/api/tasks/:id/comments`). Set up deletion verification loops that restrict comment modifications exclusively to the original creator or system Project Managers.
- **Member B — Secure File Transfer & Storage Processing:** Develop automated file stream parsing logic with strict upload size caps, populating the Attachment model. Enforce rigid MIME-type filters (allowing only secure extensions like PDF, PNG, JPG). Integrate safe cryptographic filename randomizers.
- **Member C — Comment Threads & Drag-and-Drop UIs:** Construct contextual timeline list elements within task inspection tabs. Design intuitive file picker and drag-and-drop file upload wrappers using Tailwind notification components and dynamic progress bar tracking interfaces.
- **Member D — OWASP Security Engineering Audit:** Execute source scanning sweeps. Enforce parameterization mechanics across all data fields to insulate backend models from SQL injection vectors. Implement input sanitization on text inputs to block Cross-Site Scripting (XSS) payloads. Build customized HTTP headers.
- **Member E — Global Error Interception & Edge Case Testing:** Design Express error boundaries that intercept anomalies and map them to unified standard error formats containing structured exception payloads. Execute stress tests validating database error responses.

### ⚡ Phase 5: Real-Time Event Loop & WebSocket System (WSS)
*Focus: Integrating parallel real-time networking engines, state message brokers, persistent offline notification queues, and connection client resilience frameworks.*

- **Member A — Socket.IO Server Core & Handshake Guard:** Spin up a concurrent Socket.IO secure server cluster layer. Write custom initial socket connection interceptors capable of reading and validating client-side JWT authorization credentials before granting socket state mappings.
- **Member B — Central Event Broker & Router Pipeline:** Hook event dispatch listeners directly into backend business workflows (project configurations, task assignments, edits, modifications, comment creation). Coordinate data distribution mechanisms ensuring instant notifications map cleanly to target client IDs.
- **Member C — Real-Time Alert Panels & Badges UI:** Create navbar-integrated live operational notifications panels inside the app workspace layout using Tailwind dropdowns. Build dynamic toast components that animate instantly on incoming socket events.
- **Member D — Persistent Offline Delivery Queues:** Code dedicated schema structures within the relational tier to buffer undelivered events for offline target accounts. Design real-time synchronization hooks that detect connection reconnections and trigger immediate delivery of outstanding cached notifications.
- **Member E — Client Connection Resilience & Backoff Timers:** Build resilient WebSocket wrapper files inside React configurations. Build automated backoff recovery loops (1s, 2s, 4s, 8s, 16s escalation timings) and construct visual structural monitors signaling active states.

### ☁️ Phase 6: Production Deployment, CI/CD Completion & Final Documentation
*Focus: Executing secure cloud container deployments, reverse-proxy engineering, writing complete topography models, user manuals, and passing validation criteria steps.*

- **Member A — Production Cloud Setup & Network Controls:** Initialize runtime environments on cloud providers. Link secure environment profiles separating private database strings. Install reverse-proxy network controls to safely manage incoming traffic.
- **Member B — Runtime Monitoring, SSL & Data Masking:** Audit active production TLS/SSL certificate keys. Establish continuous system tracking pipelines to log anomalies, and program log filtration layers to scrub sensitive credentials or private profiles from system traces.
- **Member C — Topography Modeling & Deployment Guides:** Draft complete Cloud Deployment Topography Diagrams mapping virtual clusters, containers, proxies, and storage nodes. Complete setup document guides in the project's root `README.md` detailing setup steps using Docker Compose.
- **Member D — Platform Manuals & Presentation Media:** Write comprehensive user documentation manuals defining operational guidelines for user roles. Construct and capture live platform workflow showcase recordings detailing full system feature paths from distinct user perspectives.
- **Member E — Compliance Reviews & Swagger Audit:** Execute the final code review verification sweep across the code architecture. Confirm all active routes mirror target OpenAPI configurations exactly. Clean up unused development modules and document individual contributor metrics within the public repository.
