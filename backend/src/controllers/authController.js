const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const db = req.db;

    const newUser = await db.query(
      'INSERT INTO users (name, email, password, role, status, login_count) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, status',
      [name, email, hashedPassword, role || 'user', 'active', 0]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = req.db;
    const company = req.company || 'phoenix';

    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Identity not found in current logistics node.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account access has been suspended. Contact Administration.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Security key verification failed.' });
    }

    // Professional Audit: Update login metrics
    const isFirstLogin = Number(user.login_count ?? 0) === 0;
    await db.query(
      'UPDATE users SET login_count = login_count + 1, last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Automation: Alert admins of first-time access
    if (user.role === 'user' && isFirstLogin) {
      const alertMsg = `New Personnel Access: ${user.name || user.email} authorized for ${company.toUpperCase()}`;
      await db.query(
        'INSERT INTO notifications (message, user_name, type) VALUES ($1, $2, $3)',
        [alertMsg, user.name || 'System', 'USER_ACCESS']
      ).catch(() => {}); // Fallback for schema variations
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, company },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
      company,
      id: user.id
    });
  } catch (err) {
    console.error('Login Failure:', err);
    res.status(500).json({ error: 'Internal Security Error' });
  }
};

module.exports = {
  register,
  login
};