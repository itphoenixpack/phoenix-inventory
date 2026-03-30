const BaseRepository = require('./BaseRepository');

class StockRepository extends BaseRepository {
  constructor(knex) {
    super(knex, 'stock');
  }

  async findByProductAndWarehouse(productId, warehouseName) {
    return this.knex(this.tableName)
      .where({ product_id: productId, warehouse_name: warehouseName })
      .first();
  }

  async getAllWithProductDetails() {
    return this.knex(this.tableName)
      .join('products', 'stock.product_id', '=', 'products.id')
      .select('stock.*', 'products.name as product_name', 'products.sku as product_sku');
  }
}

module.exports = StockRepository;
