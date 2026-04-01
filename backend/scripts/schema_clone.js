const { Client, Pool } = require('pg');

const phoenixPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'inventory_system',
  password: 'root',
  port: 5432
});

const impackPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'impack_db',
  password: 'root',
  port: 5432
});

async function run() {
  try {
    console.log('Fetching table definitions from inventory_system...');
    const tables = await phoenixPool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
    
    for (const row of tables.rows) {
      const tableName = row.tablename;
      if (tableName === 'pg_stat_statements') continue; // Skip maintenance tables

      console.log(`Cloning table schema: ${tableName}...`);
      
      // Get column definitions
      const columnsRes = await phoenixPool.query(`
        SELECT column_name, data_type, column_default, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [tableName]);

      let createStmt = `CREATE TABLE IF NOT EXISTS ${tableName} (`;
      const columnDefs = columnsRes.rows.map(col => {
        let def = `${col.column_name} ${col.data_type}`;
        if (col.is_nullable === 'NO') def += ' NOT NULL';
        if (col.column_default) {
           if (col.column_default.includes('nextval')) {
             def = `${col.column_name} SERIAL`;
           } else {
             def += ` DEFAULT ${col.column_default}`;
           }
        }
        return def;
      });

      // Special case for PKs if they were SERIAL
      createStmt += columnDefs.join(', ');
      
      // Basic PK mapping (assumes id is PK)
      if (columnDefs.some(d => d.startsWith('id '))) {
        createStmt += `, PRIMARY KEY (id)`;
      }
      createStmt += ')';

      await impackPool.query(createStmt);
      console.log(`Table ${tableName} created or already exists.`);
    }

    console.log('Adding professional audit columns to impack_db users table...');
    await impackPool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0");
    await impackPool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP");
    await impackPool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'");
    await impackPool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS company_access JSONB DEFAULT '{}'");
    
    console.log('Schema cloning and evolution complete.');
  } catch (err) {
    console.error('Error during schema cloning:', err);
  } finally {
    await phoenixPool.end();
    await impackPool.end();
  }
}

run();
