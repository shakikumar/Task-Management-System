// ==============================
// server.js — The Main Entry Point
// This is the first file that runs when you start the backend
// ==============================

require('dotenv').config();           // Loads your .env file

const taskRoutes = require('./routes/taskRoutes');
const commentRoutes = require('./routes/commentRoutes');
const express = require('express');   // The web server framework
const cors = require('cors');         // Allows frontend to talk to backend

// Swagger API Documentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');


// ── PHASE 1 ROUTE ────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');

// ── PHASE 2 ROUTES (NEW) ─────────────────────────────────────────────────────
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');


// Create the Express app — think of this as "turning on the restaurant"
const app = express();

// ==============================
// MIDDLEWARE (things that run on EVERY request)
// ==============================

// This allows the frontend (React on port 3000) to send requests here
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// This tells Express to understand JSON data sent from the frontend
// Without this, req.body would be empty when frontend sends data
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ==============================
// ROUTES (the URLs your server listens to)
// ==============================

// ── API Documentation ──────────────────────────────────────────────────────
// Interactive Swagger UI: http://localhost:5000/api/docs
// Raw OpenAPI JSON:       http://localhost:5000/api/docs.json
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'TMS API Docs',
  customCss: '.swagger-ui .topbar { background-color: #1e293b; }',
  swaggerOptions: { persistAuthorization: true },
}));
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ── ROUTES ────────────────────────────────────────────────────────────────────

// Phase 1
app.use('/api/auth', authRoutes);
app.use('/api/attachments', attachmentRoutes);

// Phase 2 (NEW)
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);

// Phase 3(NEW)
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
// A simple test route — visit http://localhost:5001/ to check if server is running
app.get('/', (req, res) => {
  res.json({ message: '✅ TMS Backend Server is running!' });
});

// ==============================
// START THE SERVER
// ==============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});