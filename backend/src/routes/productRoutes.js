const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validationMiddleware');

// Admin & User
router.post('/', [
  authMiddleware,
  body('name').notEmpty().withMessage('Product name is required'),
  validateRequest
], productController.addProduct);
router.put('/:id', authMiddleware, roleMiddleware('admin'), productController.updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), productController.deleteProduct);

// Admin & User
router.get('/', authMiddleware, productController.getProducts);

module.exports = router;