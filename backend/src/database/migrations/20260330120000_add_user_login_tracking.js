/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasUsers = await knex.schema.hasTable('users');
  if (hasUsers) {
    const hasLoginCount = await knex.schema.hasColumn('users', 'login_count');
    if (!hasLoginCount) {
      await knex.schema.alterTable('users', (table) => {
        table.integer('login_count').notNullable().defaultTo(0);
      });
    }

    const hasLastLoginAt = await knex.schema.hasColumn('users', 'last_login_at');
    if (!hasLastLoginAt) {
      await knex.schema.alterTable('users', (table) => {
        table.timestamp('last_login_at');
      });
    }
  }

  const hasNotifications = await knex.schema.hasTable('notifications');
  if (hasNotifications) {
    const hasUserName = await knex.schema.hasColumn('notifications', 'user_name');
    if (!hasUserName) {
      await knex.schema.alterTable('notifications', (table) => {
        table.string('user_name');
      });
    }

    const hasType = await knex.schema.hasColumn('notifications', 'type');
    if (!hasType) {
      await knex.schema.alterTable('notifications', (table) => {
        table.string('type');
      });
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // No-op: keep audit columns to avoid accidental data loss.
};

