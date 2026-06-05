// ==============================
// server.js — The Main Entry Point
// This is the first file that runs when you start the backend
// ==============================

const express = require('express');   // The web server framework
const cors = require('cors');         // Allows frontend to talk to backend
require('dotenv').config();           // Loads your .env file

// Import your route files (we'll create these next)
const authRoutes = require('./routes/authRoutes');

// Create the Express app — think of this as "turning on the restaurant"
const app = express();

// ==============================
// MIDDLEWARE (things that run on EVERY request)
// ==============================

// This allows the frontend (React on port 3000) to send requests here
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// This tells Express to understand JSON data sent from the frontend
// Without this, req.body would be empty when frontend sends data
app.use(express.json());

// ==============================
// ROUTES (the URLs your server listens to)
// ==============================

// All auth routes will start with /api/auth
// Example: /api/auth/login
app.use('/api/auth', authRoutes);

// A simple test route — visit http://localhost:5000/ to check if server is running
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