// Add Product (Atomic Transaction: Creates Product + Initial Stock)
const addProduct = async (req, res) => {
  const { name, warehouse_id, shelf_code, sku: providedSku } = req.body;
  const company = (req.company || 'phoenix').toUpperCase().slice(0, 3);

  // Auto-generate a professional SKU if not provided
  const sku = providedSku || `${company}-${Date.now().toString().slice(-6)}`;
  const description = "Registered Asset";

  const client = await req.db.connect();
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

    // 3. Notification
    const alertMsg = `New Asset Registered: ${name} (${sku}) by ${req.user?.name || 'System'}`;
    await client.query(
      'INSERT INTO notifications (message, user_name, type) VALUES ($1, $2, $3)',
      [alertMsg, req.user?.name || 'System', 'PRODUCT_CREATE']
    ).catch(() => {});

    await client.query('COMMIT');
    res.status(201).json({
      id: productId,
      sku,
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
    const products = await req.db.query('SELECT * FROM products ORDER BY name ASC');
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
    const updated = await req.db.query(
      'UPDATE products SET name=$1, sku=$2, description=$3 WHERE id=$4 RETURNING *',
      [name, sku, description, id]
    );
    if (updated.rows.length === 0) return res.status(404).json({ message: 'Product not found.' });
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Product (Admin only)
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await req.db.query('DELETE FROM products WHERE id=$1', [id]);
    res.json({ message: 'Asset removed from operational catalog.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addProduct, getProducts, updateProduct, deleteProduct };