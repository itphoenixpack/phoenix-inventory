const BaseService = require('./BaseService');
const logger = require('../utils/logger');

class StockService extends BaseService {
  constructor(stockRepository, transactionRepository, knex) {
    super(stockRepository);
    this.transactionRepository = transactionRepository;
    this.knex = knex;
  }

  async updateStock(productId, warehouseName, quantity, transactionType, userId, shelfCode = null) {
    return this.knex.transaction(async (trx) => {
      logger.info(`Initiating stock transaction: ${transactionType} for product ${productId} in ${warehouseName}`);

      // 1. Find or Create Stock record
      let stockRecord = await this.knex('stock')
        .transacting(trx)
        .where({ product_id: productId, warehouse_name: warehouseName })
        .forUpdate() // Lock row for integrity
        .first();

      let newQuantity;
      if (stockRecord) {
        newQuantity = stockRecord.quantity + quantity;
        if (newQuantity < 0) {
          throw { statusCode: 400, message: 'Transaction rejected: Insufficient stock levels.' };
        }
        await this.knex('stock')
          .transacting(trx)
          .where({ id: stockRecord.id })
          .update({ quantity: newQuantity, shelf_code: shelfCode || stockRecord.shelf_code, updated_at: this.knex.fn.now() });
      } else {
        if (quantity < 0) {
          throw { statusCode: 400, message: 'Transaction rejected: Cannot initialize negative stock.' };
        }
        newQuantity = quantity;
        await this.knex('stock')
          .transacting(trx)
          .insert({
            product_id: productId,
            warehouse_name: warehouseName,
            shelf_code: shelfCode,
            quantity: newQuantity
          });
      }

      // 2. Create Audit Transaction
      await this.knex('inventory_transactions')
        .transacting(trx)
        .insert({
          product_id: productId,
          warehouse_name: warehouseName,
          shelf_code: shelfCode,
          quantity: quantity,
          type: transactionType,
          user_id: userId
        });

      logger.info(`Stock transaction completed: ${productId} quantity is now ${newQuantity}`);
      
      // Return updated stock with product details
      return this.knex('stock')
        .transacting(trx)
        .join('products', 'stock.product_id', '=', 'products.id')
        .select('stock.*', 'products.name as product_name')
        .where({ 'stock.product_id': productId, 'stock.warehouse_name': warehouseName })
        .first();
    });
  }

  async getGlobalStock() {
    return this.repository.getAllWithProductDetails();
  }
}

module.exports = StockService;
