const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'secretkey';
    const verified = jwt.verify(token, jwtSecret);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid Token' });
  }
};

module.exports = authMiddleware;