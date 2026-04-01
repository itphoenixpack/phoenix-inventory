const jwt = require('jsonwebtoken');
const { getDB } = require('../config/dbManager');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'secretkey';
    const verified = jwt.verify(token, jwtSecret);
    
    const homeCompany = (verified.company || 'phoenix').toLowerCase();
    const targetCompany = (req.company || req.header('x-company') || 'phoenix').toLowerCase();

    // Check for cross-company permission if needed
    if (homeCompany !== targetCompany) {
      if (verified.role !== 'super_admin') {
        const homePool = getDB(homeCompany);
        const userRes = await homePool.query(
          'SELECT company_access FROM users WHERE id = $1',
          [verified.id]
        );

        const access = userRes.rows[0]?.company_access || {};
        const expiry = access[targetCompany];

        if (!expiry || new Date() > new Date(expiry)) {
          return res.status(403).json({ 
            message: `Cross-company access to ${targetCompany.toUpperCase()} denied. Clearance required.` 
          });
        }
      }
    }

    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid Token' });
  }
};

module.exports = authMiddleware;