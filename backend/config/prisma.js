const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch(err => console.error("❌ PostgreSQL Error:", err));

const adapter = new PrismaPg({ pool });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;