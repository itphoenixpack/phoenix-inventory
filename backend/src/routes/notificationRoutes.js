const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware(['admin', 'user']), notificationController.getNotifications);
router.put('/:id/read', authMiddleware, roleMiddleware(['admin', 'user']), notificationController.markAsRead);

module.exports = router;
