const roleMiddleware = (roles) => {
  return (req, res, next) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access Forbidden: Insufficient permissions.' });
    }
    next();
  };
};

module.exports = roleMiddleware;