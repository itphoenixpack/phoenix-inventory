const ApiResponse = require('../utils/ApiResponse');

const permissionMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error('Authentication required. Access denied.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(ApiResponse.error(`Permission denied. Role [${req.user.role}] lacks required oversight level.`));
    }

    next();
  };
};

module.exports = permissionMiddleware;
