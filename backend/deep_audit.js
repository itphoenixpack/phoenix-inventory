const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'inventory_system',
    password: 'root',
    port: 5432,
});

async function deepAudit() {
    try {
        console.log("--- ALL INVENTORY RECORDS ---");
        const inv = await pool.query('SELECT * FROM inventory');
        console.table(inv.rows);

        console.log("\n--- PRODUCTS WITHOUT STOCK ---");
        const orphans = await pool.query('SELECT * FROM products WHERE id NOT IN (SELECT product_id FROM inventory)');
        console.table(orphans.rows);

        await pool.end();
    } catch (err) {
        console.error("Deep audit failed:", err);
        process.exit(1);
    }
}

deepAudit();
