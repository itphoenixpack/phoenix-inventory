const BaseService = require('./BaseService');
const logger = require('../utils/logger');

class ProductService extends BaseService {
  constructor(productRepository, knex) {
    super(productRepository);
    this.knex = knex;
  }

  async create(data) {
    const { name, warehouse_id, shelf_code, description } = data;
    
    // Generate a secure SKU for the enterprise registry
    const sku = `PHX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return this.knex.transaction(async (trx) => {
      logger.info(`Registering new asset: ${name} (${sku})`);

      // 1. Create Product
      const [product] = await this.knex('products')
        .transacting(trx)
        .insert({
          name,
          sku,
          description: description || '',
          created_at: this.knex.fn.now(),
          updated_at: this.knex.fn.now()
        })
        .returning('*');

      // 2. Initialize Stock Record
      const warehouseNames = { 1: "Warehouse 2", 2: "Warehouse 3" };
      const warehouseName = warehouseNames[warehouse_id] || "Global Facility";

      await this.knex('stock')
        .transacting(trx)
        .insert({
          product_id: product.id,
          warehouse_name: warehouseName,
          shelf_code: shelf_code || 'UNASSIGNED',
          quantity: 0,
          created_at: this.knex.fn.now(),
          updated_at: this.knex.fn.now()
        });

      return product;
    });
  }

  async findBySku(sku) {
    return this.repository.findBySku(sku);
  }
}

module.exports = ProductService;
