const pool = require('../config/db');

const getNotifications = async (req, res) => {
  try {
    const notifications = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
    res.json(notifications.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getNotifications, markAsRead };
