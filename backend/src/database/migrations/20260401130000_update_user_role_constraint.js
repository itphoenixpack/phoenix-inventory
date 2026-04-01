/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasUsers = await knex.schema.hasTable('users');
  if (hasUsers) {
    try {
      // 1. Drop existing role check if it exists
      await knex.raw('ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_role_check"');
      
      // 2. Add the new flexible role check (super_admin, admin, user)
      await knex.raw(`
        ALTER TABLE "users" 
        ADD CONSTRAINT "users_role_check" 
        CHECK (role IN ('super_admin', 'admin', 'user'))
      `);
    } catch (err) {
      console.warn('Manual constraint update skipped or failed. This may happen if the database driver differs or constraints are missing.', err.message);
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // Reverting to more restrictive check if needed, but usually we don't want to break the system on rollback.
  await knex.raw('ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_role_check"');
  await knex.raw(`
    ALTER TABLE "users" 
    ADD CONSTRAINT "users_role_check" 
    CHECK (role IN ('admin', 'user'))
  `);
};
