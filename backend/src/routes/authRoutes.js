const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validationMiddleware');

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
  validateRequest
], authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
], authController.login);

module.exports = router;