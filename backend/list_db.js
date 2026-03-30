const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // Connect to default postgres DB to list others
  password: 'root',
  port: 5432,
});

async function listDatabases() {
  try {
    const res = await pool.query('SELECT datname FROM pg_database');
    console.log('Databases:', res.rows.map(r => r.datname));
  } catch (err) {
    console.error('Error listing databases:', err);
  } finally {
    await pool.end();
  }
}

listDatabases();
