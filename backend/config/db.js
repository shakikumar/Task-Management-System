const { Pool } = require('pg');
require('dotenv').config();

// Create a reusable pool of connections to your relational database
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: parseInt(process.env.DB_POOL_MAX) || 5
});

// A lightweight function to test the connection handshake
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Base Database Connection: Successful and active!');
    client.release(); // Free up the connection back to the pool
  } catch (error) {
    console.error('❌ Database Connection Failed: Ensure local server is running.', error.message);
  }
};

module.exports = { pool, testConnection };
