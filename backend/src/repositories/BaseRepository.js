class BaseRepository {
  constructor(knex, tableName) {
    this.knex = knex;
    this.tableName = tableName;
  }

  async findAll() {
    return this.knex(this.tableName).select('*');
  }

  async findById(id) {
    return this.knex(this.tableName).where({ id }).first();
  }

  async create(data) {
    const result = await this.knex(this.tableName).insert(data).returning('id');
    const id = typeof result[0] === 'object' ? result[0].id : result[0];
    return this.findById(id);
  }

  async update(id, data) {
    await this.knex(this.tableName).where({ id }).update(data);
    return this.findById(id);
  }

  async delete(id) {
    return this.knex(this.tableName).where({ id }).del();
  }
  
  async query() {
    return this.knex(this.tableName);
  }
}

module.exports = BaseRepository;
