const pool = require('../config/db');

// ADD STOCK
const addStock = async (req, res) => {
  const { product_id, warehouse_id, quantity, shelf_code } = req.body;

  try {
    const existing = await pool.query(
      'SELECT * FROM inventory WHERE product_id=$1 AND warehouse_id=$2',
      [product_id, warehouse_id]
    );

    let result;

    if (existing.rows.length > 0) {
      result = await pool.query(
        'UPDATE inventory SET quantity = quantity + $1 WHERE id=$2 RETURNING *',
        [quantity, existing.rows[0].id]
      );
    } else {
      result = await pool.query(
        'INSERT INTO inventory (product_id, warehouse_id, quantity, shelf_code) VALUES ($1,$2,$3,$4) RETURNING *',
        [product_id, warehouse_id, quantity, shelf_code]
      );
    }

    // Fetch product name
    const prodRes = await pool.query('SELECT name FROM products WHERE id = $1', [product_id]);
    const productName = prodRes.rows.length > 0 ? prodRes.rows[0].name : product_id;

    // Notification trigger
    const user_name = req.user?.name || "System";
    const notificationMessage = `Stock ADDED: ${quantity} units to ${productName} in warehouse ${warehouse_id} by ${user_name}`;
    await pool.query(
      'INSERT INTO notifications (message, user_name) VALUES ($1, $2)',
      [notificationMessage, user_name]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// REMOVE STOCK
const removeStock = async (req, res) => {
  const { product_id, warehouse_id, quantity, shelf_code } = req.body;

  try {
    const existing = await pool.query(
      'SELECT * FROM inventory WHERE product_id=$1 AND warehouse_id=$2',
      [product_id, warehouse_id]
    );

    if (existing.rows.length === 0) {
      return res.status(400).json({ message: 'No stock found' });
    }

    if (existing.rows[0].quantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    const updated = await pool.query(
      'UPDATE inventory SET quantity = quantity - $1 WHERE id=$2 RETURNING *',
      [quantity, existing.rows[0].id]
    );

    // Fetch product name
    const prodRes = await pool.query('SELECT name FROM products WHERE id = $1', [product_id]);
    const productName = prodRes.rows.length > 0 ? prodRes.rows[0].name : product_id;

    // Notification trigger
    const user_name = req.user?.name || "System";
    const notificationMessage = `Stock REMOVED: ${quantity} units from ${productName} in warehouse ${warehouse_id} by ${user_name}`;
    await pool.query(
      'INSERT INTO notifications (message, user_name) VALUES ($1, $2)',
      [notificationMessage, user_name]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET STOCK
const getStock = async (req, res) => {
  try {
    const stock = await pool.query(
      `SELECT i.id, p.name as product_name, p.sku as product_sku, w.name as warehouse_name, i.quantity, i.shelf_code
       FROM inventory i
       JOIN products p ON i.product_id = p.id
       JOIN warehouses w ON i.warehouse_id = w.id`
    );

    res.json(stock.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE STOCK ITEM (Direct adjustment)
const updateStockItem = async (req, res) => {
  const { id } = req.params;
  const { quantity, shelf_code } = req.body;

  try {
    const result = await pool.query(
      'UPDATE inventory SET quantity = $1, shelf_code = $2 WHERE id = $3 RETURNING *',
      [quantity, shelf_code, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Stock record not found' });
    }

    // Fetch product name using the product_id from the updated record
    const prodRes = await pool.query('SELECT name FROM products WHERE id = $1', [result.rows[0].product_id]);
    const productName = prodRes.rows.length > 0 ? prodRes.rows[0].name : `Record ID ${id}`;

    // Notification trigger
    const user_name = req.user?.name || "System";
    const notificationMessage = `Stock ADJUSTED: ${productName} set to ${quantity} units by ${user_name}`;
    await pool.query(
      'INSERT INTO notifications (message, user_name) VALUES ($1, $2)',
      [notificationMessage, user_name]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE STOCK ITEM (Remove from warehouse)
const deleteStockItem = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Stock record not found' });
    }

    res.json({ message: 'Stock record removed from warehouse' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addStock, removeStock, getStock, updateStockItem, deleteStockItem };