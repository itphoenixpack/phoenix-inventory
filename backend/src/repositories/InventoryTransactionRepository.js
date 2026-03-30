const BaseRepository = require('./BaseRepository');

class InventoryTransactionRepository extends BaseRepository {
  constructor(knex) {
    super(knex, 'inventory_transactions');
  }

  async getLatestByProduct(productId) {
    return this.knex(this.tableName)
      .where({ product_id: productId })
      .orderBy('created_at', 'desc')
      .limit(10);
  }
}

module.exports = InventoryTransactionRepository;
