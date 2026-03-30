const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All routes require authentication + admin role
router.get('/', authMiddleware, roleMiddleware('admin'), userController.getAllUsers);
router.put('/:id/role', authMiddleware, roleMiddleware('admin'), userController.updateUserRole);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), userController.deleteUser);

module.exports = router;
