const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'todo_db',
  max: 10,                  
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('PostgreSQL Connection Pool has been successfully connected!');
});

pool.on('error', (err) => {
  console.error('Pool client error:', err);
  process.exit(-1);
});

module.exports = pool;