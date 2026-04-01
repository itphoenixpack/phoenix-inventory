// ADD STOCK
const addStock = async (req, res) => {
  const { product_id, warehouse_id, quantity, shelf_code } = req.body;

  try {
    const existing = await req.db.query(
      'SELECT * FROM inventory WHERE product_id=$1 AND warehouse_id=$2',
      [product_id, warehouse_id]
    );

    let result;

    if (existing.rows.length > 0) {
      result = await req.db.query(
        'UPDATE inventory SET quantity = quantity + $1 WHERE id=$2 RETURNING *',
        [quantity, existing.rows[0].id]
      );
    } else {
      result = await req.db.query(
        'INSERT INTO inventory (product_id, warehouse_id, quantity, shelf_code) VALUES ($1,$2,$3,$4) RETURNING *',
        [product_id, warehouse_id, quantity, shelf_code]
      );
    }

    // Fetch product name
    const prodRes = await req.db.query('SELECT name FROM products WHERE id = $1', [product_id]);
    const productName = prodRes.rows.length > 0 ? prodRes.rows[0].name : product_id;

    // Notification trigger
    const user_name = req.user?.name || "System";
    const notificationMessage = `Stock ADDED: ${quantity} units to ${productName} in warehouse ${warehouse_id} by ${user_name}`;
    await req.db.query(
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
    const existing = await req.db.query(
      'SELECT * FROM inventory WHERE product_id=$1 AND warehouse_id=$2',
      [product_id, warehouse_id]
    );

    if (existing.rows.length === 0) {
      return res.status(400).json({ message: 'No stock found' });
    }

    if (existing.rows[0].quantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    const updated = await req.db.query(
      'UPDATE inventory SET quantity = quantity - $1 WHERE id=$2 RETURNING *',
      [quantity, existing.rows[0].id]
    );

    // Fetch product name
    const prodRes = await req.db.query('SELECT name FROM products WHERE id = $1', [product_id]);
    const productName = prodRes.rows.length > 0 ? prodRes.rows[0].name : product_id;

    // Notification trigger
    const user_name = req.user?.name || "System";
    const notificationMessage = `Stock REMOVED: ${quantity} units from ${productName} in warehouse ${warehouse_id} by ${user_name}`;
    await req.db.query(
      'INSERT INTO notifications (message, user_name) VALUES ($1, $2)',
      [notificationMessage, user_name]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET STOCK — primary `inventory` rows, plus legacy `stock` table rows when present (deduped).
const stockRowKey = (r) => `${r.product_id}-${r.warehouse_id ?? 'null'}-${(r.shelf_code || '').trim()}`;

const getStock = async (req, res) => {
  try {
    let inventoryRows = [];
    try {
      const inv = await req.db.query(
        `SELECT i.id, i.product_id, p.name AS product_name, p.sku AS product_sku,
                w.id AS warehouse_id, w.name AS warehouse_name, i.quantity, i.shelf_code,
                'inventory' AS source
         FROM inventory i
         JOIN products p ON i.product_id = p.id
         JOIN warehouses w ON i.warehouse_id = w.id`
      );
      inventoryRows = inv.rows;
    } catch (e) {
      if (e.code !== '42P01') throw e;
    }

    let legacyRows = [];
    try {
      const leg = await req.db.query(
        `SELECT s.id, s.product_id,
                p.name AS product_name, p.sku AS product_sku,
                w.id AS warehouse_id,
                COALESCE(w.name, s.warehouse_name) AS warehouse_name,
                s.quantity, s.shelf_code,
                'stock' AS source
         FROM stock s
         JOIN products p ON s.product_id = p.id
         LEFT JOIN warehouses w ON w.id = (
           CASE
             WHEN s.warehouse_name ILIKE '%2nd warehouse%' OR TRIM(s.warehouse_name) = 'Warehouse 2' THEN 1
             WHEN s.warehouse_name ILIKE '%3rd warehouse%' OR TRIM(s.warehouse_name) = 'Warehouse 3' THEN 2
             ELSE (SELECT id FROM warehouses w2 WHERE w2.name = s.warehouse_name LIMIT 1)
           END
         )`
      );
      legacyRows = leg.rows;
    } catch (e) {
      if (e.code !== '42P01') throw e;
    }

    const seen = new Set(inventoryRows.map(stockRowKey));
    const merged = [
      ...inventoryRows,
      ...legacyRows.filter((r) => !seen.has(stockRowKey(r))),
    ];

    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE STOCK ITEM (Direct adjustment — handles both inventory and legacy stock tables)
const updateStockItem = async (req, res) => {
  const { id } = req.params;
  const { quantity, shelf_code, source } = req.body;

  try {
    let result;
    let productId;

    if (source === 'stock') {
      // Legacy stock table
      result = await req.db.query(
        'UPDATE stock SET quantity = $1, shelf_code = $2 WHERE id = $3 RETURNING *',
        [quantity, shelf_code, id]
      );
      productId = result.rows[0]?.product_id;
    } else {
      // Primary inventory table
      result = await req.db.query(
        'UPDATE inventory SET quantity = $1, shelf_code = $2 WHERE id = $3 RETURNING *',
        [quantity, shelf_code, id]
      );
      productId = result.rows[0]?.product_id;
    }

    if (!result || result.rows.length === 0) {
      return res.status(404).json({ message: 'Stock record not found' });
    }

    const prodRes = await req.db.query('SELECT name FROM products WHERE id = $1', [productId]);
    const productName = prodRes.rows.length > 0 ? prodRes.rows[0].name : `Record ID ${id}`;

    const user_name = req.user?.name || "System";
    const notificationMessage = `Stock ADJUSTED: ${productName} set to ${quantity} units by ${user_name}`;
    await req.db.query(
      'INSERT INTO notifications (message, user_name) VALUES ($1, $2)',
      [notificationMessage, user_name]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE STOCK ITEM (Remove from warehouse — handles both tables)
const deleteStockItem = async (req, res) => {
  const { id } = req.params;
  const source = req.query.source || req.body?.source;

  try {
    let result;
    if (source === 'stock') {
      result = await req.db.query('DELETE FROM stock WHERE id = $1 RETURNING *', [id]);
    } else {
      result = await req.db.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [id]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Stock record not found' });
    }

    res.json({ message: 'Stock record removed from warehouse' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addStock, removeStock, getStock, updateStockItem, deleteStockItem };