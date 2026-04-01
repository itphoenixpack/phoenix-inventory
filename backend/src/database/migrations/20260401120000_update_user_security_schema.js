/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasUsers = await knex.schema.hasTable('users');
  if (hasUsers) {
    const hasCompanyAccess = await knex.schema.hasColumn('users', 'company_access');
    if (!hasCompanyAccess) {
      await knex.schema.alterTable('users', (table) => {
        table.jsonb('company_access').notNullable().defaultTo('{}');
      });
    }

    const hasStatus = await knex.schema.hasColumn('users', 'status');
    if (!hasStatus) {
      await knex.schema.alterTable('users', (table) => {
        table.string('status', 20).notNullable().defaultTo('active');
      });
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // Keeping security columns for audit integrity.
};
