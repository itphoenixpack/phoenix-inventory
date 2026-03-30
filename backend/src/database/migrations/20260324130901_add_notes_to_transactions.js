/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('inventory_transactions', table => {
    table.renameColumn('transaction_type', 'type');
    table.renameColumn('performed_by', 'user_id');
    table.text('notes');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('inventory_transactions', table => {
    table.dropColumn('notes');
    table.renameColumn('user_id', 'performed_by');
    table.renameColumn('type', 'transaction_type');
  });
};
