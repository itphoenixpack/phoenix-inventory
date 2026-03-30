const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'inventory_system',
  password: 'root',
  port: 5432,
});

async function checkDataContent() {
  const tables = ['users', 'products', 'warehouses', 'inventory', 'stock', 'inventory_transactions', 'notifications'];
  try {
    for (const table of tables) {
      const res = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`Table ${table} has ${res.rows[0].count} rows.`);
      if (parseInt(res.rows[0].count) > 0) {
        const samples = await pool.query(`SELECT * FROM ${table} LIMIT 2`);
        console.log(`Sample data for ${table}:`, samples.rows);
      }
    }
  } catch (err) {
    console.error('Error checking data content:', err);
  } finally {
    await pool.end();
  }
}

checkDataContent();
