const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'inventory_system',
    password: 'root',
    port: 5432,
});

async function testInsert() {
    try {
        // 1. Create a dummy product
        console.log("Creating dummy product...");
        const p = await pool.query("INSERT INTO products (name, sku) VALUES ('DEBUG_PROD', 'SKU_DEBUG') RETURNING id");
        const pid = p.rows[0].id;
        console.log("ID:", pid);

        // 2. Try to insert into inventory
        console.log("Inserting into inventory...");
        const i = await pool.query(
            "INSERT INTO inventory (product_id, warehouse_id, quantity, shelf_code) VALUES ($1, $2, $3, $4) RETURNING *",
            [pid, 1, 0, 'DEBUG-SHELF']
        );
        console.log("Successfully inserted:", i.rows[0]);

        // Cleanup
        await pool.query("DELETE FROM inventory WHERE product_id = $1", [pid]);
        await pool.query("DELETE FROM products WHERE id = $1", [pid]);

        await pool.end();
    } catch (err) {
        console.error("Test failed!");
        console.error(err);
        process.exit(1);
    }
}

testInsert();
