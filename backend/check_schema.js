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
        console.log("--- INVENTORY COLUMNS ---");
        const cols = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'inventory'");
        console.table(cols.rows);

        console.log("\n--- PRODUCTS COLUMNS ---");
        const pCols = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'products'");
        console.table(pCols.rows);

        await pool.end();
    } catch (err) {
        console.error("Schema check failed:", err);
        process.exit(1);
    }
}

checkSchema();
