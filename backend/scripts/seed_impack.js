const { Pool } = require('pg');

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
    console.log('Fetching products from Phoenix (inventory_system)...');
    const res = await phoenixPool.query('SELECT * FROM products');
    
    console.log('Seeding products to Impack (impack_db)...');
    
    for (const prod of res.rows) {
      // Split names if they contain multiple products separated by common delimiters
      const names = prod.name.split(/[,\/]| & /).map(n => n.trim()).filter(n => n.length > 0);
      
      for (const name of names) {
        const sku = `IMP-${Math.random().toString(36).substring(7).toUpperCase()}`;
        
        await impackPool.query(
          'INSERT INTO products (name, sku, description) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [name, sku, prod.description || 'Imported Asset']
        );
      }
    }
    
    // Seed basic warehouses for Impack
    console.log('Seeding warehouses to Impack...');
    await impackPool.query("INSERT INTO warehouses (id, name) VALUES (1, 'Warehouse 2'), (2, 'Warehouse 3') ON CONFLICT (id) DO NOTHING");

    console.log('Impack seeding complete.');
  } catch (err) {
    console.error('Seeding Error:', err);
  } finally {
    await phoenixPool.end();
    await impackPool.end();
  }
}

run();
