const BaseRepository = require('./BaseRepository');

class ProductRepository extends BaseRepository {
  constructor(knex) {
    super(knex, 'products');
  }

  async findBySku(sku) {
    return this.knex(this.tableName).where({ sku }).first();
  }
}

module.exports = ProductRepository;
