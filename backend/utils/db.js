const { Pool } = require('pg');
require('dotenv').config();

// Create a new PostgreSQL connection pool using environment variables.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'skillmatch_db',
  port: process.env.DB_PORT || 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};