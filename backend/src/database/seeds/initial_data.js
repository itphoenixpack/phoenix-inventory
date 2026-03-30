/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deleting existing entries to ensure a clean slate
  await knex('stock').del();
  await knex('inventory_transactions').del();
  await knex('products').del();

  // 1. Seed Products
  const products = await knex('products').insert([
    { name: 'Quantum Chipset X1', sku: 'QC-X1-001' },
    { name: 'Thermal Regulator Prime', sku: 'TR-P-202' },
    { name: 'Neural Link Interface', sku: 'NL-INT-303' }
  ]).returning('*');

  // 2. Seed Stock (Distribution across Facilities)
  await knex('stock').insert([
    { product_id: products[0].id, warehouse_name: 'Warehouse 2', shelf_code: 'A-101', quantity: 150 },
    { product_id: products[1].id, warehouse_name: 'Warehouse 2', shelf_code: 'B-202', quantity: 8 },
    { product_id: products[2].id, warehouse_name: 'Warehouse 3', shelf_code: 'C-303', quantity: 25 }
  ]);

  // 3. Log initial transactions
  await knex('inventory_transactions').insert([
    { 
      product_id: products[1].id, 
      warehouse_name: 'Warehouse 2', 
      type: 'IN', 
      quantity: 8, 
      user_id: 1, // Assumes admin exists
      notes: 'Initial organizational registry setup'
    }
  ]);

  console.log('Database organizational data registry initialized successfully.');
};
