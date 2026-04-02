/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 *
 * NOTE: This migration was a historical patch applied to an older schema.
 * The current create migration already includes the correct column names
 * (type, user_id, notes), so we guard every operation to be idempotent.
 */
exports.up = async function(knex) {
  const hasTransactionType = await knex.schema.hasColumn('inventory_transactions', 'transaction_type');
  const hasPerformedBy = await knex.schema.hasColumn('inventory_transactions', 'performed_by');
  const hasNotes = await knex.schema.hasColumn('inventory_transactions', 'notes');

  // Only rename if the legacy column names still exist (older deployments)
  if (hasTransactionType) {
    await knex.schema.alterTable('inventory_transactions', table => {
      table.renameColumn('transaction_type', 'type');
    });
  }
  if (hasPerformedBy) {
    await knex.schema.alterTable('inventory_transactions', table => {
      table.renameColumn('performed_by', 'user_id');
    });
  }
  // Only add notes if it doesn't already exist (created fresh in the create migration)
  if (!hasNotes) {
    await knex.schema.alterTable('inventory_transactions', table => {
      table.text('notes');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const hasNotes = await knex.schema.hasColumn('inventory_transactions', 'notes');
  const hasType = await knex.schema.hasColumn('inventory_transactions', 'type');
  const hasUserId = await knex.schema.hasColumn('inventory_transactions', 'user_id');

  if (hasNotes) {
    await knex.schema.alterTable('inventory_transactions', table => {
      table.dropColumn('notes');
    });
  }
  if (hasUserId) {
    await knex.schema.alterTable('inventory_transactions', table => {
      table.renameColumn('user_id', 'performed_by');
    });
  }
  if (hasType) {
    await knex.schema.alterTable('inventory_transactions', table => {
      table.renameColumn('type', 'transaction_type');
    });
  }
};
