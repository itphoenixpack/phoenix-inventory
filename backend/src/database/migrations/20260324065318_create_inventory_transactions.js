/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('inventory_transactions', (table) => {
    table.increments('id').primary();
    table.integer('product_id').unsigned().notNullable()
      .references('id').inTable('products').onDelete('CASCADE');
    table.string('warehouse_name').notNullable();
    table.string('shelf_code');
    table.integer('quantity').notNullable();
    table.enum('type', ['IN', 'OUT', 'ADJUSTMENT']).notNullable();
    table.integer('user_id').unsigned().references('id').inTable('users');
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Add Indexes for performance
    table.index(['product_id']);
    table.index(['warehouse_name']);
    table.index(['created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('inventory_transactions');
};
