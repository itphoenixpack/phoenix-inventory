const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
  constructor(knex) {
    super(knex, 'users');
  }

  async findByEmail(email) {
    return this.knex(this.tableName).where({ email }).first();
  }
}

module.exports = UserRepository;
