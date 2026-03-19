const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/add', authMiddleware, roleMiddleware(['admin', 'user']), stockController.addStock);
router.post('/remove', authMiddleware, roleMiddleware(['admin', 'user']), stockController.removeStock);
router.get('/', authMiddleware, stockController.getStock);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), stockController.updateStockItem);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), stockController.deleteStockItem);

module.exports = router;