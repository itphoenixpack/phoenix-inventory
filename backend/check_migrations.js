const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'inventory_system',
  password: 'root',
  port: 5432,
});

async function checkMigrations() {
  try {
    const res = await pool.query('SELECT * FROM knex_migrations');
    console.log(res.rows);
  } catch (err) {
    if (err.code === '42P01') {
      console.log('knex_migrations table does not exist');
    } else {
      console.error(err);
    }
  } finally {
    await pool.end();
  }
}

checkMigrations();
