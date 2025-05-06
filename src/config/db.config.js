module.exports = {
  user: process.env.DB_USER || 'zak',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'home_automation',
  password: process.env.DB_PASS || '',
  port: process.env.DB_PORT || 5432
};