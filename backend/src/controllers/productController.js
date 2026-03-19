const pool = require('../config/db');

// Add Product (Atomic Transaction: Creates Product + Initial Stock)
const addProduct = async (req, res) => {
  const { name, warehouse_id, shelf_code } = req.body;

  // Auto-generate a basic SKU for internal tracking
  const sku = `PHX-${Date.now().toString().slice(-6)}`;
  const description = "Auto-generated registration";

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert Product
    const productRes = await client.query(
      'INSERT INTO products (name, sku, description) VALUES ($1, $2, $3) RETURNING id',
      [name, sku, description]
    );
    const productId = productRes.rows[0].id;

    // 2. Insert Inventory (Stock)
    await client.query(
      'INSERT INTO inventory (product_id, warehouse_id, quantity, shelf_code) VALUES ($1, $2, $3, $4)',
      [productId, parseInt(warehouse_id), 0, shelf_code]
    );

    await client.query('COMMIT');
    res.status(201).json({
      id: productId,
      message: 'Product and stock record successfully initialized'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// Get All Products (Admin/User)
const getProducts = async (req, res) => {
  try {
    const products = await pool.query('SELECT * FROM products');
    res.json(products.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Product (Admin only)
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, sku, description } = req.body;
  try {
    const updated = await pool.query(
      'UPDATE products SET name=$1, sku=$2, description=$3 WHERE id=$4 RETURNING *',
      [name, sku, description, id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Product (Admin only)
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM products WHERE id=$1', [id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addProduct, getProducts, updateProduct, deleteProduct };