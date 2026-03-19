const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'inventory_system',
    password: 'root',
    port: 5432,
});

async function audit() {
    try {
        console.log("--- WAREHOUSES ---");
        const ws = await pool.query('SELECT * FROM warehouses');
        console.table(ws.rows);

        console.log("\n--- RECENT PRODUCTS (Last 5) ---");
        const prods = await pool.query('SELECT * FROM products ORDER BY id DESC LIMIT 5');
        console.table(prods.rows);

        console.log("\n--- RECENT INVENTORY/STOCK (Last 5) ---");
        const inv = await pool.query(`
        SELECT i.id, p.name as product, w.name as warehouse, i.quantity, i.shelf_code 
        FROM inventory i 
        JOIN products p ON i.product_id = p.id 
        JOIN warehouses w ON i.warehouse_id = w.id 
        ORDER BY i.id DESC LIMIT 5
    `);
        console.table(inv.rows);

        await pool.end();
    } catch (err) {
        console.error("Audit failed:", err);
        process.exit(1);
    }
}

audit();
