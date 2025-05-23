const { Pool } = require('pg');
const dbConfig = require('../config/db.config');

const pool = new Pool({
    user: dbConfig.user,
    host: dbConfig.host,
    database: dbConfig.database,
    password: dbConfig.password,
    port: dbConfig.port
});
// After creating the pool in db.js
pool.query('SELECT NOW()', (err) => {
    if (err) console.error("Database connection failed:", err);
    else console.log("Database connected successfully");
  });
pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database');
});

pool.on('error', (err) => {
    console.error("Unexpected error on idel client", err);
    process.exit(-1);
});

module.exports = pool;