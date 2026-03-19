const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'inventory_system',
    password: 'root',
    port: 5432,
});

async function migrate() {
    try {
        console.log("Adding shelf_code column to inventory table...");
        await pool.query('ALTER TABLE inventory ADD COLUMN IF NOT EXISTS shelf_code VARCHAR(100)');
        console.log("Column added successfully.");

        console.log("Creating notifications table if not exists...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                message TEXT NOT NULL,
                user_name VARCHAR(255),
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Notifications table created successfully.");

        await pool.end();
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
