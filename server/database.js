const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// Test connection
pool.on('connect', () => {
    console.log('✓ Connected to PostgreSQL database:', process.env.DB_NAME);
});

pool.on('error', (err) => {
    console.error('Database connection error:', err);
});

// Test query on startup
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database test query failed:', err.message);
    } else {
        console.log('✓ Database test query successful');
    }
});

module.exports = pool;
