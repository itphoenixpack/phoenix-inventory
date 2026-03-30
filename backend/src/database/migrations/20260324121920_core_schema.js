/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1. Users Table
  if (!(await knex.schema.hasTable('users'))) {
    await knex.schema.createTable('users', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
      table.string('role').defaultTo('user');
      table.timestamps(true, true);
    });
  }

  // 2. Products Table
  if (!(await knex.schema.hasTable('products'))) {
    await knex.schema.createTable('products', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('sku').unique().notNullable();
      table.timestamps(true, true);
    });
  }

  // 3. Stock Table (Linking Products to Warehouses)
  if (!(await knex.schema.hasTable('stock'))) {
    await knex.schema.createTable('stock', table => {
      table.increments('id').primary();
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
      table.string('warehouse_name').notNullable();
      table.string('shelf_code');
      table.integer('quantity').defaultTo(0);
      table.timestamps(true, true);
    });
  }

  // 4. Notifications Table (Organizational Alerts)
  if (!(await knex.schema.hasTable('notifications'))) {
    await knex.schema.createTable('notifications', table => {
      table.increments('id').primary();
      table.string('type').notNullable(); // 'STOCK_LOW', 'USER_ACCESS', etc.
      table.text('message').notNullable();
      table.boolean('is_read').defaultTo(false);
      table.timestamps(true, true);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('stock');
  await knex.schema.dropTableIfExists('products');
  // We keep the users table to avoid accidental data loss during rollout
};
