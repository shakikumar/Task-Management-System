// ==============================
// server.js — Main Entry Point
// ==============================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Swagger documentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// ── PHASE 1 ROUTE ────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');

// ── PHASE 2 ROUTES (NEW) ─────────────────────────────────────────────────────
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// ── SWAGGER DOCS ──────────────────────────────────────────────────────────────
// Visit http://localhost:5000/api/docs to see all your APIs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'TMS API Docs',
  swaggerOptions: { persistAuthorization: true },
}));

// ── ROUTES ────────────────────────────────────────────────────────────────────

// Phase 1
app.use('/api/auth', authRoutes);

// Phase 2 (NEW)
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: '✅ TMS Backend Server is running!' });
});

// ── START SERVER ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});