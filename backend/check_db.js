const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'inventory_system',
  password: 'root',
  port: 5432,
});

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables:', res.rows.map(r => r.table_name));
    
    for (const row of res.rows) {
      const columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${row.table_name}'
      `);
      console.log(`Columns for ${row.table_name}:`, columns.rows.map(c => `${c.column_name} (${c.data_type})`));
    }
  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    await pool.end();
  }
}

checkSchema();
