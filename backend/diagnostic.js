const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'inventory_system',
    password: 'root',
    port: 5432,
});

async function diagnostic() {
    try {
        console.log("Checking warehouses...");
        const warehouses = await pool.query('SELECT * FROM warehouses');
        console.log("Warehouses in DB:", warehouses.rows);

        console.log("\nChecking inventory schema...");
        const schema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'inventory'
    `);
        console.log("Inventory Columns:", schema.rows);

        await pool.end();
    } catch (err) {
        console.error("Diagnostic failed:", err);
        process.exit(1);
    }
}

diagnostic();
