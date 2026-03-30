const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const u = user.rows[0];
    const isFirstLogin = Number(u.login_count ?? 0) === 0;

    try {
      await pool.query(
        'UPDATE users SET login_count = COALESCE(login_count, 0) + 1, last_login_at = NOW() WHERE id = $1',
        [u.id]
      );
    } catch (e) {
      // If columns don't exist yet, login should still succeed.
    }

    if (u.role === 'user' && isFirstLogin) {
      const user_name = u.name || u.email || 'Unknown User';
      const message = `New user login: ${user_name} (${u.email}) accessed the system for the first time.`;
      try {
        await pool.query(
          'INSERT INTO notifications (message, user_name, type) VALUES ($1, $2, $3)',
          [message, user_name, 'USER_ACCESS']
        );
      } catch (e) {
        try {
          await pool.query(
            'INSERT INTO notifications (message, user_name) VALUES ($1, $2)',
            [message, user_name]
          );
        } catch (e2) {
          // If notifications schema differs, skip notifying but keep login working.
        }
      }
    }

    const token = jwt.sign(
      { id: u.id, role: u.role, name: u.name },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      role: u.role,
      name: u.name
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  register,
  login
};