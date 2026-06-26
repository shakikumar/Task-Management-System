const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL Pool Error:', err.message);
});

pool.connect()
  .then(client => {
    console.log('✅ PostgreSQL Connected');
    client.release();
  })
  .catch(err => console.error('❌ PostgreSQL Error:', err.message));

// ✅ Fixed - pass pool directly, not wrapped in object
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;