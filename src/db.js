// server/src/db.js
const { Pool } = require('pg');
const dbConfig = require('./config/db.config');

const pool = new Pool({
  user: dbConfig.user,
  host: dbConfig.host,
  database: dbConfig.database,
  password: dbConfig.password,
  port: dbConfig.port
});

// Verify connection on startup
pool.query('SELECT NOW()', (err) => {
  if (err) console.error("Database connection failed:", err);
  else console.log("Database connected successfully");
});

module.exports = pool;